const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/checkJWT');
const stravaService = require('../services/stravaService');
const { User } = require('../models');


const stateStorage = new Map();

router.get('/auth', authMiddleware, async (req, res) => {
  try {
    const state = stravaService.generateState();
    const authUrl = stravaService.getAuthUrl(state);
    stateStorage.set(state, {
      userId: req.user.id,
      timestamp: Date.now()
    });
    setTimeout(() => {
      stateStorage.delete(state);
    }, 5 * 60 * 1000);

    // 本番・開発環境共に直接リダイレクト
    res.redirect(authUrl);

  } catch (error) {
    console.error('Strava auth initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate Strava authentication' });
  }
});


router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const stateData = stateStorage.get(state);
    if (!stateData) {
      return res.status(400).json({ error: 'Invalid or expired state parameter' });
    }
    
    stateStorage.delete(state);
    
    const tokenData = await stravaService.exchangeCodeForToken(code);
    
    await User.update({
      strava_athlete_id: tokenData.athlete.id.toString(),
      strava_access_token: stravaService.encryptToken(tokenData.access_token),
      strava_refresh_token: stravaService.encryptToken(tokenData.refresh_token),
      strava_token_expires_at: new Date(tokenData.expires_at * 1000)
    }, { 
      where: { id: stateData.userId } 
    });

    // 環境に応じた動的なフロントエンドURL設定
    const getFrontendUrl = () => {
      const currentEnv = process.env.NODE_ENV || 'development';
      const isProduction = currentEnv === 'production';
      return isProduction 
        ? process.env.FRONTEND_URL_PROD || 'https://fitstart-frontend.vercel.app'
        : process.env.FRONTEND_URL || 'http://localhost:5173';
    };
    
    const frontendUrl = getFrontendUrl();
    res.redirect(`${frontendUrl}/dashboard?strava=connected`);
    
  } catch (error) {
    console.error('Strava callback error:', error);
    
    // 環境に応じた動的なフロントエンドURL設定
    const getFrontendUrl = () => {
      const currentEnv = process.env.NODE_ENV || 'development';
      const isProduction = currentEnv === 'production';
      return isProduction 
        ? process.env.FRONTEND_URL_PROD || 'https://fitstart-frontend.vercel.app'
        : process.env.FRONTEND_URL || 'http://localhost:5173';
    };
    
    const frontendUrl = getFrontendUrl();
    res.redirect(`${frontendUrl}/dashboard?strava=error&message=${encodeURIComponent(error.message)}`);
  }
});


router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    const now = Math.floor(Date.now() / 1000);
    const connected = !!(
      user.strava_athlete_id &&
      user.strava_access_token &&
      user.strava_token_expires_at > now
    );
    
    res.json({
      connected,
      athlete_id: user.strava_athlete_id,
      last_sync: user.strava_last_sync,
      activities_count: 0,
      token_expires_at: user.strava_token_expires_at
    });
  } catch (error) {
    console.error('Strava status check error:', error);
    res.status(500).json({ error: 'Failed to check Strava status' });
  }
});


router.delete('/disconnect', authMiddleware, async (req, res) => {
  try {
    await User.update({
      strava_athlete_id: null,
      strava_access_token: null,
      strava_refresh_token: null,
      strava_token_expires_at: null,
      strava_last_sync: null
    }, { 
      where: { id: req.user.id } 
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Strava disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect Strava' });
  }
});

router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const { days = 30 } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user.strava_access_token) {
      return res.status(401).json({ 
        success: false,
        error: 'Strava認証が必要です',
        action: 'connect'
      });
    }

    const now = Math.floor(Date.now() / 1000);
    if (user.strava_token_expires_at <= now) {
      return res.status(401).json({
        success: false,
        error: 'Stravaトークンの有効期限が切れています',
        action: 'reconnect'
      });
    }

    const accessToken = stravaService.decryptToken(user.strava_access_token);
    const activities = await stravaService.getActivities(accessToken, { days });
    const results = await stravaService.syncActivitiesToWorkouts(activities, user.id);
    await user.update({ strava_last_sync: new Date() });
    res.json({
      success: true,
      synced: results.synced,
      skipped: results.skipped,
      errors: results.errors.length || 0,
      message: results.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || '同期処理中にエラーが発生しました'
    });
  }
});

module.exports = router;