# Small Wins Engine 技術仕様書

## 📋 概要

Small Wins Engineは、運動データをWHO基準の健康指標に変換し、ユーザーが理解しやすい形で健康への寄与を「翻訳」するコアエンジンです。

## 🎯 設計原則

1. **エビデンスベース**: WHO/厚生労働省のガイドラインに基づく
2. **透明性**: スコア算出根拠を明確に表示
3. **拡張性**: 新しい健康指標を容易に追加可能
4. **パフォーマンス**: キャッシングによる高速レスポンス

## 📐 アーキテクチャ

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Workout    │────▶│ SmallWins    │────▶│  Insights   │
│   Data      │     │   Engine     │     │    API      │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                     │
       ▼                    ▼                     ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  PostgreSQL │     │    Redis     │     │   Frontend  │
│  (Storage)  │     │   (Cache)    │     │  (Display)  │
└─────────────┘     └──────────────┘     └─────────────┘
```

## 🔢 スコアリングアルゴリズム

### 基本スコア計算式

```javascript
Score = Σ(Component_i × Weight_i)

where:
  Component_1: 有酸素運動達成率 (0-100)
  Component_2: 筋力トレーニング達成率 (0-100)
  Component_3: 連続日数スコア (0-100)
  Component_4: 前週比改善率 (0-100)
  Component_5: Zone2継続スコア (0-100)

  Weight_1: 0.35 (35%) - 有酸素運動
  Weight_2: 0.20 (20%) - 筋力トレーニング
  Weight_3: 0.15 (15%) - 連続性
  Weight_4: 0.15 (15%) - 改善傾向
  Weight_5: 0.15 (15%) - Zone2運動
```

### 有酸素運動達成率

```javascript
function calculateAerobicAchievement(minutes) {
  const WHO_AEROBIC_TARGET = 150; // 週150分の中強度運動
  // または週75分の高強度運動
  return Math.min(100, (minutes / WHO_AEROBIC_TARGET) * 100);
}
```

### 筋力トレーニング達成率

```javascript
function calculateStrengthAchievement(strengthDays, muscleGroups) {
  const WHO_STRENGTH_TARGET = 2; // 週2日以上
  const MAJOR_MUSCLE_GROUPS = 7; // 主要筋群数

  // 日数達成率（50%）
  const daysScore = Math.min(100, (strengthDays / WHO_STRENGTH_TARGET) * 100);

  // 筋群カバー率（50%）
  const muscleScore = (muscleGroups.length / MAJOR_MUSCLE_GROUPS) * 100;

  return (daysScore * 0.5) + (muscleScore * 0.5);
}

// 主要筋群の定義
const MAJOR_MUSCLE_GROUPS = [
  'chest',     // 胸
  'back',      // 背中
  'shoulders', // 肩
  'arms',      // 腕
  'core',      // 体幹
  'glutes',    // 臀部
  'legs'       // 脚
];
```

### 連続日数スコア

```javascript
function calculateStreakScore(days) {
  // 7日連続を100点とする対数曲線
  if (days === 0) return 0;
  if (days >= 7) return 100;
  return Math.round((days / 7) * 100);
}
```

### 前週比改善率

```javascript
function calculateImprovement(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  const change = ((current - previous) / previous) * 100;
  // -50% ~ +50%を0-100にマッピング
  return Math.max(0, Math.min(100, 50 + change));
}
```

## 🏷️ 健康寄与メッセージ

### メッセージ選択ロジック

```javascript
function getHealthBenefit(metrics) {
  const benefits = [];

  // 有酸素運動 + 筋力トレーニングの複合効果
  if (metrics.weeklyMinutes >= 150 && metrics.strengthDays >= 2) {
    benefits.push({
      level: 'platinum',
      message: 'WHO推奨完全達成：総死亡リスク40%減',
      evidence: 'BMJ 2022 - Combined aerobic and resistance training'
    });
  }

  // 有酸素運動のみ
  if (metrics.weeklyMinutes >= 150) {
    benefits.push({
      level: 'gold',
      message: 'WHO有酸素推奨達成：心疾患リスク30%減',
      evidence: 'WHO Physical Activity Guidelines 2020'
    });
  }

  // 筋力トレーニングのみ
  if (metrics.strengthDays >= 2) {
    benefits.push({
      level: 'gold',
      message: 'WHO筋力推奨達成：サルコペニア予防',
      evidence: 'WHO Physical Activity Guidelines 2020'
    });
  }

  if (metrics.weeklyMinutes >= 75 && metrics.intensity === 'high') {
    benefits.push({
      level: 'silver',
      message: '高強度運動：認知機能向上',
      evidence: 'Lancet Public Health 2018'
    });
  }

  if (metrics.strengthDays >= 1) {
    benefits.push({
      level: 'silver',
      message: '筋力トレーニング実施：骨密度維持',
      evidence: 'Osteoporosis International 2021'
    });
  }

  if (metrics.streakDays >= 7) {
    benefits.push({
      level: 'bronze',
      message: '習慣化達成：メンタルヘルス改善',
      evidence: 'JAMA Psychiatry 2019'
    });
  }

  return benefits.sort((a, b) =>
    ['platinum', 'gold', 'silver', 'bronze'].indexOf(a.level) -
    ['platinum', 'gold', 'silver', 'bronze'].indexOf(b.level)
  )[0];
}
```

## 💾 データモデル

### Insightテーブル

```sql
CREATE TABLE insights (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  rationale_json JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date, type)
);

CREATE INDEX idx_insights_user_date ON insights(user_id, date DESC);
CREATE INDEX idx_insights_score ON insights(score) WHERE score >= 80;
```

### Rationale JSON構造

```json
{
  "aerobic": {
    "weeklyMinutes": 157,
    "targetMinutes": 150,
    "achievementRate": 104.7,
    "zone2Minutes": 45,
    "highIntensityMinutes": 30
  },
  "strength": {
    "weeklyDays": 2,
    "targetDays": 2,
    "achievementRate": 100,
    "muscleGroups": ["chest", "back", "legs", "core"],
    "sessionsCompleted": 2
  },
  "consistency": {
    "streakDays": 7,
    "activeDays": 5,
    "previousWeekMinutes": 140,
    "weekOverWeekChange": 12.1
  },
  "healthBenefit": {
    "level": "platinum",
    "message": "WHO推奨完全達成：総死亡リスク40%減",
    "evidence": "BMJ 2022 - Combined aerobic and resistance training",
    "url": "https://www.bmj.com/content/377/bmj-2021-068449"
  },
  "recommendations": [
    "Zone2運動をあと15分増やすと脂質代謝が向上します",
    "上半身の筋群（肩・腕）も追加すると全身バランスが向上します",
    "週末も軽い運動を継続して連続記録を伸ばしましょう"
  ],
  "whoCompliance": {
    "aerobic": true,
    "strength": true,
    "combined": true
  }
}
```

## 🏋️ 運動種目の分類

### 筋力トレーニングの識別

```javascript
// 筋力トレーニングとして認識する運動種目
const STRENGTH_EXERCISES = {
  // ウェイトトレーニング
  weights: [
    'bench_press', 'squat', 'deadlift', 'shoulder_press',
    'bicep_curl', 'tricep_extension', 'lat_pulldown', 'row'
  ],

  // 自重トレーニング
  bodyweight: [
    'push_up', 'pull_up', 'dip', 'plank',
    'sit_up', 'crunch', 'lunge', 'burpee'
  ],

  // レジスタンスバンド
  resistance: [
    'band_pull', 'band_press', 'band_row', 'band_squat'
  ],

  // 機能的トレーニング
  functional: [
    'kettlebell', 'medicine_ball', 'battle_rope', 'tire_flip'
  ],

  // ヨガ・ピラティス（筋力要素あり）
  mindBody: [
    'power_yoga', 'vinyasa', 'pilates', 'barre'
  ]
};

// 運動が筋力トレーニングか判定
function isStrengthExercise(exercise) {
  const allStrengthExercises = [
    ...STRENGTH_EXERCISES.weights,
    ...STRENGTH_EXERCISES.bodyweight,
    ...STRENGTH_EXERCISES.resistance,
    ...STRENGTH_EXERCISES.functional,
    ...STRENGTH_EXERCISES.mindBody
  ];

  return allStrengthExercises.includes(exercise.toLowerCase().replace(/\s+/g, '_'));
}

// 対象筋群の特定
function identifyMuscleGroups(exercise) {
  const muscleGroupMap = {
    // 胸
    chest: ['bench_press', 'push_up', 'dip', 'chest_fly'],
    // 背中
    back: ['pull_up', 'lat_pulldown', 'row', 'deadlift'],
    // 肩
    shoulders: ['shoulder_press', 'lateral_raise', 'front_raise'],
    // 腕
    arms: ['bicep_curl', 'tricep_extension', 'hammer_curl'],
    // 体幹
    core: ['plank', 'sit_up', 'crunch', 'russian_twist'],
    // 臀部
    glutes: ['squat', 'deadlift', 'hip_thrust', 'lunge'],
    // 脚
    legs: ['squat', 'lunge', 'leg_press', 'calf_raise']
  };

  const targetedGroups = [];
  for (const [group, exercises] of Object.entries(muscleGroupMap)) {
    if (exercises.some(ex => exercise.toLowerCase().includes(ex))) {
      targetedGroups.push(group);
    }
  }

  return targetedGroups;
}
```

## 🚀 パフォーマンス最適化

### キャッシング戦略

```javascript
class InsightCache {
  constructor(redis) {
    this.redis = redis;
    this.TTL = 3600; // 1時間
  }
  
  getCacheKey(userId, type, date) {
    return `insight:${userId}:${type}:${date}`;
  }
  
  async get(userId, type, date) {
    const key = this.getCacheKey(userId, type, date);
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(userId, type, date, data) {
    const key = this.getCacheKey(userId, type, date);
    await this.redis.setex(key, this.TTL, JSON.stringify(data));
  }
  
  async invalidate(userId) {
    const pattern = `insight:${userId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### バッチ処理

```javascript
// 夜間バッチで翌日分を事前計算
async function preCalculateInsights() {
  const users = await User.findAll({ where: { active: true } });
  
  for (const user of users) {
    await queue.add('calculate-insight', {
      userId: user.id,
      date: dayjs().format('YYYY-MM-DD')
    }, {
      delay: Math.random() * 3600000, // 1時間内でランダム分散
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });
  }
}
```

## 🧪 テスト戦略

### 単体テスト例

```javascript
describe('SmallWinsEngine', () => {
  describe('calculateScore', () => {
    it('should return 100 for perfect metrics', () => {
      const metrics = {
        weeklyMinutes: 150,
        strengthDays: 2,
        muscleGroups: ['chest', 'back', 'shoulders', 'arms', 'core', 'glutes', 'legs'],
        streakDays: 7,
        weekOverWeekChange: 10,
        zone2Minutes: 60
      };
      const score = engine.calculateScore(metrics);
      expect(score).toBe(100);
    });

    it('should handle aerobic-only exercise', () => {
      const metrics = {
        weeklyMinutes: 150,
        strengthDays: 0,
        muscleGroups: [],
        streakDays: 5,
        weekOverWeekChange: 0
      };
      const score = engine.calculateScore(metrics);
      expect(score).toBeGreaterThan(30); // 有酸素運動分のスコア
      expect(score).toBeLessThan(60); // 筋トレ分が欠けている
    });

    it('should handle strength-only exercise', () => {
      const metrics = {
        weeklyMinutes: 0,
        strengthDays: 3,
        muscleGroups: ['chest', 'back', 'legs', 'core'],
        streakDays: 0,
        weekOverWeekChange: 0
      };
      const score = engine.calculateScore(metrics);
      expect(score).toBeGreaterThan(15); // 筋トレ分のスコア
      expect(score).toBeLessThan(40); // 有酸素運動分が欠けている
    });

    it('should cap score at 100', () => {
      const metrics = {
        weeklyMinutes: 300, // 200% of target
        strengthDays: 5, // 250% of target
        muscleGroups: ['chest', 'back', 'shoulders', 'arms', 'core', 'glutes', 'legs'],
        streakDays: 14,
        weekOverWeekChange: 100
      };
      const score = engine.calculateScore(metrics);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should recognize WHO complete compliance', () => {
      const metrics = {
        weeklyMinutes: 150,
        strengthDays: 2,
        muscleGroups: ['chest', 'back', 'legs']
      };
      const benefit = engine.getHealthBenefit(metrics);
      expect(benefit.level).toBe('platinum');
      expect(benefit.message).toContain('40%');
    });
  });
});
```

## 📊 メトリクス

### 監視指標

| メトリクス | 目標値 | アラート閾値 |
|-----------|--------|-------------|
| 計算成功率 | 99.9% | < 95% |
| レスポンス時間 P95 | < 200ms | > 500ms |
| キャッシュヒット率 | > 80% | < 60% |
| エラー率 | < 0.1% | > 1% |

### ログ出力

```javascript
logger.info('Insight calculated', {
  userId,
  score,
  calculationTime: Date.now() - startTime,
  cacheHit: false,
  weeklyMinutes: metrics.weeklyMinutes,
  streakDays: metrics.streakDays
});
```

## 🔄 将来の拡張

### Phase 2機能
- 睡眠スコアの統合
- 栄養データとの相関
- AIによる個別推奨
- 医療機関向けAPI

### Phase 3機能
- 予測モデル（3ヶ月後の健康状態）
- グループ比較（同年代平均との比較）
- 健康目標の自動設定
- 医師コメント機能

---

**作成日**: 2025年9月26日
**バージョン**: 1.0.0
**作成者**: FitStart Tech Lead