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

  async getActivities(accessToken) {
    try {

      const response = await axios.get(`${this.baseURL}/athlete/activities`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
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
}

module.exports = new StravaService();