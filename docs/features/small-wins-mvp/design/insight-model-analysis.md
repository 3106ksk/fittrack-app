# Insight.js モデル設計解説書

**文書番号**: MOD-SW-001
**バージョン**: 1.0.0
**作成日**: 2025-09-25
**ステータス**: Model Design Analysis

## 1. Insightモデルの全体像と設計思想

### 1.1 モデルの目的
```javascript
// models/Insight.js の役割
/*
 * Insightモデルは「運動データの健康指標への変換結果」を永続化する
 * - 日次の健康スコアを保存（再計算コスト削減）
 * - 履歴データとして医療連携に使用
 * - トレンド分析の基礎データ
 */
```

### 1.2 設計原則
1. **イミュータブル性**: 一度計算されたスコアは原則変更しない
2. **監査可能性**: いつ、どのバージョンで計算されたか追跡可能
3. **拡張性**: JSONBフィールドで将来の指標追加に対応

## 2. 各カラムの詳細解説

### 2.1 識別子フィールド

#### `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
```javascript
id: {
  type: DataTypes.INTEGER,
  primaryKey: true,
  autoIncrement: true
}
```

**役割**: レコードの一意識別子
**型決定理由**:
- INTEGER: PostgreSQLのSERIAL型と互換性があり、インデックス効率が良い
- AUTO_INCREMENT: アプリケーション側でIDを管理する必要がない

**実例**:
```sql
-- 自動採番される
INSERT INTO insights (user_id, date) VALUES (1, '2025-09-25');
-- id = 1001 (自動付与)
```

---

### 2.2 関連付けフィールド

#### `userId` (INTEGER, NOT NULL, FOREIGN KEY)
```javascript
userId: {
  type: DataTypes.INTEGER,
  allowNull: false,
  field: 'user_id',  // snake_case変換
  references: {
    model: 'users',
    key: 'id'
  }
}
```

**役割**: Userモデルとの1対多関係を確立
**型決定理由**:
- INTEGER: users.idと同じ型で外部キー制約
- NOT NULL: 孤立したインサイトは意味がない

**実例と影響**:
```javascript
// ユーザー削除時の連鎖削除
await User.destroy({ where: { id: 123 } });
// → user_id = 123 のすべてのinsightsも自動削除（CASCADE）

// 関連データの取得
const userWithInsights = await User.findOne({
  include: [{
    model: Insight,
    as: 'insights',
    order: [['date', 'DESC']]
  }]
});
```

---

### 2.3 時系列フィールド

#### `date` (DATEONLY, NOT NULL)
```javascript
date: {
  type: DataTypes.DATEONLY,  // 時刻なしの日付
  allowNull: false
}
```

**役割**: スコア計算の対象日
**型決定理由**:
- DATEONLY: 時刻は不要、日単位の集計のため
- NOT NULL: 日付のないスコアは無意味

**実例**:
```javascript
// 正しい使用例
await Insight.create({
  userId: 1,
  date: '2025-09-25'  // YYYY-MM-DD形式
});

// ユニーク制約（userId + date）
await Insight.upsert({
  userId: 1,
  date: '2025-09-25',
  totalScore: 85
});
// → 既存レコードがあれば更新、なければ作成
```

---

### 2.4 スコアフィールド群

#### `totalScore` (INTEGER, 0-100)
```javascript
totalScore: {
  type: DataTypes.INTEGER,
  defaultValue: 0,
  field: 'total_score',
  validate: {
    min: 0,
    max: 100
  }
}
```

**役割**: 総合健康スコア（すべての要素の加重平均）
**型決定理由**:
- INTEGER: 小数点は不要、UIで整数表示
- 0-100範囲: パーセンテージとして直感的

**計算ロジック**:
```javascript
// SmallWinsEngineでの計算例
const totalScore = Math.round(
  cardioScore * 0.35 +      // カーディオ運動: 35%
  strengthScore * 0.20 +     // 筋力トレーニング: 20%
  consistencyScore * 0.15 +  // 継続性: 15%
  improvementScore * 0.15 +  // 改善度: 15%
  zone2Score * 0.15         // Zone2運動: 15%
);
```

#### `cardioScore` / `strengthScore` (INTEGER, 0-100)
```javascript
cardioScore: {
  type: DataTypes.INTEGER,
  defaultValue: 0,
  field: 'cardio_score',
  validate: { min: 0, max: 100 }
}
```

**役割**:
- cardioScore: WHO推奨有酸素運動（週150分）の達成率
- strengthScore: WHO推奨筋力トレーニング（週2日）の達成率

**実例**:
```javascript
// 週150分運動 → cardioScore = 100
// 週75分運動 → cardioScore = 50
// 週300分運動 → cardioScore = 100（上限でキャップ）
```

---

### 2.5 達成フラグフィールド

#### `whoCardioAchieved` / `whoStrengthAchieved` (BOOLEAN)
```javascript
whoCardioAchieved: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  field: 'who_cardio_achieved'
}
```

**役割**: WHO基準の達成フラグ（バイナリ判定）
**型決定理由**:
- BOOLEAN: 達成/未達成の2値
- インデックス最適化に有利

**使用例**:
```javascript
// 完全達成者のクエリ（高速）
const achievers = await Insight.findAll({
  where: {
    whoCardioAchieved: true,
    whoStrengthAchieved: true,
    date: TODAY
  }
});

// パーシャルインデックスの活用
CREATE INDEX idx_who_achievers ON insights(user_id)
WHERE who_cardio_achieved = TRUE AND who_strength_achieved = TRUE;
```

---

### 2.6 詳細データフィールド

#### `metrics` (JSONB)
```javascript
metrics: {
  type: DataTypes.JSONB,  // PostgreSQL専用
  defaultValue: {}
}
```

**役割**: 計算の詳細データを柔軟に保存
**型決定理由**:
- JSONB: 構造化データをそのまま保存、クエリ可能
- 将来の拡張に対応（スキーマ変更不要）

**実例データ構造**:
```json
{
  "cardio": {
    "weeklyMinutes": 165,
    "targetMinutes": 150,
    "achievementRate": 110,
    "byDay": {
      "2025-09-19": 30,
      "2025-09-21": 45,
      "2025-09-23": 90
    }
  },
  "strength": {
    "weeklyDays": 2,
    "targetDays": 2,
    "muscleGroups": ["chest", "back", "legs"],
    "sessions": [
      {"date": "2025-09-20", "duration": 45},
      {"date": "2025-09-22", "duration": 30}
    ]
  },
  "consistency": {
    "streakDays": 7,
    "activeDays": 5,
    "restDays": 2
  },
  "improvement": {
    "weekOverWeek": 12.5,
    "monthOverMonth": 28.3
  }
}
```

**クエリ例**:
```sql
-- JSONBの検索（筋群に"legs"を含むユーザー）
SELECT * FROM insights
WHERE metrics->'strength'->>'muscleGroups' @> '["legs"]';

-- 週間運動量でソート
SELECT * FROM insights
ORDER BY (metrics->'cardio'->>'weeklyMinutes')::int DESC;
```

---

### 2.7 メッセージフィールド

#### `healthMessage` (VARCHAR(255))
```javascript
healthMessage: {
  type: DataTypes.STRING(255),
  field: 'health_message',
  allowNull: true
}
```

**役割**: ユーザー向けの健康メッセージ（最重要1件）
**型決定理由**:
- VARCHAR(255): 日本語で約80文字、英語で約40単語
- NULLable: メッセージがない場合もある

**実例**:
```javascript
// メッセージ生成ロジック
if (cardioAchieved && strengthAchieved) {
  healthMessage = "WHO推奨完全達成：総死亡リスク40%減（BMJ 2022）";
} else if (cardioAchieved) {
  healthMessage = "WHOカーディオ推奨達成：心疾患リスク30%減";
} else {
  healthMessage = "運動習慣を増やしましょう：週150分で健康改善";
}
```

#### `recommendations` (TEXT[])
```javascript
recommendations: {
  type: DataTypes.ARRAY(DataTypes.TEXT),
  defaultValue: []
}
```

**役割**: 個別化された改善提案（複数）
**型決定理由**:
- ARRAY: PostgreSQL配列型で複数の提案を保存
- TEXT: 長文の提案にも対応

**実例**:
```javascript
recommendations: [
  "カーディオ運動をあと週30分追加でWHO推奨達成",
  "上半身の筋群（肩・腕）も追加でバランス向上",
  "Zone2運動を増やすと脂質代謝がさらに改善"
]

// クエリでの使用
const needsCardio = await Insight.findAll({
  where: {
    recommendations: {
      [Op.contains]: ["カーディオ運動"]
    }
  }
});
```

---

### 2.8 メタデータフィールド

#### `calculatedAt` (TIMESTAMP)
```javascript
calculatedAt: {
  type: DataTypes.DATE,
  defaultValue: DataTypes.NOW,
  field: 'calculated_at'
}
```

**役割**: スコア計算実行時刻の記録
**型決定理由**:
- TIMESTAMP: ミリ秒単位の精度が必要
- 再計算のタイミング判定に使用

**実例**:
```javascript
// 古いデータの再計算判定
const needsRecalc = await Insight.findAll({
  where: {
    calculatedAt: {
      [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24時間前
    }
  }
});
```

#### `version` (VARCHAR(10))
```javascript
version: {
  type: DataTypes.STRING(10),
  defaultValue: '1.0.0'
}
```

**役割**: 計算アルゴリズムのバージョン管理
**型決定理由**:
- VARCHAR(10): セマンティックバージョニング形式
- アルゴリズム変更時の互換性確保

**実例**:
```javascript
// バージョン別の処理
if (insight.version === '1.0.0') {
  // 旧アルゴリズムでの表示
} else if (insight.version === '2.0.0') {
  // 新アルゴリズムでの表示
}
```

---

## 3. モデル間の影響分析

### 3.1 Insightモデル追加による既存モデルへの影響

#### Userモデルへの影響

```javascript
// models/User.js の変更
User.associate = function(models) {
  // 既存のアソシエーション
  User.hasMany(models.Workout, {
    foreignKey: 'userID',
    as: 'workouts'
  });

  // 新規追加されるアソシエーション
  User.hasMany(models.Insight, {
    foreignKey: 'userId',
    as: 'insights',
    onDelete: 'CASCADE'
  });
};

// 影響を受けるクエリ
const userProfile = await User.findOne({
  where: { id: userId },
  include: [
    'workouts',  // 既存
    'insights'   // 新規追加
  ]
});
```

**影響度**: 中
- メリット: ユーザープロフィール画面で健康スコアを即座に表示可能
- デメリット: includeクエリのパフォーマンス低下の可能性

#### Workoutモデルへの影響

```javascript
// models/Workout.js - 直接的な変更はないが、論理的関係が発生

// 新規: Workout変更時のInsight無効化
Workout.afterUpdate(async (workout, options) => {
  // 該当日のInsightに再計算フラグを立てる
  await Insight.update(
    {
      metrics: sequelize.fn(
        'jsonb_set',
        sequelize.col('metrics'),
        '{needsRecalculation}',
        'true'
      )
    },
    {
      where: {
        userId: workout.userID,
        date: workout.workout_date
      }
    }
  );
});
```

**影響度**: 低〜中
- メリット: データ整合性の自動保証
- デメリット: Workout更新時のオーバーヘッド増加

### 3.2 影響箇所の具体的リスト

#### APIルート層への影響

```javascript
// 変更が必要なファイル
// ✅ backend/routes/userRoutes.js
router.get('/profile/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    include: [
      'workouts',
      'insights'  // 新規追加
    ]
  });
  // ...
});

// ✅ backend/routes/dashboardRoutes.js
router.get('/dashboard', async (req, res) => {
  const [workouts, insights] = await Promise.all([
    Workout.findAll({ where: { userID: req.user.id } }),
    Insight.findOne({  // 新規追加
      where: { userId: req.user.id, date: TODAY }
    })
  ]);
  // ...
});

// ✅ 新規作成: backend/routes/insightRoutes.js
```

#### サービス層への影響

```javascript
// ✅ backend/services/HealthService.js (新規作成)
class HealthService {
  async calculateDailyScore(userId, date) {
    // Workoutデータを取得
    const workouts = await Workout.findAll({
      where: {
        userID: userId,
        workout_date: {
          [Op.between]: [weekStart, weekEnd]
        }
      }
    });

    // Insightを作成または更新
    const [insight, created] = await Insight.upsert({
      userId,
      date,
      ...calculatedScores
    });

    return insight;
  }
}
```

#### バッチジョブへの影響

```javascript
// ✅ backend/jobs/dailyCalculation.js (新規作成)
const calculateAllUsersInsights = async () => {
  const users = await User.findAll({ where: { active: true } });

  for (const user of users) {
    await Insight.create({
      userId: user.id,
      date: TODAY,
      // ... スコア計算
    });
  }
};
```

### 3.3 データベースへの影響

#### インデックス戦略の見直し

```sql
-- Workoutテーブルの既存インデックス
CREATE INDEX idx_workouts_user_date ON workouts(userID, workout_date);

-- Insightテーブル追加に伴う新規インデックス
CREATE INDEX idx_insights_user_date ON insights(user_id, date DESC);
CREATE INDEX idx_insights_score ON insights(total_score DESC);

-- 複合クエリ最適化のための追加インデックス
CREATE INDEX idx_workouts_user_week ON workouts(userID, workout_date)
WHERE workout_date >= CURRENT_DATE - INTERVAL '7 days';
```

#### ストレージへの影響

```sql
-- 想定されるデータ増加量
/*
 * ユーザー数: 10,000
 * 1日1レコード/ユーザー
 * レコードサイズ: 約500バイト（JSONB含む）
 *
 * 日次増加: 10,000 * 500B = 5MB
 * 月次増加: 5MB * 30 = 150MB
 * 年次増加: 150MB * 12 = 1.8GB
 */

-- パーティショニング戦略（1年後）
CREATE TABLE insights_2025_09 PARTITION OF insights
FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
```

### 3.4 フロントエンドへの影響

#### Redux Storeの拡張

```javascript
// store/slices/insightSlice.js (新規作成)
const insightSlice = createSlice({
  name: 'insights',
  initialState: {
    current: null,
    weekly: [],
    loading: false
  },
  reducers: {
    setCurrentInsight: (state, action) => {
      state.current = action.payload;
    }
  }
});

// store/index.js
export const store = configureStore({
  reducer: {
    user: userReducer,
    workouts: workoutReducer,
    insights: insightReducer  // 新規追加
  }
});
```

#### コンポーネントへの影響

```jsx
// components/Dashboard.jsx
const Dashboard = () => {
  // 既存のworkoutデータ
  const workouts = useSelector(state => state.workouts);

  // 新規追加のinsightデータ
  const insight = useSelector(state => state.insights.current);

  return (
    <div>
      {/* 新規追加 */}
      <HealthScoreCard score={insight?.totalScore} />

      {/* 既存 */}
      <WorkoutList workouts={workouts} />
    </div>
  );
};
```

## 4. パフォーマンスへの影響

### 4.1 クエリパフォーマンス

```javascript
// ❌ N+1問題が発生する例
const users = await User.findAll();
for (const user of users) {
  const insight = await Insight.findOne({
    where: { userId: user.id, date: TODAY }
  });
}

// ✅ 最適化された例
const insights = await Insight.findAll({
  where: { date: TODAY },
  include: [{
    model: User,
    as: 'user'
  }]
});
```

### 4.2 キャッシング戦略

```javascript
// Redis/メモリキャッシュの必要性
class InsightCache {
  async get(userId, date) {
    const key = `insight:${userId}:${date}`;

    // キャッシュヒット
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    // キャッシュミス - DBから取得
    const insight = await Insight.findOne({
      where: { userId, date }
    });

    // キャッシュ保存（1時間）
    await redis.setex(key, 3600, JSON.stringify(insight));
    return insight;
  }
}
```

## 5. マイグレーション戦略

### 5.1 段階的導入計画

```javascript
// Phase 1: テーブル作成のみ（影響最小）
await queryInterface.createTable('insights', {...});

// Phase 2: 初期データ投入（過去7日分）
await Insight.bulkCreate(initialData);

// Phase 3: APIエンドポイント有効化
app.use('/api/insights', insightRoutes);

// Phase 4: UIコンポーネント表示
// フィーチャーフラグで制御
if (FEATURE_FLAGS.INSIGHTS_ENABLED) {
  return <HealthScoreCard />;
}
```

### 5.2 ロールバック計画

```sql
-- ロールバックSQL
DROP TABLE IF EXISTS insights CASCADE;

-- アソシエーション削除
-- models/User.js から insights アソシエーションを削除
-- APIルートから /insights エンドポイントを削除
```

## 6. まとめ

### Insightモデル追加の総合影響度: **中〜高**

**メリット**:
- パフォーマンス向上（計算結果のキャッシュ）
- 医療連携機能の基盤確立
- トレンド分析の実現

**デメリット**:
- ストレージコスト増加（年間約2GB/1万ユーザー）
- データ整合性管理の複雑化
- 初期実装コスト（約2-3週間）

**推奨事項**:
1. 段階的導入でリスク最小化
2. キャッシング層の早期実装
3. モニタリング強化（特にストレージとパフォーマンス）

---

**作成日**: 2025-09-25
**バージョン**: 1.0.0
**作成者**: FitStart Tech Lead