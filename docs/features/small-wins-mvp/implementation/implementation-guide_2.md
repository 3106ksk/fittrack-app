# Small Wins MVP - Insights API 開発フロー（MUST機能のみ）

**文書番号**: DEV-SW-001
**バージョン**: 2.0.0
**作成日**: 2025-09-27
**ステータス**: MVP Development Flow (MUST Only)

## 📋 概要

本ドキュメントは、Small Wins MVPのInsights API実装における開発フローを定義します。
時間制約を考慮し、**MUST機能のみ**に集中した最小限の実装を行います。

## 🎯 開発スコープ（MUST機能のみ）

### 実装対象
- ✅ GET /api/insights/current - 現在のスコア取得
- ✅ GET /api/insights/weekly - 週次サマリー
- ✅ POST /api/insights/calculate - 手動再計算

### 実装除外（BETTER/UNNECESSARY）
- ❌ キャッシュ機能（インメモリキャッシュも省略）
- ❌ バッチ処理
- ❌ レート制限
- ❌ 詳細な統計分析

## 📊 API レスポンス構造（Calculator準拠）

### GET /api/insights/current

```javascript
{
  "date": "2025-09-27",
  "scores": {
    "total": 85,
    "cardio": 100,      // CardioMetricsCalculator.score
    "strength": 50      // StrengthMetricsCalculator.score
  },
  "whoCompliance": {
    "cardio": true,     // CardioMetricsCalculator.whoAchieved
    "strength": false,  // StrengthMetricsCalculator.whoAchieved
    "combined": false
  },
  "metrics": {
    "cardio": {         // CardioMetricsCalculator.details をそのまま使用
      "weeklyMinutes": 165,
      "targetMinutes": 150,
      "achievementRate": 110,
      "workoutCount": 4,
      "byDay": {
        "2025-09-21": 45,
        "2025-09-23": 30,
        "2025-09-25": 60,
        "2025-09-27": 30
      }
    },
    "strength": {       // StrengthMetricsCalculator.details をそのまま使用
      "weeklyDays": 1,
      "targetDays": 2,
      "achievementRate": 50,
      "totalSets": 12,
      "totalReps": 120,
      "workoutCount": 2,
      "byDay": {
        "2025-09-22": { "sets": 6, "reps": 60 },
        "2025-09-24": { "sets": 6, "reps": 60 }
      }
    }
  },
  "healthMessage": "WHO有酸素推奨達成：心疾患リスク30%減",
  "recommendations": [
    "筋力トレーニングをあと1日追加でWHO推奨完全達成"
  ]
}
```

### GET /api/insights/weekly

```javascript
{
  "period": {
    "start": "2025-09-21",
    "end": "2025-09-27"
  },
  "summary": {
    "averageScore": 82,
    "bestDay": {
      "date": "2025-09-25",
      "score": 95
    },
    "totalWorkoutDays": 5,
    "whoAchievementDays": 3
  },
  "daily": [
    {
      "date": "2025-09-27",
      "totalScore": 85,
      "cardioScore": 100,
      "strengthScore": 50
    }
    // ... 残り6日分
  ],
  "trends": {
    "scoreDirection": "up",     // 単純に前半と後半を比較
    "percentageChange": 12,
    "streakDays": 5
  }
}
```

### POST /api/insights/calculate

```javascript
// Request
{
  "date": "2025-09-27"  // optional, デフォルトは今日
}

// Response
{
  "message": "スコアを再計算しました",
  "result": {
    "date": "2025-09-27",
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

## 🔄 シンプルな開発フロー（2日間で完了）

### Day 1: 実装
- [ ] insightRoutes.js の作成
  - 3つのエンドポイント実装
  - SmallWinsEngineとの連携
  - エラーハンドリング
- [ ] app.js への統合
  - ルートのマウント

### Day 2: テストと調整
- [ ] 手動テストによる動作確認
- [ ] エラーケースの確認
- [ ] レスポンス形式の最終調整

## 📁 最小限のファイル構造

```
backend/
├── routes/
│   └── insightRoutes.js          # 新規作成（これだけ！）
├── services/
│   └── smallWins/                # 既存（変更なし）
│       ├── index.js
│       └── metrics/
│           ├── CardioMetricsCalculator.js
│           └── StrengthMetricsCalculator.js
├── models/
│   └── Insight.js                # 既存（変更なし）
└── app.js                        # 修正（1行追加のみ）
```

## 💻 実装コードの要点

### insightRoutes.js の基本構造

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const SmallWinsEngine = require('../services/smallWins');
const Insight = require('../models/Insight');
const Workout = require('../models/Workout');

const engine = new SmallWinsEngine();

// GET /api/insights/current
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // DBから取得を試みる
    let insight = await Insight.findOne({
      where: { userId, date: today }
    });

    // なければ計算
    if (!insight) {
      // Workoutデータ取得
      const workouts = await Workout.findAll({
        where: {
          userId,
          // 過去7日間のデータ
        }
      });

      // SmallWinsEngineで計算
      const result = engine.calculateWeeklyInsight(workouts);

      // DB保存
      insight = await Insight.create({
        userId,
        date: today,
        totalScore: result.score.total,
        cardioScore: result.metrics.cardio.score,
        strengthScore: result.metrics.strength.score,
        // ... その他のフィールド
      });
    }

    // レスポンス返却
    res.json({
      date: insight.date,
      scores: {
        total: insight.totalScore,
        cardio: insight.cardioScore,
        strength: insight.strengthScore
      },
      // ... 残りのレスポンス
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INSIGHT_ERROR',
        message: 'スコア取得中にエラーが発生しました'
      }
    });
  }
});

// 同様にweeklyとcalculateも実装

module.exports = router;
```

### app.js への統合（1行追加）

```javascript
// 既存のルートに追加
app.use('/api/insights', require('./routes/insightRoutes'));
```

## ✅ 完了基準

- [ ] 3つのエンドポイントが動作する
- [ ] SmallWinsEngineの計算結果が正しく返却される
- [ ] エラー時に適切なメッセージが返る
- [ ] レスポンス時間 < 500ms

## 🚫 今回やらないこと

- キャッシュの実装
- バッチ処理
- 詳細なパフォーマンスチューニング
- 複雑なエラーハンドリング
- レート制限

## 📝 GitHub Issue 作成用テンプレート

```markdown
## Issue 1: Insights API実装（MUST機能のみ）

### 概要
Small Wins MVPのInsights APIエンドポイントを実装する（MUST機能のみ）

### タスク
- [ ] insightRoutes.js の作成
- [ ] GET /api/insights/current の実装
- [ ] GET /api/insights/weekly の実装
- [ ] POST /api/insights/calculate の実装
- [ ] app.js への統合
- [ ] 動作確認

### 受け入れ条件
- 3つのエンドポイントが正常に動作する
- SmallWinsEngineの計算結果が正しく返却される
- エラーハンドリングが実装されている

### 備考
- キャッシュ機能は実装しない（時間制約のため）
- 既存のSmallWinsEngineを活用する
```

---

**作成者**: Claude Code
**最終更新**: 2025-09-27