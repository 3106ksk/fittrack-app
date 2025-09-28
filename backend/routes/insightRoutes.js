/**
 * Insights API ルーター
 * Small Wins MVPのメインAPIエンドポイント
 */

const router = require('express').Router();
const authMiddleware = require('../middleware/checkJWT');
const SmallWinsEngine = require('../services/smallWins');
const DateHelper = require('../services/smallWins/utils/DateHelper');
const { Insight, Workout } = require('../models');
const { Op } = require('sequelize');

const engine = new SmallWinsEngine();

/**
 * GET /api/insights/current
 * 現在の健康スコアとWHO達成状況を取得
 */
router.get('/current', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '認証エラー - リクエストにユーザー情報がありません' });
  }

  const userId = req.user.id;
  const today = DateHelper.format(new Date());
  const weekBounds = DateHelper.getWeekBounds(new Date());

  try {
    // Insightテーブルから既存データを検索
    let insight = await Insight.findOne({
      where: { userId, date: today },
    });

    // データがなければ新規計算
    if (!insight) {
      const workouts = await Workout.findAll({
        where: {
          userID: userId,
          date: { [Op.between]: [weekBounds.startString, weekBounds.endString] },
        },
      });

      const result = engine.calculateWeeklyInsight(workouts);

      insight = await Insight.create({
        userId,
        date: today,
        totalScore: result.score.total,
        cardioScore: result.score.cardio,
        strengthScore: result.score.strength,
        whoCardioAchieved: result.achievements.cardio,
        whoStrengthAchieved: result.achievements.strength,
        metrics: result.metrics,
        healthMessage: result.healthMessage,
        recommendations: result.recommendations,
      });
    }

    // レスポンス整形
    const response = {
      date: insight.date,
      scores: {
        total: insight.totalScore,
        cardio: insight.cardioScore,
        strength: insight.strengthScore,
      },
      whoCompliance: {
        cardio: insight.whoCardioAchieved,
        strength: insight.whoStrengthAchieved,
        combined: insight.whoCardioAchieved && insight.whoStrengthAchieved,
      },
      metrics: insight.metrics || {},
      healthMessage: insight.healthMessage || '運動習慣を増やしましょう',
      recommendations: insight.recommendations || [],
    };
    console.log('🚧DBフェッチ結果🚧', response);
    res.json(response);
  } catch (error) {
    console.error('Error in /insights/current:', error);
    res.status(500).json({ error: 'データ取得中にエラーが発生しました' });
  }
});

// TODO: 他のエンドポイント（weekly, calculate）を実装

module.exports = router;
