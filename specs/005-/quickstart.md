# クイックスタートガイド: バックエンドエラーハンドリング実装

**機能**: 005- バックエンドエラーハンドリング実装
**作成日**: 2025-11-13
**対象**: 開発者

## 概要

このガイドでは、バックエンドエラーハンドリングシステムの実装と使用方法を説明します。

## 前提条件

- Node.js 18以上
- 既存のExpress backendが動作している
- PostgreSQL 17がインストールされている

## セットアップ

### 1. 依存パッケージのインストール

```bash
cd backend
npm install winston winston-daily-rotate-file express-rate-limit uuid
```

**パッケージの役割**:
- `winston`: 構造化ログライブラリ
- `winston-daily-rotate-file`: ログローテーション
- `express-rate-limit`: レート制限
- `uuid`: リクエストID生成

### 2. ディレクトリ構造の確認

```bash
backend/
├── middleware/
│   ├── errorHandler.js      # 新規作成
│   ├── requestId.js         # 新規作成
│   └── rateLimiter.js       # 新規作成
├── utils/
│   ├── logger.js            # 新規作成
│   ├── AppError.js          # 新規作成
│   └── errorCodes.js        # 新規作成
└── logs/                    # 新規作成（.gitignoreに追加）
```

### 3. 環境変数の設定

`.env`ファイルに以下を追加:

```bash
# 本番環境では必ず'production'に設定
NODE_ENV=development

# ログレベル（error, warn, info, debug）
LOG_LEVEL=info
```

### 4. .gitignoreにログディレクトリを追加

```bash
echo "logs/" >> .gitignore
```

## 基本的な使い方

### エラーの投げ方

#### カスタムエラークラスを使用

```javascript
const AppError = require('./utils/AppError');

// バリデーションエラー
throw new AppError('メールアドレスの形式が正しくありません', 400, 'VALIDATION_ERROR');

// 認証エラー
throw new AppError('認証が必要です', 401, 'UNAUTHORIZED');

// リソースが見つからない
throw new AppError('ユーザーが見つかりません', 404, 'NOT_FOUND');
```

#### Sequelizeエラーは自動変換

```javascript
// Sequelizeエラーは自動的に適切なHTTPステータスとメッセージに変換されます
try {
  await User.create({ email: 'duplicate@example.com' });
} catch (error) {
  // SequelizeUniqueConstraintError → 409 Conflict
  // SequelizeValidationError → 400 Bad Request
  // 自動的に処理されます
  throw error;
}
```

### ルートハンドラーでの使用

```javascript
// 既存のルート
router.post('/workouts', async (req, res, next) => {
  try {
    const { type, duration } = req.body;

    // バリデーション
    if (!type || !duration) {
      throw new AppError('typeとdurationは必須です', 400, 'VALIDATION_ERROR');
    }

    const workout = await Workout.create({ type, duration, userId: req.user.id });
    res.status(201).json(workout);
  } catch (error) {
    // エラーハンドラーミドルウェアに渡す
    next(error);
  }
});
```

### ログの記録

```javascript
const logger = require('./utils/logger');

// エラーログ
logger.error('Database connection failed', {
  userId: 123,
  endpoint: '/api/workouts'
});

// 警告ログ
logger.warn('Rate limit approaching', {
  ip: '192.168.1.1',
  requests: 95
});

// 情報ログ
logger.info('User logged in', {
  userId: 123
});

// デバッグログ（開発環境のみ）
logger.debug('Request payload', {
  body: req.body
});
```

### レート制限の設定

```javascript
// backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// 認証エンドポイント用（厳しい制限）
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 5,                   // 5リクエストまで
  message: 'ログイン試行回数が上限に達しました。15分後に再試行してください',
  skipSuccessfulRequests: true
});

// 一般API用（通常の制限）
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100,                 // 100リクエストまで
  message: 'リクエスト上限に達しました。15分後に再試行してください'
});

module.exports = { authLimiter, apiLimiter };
```

### app.jsでの統合

```javascript
const express = require('express');
const { requestIdMiddleware } = require('./middleware/requestId');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// 1. セキュリティヘッダー
app.use(helmet());

// 2. CORS設定
app.use(cors(/* 設定 */));

// 3. リクエストID付与（すべてのリクエストで最初に実行）
app.use(requestIdMiddleware);

// 4. ボディパーサー
app.use(express.json());

// 5. レート制限（認証前に実行）
app.use('/api', apiLimiter);

// 6. ルート
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);

// 7. 404ハンドラー
app.use((req, res, next) => {
  const error = new AppError('指定されたリソースが見つかりません', 404, 'NOT_FOUND');
  next(error);
});

// 8. エラーハンドラー（最後に配置）
app.use(errorHandler);
```

## エラーレスポンス形式

すべてのエラーは以下の形式で返されます：

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "入力データが無効です",
  "details": [
    {
      "field": "email",
      "message": "メールアドレスの形式が正しくありません"
    }
  ],
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-11-13T10:30:45.123Z"
}
```

### 環境別の動作

**開発環境** (`NODE_ENV=development`):
- `details`にスタックトレースが含まれる
- 詳細なエラー情報が提供される

**本番環境** (`NODE_ENV=production`):
- `details`にスタックトレースは含まれない
- セキュリティのため最小限の情報のみ

## ログの確認

### ログファイルの場所

```
backend/logs/
├── error.log              # errorレベルのみ
├── combined.log           # すべてのログ
├── 2025-11-13.log        # 日次ローテーション
├── exceptions.log         # 未処理の例外
└── rejections.log         # 未処理のPromise rejection
```

### ログの検索

```bash
# リクエストIDでログを検索
grep "550e8400-e29b-41d4-a716-446655440000" logs/combined.log

# 特定のエンドポイントのエラーを検索
grep "/api/workouts" logs/error.log

# 特定のユーザーのエラーを検索
grep '"userId":123' logs/error.log
```

### ログのフォーマット（JSON Lines）

```json
{"timestamp":"2025-11-13T10:30:45.123Z","level":"error","requestId":"550e8400-...","userId":123,"endpoint":"/api/workouts","method":"POST","statusCode":500,"errorType":"SequelizeDatabaseError","message":"Database connection failed","stack":"Error: Database connection failed\n at ..."}
```

## テスト

### エラーハンドリングのテスト

```javascript
const request = require('supertest');
const app = require('../app');

describe('Error Handling', () => {
  test('バリデーションエラーを返す', async () => {
    const response = await request(app)
      .post('/api/workouts')
      .send({ /* 不正なデータ */ });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(response.body).toHaveProperty('requestId');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('レート制限を超過した場合429を返す', async () => {
    // 101回リクエストを送信
    for (let i = 0; i < 101; i++) {
      await request(app).get('/api/workouts');
    }

    const response = await request(app).get('/api/workouts');
    expect(response.status).toBe(429);
    expect(response.headers).toHaveProperty('retry-after');
  });
});
```

## トラブルシューティング

### ログが記録されない

1. `logs/`ディレクトリが存在するか確認
2. `LOG_LEVEL`環境変数を確認（`debug`に設定すると詳細ログが出力）
3. Winstonの初期化エラーをチェック

```bash
# ログディレクトリを作成
mkdir -p backend/logs

# 環境変数を確認
echo $LOG_LEVEL
```

### レート制限が動作しない

1. ミドルウェアの順序を確認（ルートより前に配置）
2. プロキシ設定を確認（`app.set('trust proxy', 1)`）
3. リクエストカウントをリセット（開発環境）

### エラーがキャッチされない

1. `next(error)`を呼び出しているか確認
2. エラーハンドラーが最後のミドルウェアとして配置されているか確認
3. `async/await`の場合、try-catchで囲んでいるか確認

## 次のステップ

1. **/speckit.tasks** - 実装タスクを生成
2. **実装** - タスクに従って各ファイルを実装
3. **テスト** - エラーハンドリングのテストを作成
4. **デプロイ** - 本番環境でログとレート制限を確認

## 参考資料

- [Winston公式ドキュメント](https://github.com/winstonjs/winston)
- [express-rate-limit公式ドキュメント](https://github.com/express-rate-limit/express-rate-limit)
- [データモデル定義](./data-model.md)
- [API契約](./contracts/error-responses.yaml)
- [リサーチレポート](./research.md)

---

**作成者**: Claude Code
**最終更新**: 2025-11-13
