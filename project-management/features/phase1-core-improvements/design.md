# Phase 1: コア機能改善 + セキュリティ基盤 - 設計書

**作成日**: 2025-10-09
**期間**: 2025年10月（Month 1）
**関連**: [要件定義書](./requirements.md)

---

## 📋 目次

1. [アーキテクチャ概要](#アーキテクチャ概要)
2. [コンポーネント設計](#コンポーネント設計)
3. [データモデル](#データモデル)
4. [API設計](#api設計)
5. [セキュリティ設計](#セキュリティ設計)
6. [実装計画](#実装計画)

---

## アーキテクチャ概要

### Before（現状）

```
[Dashboard.jsx] ──────┐
                      ↓
                 [Statistics]
                 [HealthScore]

[WorkoutHistory.jsx] ─┐
  └─ [WorkoutHistoryTable.jsx] (355行)
  └─ [WorkoutCustomizationDrawer.jsx] (150行)
  └─ [useWorkoutConfig.js] (80行)
  └─ [TransformWorkoutData.js] (46行)
```

### After（Phase 1完了後）

```
[Dashboard.jsx] ──────┬───────────────┐
                      ↓               ↓
                 [Statistics]    [WeeklyActivitySummary]
                 [HealthScore]        ↓
                                 [RecentWorkoutsList]
                                      ↓
                                 (直近10件表示)
```

### 削減されるコード

| ファイル | 行数 | 削除理由 |
|---------|------|---------|
| WorkoutHistory.jsx | 77 | ダッシュボードに統合 |
| WorkoutHistoryTable.jsx | 355 | シンプルなリストに置換 |
| WorkoutCustomizationDrawer.jsx | 150 | カスタマイズ機能削除 |
| useWorkoutConfig.js | 80 | 不要になる |
| TransformWorkoutData.js（部分） | 20 | グループ化ロジックのみ再利用 |
| **合計** | **約680行** | **+ ルート・テスト等で800行削減** |

---

## コンポーネント設計

### 1. RecentWorkoutsList コンポーネント

#### 責務
- 直近10件のワークアウトを日付グループ化して表示
- 1日複数回トレーニング時は時刻も表示
- セット詳細（repsDetail）を適切にフォーマット

#### Props
```typescript
interface RecentWorkoutsListProps {
  workouts: Workout[]; // 全ワークアウトデータ
}
```

#### State
```typescript
// なし（Pure Component）
```

#### ファイル構成
```
frontend/src/components/activity/
├── RecentWorkoutsList.jsx         # メインコンポーネント
├── WorkoutItem.jsx                # 個別ワークアウト表示
└── utils/
    ├── formatWorkoutDetails.js    # フォーマット関数
    └── groupByDate.js             # 日付グループ化
```

#### 実装（RecentWorkoutsList.jsx）

```jsx
import { Box, Typography } from '@mui/material';
import WorkoutItem from './WorkoutItem';
import { groupByDate } from './utils/groupByDate';

const RecentWorkoutsList = ({ workouts }) => {
  // 直近10件に絞る
  const recent10 = workouts.slice(0, 10);

  // 日付でグループ化
  const groupedByDate = groupByDate(recent10);

  if (recent10.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        まだワークアウトがありません
      </Typography>
    );
  }

  return (
    <Box>
      {Object.entries(groupedByDate).map(([date, dayWorkouts]) => (
        <Box key={date} sx={{ mb: 2 }}>
          {/* 日付ヘッダー */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 'bold', mb: 0.5, display: 'block' }}
          >
            {date}
          </Typography>

          {/* その日のワークアウト */}
          <Box sx={{ pl: 2, borderLeft: '2px solid #4CAF50' }}>
            {dayWorkouts.map((workout, idx) => (
              <WorkoutItem
                key={workout.id || idx}
                workout={workout}
                showTime={dayWorkouts.length > 1} // 複数ある時だけ時刻表示
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default RecentWorkoutsList;
```

#### 実装（WorkoutItem.jsx）

```jsx
import { Box, Typography, Chip } from '@mui/material';
import { DirectionsRun, FitnessCenter } from '@mui/icons-material';
import { formatWorkoutDetails } from './utils/formatWorkoutDetails';

const WorkoutItem = ({ workout, showTime }) => {
  const icon = workout.exerciseType === 'cardio'
    ? <DirectionsRun fontSize="small" color="action" />
    : <FitnessCenter fontSize="small" color="action" />;

  // 時刻を抽出（createdAtから）
  const time = showTime && workout.createdAt
    ? new Date(workout.createdAt).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      mb: 0.5
    }}>
      {icon}
      <Typography variant="body2">
        {workout.exercise}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {formatWorkoutDetails(workout)}
      </Typography>
      {time && (
        <Chip
          label={time}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      )}
    </Box>
  );
};

export default WorkoutItem;
```

#### ユーティリティ関数

```javascript
// formatWorkoutDetails.js
export const formatWorkoutDetails = (workout) => {
  if (workout.exerciseType === 'cardio') {
    return `${workout.distance}km`;
  }

  // repsDetailがある場合は各セットの回数を表示
  if (workout.repsDetail && Array.isArray(workout.repsDetail)) {
    const repsPerSet = workout.repsDetail.map(set => set.reps).join(',');
    return `${repsPerSet} (${workout.sets}set)`;
  }

  // 通常の場合
  return `${workout.reps}×${workout.sets}`;
};

// groupByDate.js
export const groupByDate = (workouts) => {
  return workouts.reduce((acc, workout) => {
    const dateKey = new Date(workout.date).toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
    });
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(workout);
    return acc;
  }, {});
};
```

---

### 2. Dashboard.jsx への統合

#### 修正内容

```jsx
// Dashboard.jsx への追加
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RecentWorkoutsList from '../components/activity/RecentWorkoutsList';

// 既存のDashboardPageコンポーネント内に追加
<Card sx={{ mb: 3 }}>
  <CardHeader title="今週のアクティビティ" />
  <CardContent>
    {/* 今週のサマリー（既存の quickStats を活用）*/}
    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
      <Chip
        label={`${weeklyStats.weeklyWorkouts}回`}
        color="primary"
        size="small"
      />
      <Chip
        label={`${weeklyStats.weeklyReps}レップ`}
        color="secondary"
        size="small"
      />
      <Chip
        label={`${weeklyStats.weeklyDistance.toFixed(1)}km`}
        color="success"
        size="small"
      />
    </Box>

    {/* 過去ログ（折りたたみ）*/}
    <Accordion sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ minHeight: 48 }}
      >
        <Typography variant="body2" color="text.secondary">
          直近のログを見る（{Math.min(workouts.length, 10)}件）
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <RecentWorkoutsList workouts={workouts} />
      </AccordionDetails>
    </Accordion>
  </CardContent>
</Card>
```

---

## データモデル

### Workout型の拡張

#### Before（現状）
```typescript
// APIレスポンスに createdAt が含まれていない
interface Workout {
  id: number;
  date: string; // DATEONLY
  exercise: string;
  exerciseType: 'cardio' | 'strength';
  // ... 他のフィールド
}
```

#### After（Phase 1完了後）
```typescript
interface Workout {
  id: number;
  date: string; // DATEONLY
  createdAt: string; // ★追加: ISO 8601 timestamp
  exercise: string;
  exerciseType: 'cardio' | 'strength';
  // cardio
  distance?: number;
  duration?: number;
  // strength
  reps?: number;
  sets?: number;
  repsDetail?: RepsDetail[];
}

interface RepsDetail {
  setNumber: number;
  reps: number;
}
```

### データベーススキーマ（変更なし）

```sql
-- workouts テーブル（既存）
CREATE TABLE workouts (
  id SERIAL PRIMARY KEY,
  "userID" INTEGER NOT NULL,
  date DATE NOT NULL,
  exercise VARCHAR(255) NOT NULL,
  "exerciseType" VARCHAR(50) NOT NULL,
  sets INTEGER,
  reps INTEGER,
  "repsDetail" JSONB,  -- [{setNumber: 1, reps: 30}, ...]
  distance FLOAT,
  duration INTEGER,
  intensity VARCHAR(50),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),  -- ★既存
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**重要**: データベーススキーマは変更なし。`createdAt`は既に存在するが、APIレスポンスに含まれていなかっただけ。

---

## API設計

### GET /workouts の修正

#### Before（現状）
```javascript
// backend/routes/workouts.js:245-269
const formatWorkoutData = (workout) => {
  const baseData = {
    id: workout.id,
    date: workout.date,
    exercise: workout.exercise,
    exerciseType: workout.exerciseType,
    intensity: workout.intensity
    // createdAt が含まれていない ★
  };
  // ...
};
```

#### After（修正後）
```javascript
const formatWorkoutData = (workout) => {
  const baseData = {
    id: workout.id,
    date: workout.date,
    createdAt: workout.createdAt,  // ★追加（1行）
    exercise: workout.exercise,
    exerciseType: workout.exerciseType,
    intensity: workout.intensity
  };

  if (workout.exerciseType === 'strength') {
    return {
      ...baseData,
      sets: workout.sets,
      reps: workout.reps,
      repsDetail: workout.repsDetail || [],
      isCardio: false
    };
  } else {
    return {
      ...baseData,
      distance: workout.distance,
      duration: workout.duration,
      isCardio: true
    };
  }
};
```

**修正箇所**: `backend/routes/workouts.js:247`（1行追加のみ）

---

## セキュリティ設計

### 1. CSP（Content Security Policy）

#### 設計方針
- **防御対象**: XSS（Cross-Site Scripting）攻撃
- **実装方法**: Helmet ミドルウェア
- **環境別設定**: 開発環境はゆるく、本番環境は厳格に

#### 実装（backend/config/security.js）

```javascript
const helmet = require('helmet');

const getCSPDirectives = (env) => {
  const baseDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"], // Material-UI のため
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  };

  // 開発環境では制限を緩和
  if (env === 'development') {
    baseDirectives.scriptSrc.push("'unsafe-eval'"); // Vite HMR のため
    baseDirectives.connectSrc.push("ws://localhost:*"); // WebSocket
  }

  return baseDirectives;
};

const configureHelmet = (app) => {
  app.use(
    helmet.contentSecurityPolicy({
      directives: getCSPDirectives(process.env.NODE_ENV),
    })
  );

  // 他のHelmet設定
  app.use(helmet.hsts({ maxAge: 31536000 })); // 1年
  app.use(helmet.noSniff());
  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(helmet.xssFilter());
};

module.exports = { configureHelmet };
```

#### 適用（backend/app.js）

```javascript
const { configureHelmet } = require('./config/security');

// ... 既存コード

// Helmetの設定（ミドルウェアの早い段階で適用）
configureHelmet(app);

// ... 既存のミドルウェア
```

---

### 2. Rate Limiting

#### 設計方針
- **防御対象**: DDoS攻撃、ブルートフォース攻撃
- **実装方法**: express-rate-limit
- **制限レベル**: API種別ごとに異なる制限

#### 実装（backend/middleware/rateLimiter.js）

```javascript
const rateLimit = require('express-rate-limit');

// 認証API用（厳格）
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分
  max: 5, // 5回まで
  message: {
    error: 'Too many login attempts from this IP, please try again after 1 minute.'
  },
  standardHeaders: true, // `RateLimit-*` ヘッダーを返す
  legacyHeaders: false,
});

// 一般API用（緩め）
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 100, // 100回まで
  message: {
    error: 'Too many requests from this IP, please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strava API用（中程度）
const stravaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 20, // 20回まで
  message: {
    error: 'Too many Strava requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter, stravaLimiter };
```

#### 適用例

```javascript
// backend/routes/authRoutes.js
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, async (req, res) => {
  // ... ログイン処理
});

router.post('/register', authLimiter, async (req, res) => {
  // ... 登録処理
});
```

```javascript
// backend/routes/workouts.js
const { apiLimiter } = require('../middleware/rateLimiter');

router.post('/', apiLimiter, authMiddleware, async (req, res) => {
  // ... ワークアウト作成
});
```

---

### 3. 監査ログ（Winston Logger）

#### 設計方針
- **目的**: 医療データ拡張に向けた監査証跡の基盤
- **保持期間**: 30日（Phase 3で7年に拡張）
- **ログレベル**: error, warn, info, debug
- **ローテーション**: 日次、最大30ファイル

#### 実装（backend/utils/logger.js）

```javascript
const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// ログディレクトリ
const logDir = path.join(__dirname, '../../logs');

// 日次ローテーション設定
const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'fittrack-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d', // 30日保持
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

// Loggerの作成
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    dailyRotateFileTransport,

    // 開発環境ではコンソールにも出力
    ...(process.env.NODE_ENV === 'development' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ] : []),
  ],
});

module.exports = logger;
```

#### 監査ログミドルウェア（backend/middleware/auditLogger.js）

```javascript
const logger = require('../utils/logger');

const auditLogger = (action) => {
  return (req, res, next) => {
    // レスポンス完了時にログを記録
    const originalSend = res.send;

    res.send = function(data) {
      // 成功時のみログ記録（2xx, 3xx）
      if (res.statusCode >= 200 && res.statusCode < 400) {
        logger.info({
          action,
          userId: req.user?.id,
          method: req.method,
          path: req.path,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          statusCode: res.statusCode,
          timestamp: new Date().toISOString(),
        });
      }

      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = auditLogger;
```

#### 適用例

```javascript
// backend/routes/authRoutes.js
const auditLogger = require('../middleware/auditLogger');

router.post('/register', auditLogger('user.register'), async (req, res) => {
  // ... 登録処理
});

router.post('/login', auditLogger('user.login'), async (req, res) => {
  // ... ログイン処理
});
```

```javascript
// backend/routes/workouts.js
router.post('/', authMiddleware, auditLogger('workout.create'), async (req, res) => {
  // ... ワークアウト作成
});

router.put('/:id', authMiddleware, auditLogger('workout.update'), async (req, res) => {
  // ... ワークアウト更新
});

router.delete('/:id', authMiddleware, auditLogger('workout.delete'), async (req, res) => {
  // ... ワークアウト削除
});
```

---

## 実装計画

### Week 1: ワークヒストリー統合（7時間）

#### Day 1-2（2時間）: バックエンド修正
```bash
# タスク
- [ ] backend/routes/workouts.js:247 に createdAt 追加
- [ ] API動作確認（Postman or curl）
- [ ] 既存テストが通ることを確認

# 成果物
- formatWorkoutData 関数の修正（1行）
- APIレスポンスに createdAt が含まれる
```

#### Day 3-4（3時間）: フロントエンド実装
```bash
# タスク
- [ ] frontend/src/components/activity/ ディレクトリ作成
- [ ] RecentWorkoutsList.jsx 作成
- [ ] WorkoutItem.jsx 作成
- [ ] utils/formatWorkoutDetails.js 作成
- [ ] utils/groupByDate.js 作成

# 成果物
- 新規コンポーネント（約60行）
- ユーティリティ関数（約30行）
```

#### Day 5（1時間）: Dashboard統合
```bash
# タスク
- [ ] Dashboard.jsx に Accordion 追加
- [ ] RecentWorkoutsList をインポート・配置
- [ ] スタイリング調整

# 成果物
- Dashboard.jsx への追加（約30行）
```

#### Day 6（1時間）: クリーンアップ
```bash
# タスク
- [ ] WorkoutHistory.jsx 削除
- [ ] WorkoutHistoryTable.jsx 削除
- [ ] WorkoutCustomizationDrawer.jsx 削除
- [ ] useWorkoutConfig.js 削除
- [ ] App.jsx から /workout-history ルート削除
- [ ] ナビゲーションから「履歴」リンク削除

# 成果物
- 約800行の削除
- ルート整理
```

---

### Week 2: 認証バグ修正 + セキュリティ強化（6時間）

#### Day 1-2（3時間）: バグ修正
```bash
# タスク1: 新規登録後のナビゲーション問題
- [ ] backend/routes/authRoutes.js:38-43 修正
- [ ] 登録API でトークン発行
- [ ] フロントエンド側でトークン受信・保存
- [ ] 動作確認

# タスク2: ワークアウトフォームのリセット問題
- [ ] frontend/src/pages/WorkoutForm.jsx 修正
- [ ] React Hook Form の reset 呼び出し
- [ ] 動作確認

# 成果物
- 2つのバグ修正完了
```

#### Day 3-4（3時間）: セキュリティ強化
```bash
# タスク1: CSP実装
- [ ] backend/config/security.js 作成
- [ ] Helmet 設定
- [ ] backend/app.js に適用
- [ ] ブラウザコンソールでCSP違反チェック

# タスク2: Rate Limiting実装
- [ ] backend/middleware/rateLimiter.js 作成
- [ ] authRoutes.js に authLimiter 適用
- [ ] workouts.js に apiLimiter 適用
- [ ] 動作確認（5回ログイン試行でブロック）

# 成果物
- セキュリティミドルウェア実装
```

---

### Week 3: データ整合性 + 監査準備（7時間）

#### Day 1-2（3時間）: 重複問題修正
```bash
# タスク
- [ ] backend/migrations/add-unique-constraint-workouts.js 作成
- [ ] ユニーク制約追加（userID, date, exercise, createdAt）
- [ ] マイグレーション実行
- [ ] エラーハンドリング追加（重複時のメッセージ）

# 成果物
- DB制約追加
- エラーハンドリング改善
```

#### Day 3-5（4時間）: 監査ログ基盤
```bash
# タスク1: Winston Logger導入
- [ ] backend/utils/logger.js 作成
- [ ] winston, winston-daily-rotate-file インストール
- [ ] ログディレクトリ作成
- [ ] 動作確認

# タスク2: 監査ログミドルウェア
- [ ] backend/middleware/auditLogger.js 作成
- [ ] authRoutes.js に適用
- [ ] workouts.js に適用
- [ ] ログファイル確認

# 成果物
- 監査ログシステム稼働
```

---

### Week 4: Strava修正 + ドキュメント整備（6時間）

#### Day 1-3（4時間）: Strava修正
```bash
# タスク
- [ ] backend/services/stravaService.js のエラーハンドリング強化
- [ ] リトライロジック追加（exponential backoff）
- [ ] タイムアウト設定確認
- [ ] エラーメッセージ改善
- [ ] 動作確認

# 成果物
- Stravaバグ修正完了
```

#### Day 4-5（2時間）: ドキュメント整備
```bash
# タスク
- [ ] README.md 更新
  - アーキテクチャ図追加
  - セキュリティ対策の説明
  - 800行削減の意思決定プロセス
- [ ] CHANGELOG.md 作成
  - Phase 1 の全変更を記録

# 成果物
- ドキュメント更新
```

---

## テスト戦略

### ユニットテスト

#### フロントエンド
```javascript
// RecentWorkoutsList.test.jsx
describe('RecentWorkoutsList', () => {
  it('直近10件のみ表示する', () => {
    const workouts = Array(20).fill(mockWorkout);
    render(<RecentWorkoutsList workouts={workouts} />);
    // 10件のみ表示されることを確認
  });

  it('同日複数回トレーニング時に時刻を表示する', () => {
    const workouts = [
      { ...mockWorkout, date: '2025-01-30', createdAt: '2025-01-30T07:30:00Z' },
      { ...mockWorkout, date: '2025-01-30', createdAt: '2025-01-30T19:00:00Z' },
    ];
    render(<RecentWorkoutsList workouts={workouts} />);
    expect(screen.getByText('07:30')).toBeInTheDocument();
    expect(screen.getByText('19:00')).toBeInTheDocument();
  });

  it('repsDetailがバラバラでも正しく表示する', () => {
    const workout = {
      ...mockWorkout,
      repsDetail: [{ setNumber: 1, reps: 30 }, { setNumber: 2, reps: 27 }],
    };
    render(<WorkoutItem workout={workout} />);
    expect(screen.getByText('30,27 (2set)')).toBeInTheDocument();
  });
});
```

#### バックエンド
```javascript
// workouts.test.js
describe('GET /workouts', () => {
  it('createdAt がレスポンスに含まれる', async () => {
    const res = await request(app)
      .get('/workouts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty('createdAt');
    expect(new Date(res.body[0].createdAt)).toBeInstanceOf(Date);
  });
});
```

### 統合テスト

```javascript
// dashboard.integration.test.jsx
describe('Dashboard Integration', () => {
  it('過去ログのAccordionが正しく動作する', async () => {
    render(<Dashboard />);

    // 初期状態: Accordionは閉じている
    expect(screen.queryByText('Running')).not.toBeVisible();

    // クリックで展開
    fireEvent.click(screen.getByText(/直近のログを見る/));
    await waitFor(() => {
      expect(screen.getByText('Running')).toBeVisible();
    });
  });
});
```

### セキュリティテスト

```bash
# CSPテスト
- ブラウザコンソールでCSP違反がないことを確認
- インラインスクリプトが実行されないことを確認

# Rate Limitingテスト
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}' \
  --repeat 6
# 6回目で429 Too Many Requestsが返ることを確認

# 監査ログテスト
- ログイン後、logs/fittrack-YYYY-MM-DD.log にエントリーがあることを確認
- JSON形式で userId, action, timestamp が記録されていることを確認
```

---

## パフォーマンス考慮事項

### フロントエンド最適化

1. **コンポーネントメモ化**
```javascript
// RecentWorkoutsList.jsx
export default React.memo(RecentWorkoutsList);

// WorkoutItem.jsx
export default React.memo(WorkoutItem);
```

2. **日付グループ化の最適化**
```javascript
// O(n) で実行（既存のTransformWorkoutDataと同等）
const groupByDate = (workouts) => {
  // reduce を1回のみ実行
  return workouts.reduce((acc, workout) => {
    const dateKey = new Date(workout.date).toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
    });
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(workout);
    return acc;
  }, {});
};
```

### バックエンド最適化

1. **クエリ最適化**
```javascript
// すでに最適化されている（変更なし）
const workouts = await Workout.findAll({
  where: { userID: userId },
  order: [['date', 'DESC'], ['createdAt', 'DESC']], // 日付降順、作成時刻降順
});
```

2. **ログ記録の非同期化**
```javascript
// logger.js で非同期書き込み（Winstonがデフォルトで対応）
logger.info(/* ... */); // ノンブロッキング
```

---

## デプロイ計画

### Phase 1 では本番デプロイなし

- ローカル開発環境のみで実装・テスト
- Phase 4 完了後に本番デプロイ予定

### ステージング環境での検証項目（Phase 4時）

- [ ] CSPが正しく動作する
- [ ] Rate Limitingが動作する
- [ ] ログファイルが正しくローテーションされる
- [ ] 全バグが修正されている
- [ ] パフォーマンス目標を達成している

---

## 次のステップ

1. Week 1 の実装開始
2. 週次レビューの実施（毎週金曜）
3. Phase 1 完了後、Phase 2 設計書の作成

---

**最終更新**: 2025-10-09
**承認者**: Keisuke Sato
**次回レビュー**: 2025-10-15（Week 2完了時）
