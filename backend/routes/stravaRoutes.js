const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/checkJWT');
const stravaService = require('../services/stravaService');
const { User } = require('../models');

// メモリベースのstateストレージ（本番では Redis等を使用推奨）
const stateStorage = new Map();

// OAuth認証開始
router.post('/auth', authMiddleware, async (req, res) => {
  try {
    const state = stravaService.generateState();
    const authUrl = stravaService.getAuthUrl(state);
    
    // stateをストレージに保存（5分で期限切れ）
    stateStorage.set(state, {
      userId: req.user.id,
      timestamp: Date.now()
    });
    
    // 5分後にstateを削除
    setTimeout(() => {
      stateStorage.delete(state);
    }, 5 * 60 * 1000);
    
    res.json({ authUrl, state });
  } catch (error) {
    console.error('Strava auth initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate Strava authentication' });
  }
});

// OAuth認証コールバック
router.get('/callback', async (req, res) => {
  try {
    const { code, state, scope } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // state検証
    const stateData = stateStorage.get(state);
    if (!stateData) {
      return res.status(400).json({ error: 'Invalid or expired state parameter' });
    }
    
    // stateを削除（使い捨て）
    stateStorage.delete(state);
    
    // アクセストークンを取得
    const tokenData = await stravaService.exchangeCodeForToken(code);
    
    // ユーザー情報を更新
    await User.update({
      strava_athlete_id: tokenData.athlete.id.toString(),
      strava_access_token: stravaService.encryptToken(tokenData.access_token),
      strava_refresh_token: stravaService.encryptToken(tokenData.refresh_token),
      strava_token_expires_at: new Date(tokenData.expires_at * 1000)
    }, { 
      where: { id: stateData.userId } 
    });

    // フロントエンドにリダイレクト
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard?strava=connected`);
    
  } catch (error) {
    console.error('Strava callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard?strava=error&message=${encodeURIComponent(error.message)}`);
  }
});

// Strava連携ステータス確認
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const connected = !!(user.strava_athlete_id && user.strava_access_token);
    
    res.json({
      connected,
      athlete_id: user.strava_athlete_id,
      last_sync: user.strava_last_sync,
      activities_count: 0 // TODO: 実際の同期済みアクティビティ数を取得
    });
  } catch (error) {
    console.error('Strava status check error:', error);
    res.status(500).json({ error: 'Failed to check Strava status' });
  }
});

// Strava連携解除
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

module.exports = router;