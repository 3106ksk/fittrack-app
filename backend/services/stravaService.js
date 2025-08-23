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

  // OAuth認証URL生成
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

  // 認証コードをアクセストークンに交換
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

  // リフレッシュトークンでアクセストークンを更新
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

  // アクティビティ取得
  async getActivities(accessToken, page = 1, perPage = 30, after = null) {
    try {
      const params = {
        page,
        per_page: perPage
      };
      
      if (after) {
        params.after = Math.floor(after.getTime() / 1000);
      }

      const response = await axios.get(`${this.baseURL}/athlete/activities`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Access token expired');
      }
      throw new Error(`Failed to fetch activities: ${error.response?.data?.message || error.message}`);
    }
  }

  // トークン暗号化
  encryptToken(token) {
    if (!token) return null;
    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // トークン復号化
  decryptToken(encryptedToken) {
    if (!encryptedToken) return null;
    const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // state生成（CSRF対策）
  generateState() {
    return crypto.randomBytes(32).toString('hex');
  }

  // StravaアクティビティをWorkout形式に変換
  mapStravaToWorkout(stravaActivity, userId) {
    const typeMapping = {
      'Run': 'ランニング',
      'Ride': 'サイクリング', 
      'Swim': '水泳',
      'Walk': 'ウォーキング',
      'Hike': 'ハイキング',
      'WeightTraining': 'ウェイトトレーニング'
    };

    return {
      userID: userId,
      external_id: stravaActivity.id.toString(),
      source: 'strava',
      date: stravaActivity.start_date.split('T')[0],
      exercise: stravaActivity.name,
      exerciseType: typeMapping[stravaActivity.sport_type] || 'その他',
      distance: stravaActivity.distance ? stravaActivity.distance / 1000 : null, // m→km
      duration: stravaActivity.moving_time || stravaActivity.elapsed_time, // seconds
      raw_data: stravaActivity,
      synced_at: new Date()
    };
  }
}

module.exports = new StravaService();