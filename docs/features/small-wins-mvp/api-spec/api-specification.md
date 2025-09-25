# Small Wins Engine MVP - API仕様書

**文書番号**: API-SW-001
**バージョン**: 1.0.0
**作成日**: 2025-09-25
**ステータス**: MVP Specification

## 1. API概要

### 1.1 基本情報
- **ベースURL**: `/api/v1/insights`
- **認証**: JWT Bearer Token
- **レート制限**: 100 req/min per user
- **Content-Type**: application/json

### 1.2 エラーレスポンス形式

```json
{
  "error": {
    "code": "INSIGHT_NOT_FOUND",
    "message": "指定された日付のデータが見つかりません",
    "details": {}
  }
}
```

## 2. エンドポイント仕様（MUST機能のみ）

### 2.1 現在のスコア取得

#### `GET /api/v1/insights/current`

現在の健康スコアと WHO 達成状況を取得

**Request:**
```http
GET /api/v1/insights/current
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "date": "2025-09-25",
  "scores": {
    "total": 85,
    "cardio": 100,
    "strength": 50
  },
  "whoCompliance": {
    "cardio": true,
    "strength": false,
    "combined": false
  },
  "healthMessage": "WHO有酸素推奨達成：心疾患リスク30%減",
  "recommendations": [
    "筋力トレーニングをあと1日追加でWHO推奨完全達成",
    "上半身の筋群も鍛えるとバランスが向上します"
  ],
  "metrics": {
    "cardio": {
      "weeklyMinutes": 165,
      "targetMinutes": 150,
      "achievementRate": 110
    },
    "strength": {
      "weeklyDays": 1,
      "targetDays": 2,
      "achievementRate": 50,
      "muscleGroups": ["legs", "core"]
    }
  }
}
```

**Error Responses:**
- `401`: 未認証
- `404`: データ未計算
- `500`: サーバーエラー

### 2.2 週次サマリー取得

#### `GET /api/v1/insights/weekly`

過去7日間のスコア推移とサマリー

**Request:**
```http
GET /api/v1/insights/weekly
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "period": {
    "start": "2025-09-19",
    "end": "2025-09-25"
  },
  "summary": {
    "averageScore": 82,
    "bestDay": {
      "date": "2025-09-23",
      "score": 95
    },
    "totalWorkoutDays": 5,
    "whoAchievementDays": 3
  },
  "daily": [
    {
      "date": "2025-09-25",
      "totalScore": 85,
      "cardioScore": 100,
      "strengthScore": 50
    },
    {
      "date": "2025-09-24",
      "totalScore": 90,
      "cardioScore": 100,
      "strengthScore": 75
    }
    // ... 残り5日分
  ],
  "trends": {
    "scoreDirection": "up",
    "percentageChange": 12,
    "streakDays": 5
  }
}
```

### 2.3 スコア再計算（手動）

#### `POST /api/v1/insights/calculate`

指定日のスコアを強制再計算

**Request:**
```http
POST /api/v1/insights/calculate
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2025-09-25"  // optional, デフォルトは今日
}
```

**Response (200 OK):**
```json
{
  "message": "スコアを再計算しました",
  "result": {
    "date": "2025-09-25",
    "previousScore": 80,
    "newScore": 85,
    "changes": {
      "cardio": "+10",
      "strength": "0"
    }
  },
  "calculationTime": 145  // ms
}
```

**Error Responses:**
- `400`: 無効な日付
- `429`: レート制限超過

## 3. 実装コード例（Express.js）

### 3.1 ルーター実装

```javascript
// routes/insightRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const SmallWinsEngine = require('../services/SmallWinsEngine');
const InsightCache = require('../services/InsightCache');

const engine = new SmallWinsEngine();
const cache = new InsightCache();

// 現在のスコア取得
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // キャッシュチェック
    const cached = await cache.get(userId, today);
    if (cached) {
      return res.json(cached);
    }

    // DB取得
    let insight = await Insight.findOne({
      where: { userId, date: today }
    });

    // 存在しない場合は計算
    if (!insight) {
      const scores = await engine.calculateScore(userId, today);
      insight = await Insight.create({
        userId,
        date: today,
        ...scores
      });
    }

    // レスポンス整形
    const response = {
      date: insight.date,
      scores: {
        total: insight.totalScore,
        cardio: insight.cardioScore,
        strength: insight.strengthScore
      },
      whoCompliance: {
        cardio: insight.whoCardioAchieved,
        strength: insight.whoStrengthAchieved,
        combined: insight.whoCardioAchieved && insight.whoStrengthAchieved
      },
      healthMessage: insight.healthMessage,
      recommendations: insight.recommendations,
      metrics: insight.metrics
    };

    // キャッシュ保存
    await cache.set(userId, today, response);

    res.json(response);
  } catch (error) {
    console.error('Error fetching current insight:', error);
    res.status(500).json({
      error: {
        code: 'INSIGHT_ERROR',
        message: 'スコア取得中にエラーが発生しました'
      }
    });
  }
});

// 週次サマリー
router.get('/weekly', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);

    // 週間データ取得
    const insights = await Insight.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'DESC']]
    });

    // サマリー計算
    const summary = {
      averageScore: Math.round(
        insights.reduce((sum, i) => sum + i.totalScore, 0) / insights.length
      ),
      bestDay: insights.reduce((best, current) =>
        current.totalScore > (best?.totalScore || 0) ? current : best
      ),
      totalWorkoutDays: insights.length,
      whoAchievementDays: insights.filter(i =>
        i.whoCardioAchieved && i.whoStrengthAchieved
      ).length
    };

    // トレンド計算
    const recentScores = insights.slice(0, 3).map(i => i.totalScore);
    const olderScores = insights.slice(-3).map(i => i.totalScore);
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;

    res.json({
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      summary,
      daily: insights.map(i => ({
        date: i.date,
        totalScore: i.totalScore,
        cardioScore: i.cardioScore,
        strengthScore: i.strengthScore
      })),
      trends: {
        scoreDirection: recentAvg > olderAvg ? 'up' : 'down',
        percentageChange: Math.round(((recentAvg - olderAvg) / olderAvg) * 100),
        streakDays: calculateStreak(insights)
      }
    });
  } catch (error) {
    console.error('Error fetching weekly insights:', error);
    res.status(500).json({
      error: {
        code: 'WEEKLY_ERROR',
        message: '週次データ取得中にエラーが発生しました'
      }
    });
  }
});

// 再計算
router.post('/calculate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const date = req.body.date || new Date().toISOString().split('T')[0];

    // レート制限チェック
    const lastCalculation = await cache.get(`calc-${userId}`);
    if (lastCalculation && Date.now() - lastCalculation < 60000) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT',
          message: '再計算は1分に1回までです'
        }
      });
    }

    const startTime = Date.now();

    // 既存データ取得
    const existing = await Insight.findOne({
      where: { userId, date }
    });

    // 再計算実行
    const newScores = await engine.calculateScore(userId, date);

    // 更新または作成
    const [insight, created] = await Insight.upsert({
      userId,
      date,
      ...newScores,
      calculatedAt: new Date()
    });

    // キャッシュクリア
    await cache.delete(userId, date);
    await cache.set(`calc-${userId}`, Date.now());

    res.json({
      message: 'スコアを再計算しました',
      result: {
        date,
        previousScore: existing?.totalScore || null,
        newScore: newScores.totalScore,
        changes: {
          cardio: `${(newScores.cardioScore - (existing?.cardioScore || 0)) >= 0 ? '+' : ''}${newScores.cardioScore - (existing?.cardioScore || 0)}`,
          strength: `${(newScores.strengthScore - (existing?.strengthScore || 0)) >= 0 ? '+' : ''}${newScores.strengthScore - (existing?.strengthScore || 0)}`
        }
      },
      calculationTime: Date.now() - startTime
    });
  } catch (error) {
    console.error('Error calculating insight:', error);
    res.status(500).json({
      error: {
        code: 'CALCULATION_ERROR',
        message: '再計算中にエラーが発生しました'
      }
    });
  }
});

module.exports = router;
```

### 3.2 ミドルウェア

```javascript
// middleware/cacheMiddleware.js
const cacheMiddleware = (ttl = 3600) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = `${req.user.id}-${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached && cached.expires > Date.now()) {
      res.set('X-Cache', 'HIT');
      return res.json(cached.data);
    }

    res.set('X-Cache', 'MISS');
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, {
        data,
        expires: Date.now() + ttl * 1000
      });
      originalJson.call(this, data);
    };

    next();
  };
};
```

## 4. テストケース

```javascript
// tests/insights.test.js
describe('Insights API', () => {
  describe('GET /current', () => {
    it('should return current health score', async () => {
      const res = await request(app)
        .get('/api/v1/insights/current')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('scores');
      expect(res.body.scores.total).toBeGreaterThanOrEqual(0);
      expect(res.body.scores.total).toBeLessThanOrEqual(100);
    });

    it('should use cache on second request', async () => {
      const res1 = await request(app)
        .get('/api/v1/insights/current')
        .set('Authorization', `Bearer ${token}`);

      expect(res1.headers['x-cache']).toBe('MISS');

      const res2 = await request(app)
        .get('/api/v1/insights/current')
        .set('Authorization', `Bearer ${token}`);

      expect(res2.headers['x-cache']).toBe('HIT');
      expect(res2.body).toEqual(res1.body);
    });
  });
});
```

## 5. パフォーマンス要件

| エンドポイント | P50 | P95 | P99 |
|-------------|-----|-----|-----|
| GET /current | < 50ms | < 200ms | < 500ms |
| GET /weekly | < 100ms | < 300ms | < 800ms |
| POST /calculate | < 200ms | < 500ms | < 1000ms |

---

**次のステップ**:
1. Sequelizeモデル作成
2. SmallWinsEngineクラス実装
3. API統合テスト作成
4. Postmanコレクション作成