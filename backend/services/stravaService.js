const axios = require('axios');
const crypto = require('crypto');

class StravaService {
  constructor() {
    this.clientId = process.env.STRAVA_CLIENT_ID;
    this.clientSecret = process.env.STRAVA_CLIENT_SECRET;
    this.redirectUri = process.env.STRAVA_REDIRECT_URI;
    this.baseURL = 'https://www.strava.com/api/v3';
    this.authURL = 'https://www.strava.com/oauth';
  }

  getAuthUrl(state) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      approval_prompt: 'force',
      scope: 'read,activity:read_all',
      state
    });

    return `${this.authURL}/authorize?${params}`;
  }

  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post(`${this.authURL}/token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code'
      });

      return response.data;
    } catch (error) {
      throw new Error(`Token exchange failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(`${this.authURL}/token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      return response.data;
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async getActivities(accessToken, options = {}) {
    const { days = 30, page = 1, per_page = 50 } = options;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startTimestamp = Math.floor(startDate.getTime() / 1000);

    let retryCount = 0;
    const maxRetries = 3;

    const makeRequest = async () => {
      try {
        const response = await axios.get(`${this.baseURL}/athlete/activities`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            after: startTimestamp,
            page,
            per_page
          }
        });
        return response.data;
      } catch (error) {
        if (error.response?.status === 429 && retryCount < maxRetries) {
          retryCount++;
          const waitTime = Math.pow(2, retryCount) * 1000;
          console.log(`Rate limit hit. Retry ${retryCount}/${maxRetries} in ${waitTime}ms`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return makeRequest();
        }
        throw error;
      }
    };

    try {
      const response = await makeRequest();
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('認証エラー：トークンの有効期限切れ');
      }
      throw new Error(`Failed to fetch activities: ${error.response?.data?.message || error.message}`);
    }
  }

  encryptToken(token) {
    if (!token) return null;
    const key = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decryptToken(encryptedToken) {
    if (!encryptedToken) return null;

    const key = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest();
    const parts = encryptedToken.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted token format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }


  generateState() {
    return crypto.randomBytes(32).toString('hex');
  }

  mapStravaToWorkout(stravaActivity, userId) {
    const typeMapping = {
      'Run': 'ランニング',
      'Walk': 'ウォーキング',
      'WeightTraining': 'ウェイトトレーニング'
    }

    return {
      userID: userId,
      external_id: stravaActivity.id.toString(),
      source: 'strava',
      date: stravaActivity.start_date.split('T')[0],
      exercise: stravaActivity.name,
      exerciseType: typeMapping[stravaActivity.sport_type] || '不明',
      distance: stravaActivity.distance ? stravaActivity.distance / 1000 : null,
      duration: stravaActivity.moving_time || stravaActivity.elapsed_time,
      raw_data: stravaActivity,  
      synced_at: new Date(),
    }
  }

  async syncActivitiesToWorkouts(activities, userId) {
    const { Workout } = require('../models');
    const results = { synced: 0, skipped: 0, errors: [] };
    
    console.log('📊 既存のWorkoutを確認中...');
    
    let existingExternalIds;
    try {
      const existingWorkouts = await Workout.findAll({
        where: {
          userID: userId,
          source: 'strava'
        },
        attributes: ['external_id'],
      });
      existingExternalIds = new Set(existingWorkouts.map(workout => workout.external_id));
    } catch (error) {
      console.error('既存のWorkout取得失敗:', error);
      throw error;
    }

    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5;

    console.log(`🔄 ${activities.length}件のアクティビティを処理開始`);
    
    for (const activity of activities) {
      try {
        const stravaId = activity.id.toString();
        if (existingExternalIds.has(stravaId)) {
          console.log(`🔄 スキップ: ${stravaId} (既に同期済み)`);
          results.skipped++;
          consecutiveErrors = 0;
          continue;
        }
        
        const workoutData = this.mapStravaToWorkout(activity, userId);
        await Workout.create(workoutData);
        console.log(`✅ 同期成功: ${activity.name}`);
        results.synced++;
        consecutiveErrors = 0;
        
      } catch (error) {
        consecutiveErrors++;
        console.error(`❌ エラー: ${activity.name} - ${error.message}`);
        results.errors.push({
          activityName: activity.name,
          activityId: activity.id,
          error: error.message
        });

        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.log(`❌ 連続エラーが${maxConsecutiveErrors}件に達したため、処理を中断します`);
          results.aborted = true;
          break;
        }
      }
    }
    
    console.log('\n📈 同期結果:');
    console.log(`  ✅ 新規保存: ${results.synced}件`);
    console.log(`  ⏭️ スキップ: ${results.skipped}件`);
    console.log(`  ❌ エラー: ${results.errors.length}件`);
    
    return results;
  }
}

module.exports = new StravaService();