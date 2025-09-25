# Small Wins Engine MVP - 実装ガイド

**文書番号**: IMP-SW-001
**バージョン**: 1.0.0
**作成日**: 2025-01-25
**ステータス**: MVP Implementation Guide

## 1. 実装順序とタイムライン

### 📅 Week 1-2: 基盤構築
- Day 1-2: データベース設定
- Day 3-5: SmallWinsEngine実装
- Day 6-7: テストとデバッグ

### 📅 Week 3: API実装
- Day 1-2: エンドポイント作成
- Day 3-4: キャッシング実装
- Day 5: APIテスト

### 📅 Week 4: UI実装
- Day 1-2: コンポーネント作成
- Day 3-4: ダッシュボード統合
- Day 5: E2Eテスト

## 2. Step-by-Step 実装手順

### Step 1: データベースマイグレーション

#### 1.1 Sequelizeモデル作成

**ファイル**: `/backend/models/Insight.js`

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Insight = sequelize.define('Insight', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  totalScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  aerobicScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  strengthScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  whoAerobicAchieved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  whoStrengthAchieved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metrics: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  healthMessage: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  recommendations: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  calculatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  version: {
    type: DataTypes.STRING(10),
    defaultValue: '1.0.0'
  }
}, {
  tableName: 'insights',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'date']
    },
    {
      fields: ['userId', 'date'],
      order: [['date', 'DESC']]
    }
  ]
});

// アソシエーション
Insight.associate = (models) => {
  Insight.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = Insight;
```

#### 1.2 マイグレーションファイル作成

```bash
# ターミナルで実行
npx sequelize-cli migration:generate --name create-insights-table
```

**ファイル**: `/backend/migrations/[timestamp]-create-insights-table.js`

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('insights', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      totalScore: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      aerobicScore: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      strengthScore: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      whoAerobicAchieved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      whoStrengthAchieved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      metrics: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      healthMessage: {
        type: Sequelize.STRING(255)
      },
      recommendations: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: []
      },
      calculatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      version: {
        type: Sequelize.STRING(10),
        defaultValue: '1.0.0'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // インデックス追加
    await queryInterface.addIndex('insights', ['userId', 'date'], {
      unique: true,
      name: 'insights_user_date_unique'
    });

    await queryInterface.addIndex('insights', ['userId', 'date'], {
      name: 'insights_user_date_idx'
    });

    // workoutsテーブル拡張
    await queryInterface.addColumn('workouts', 'exerciseDetails', {
      type: Sequelize.JSONB,
      defaultValue: {}
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('workouts', 'exerciseDetails');
    await queryInterface.dropTable('insights');
  }
};
```

#### 1.3 マイグレーション実行

```bash
# データベース作成（初回のみ）
createdb fitstart_dev

# マイグレーション実行
npx sequelize-cli db:migrate

# ロールバック（必要な場合）
npx sequelize-cli db:migrate:undo
```

### Step 2: SmallWinsEngine実装

**ファイル**: `/backend/services/SmallWinsEngine.js`

```javascript
const { Op } = require('sequelize');
const Workout = require('../models/Workout');
const Insight = require('../models/Insight');
const dayjs = require('dayjs');

class SmallWinsEngine {
  constructor() {
    // WHO推奨基準
    this.WHO_AEROBIC_TARGET = 150; // 週150分
    this.WHO_STRENGTH_TARGET = 2;  // 週2日

    // スコア重み付け
    this.WEIGHTS = {
      aerobic: 0.35,
      strength: 0.20,
      consistency: 0.15,
      improvement: 0.15,
      zone2: 0.15
    };

    // 筋力トレーニング判定用
    this.STRENGTH_EXERCISES = [
      'bench_press', 'squat', 'deadlift', 'push_up',
      'pull_up', 'plank', 'dumbbell', 'barbell',
      'resistance', 'weight', 'strength'
    ];
  }

  /**
   * 指定日のスコアを計算
   */
  async calculateScore(userId, date) {
    const targetDate = dayjs(date);
    const weekStart = targetDate.startOf('week');
    const weekEnd = targetDate.endOf('week');

    // 週間のワークアウトデータ取得
    const workouts = await this.getWeeklyWorkouts(userId, weekStart, weekEnd);

    // 各種スコア計算
    const aerobicData = this.calculateAerobicScore(workouts);
    const strengthData = this.calculateStrengthScore(workouts);
    const consistencyScore = this.calculateConsistencyScore(workouts);
    const improvementScore = await this.calculateImprovementScore(userId, workouts);
    const zone2Score = this.calculateZone2Score(workouts);

    // 総合スコア計算
    const totalScore = Math.round(
      aerobicData.score * this.WEIGHTS.aerobic +
      strengthData.score * this.WEIGHTS.strength +
      consistencyScore * this.WEIGHTS.consistency +
      improvementScore * this.WEIGHTS.improvement +
      zone2Score * this.WEIGHTS.zone2
    );

    // 健康メッセージ生成
    const healthMessage = this.generateHealthMessage(aerobicData, strengthData);

    // 推奨事項生成
    const recommendations = this.generateRecommendations(
      aerobicData,
      strengthData,
      consistencyScore
    );

    return {
      totalScore,
      aerobicScore: aerobicData.score,
      strengthScore: strengthData.score,
      whoAerobicAchieved: aerobicData.achieved,
      whoStrengthAchieved: strengthData.achieved,
      metrics: {
        aerobic: aerobicData.metrics,
        strength: strengthData.metrics,
        consistency: { score: consistencyScore, workoutDays: workouts.length },
        improvement: { score: improvementScore }
      },
      healthMessage,
      recommendations
    };
  }

  /**
   * 週間ワークアウトデータ取得
   */
  async getWeeklyWorkouts(userId, weekStart, weekEnd) {
    return await Workout.findAll({
      where: {
        userID: userId,
        date: {
          [Op.between]: [weekStart.toDate(), weekEnd.toDate()]
        }
      },
      order: [['date', 'DESC']]
    });
  }

  /**
   * 有酸素運動スコア計算
   */
  calculateAerobicScore(workouts) {
    const aerobicWorkouts = workouts.filter(w =>
      !this.isStrengthExercise(w.exercise)
    );

    const totalMinutes = aerobicWorkouts.reduce((sum, w) =>
      sum + (w.duration || 0), 0
    );

    const achievementRate = (totalMinutes / this.WHO_AEROBIC_TARGET) * 100;
    const score = Math.min(100, achievementRate);
    const achieved = totalMinutes >= this.WHO_AEROBIC_TARGET;

    return {
      score: Math.round(score),
      achieved,
      metrics: {
        weeklyMinutes: totalMinutes,
        targetMinutes: this.WHO_AEROBIC_TARGET,
        achievementRate: Math.round(achievementRate)
      }
    };
  }

  /**
   * 筋力トレーニングスコア計算
   */
  calculateStrengthScore(workouts) {
    const strengthWorkouts = workouts.filter(w =>
      this.isStrengthExercise(w.exercise)
    );

    // 筋トレ実施日数をカウント（同じ日の複数セッションは1日とカウント）
    const strengthDays = new Set(
      strengthWorkouts.map(w => dayjs(w.date).format('YYYY-MM-DD'))
    ).size;

    // 対象筋群の抽出
    const muscleGroups = this.extractMuscleGroups(strengthWorkouts);

    const dayAchievementRate = (strengthDays / this.WHO_STRENGTH_TARGET) * 100;
    const muscleVariety = (muscleGroups.length / 7) * 100; // 7主要筋群

    const score = (Math.min(100, dayAchievementRate) * 0.5) +
                  (Math.min(100, muscleVariety) * 0.5);

    const achieved = strengthDays >= this.WHO_STRENGTH_TARGET;

    return {
      score: Math.round(score),
      achieved,
      metrics: {
        weeklyDays: strengthDays,
        targetDays: this.WHO_STRENGTH_TARGET,
        achievementRate: Math.round(dayAchievementRate),
        muscleGroups: muscleGroups
      }
    };
  }

  /**
   * 運動が筋力トレーニングか判定
   */
  isStrengthExercise(exercise) {
    const exerciseLower = exercise.toLowerCase();
    return this.STRENGTH_EXERCISES.some(keyword =>
      exerciseLower.includes(keyword)
    );
  }

  /**
   * 対象筋群の抽出
   */
  extractMuscleGroups(workouts) {
    const groups = new Set();

    const muscleMap = {
      chest: ['bench', 'push', 'chest', 'fly'],
      back: ['pull', 'row', 'lat', 'back'],
      shoulders: ['shoulder', 'press', 'lateral', 'raise'],
      arms: ['bicep', 'tricep', 'curl', 'extension'],
      core: ['plank', 'crunch', 'sit-up', 'ab'],
      glutes: ['squat', 'deadlift', 'hip', 'glute'],
      legs: ['squat', 'lunge', 'leg', 'calf']
    };

    workouts.forEach(w => {
      const exerciseLower = w.exercise.toLowerCase();
      Object.entries(muscleMap).forEach(([group, keywords]) => {
        if (keywords.some(keyword => exerciseLower.includes(keyword))) {
          groups.add(group);
        }
      });
    });

    return Array.from(groups);
  }

  /**
   * 継続性スコア計算
   */
  calculateConsistencyScore(workouts) {
    const workoutDays = new Set(
      workouts.map(w => dayjs(w.date).format('YYYY-MM-DD'))
    ).size;

    // 週7日を100点満点とする
    return Math.min(100, (workoutDays / 7) * 100);
  }

  /**
   * 改善スコア計算
   */
  async calculateImprovementScore(userId, currentWorkouts) {
    // 前週のデータ取得
    const lastWeekStart = dayjs().subtract(1, 'week').startOf('week');
    const lastWeekEnd = dayjs().subtract(1, 'week').endOf('week');

    const previousWorkouts = await this.getWeeklyWorkouts(
      userId,
      lastWeekStart,
      lastWeekEnd
    );

    const currentMinutes = currentWorkouts.reduce((sum, w) =>
      sum + (w.duration || 0), 0
    );
    const previousMinutes = previousWorkouts.reduce((sum, w) =>
      sum + (w.duration || 0), 0
    );

    if (previousMinutes === 0) {
      return currentMinutes > 0 ? 100 : 0;
    }

    const changeRate = ((currentMinutes - previousMinutes) / previousMinutes) * 100;
    // -50% ~ +50% を 0-100 にマッピング
    return Math.max(0, Math.min(100, 50 + changeRate));
  }

  /**
   * Zone2運動スコア計算
   */
  calculateZone2Score(workouts) {
    // MVP版では簡易判定（中強度の運動を Zone2 とみなす）
    const zone2Minutes = workouts
      .filter(w => w.intensity === 'moderate' || w.intensity === 'medium')
      .reduce((sum, w) => sum + (w.duration || 0), 0);

    // 週60分を目標
    const targetZone2 = 60;
    return Math.min(100, (zone2Minutes / targetZone2) * 100);
  }

  /**
   * 健康メッセージ生成
   */
  generateHealthMessage(aerobicData, strengthData) {
    if (aerobicData.achieved && strengthData.achieved) {
      return 'WHO推奨完全達成：総死亡リスク40%減（BMJ 2022）';
    }
    if (aerobicData.achieved) {
      return 'WHO有酸素推奨達成：心疾患リスク30%減';
    }
    if (strengthData.achieved) {
      return 'WHO筋力推奨達成：サルコペニア予防効果';
    }
    if (aerobicData.score >= 50 || strengthData.score >= 50) {
      return '良好な運動習慣：健康維持に貢献中';
    }
    return '運動習慣を増やしましょう：週150分の運動で健康改善';
  }

  /**
   * 推奨事項生成
   */
  generateRecommendations(aerobicData, strengthData, consistencyScore) {
    const recommendations = [];

    // 有酸素運動の推奨
    if (!aerobicData.achieved) {
      const shortage = this.WHO_AEROBIC_TARGET - aerobicData.metrics.weeklyMinutes;
      if (shortage > 0) {
        recommendations.push(
          `有酸素運動をあと週${shortage}分追加でWHO推奨達成`
        );
      }
    }

    // 筋力トレーニングの推奨
    if (!strengthData.achieved) {
      const daysNeeded = this.WHO_STRENGTH_TARGET - strengthData.metrics.weeklyDays;
      if (daysNeeded > 0) {
        recommendations.push(
          `筋力トレーニングをあと週${daysNeeded}日追加でWHO推奨達成`
        );
      }
    }

    // 筋群バランスの推奨
    if (strengthData.metrics.muscleGroups.length < 7) {
      const missingGroups = ['chest', 'back', 'shoulders', 'arms', 'core', 'glutes', 'legs']
        .filter(g => !strengthData.metrics.muscleGroups.includes(g));

      if (missingGroups.length > 0) {
        recommendations.push(
          `${missingGroups.slice(0, 2).join('と')}の筋群も鍛えるとバランスが向上`
        );
      }
    }

    // 継続性の推奨
    if (consistencyScore < 70) {
      recommendations.push('週4日以上の運動で習慣化を促進');
    }

    // 完全達成者への推奨
    if (aerobicData.achieved && strengthData.achieved) {
      recommendations.push('素晴らしい！この習慣を維持しましょう');
      recommendations.push('Zone2運動を増やすと脂質代謝がさらに向上');
    }

    return recommendations.slice(0, 3); // 最大3つの推奨
  }
}

module.exports = SmallWinsEngine;
```

### Step 3: キャッシュ実装

**ファイル**: `/backend/services/InsightCache.js`

```javascript
class InsightCache {
  constructor() {
    this.cache = new Map();
    this.TTL = 3600000; // 1時間
  }

  generateKey(userId, date) {
    return `insight-${userId}-${date}`;
  }

  get(userId, date) {
    const key = this.generateKey(userId, date);
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(userId, date, data) {
    const key = this.generateKey(userId, date);
    this.cache.set(key, {
      data,
      expires: Date.now() + this.TTL
    });
  }

  delete(userId, date) {
    const key = this.generateKey(userId, date);
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // デバッグ用
  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;

    this.cache.forEach((item) => {
      if (now > item.expires) {
        expired++;
      } else {
        valid++;
      }
    });

    return {
      total: this.cache.size,
      valid,
      expired
    };
  }
}

// シングルトンとしてエクスポート
module.exports = new InsightCache();
```

### Step 4: バッチ処理実装

**ファイル**: `/backend/jobs/insightCalculation.js`

```javascript
const cron = require('node-cron');
const { Op } = require('sequelize');
const User = require('../models/User');
const SmallWinsEngine = require('../services/SmallWinsEngine');
const Insight = require('../models/Insight');
const dayjs = require('dayjs');

const engine = new SmallWinsEngine();

/**
 * 毎日深夜2時に全ユーザーのスコアを計算
 */
const scheduleInsightCalculation = () => {
  // 毎日 02:00 に実行
  cron.schedule('0 2 * * *', async () => {
    console.log('Starting daily insight calculation...');

    try {
      // アクティブユーザーを取得
      const users = await User.findAll({
        where: {
          active: true
        },
        attributes: ['id']
      });

      console.log(`Found ${users.length} active users`);

      const today = dayjs().format('YYYY-MM-DD');
      let successCount = 0;
      let errorCount = 0;

      // バッチ処理
      for (const user of users) {
        try {
          const scores = await engine.calculateScore(user.id, today);

          await Insight.upsert({
            userId: user.id,
            date: today,
            ...scores,
            calculatedAt: new Date()
          });

          successCount++;
        } catch (error) {
          console.error(`Failed to calculate for user ${user.id}:`, error);
          errorCount++;
        }

        // レート制限対策（100ms間隔）
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`Insight calculation completed. Success: ${successCount}, Errors: ${errorCount}`);
    } catch (error) {
      console.error('Batch calculation failed:', error);
    }
  });

  console.log('Insight calculation job scheduled');
};

module.exports = { scheduleInsightCalculation };
```

### Step 5: APIルート統合

**ファイル**: `/backend/app.js` に追加

```javascript
// 既存のインポートに追加
const insightRoutes = require('./routes/insightRoutes');
const { scheduleInsightCalculation } = require('./jobs/insightCalculation');

// ルート設定に追加
app.use('/api/v1/insights', insightRoutes);

// バッチジョブの開始
if (process.env.NODE_ENV !== 'test') {
  scheduleInsightCalculation();
}
```

### Step 6: 環境変数設定

**ファイル**: `/backend/.env`

```bash
# Small Wins Engine設定
INSIGHT_CACHE_TTL=3600000
INSIGHT_BATCH_ENABLED=true
INSIGHT_BATCH_TIME="0 2 * * *"
```

## 3. テスト実装

### 3.1 ユニットテスト

**ファイル**: `/backend/tests/services/SmallWinsEngine.test.js`

```javascript
const SmallWinsEngine = require('../../services/SmallWinsEngine');

describe('SmallWinsEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new SmallWinsEngine();
  });

  describe('calculateAerobicScore', () => {
    it('should calculate correct score for WHO target', () => {
      const workouts = [
        { exercise: 'running', duration: 30 },
        { exercise: 'cycling', duration: 45 },
        { exercise: 'swimming', duration: 40 },
        { exercise: 'walking', duration: 35 }
      ];

      const result = engine.calculateAerobicScore(workouts);

      expect(result.score).toBe(100);
      expect(result.achieved).toBe(true);
      expect(result.metrics.weeklyMinutes).toBe(150);
    });
  });

  describe('calculateStrengthScore', () => {
    it('should identify strength exercises correctly', () => {
      const workouts = [
        { exercise: 'bench press', date: '2025-01-20' },
        { exercise: 'squat', date: '2025-01-20' },
        { exercise: 'deadlift', date: '2025-01-22' }
      ];

      const result = engine.calculateStrengthScore(workouts);

      expect(result.metrics.weeklyDays).toBe(2);
      expect(result.achieved).toBe(true);
    });
  });
});
```

### 3.2 統合テスト

**ファイル**: `/backend/tests/api/insights.test.js`

```javascript
const request = require('supertest');
const app = require('../../app');
const { generateToken } = require('../helpers/auth');

describe('Insights API', () => {
  let token;
  let userId = 1;

  beforeAll(async () => {
    token = await generateToken(userId);
  });

  describe('GET /api/v1/insights/current', () => {
    it('should return current insight', async () => {
      const response = await request(app)
        .get('/api/v1/insights/current')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('scores');
      expect(response.body.scores).toHaveProperty('total');
      expect(response.body).toHaveProperty('whoCompliance');
    });
  });

  describe('POST /api/v1/insights/calculate', () => {
    it('should recalculate insight', async () => {
      const response = await request(app)
        .post('/api/v1/insights/calculate')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: '2025-01-25' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('result');
    });
  });
});
```

## 4. デバッグとトラブルシューティング

### 4.1 よくある問題と解決策

| 問題 | 原因 | 解決策 |
|-----|------|--------|
| スコアが0になる | ワークアウトデータなし | デフォルト値設定 |
| キャッシュが効かない | キー不一致 | 日付フォーマット統一 |
| 筋トレが認識されない | 判定キーワード不足 | STRENGTH_EXERCISES拡張 |
| APIが遅い | DB非効率クエリ | インデックス確認 |

### 4.2 ログ出力

```javascript
// デバッグログ設定
const debug = require('debug')('fitstart:insights');

debug('Calculating score for user %d on %s', userId, date);
debug('Aerobic score: %O', aerobicData);
debug('Strength score: %O', strengthData);
```

### 4.3 パフォーマンス監視

```javascript
// 実行時間計測
const startTime = Date.now();
const result = await engine.calculateScore(userId, date);
const executionTime = Date.now() - startTime;

console.log(`Score calculation took ${executionTime}ms`);
```

## 5. デプロイチェックリスト

### 本番環境デプロイ前の確認事項

- [ ] データベースマイグレーション実行
- [ ] 環境変数設定確認
- [ ] キャッシュTTL設定
- [ ] バッチジョブ時間設定
- [ ] エラーハンドリング確認
- [ ] レート制限設定
- [ ] ログレベル設定
- [ ] モニタリング設定

### デプロイコマンド

```bash
# 本番環境へのデプロイ
npm run build
npm run migrate:prod
npm run start:prod

# ヘルスチェック
curl https://api.fitstart.com/health
```

## 6. 今後の改善ポイント

### Phase 2 (3ヶ月後)
- Redis導入
- GraphQL API追加
- リアルタイム更新（WebSocket）
- 詳細な筋群分析

### Phase 3 (6ヶ月後)
- 機械学習による個別推奨
- 予測モデル実装
- マイクロサービス化

---

**完了**: MVP実装ガイドの作成が完了しました。
**次のアクション**: 実際のコーディング開始