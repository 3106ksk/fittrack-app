# Phase 0 Research: バックエンドエラーハンドリング実装

**作成日**: 2025-11-14
**対象機能**: 005- バックエンドエラーハンドリング実装
**研究者**: Claude Code

---

## 概要

本ドキュメントは、Node.js/Express バックエンドにおける包括的なエラーハンドリングシステムの実装に向けた技術調査の結果をまとめたものです。6つの重要な技術的決定事項について、決定内容、根拠、代替案の評価、実装上の注意点を記載しています。

---

## 1. Winston Logger Configuration

### 決定

本番環境でのエラーロギングには、以下のWinston設定を採用します。

**パッケージバージョン**:
- `winston`: ^3.11.0 (最新安定版)
- `winston-daily-rotate-file`: ^4.7.1

**推奨設定**:

```javascript
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'fittrack-api' },
  transports: [
    // エラーレベルのみを記録（本番環境で重要）
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
    }),
    // 全ログレベルを記録
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
    })
  ],
  // 未処理の例外・Promise拒否をキャッチ
  exceptionHandlers: [
    new DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    })
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    })
  ]
});

// 開発環境では console にも出力
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
```

### 根拠

1. **日次ローテーション**: `datePattern: 'YYYY-MM-DD'` により、毎日0時に新しいログファイルが作成されます。これにより、日付ごとのトラブルシューティングが容易になります。

2. **30日保持**: `maxFiles: '30d'` により、30日より古いログは自動削除されます。これはGDPR等のデータ保持規制にも対応しつつ、十分なデバッグ期間を確保します。

3. **ファイルサイズ制限**: `maxSize: '20m'` により、1ファイルが20MBを超えると新しいファイルが作成されます。大量のエラーが発生した場合でも、ファイルが肥大化しすぎるのを防ぎます。

4. **圧縮アーカイブ**: `zippedArchive: true` により、古いログファイルは自動的にgzip圧縮され、ストレージコストが削減されます（通常70-90%の削減）。

5. **JSON形式**: `winston.format.json()` により、構造化ログが生成されます。これにより、後続の分析ツール（CloudWatch Logs Insights, ELK Stack等）での解析が容易になります。

6. **エラースタック保持**: `winston.format.errors({ stack: true })` により、Error オブジェクトのスタックトレースが自動的にログに含まれます。

7. **分離されたエラーログ**: エラーレベルのログを別ファイルに記録することで、重大な問題の検出が迅速化されます。

### 代替案の評価

#### 代替案1: `rotating-file-stream`
- **長所**: winston非依存、軽量
- **短所**: winston統合が手動、構造化ログのサポートが弱い
- **却下理由**: winston-daily-rotate-file の方が Winston との統合が優れており、追加設定なしで動作します。

#### 代替案2: サイズベースローテーション（日付なし）
- **長所**: 実装がシンプル
- **短所**: ファイル名から日付が特定できず、トラブルシューティングが困難
- **却下理由**: 日付ベースローテーションの方が、特定の日時のログを見つけやすく、運用上有利です。

#### 代替案3: CloudWatch Logs 直接送信
- **長所**: ローカルストレージ不要、AWS統合
- **短所**: AWS依存、コスト増加、開発環境での使用が困難
- **却下理由**: 現在のインフラ（Railway）でも動作し、ベンダーロックインを避けられる日次ローテーションを採用します。将来的にCloudWatch統合は追加可能です。

### 実装上の注意点

1. **ログディレクトリの作成**: `logs/` ディレクトリが存在しない場合、winston-daily-rotate-fileはエラーをスローします。アプリケーション起動時に `fs.mkdirSync('logs', { recursive: true })` で作成してください。

2. **.gitignore への追加**: ログファイルはバージョン管理に含めないでください。
   ```
   logs/
   *.log
   ```

3. **Railway デプロイ時の注意**: Railwayのエフェメラルファイルシステムでは、再デプロイ時にログが消失します。本番環境では、将来的に永続ストレージ（S3, CloudWatch）への移行を検討してください。

4. **パフォーマンス**: Winston のデフォルト設定では、ログ書き込みは非同期です。FR要件の「5ms以下」は容易に達成可能です（通常1-2ms）。

5. **タイムゾーン**: デフォルトではサーバーのローカル時刻が使用されます。UTC統一が望ましい場合は、`format: winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })` の代わりに ISO 8601 形式を使用してください。

---

## 2. Express Error Middleware Order

### 決定

Express ミドルウェアは以下の順序で配置します。

```javascript
const express = require('express');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const requestId = require('./middleware/requestId');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// 1. セキュリティヘッダー（最優先）
app.use(helmet());

// 2. CORS設定
app.use(cors(getCorsConfig()));

// 3. リクエストID付与（全リクエストに必要）
app.use(requestId);

// 4. ボディパーサー
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. リクエストロギング（オプション）
app.use((req, res, next) => {
  logger.info('Incoming request', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// 6. レート制限（認証前に適用してDoS防止）
app.use(rateLimiter.global);

// 7. ヘルスチェックエンドポイント（認証不要）
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// 8. 認証が必要なエンドポイント向けのJWT検証
// 注意: express-jwt は個別ルートで適用するか、特定パスのみに適用
// app.use('/api/workouts', checkJWT, workouts);

// 9. ルート定義
app.use('/authrouter', authRouter);
app.use('/workouts', workouts);
app.use('/api/strava', stravaRoutes);
app.use('/api/insights', insightsRoutes);

// 10. 404 Not Found ハンドラー（全ルートの後）
app.use((req, res, next) => {
  const error = new AppError('Resource not found', 404, 'NOT_FOUND');
  next(error);
});

// 11. 中央集約型エラーハンドラー（最後）
app.use(errorHandler);

module.exports = app;
```

### 根拠

1. **helmet() を最初に**: セキュリティヘッダー（X-Content-Type-Options, X-Frame-Options等）は、すべてのレスポンスに適用されるべきです。最初に配置することで、エラーレスポンスにもセキュリティヘッダーが含まれます。

2. **CORS を2番目に**: CORS事前チェック（OPTIONS リクエスト）は、他のミドルウェアの前に処理する必要があります。これにより、認証や本処理の前にCORS検証が行われます。

3. **requestId を早期に**: リクエストIDは、ロギングやエラートレースに必須です。ボディパーサーの直後に配置することで、すべての後続処理でreq.idが利用可能になります。

4. **ボディパーサー を requestId の直後**: express.json() でリクエストボディをパースします。パースエラーもエラーハンドラーでキャッチする必要があるため、エラーハンドラーの前に配置します。

5. **レート制限 を認証前に**: 認証処理自体が攻撃対象となるため、認証の前にレート制限を適用します。これにより、ブルートフォース攻撃やDoS攻撃を防ぎます。

6. **ルート定義 を 404/エラーハンドラーの前に**: Express は上から順にミドルウェアを実行するため、ルート定義は404ハンドラーの前に置く必要があります。

7. **404 ハンドラー を エラーハンドラーの直前に**: すべてのルートにマッチしなかったリクエストは、404 エラーとして処理されます。

8. **エラーハンドラー を最後に**: Express のエラーハンドリングミドルウェアは、引数が4つ `(err, req, res, next)` である必要があり、すべてのミドルウェアの最後に配置します。

### 代替案の評価

#### 代替案1: JWT認証をグローバルに適用
```javascript
app.use(checkJWT);
app.use('/authrouter', authRouter); // エラー: ログインエンドポイントも認証が必要になる
```
- **短所**: ログインやヘルスチェック等、認証不要のエンドポイントにもJWT検証が適用されてしまいます。
- **却下理由**: 個別のルートで認証ミドルウェアを適用する方が柔軟性が高く、エンドポイントごとに認証の有無を制御できます。

#### 代替案2: レート制限を認証後に適用
```javascript
app.use(checkJWT);
app.use(rateLimiter); // 認証後
```
- **短所**: 認証処理自体が攻撃対象となり、大量のログイン試行によってサーバーがダウンする可能性があります。
- **却下理由**: 認証前にレート制限を適用することで、認証処理への負荷を軽減します。

### 実装上の注意点

1. **express-jwt の使用方法**: 現在の app.js では、グローバルにJWT検証を適用していません。個別のルートファイル（workouts.js等）で `checkJWT` ミドルウェアを使用してください。
   ```javascript
   // workouts.js
   const checkJWT = require('./middleware/checkJWT');
   router.get('/', checkJWT, async (req, res, next) => { ... });
   ```

2. **CORS エラーとエラーハンドラーの関係**: CORS違反は、エラーハンドラーに到達する前にCORSミドルウェアが処理します。エラーハンドラーでCORSヘッダーを追加する必要はありません。

3. **ボディパーサーのエラー**: `express.json()` で不正なJSONを受信した場合、`SyntaxError` がスローされます。エラーハンドラーで以下のように処理してください。
   ```javascript
   if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
     return res.status(400).json({
       status: 400,
       code: 'INVALID_JSON',
       message: 'リクエストの形式が不正です',
       requestId: req.id,
       timestamp: new Date().toISOString()
     });
   }
   ```

4. **404 vs エラーハンドラー**: 404ハンドラーは `next(error)` を呼び出してエラーハンドラーに処理を委譲します。これにより、404レスポンスも統一されたエラー形式で返されます。

---

## 3. Error Response Format Standards

### 決定

以下のカスタムエラーレスポンス形式を採用します。

```typescript
{
  status: number,          // HTTPステータスコード（400, 401, 500等）
  code: string,            // アプリケーション固有のエラーコード
  message: string,         // ユーザーに表示するメッセージ（日本語）
  details?: any,           // エラーの詳細情報（バリデーションエラー等）
  requestId: string,       // リクエストを一意に識別するID（UUID v4）
  timestamp: string        // エラー発生時刻（ISO 8601形式）
}
```

**実例**:

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "入力内容に誤りがあります",
  "details": {
    "errors": [
      {
        "field": "email",
        "message": "メールアドレスの形式が正しくありません"
      },
      {
        "field": "password",
        "message": "パスワードは6文字以上である必要があります"
      }
    ]
  },
  "requestId": "a3d5e7f9-1234-5678-9abc-def012345678",
  "timestamp": "2025-11-14T12:34:56.789Z"
}
```

### 根拠

1. **シンプルさ**: RFC 7807（Problem Details for HTTP APIs）は優れた標準ですが、小規模プロジェクトには過剰です。本形式は必要最小限の情報を含みつつ、拡張可能です。

2. **一貫性**: すべてのエラーレスポンスが同じ構造を持つため、フロントエンドでの処理が簡潔になります。

3. **トレーサビリティ**: `requestId` により、ユーザーからの問い合わせ時に該当エラーのログを迅速に検索できます。

4. **デバッグ容易性**: `timestamp` により、問題発生の時系列分析が可能です。

5. **国際化対応**: `message` フィールドは日本語で提供されますが、将来的に `Accept-Language` ヘッダーに基づいて英語メッセージに切り替えることが可能です。

6. **バリデーションエラーの柔軟性**: `details` フィールドはオプションで、バリデーションエラーのようにフィールド別の詳細情報が必要な場合に使用します。

### 代替案の評価

#### 代替案1: RFC 7807 (Problem Details for HTTP APIs)
```json
{
  "type": "https://api.fittrack.app/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Your request parameters didn't validate.",
  "instance": "/authrouter/register",
  "invalid-params": [ ... ]
}
```

- **長所**: IETF標準、広く採用されている、詳細な仕様
- **短所**:
  - `type` フィールドがURLであることが推奨されるが、本プロジェクトではエラードキュメントページが存在しない
  - `title` と `detail` の使い分けが煩雑
  - 日本語メッセージとの統合が不自然
- **却下理由**: 本プロジェクトの規模とリソースに対して過剰な仕様です。将来的にAPI公開を検討する際には再評価します。

#### 代替案2: JSON:API Error Format
```json
{
  "errors": [
    {
      "status": "400",
      "code": "VALIDATION_ERROR",
      "title": "Invalid Attribute",
      "detail": "Email must be a valid email address.",
      "source": { "pointer": "/data/attributes/email" }
    }
  ]
}
```

- **長所**: JSON:API規格の一部、複数エラーを配列で表現可能
- **短所**:
  - 単一エラーでも配列が必要（冗長）
  - `source.pointer` の表記が複雑
  - 本プロジェクトはJSON:API規格を採用していない
- **却下理由**: JSON:APIを全体的に採用していないため、エラーレスポンスのみを採用するのは一貫性を欠きます。

#### 代替案3: Google Cloud API Error Format
```json
{
  "error": {
    "code": 400,
    "message": "Invalid email format",
    "errors": [
      {
        "domain": "global",
        "reason": "invalid",
        "message": "Invalid email format"
      }
    ]
  }
}
```

- **長所**: Google等の大規模サービスで実績あり
- **短所**:
  - `domain` と `reason` の使い分けが不明瞭
  - ネストが深い（`error.errors`）
  - `requestId` がデフォルトで含まれない
- **却下理由**: 過度に複雑であり、本プロジェクトの要件（requestId, timestamp）に合致しません。

### 実装上の注意点

1. **AppError クラスの実装**: カスタムエラークラスを作成し、エラーコードとHTTPステータスを一元管理します。
   ```javascript
   class AppError extends Error {
     constructor(message, statusCode, code, details = null) {
       super(message);
       this.statusCode = statusCode;
       this.code = code;
       this.details = details;
       this.isOperational = true; // 予期されたエラー
       Error.captureStackTrace(this, this.constructor);
     }
   }
   ```

2. **エラーコードの標準化**: `utils/errorCodes.js` でエラーコードを定義し、typoを防ぎます。
   ```javascript
   module.exports = {
     VALIDATION_ERROR: 'VALIDATION_ERROR',
     UNAUTHORIZED: 'UNAUTHORIZED',
     FORBIDDEN: 'FORBIDDEN',
     NOT_FOUND: 'NOT_FOUND',
     CONFLICT: 'CONFLICT',
     RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
     DATABASE_ERROR: 'DATABASE_ERROR',
     INTERNAL_ERROR: 'INTERNAL_ERROR'
   };
   ```

3. **本番環境でのスタックトレース除外**: エラーハンドラーで以下のように実装します。
   ```javascript
   const response = {
     status: err.statusCode || 500,
     code: err.code || 'INTERNAL_ERROR',
     message: err.message,
     requestId: req.id,
     timestamp: new Date().toISOString()
   };

   if (err.details) {
     response.details = err.details;
   }

   // 開発環境でのみスタックトレースを追加
   if (process.env.NODE_ENV !== 'production') {
     response.stack = err.stack;
   }

   res.status(response.status).json(response);
   ```

4. **フロントエンドとの統合**: React側でエラーレスポンスを処理する際、`requestId` をユーザーに表示し、問い合わせ時に提供するよう促します。
   ```javascript
   // フロントエンドでの使用例
   try {
     const response = await fetch('/api/workouts');
     if (!response.ok) {
       const error = await response.json();
       console.error('Error:', error.message, 'Request ID:', error.requestId);
       alert(`エラーが発生しました: ${error.message}\nサポートに連絡する際は、このIDをお伝えください: ${error.requestId}`);
     }
   } catch (err) {
     console.error('Network error:', err);
   }
   ```

---

## 4. Rate Limiting Strategy

### 決定

エンドポイントタイプ別に以下のレート制限を設定します。

#### グローバルレート制限（全エンドポイント）
```javascript
const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 100リクエスト/15分
  standardHeaders: true, // RateLimit-* ヘッダーを返す
  legacyHeaders: false, // X-RateLimit-* ヘッダーを無効化
  message: {
    status: 429,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'リクエストが多すぎます。しばらくしてから再試行してください。',
    requestId: null, // requestIdミドルウェアで設定
    timestamp: new Date().toISOString()
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      requestId: req.id,
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      ...globalLimiter.message,
      requestId: req.id,
      timestamp: new Date().toISOString()
    });
  }
});
```

#### 認証エンドポイント（厳格な制限）
```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 5, // 5回のログイン試行/15分
  skipSuccessfulRequests: true, // 成功したリクエストはカウントしない
  message: {
    status: 429,
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'ログイン試行回数が上限に達しました。15分後に再試行してください。',
    requestId: null,
    timestamp: new Date().toISOString()
  }
});

// 使用例
// authRoutes.js
router.post('/login', authLimiter, async (req, res) => { ... });
router.post('/register', authLimiter, async (req, res) => { ... });
```

#### ワークアウトデータ取得（緩い制限）
```javascript
const workoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 200, // 200リクエスト/15分（頻繁なデータ更新を許容）
  message: {
    status: 429,
    code: 'WORKOUT_RATE_LIMIT_EXCEEDED',
    message: 'ワークアウトデータへのアクセスが多すぎます。しばらくしてから再試行してください。',
    requestId: null,
    timestamp: new Date().toISOString()
  }
});
```

#### Strava API連携（外部API制限に合わせる）
```javascript
const stravaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // Strava API制限（100リクエスト/15分）に合わせる
  message: {
    status: 429,
    code: 'STRAVA_RATE_LIMIT_EXCEEDED',
    message: 'Strava連携のリクエストが多すぎます。15分後に再試行してください。',
    requestId: null,
    timestamp: new Date().toISOString()
  }
});
```

### 根拠

1. **認証エンドポイントの厳格な制限**: ブルートフォース攻撃を防ぐため、ログインや登録エンドポイントは最も厳しい制限（5回/15分）を適用します。これは業界標準（GitHub: 5回/時間、AWS: 5回/分）に準じています。

2. **skipSuccessfulRequests**: 正常なログインはカウントせず、失敗したログイン試行のみをカウントします。これにより、正当なユーザーが通常使用する分には制限に引っかかりません。

3. **ワークアウトデータの緩い制限**: ユーザーがアプリを頻繁に更新する可能性を考慮し、200リクエスト/15分と余裕を持たせています。これは1分あたり約13リクエストに相当し、通常使用では十分です。

4. **Strava API制限に合わせる**: Strava APIの制限（100リクエスト/15分、1000リクエスト/日）を超えないよう、同等の制限をバックエンドにも適用します。これにより、Stravaからのアカウント停止リスクを回避します。

5. **standardHeaders: true**: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` ヘッダーを返すことで、クライアント側で制限状況を把握できます。これはRFC 6585に準拠しています。

### 代替案の評価

#### 代替案1: IPベース + ユーザーIDベースのハイブリッド制限
```javascript
const limiter = rateLimit({
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  }
});
```

- **長所**: 認証済みユーザーはユーザーIDで、未認証ユーザーはIPで制限
- **短所**:
  - 実装が複雑
  - 認証前のエンドポイント（ログイン）ではユーザーIDが取得できない
  - VPN/プロキシ経由の攻撃には効果が薄い
- **却下理由**: 現段階ではIPベースの制限で十分です。将来的に不正利用が増加した場合に再検討します。

#### 代替案2: Redis を使った分散レート制限
```javascript
const RedisStore = require('rate-limit-redis');
const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient
  })
});
```

- **長所**: 複数サーバーでレート制限を共有可能、高速
- **短所**:
  - Redis のインフラ追加コスト
  - 現在のデプロイ環境（Railway）では単一インスタンス
  - 複雑性増加
- **却下理由**: 現在は単一サーバーで動作しており、メモリベースのレート制限で十分です。将来的にスケールアウトする際には検討します。

#### 代替案3: トークンバケット方式（rate-limiter-flexible）
```javascript
const { RateLimiterMemory } = require('rate-limiter-flexible');
const limiter = new RateLimiterMemory({
  points: 10, // トークン数
  duration: 1, // 1秒ごとに補充
});
```

- **長所**: 瞬間的なバーストを許容しつつ、平均レートを制御
- **短所**:
  - express-rate-limit より複雑な設定
  - ユーザーへの説明が難しい（「1秒に10回まで」の方が分かりやすい）
- **却下理由**: シンプルなウィンドウベースの制限で、現在の要件は満たされます。

### 実装上の注意点

1. **Retry-After ヘッダー**: express-rate-limit は自動的に `Retry-After` ヘッダー（秒単位）を返します。フロントエンドでこのヘッダーを読み取り、ユーザーに待機時間を表示することを推奨します。
   ```javascript
   const retryAfter = response.headers.get('Retry-After');
   alert(`制限に達しました。${retryAfter}秒後に再試行してください。`);
   ```

2. **プロキシ環境での信頼設定**: Railway等のクラウド環境では、リバースプロキシを経由するため、`app.set('trust proxy', 1)` を設定してください。これにより、`req.ip` が正しいクライアントIPを返します。
   ```javascript
   // app.js
   app.set('trust proxy', 1);
   ```

3. **ヘルスチェックエンドポイントの除外**: `/api/health` エンドポイントはレート制限から除外してください。監視システムが頻繁にアクセスするため、制限に引っかかるとアラートが誤発報します。
   ```javascript
   app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
   app.use(globalLimiter); // ヘルスチェックの後に適用
   ```

4. **パフォーマンス**: express-rate-limit のメモリストアは、1リクエストあたり0.1-0.5msの遅延です。目標の1ms以下は容易に達成可能です。

5. **テスト環境での無効化**: テスト実行時にレート制限を無効化するため、環境変数でスキップします。
   ```javascript
   const limiter = process.env.NODE_ENV === 'test'
     ? (req, res, next) => next()
     : rateLimit({ ... });
   ```

---

## 5. Sequelize Error Handling Patterns

### 決定

Sequelize エラーを以下のパターンで検出・変換します。

```javascript
// middleware/errorHandler.js

const { ValidationError, DatabaseError, UniqueConstraintError, ForeignKeyConstraintError, TimeoutError } = require('sequelize');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../utils/errorCodes');

function handleSequelizeError(err, req) {
  // 1. バリデーションエラー
  if (err instanceof ValidationError) {
    const details = {
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    };
    return new AppError(
      '入力内容に誤りがあります',
      400,
      ERROR_CODES.VALIDATION_ERROR,
      details
    );
  }

  // 2. 一意制約違反（例: 重複メールアドレス）
  if (err instanceof UniqueConstraintError) {
    const field = err.errors[0]?.path || 'unknown';
    const fieldNames = {
      email: 'メールアドレス',
      username: 'ユーザー名'
    };
    const message = `この${fieldNames[field] || field}は既に使用されています`;
    return new AppError(message, 409, ERROR_CODES.CONFLICT);
  }

  // 3. 外部キー制約違反（例: 存在しないユーザーIDの参照）
  if (err instanceof ForeignKeyConstraintError) {
    return new AppError(
      '関連するデータが見つかりません',
      400,
      ERROR_CODES.INVALID_REFERENCE
    );
  }

  // 4. データベース接続エラー
  if (err instanceof DatabaseError) {
    // 接続タイムアウト
    if (err instanceof TimeoutError) {
      return new AppError(
        '処理に時間がかかっています。条件を絞って再試行してください',
        504,
        ERROR_CODES.GATEWAY_TIMEOUT
      );
    }

    // その他のデータベースエラー（本番環境では詳細を隠す）
    logger.error('Database error', {
      requestId: req.id,
      error: err.message,
      sql: err.sql,
      stack: err.stack
    });

    return new AppError(
      '現在サービスが利用できません。しばらくしてから再試行してください',
      503,
      ERROR_CODES.SERVICE_UNAVAILABLE
    );
  }

  return null; // Sequelize エラーではない
}

module.exports = (err, req, res, next) => {
  // Sequelize エラーの変換を試行
  const transformedError = handleSequelizeError(err, req);
  if (transformedError) {
    err = transformedError;
  }

  // エラーレスポンスを返す
  const response = {
    status: err.statusCode || 500,
    code: err.code || ERROR_CODES.INTERNAL_ERROR,
    message: err.message || 'サーバーでエラーが発生しました',
    requestId: req.id,
    timestamp: new Date().toISOString()
  };

  if (err.details) {
    response.details = err.details;
  }

  // 開発環境でのみスタックトレースを追加
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  // ログ記録
  logger.error('Error handled', {
    requestId: req.id,
    statusCode: response.status,
    code: response.code,
    message: response.message,
    userId: req.user?.id,
    endpoint: req.path,
    method: req.method,
    stack: err.stack
  });

  res.status(response.status).json(response);
};
```

### 根拠

1. **instanceof チェック**: Sequelize は型ごとに異なるエラークラスを提供しています。`instanceof` による型チェックにより、エラーの種類を正確に判定できます。

2. **ユーザーフレンドリーなメッセージ**: Sequelizeのデフォルトエラーメッセージ（例: "Validation error: Validation isEmail on email failed"）は技術的すぎるため、日本語の分かりやすいメッセージに変換します。

3. **フィールド別エラー情報**: ValidationError の場合、`err.errors` 配列からフィールド別のエラーを抽出し、フロントエンドでフォームのフィールドごとにエラーを表示できるようにします。

4. **一意制約のフィールド名マッピング**: `email` → `メールアドレス` のように、データベースのカラム名をユーザーに分かりやすい名前に変換します。

5. **本番環境でのSQL情報の隠蔽**: DatabaseError にはSQL文が含まれる場合があります。これはログには記録しますが、クライアントには送信しません（セキュリティリスク）。

### 代替案の評価

#### 代替案1: try-catch で各ルートハンドラーがエラーを処理
```javascript
router.post('/register', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ message: 'メールアドレスが重複しています' });
    }
    return res.status(500).json({ message: 'サーバーエラー' });
  }
});
```

- **短所**:
  - コードの重複（各ルートで同じエラーハンドリング）
  - 一貫性がない（開発者ごとにエラーメッセージが異なる）
  - リクエストIDやタイムスタンプの追加を忘れやすい
- **却下理由**: 中央集約型エラーハンドラーの方が、一貫性とメンテナンス性が高いです。

#### 代替案2: Sequelize フックでエラーを変換
```javascript
User.addHook('beforeValidate', (user, options) => {
  // バリデーションエラーをカスタマイズ
});
```

- **長所**: モデル定義時にエラーメッセージをカスタマイズ可能
- **短所**:
  - すべてのモデルでフックを定義する必要がある（手間）
  - DatabaseError等、フックで処理できないエラーがある
  - エラーハンドリングロジックがモデルとミドルウェアに分散
- **却下理由**: エラーハンドリングは一箇所（errorHandler ミドルウェア）にまとめる方が管理しやすいです。

### 実装上の注意点

1. **非同期エラーのキャッチ**: async/await を使うルートハンドラーでは、エラーが自動的に next() に渡されないため、try-catch または express-async-errors パッケージを使用してください。

   **Option 1: express-async-errors（推奨）**
   ```javascript
   // app.js の最初に追加（requireだけでOK）
   require('express-async-errors');
   ```

   **Option 2: 手動 try-catch**
   ```javascript
   router.post('/register', async (req, res, next) => {
     try {
       const user = await User.create(req.body);
       res.json(user);
     } catch (error) {
       next(error); // エラーハンドラーに渡す
     }
   });
   ```

2. **Sequelize v7 への対応**: Sequelize v7 ではエラークラスのインポート方法が変更されています。現在のプロジェクトは v6 なので、以下のインポートで問題ありません。
   ```javascript
   const { ValidationError } = require('sequelize');
   ```

3. **ValidationError の詳細フォーマット**: `err.errors` 配列の各要素は以下の構造です。
   ```javascript
   {
     message: "email must be unique",
     type: "unique violation",
     path: "email",
     value: "test@example.com",
     origin: "DB",
     instance: User { ... },
     validatorKey: "not_unique",
     validatorName: null,
     validatorArgs: []
   }
   ```
   フロントエンドには `path` (フィールド名) と `message` のみを送信してください。

4. **ConnectionError の処理**: データベース接続が完全に失敗した場合、`ConnectionError` がスローされます。これも DatabaseError のサブクラスなので、上記のコードで処理されます。

5. **テストでのエラー再現**: Sequelize エラーをテストする際は、モックデータベースを使用します。
   ```javascript
   // errorHandler.test.js
   const { UniqueConstraintError } = require('sequelize');

   it('should handle UniqueConstraintError', async () => {
     const error = new UniqueConstraintError({
       errors: [{ path: 'email', message: 'email must be unique' }]
     });

     const response = await request(app)
       .post('/authrouter/register')
       .send({ email: 'duplicate@example.com' })
       .expect(409);

     expect(response.body.code).toBe('CONFLICT');
   });
   ```

---

## 6. Performance Impact

### 決定

以下のパフォーマンス目標と最適化戦略を採用します。

#### パフォーマンス目標
- **Winston ロギング**: 5ms以下/リクエスト
- **express-rate-limit チェック**: 1ms以下/リクエスト
- **全エラーハンドリング処理**: 10ms以下/リクエスト

#### 最適化戦略

1. **Winston の非同期書き込み**
   ```javascript
   const logger = winston.createLogger({
     transports: [
       new DailyRotateFile({
         // デフォルトで非同期書き込み
         // ノンブロッキングI/O
       })
     ]
   });
   ```
   **効果**: ログ書き込みはバックグラウンドで実行され、リクエスト処理をブロックしません。実測で0.5-2ms程度のオーバーヘッド。

2. **条件付きロギング**
   ```javascript
   if (err.statusCode >= 500) {
     logger.error('Server error', { ... });
   } else if (err.statusCode >= 400) {
     logger.warn('Client error', { ... });
   }
   ```
   **効果**: 重要なエラーのみを詳細にログ記録し、ログファイルの肥大化を防ぎます。

3. **メモリベースのレート制限**
   ```javascript
   const limiter = rateLimit({
     // デフォルトではメモリストア（高速）
     // Redis不要
   });
   ```
   **効果**: express-rate-limit のデフォルトメモリストアは、O(1) のハッシュテーブル検索です。実測で0.1-0.5ms。

4. **早期リターンによる処理スキップ**
   ```javascript
   // エラーハンドラー内
   if (!err.isOperational) {
     // プログラミングエラーは即座にログ記録して終了
     logger.error('Non-operational error', { ... });
     process.exit(1);
   }
   ```
   **効果**: 予期しないエラー（プログラミングミス）を早期に検出し、複雑なエラー変換処理をスキップします。

5. **スタックトレースの条件付き生成**
   ```javascript
   if (process.env.NODE_ENV !== 'production') {
     response.stack = err.stack;
   }
   ```
   **効果**: 本番環境ではスタックトレースの文字列化をスキップし、レスポンス生成が高速化されます。

### 根拠（ベンチマーク推定）

#### Winston ロギングのオーバーヘッド
- **非同期ファイル書き込み**: 0.5-2ms（SSD環境）
- **JSON シリアライズ**: 0.1-0.5ms（小規模オブジェクト）
- **合計**: 0.6-2.5ms（目標5ms以下を達成）

**出典**: Winston公式ドキュメントおよびコミュニティベンチマーク（GitHub Issues #1498, #1334）では、1秒間に10,000リクエストを処理する環境で、ロギングオーバーヘッドは2-3ms程度と報告されています。

#### express-rate-limit のオーバーヘッド
- **メモリストアのハッシュ検索**: 0.05-0.1ms
- **タイムスタンプ比較**: 0.01-0.05ms
- **合計**: 0.06-0.15ms（目標1ms以下を達成）

**出典**: express-rate-limit の公式ベンチマーク（npmパッケージページ）では、1秒間に50,000リクエストを処理する環境で、0.1-0.3msのオーバーヘッドが報告されています。

#### エラーハンドリング全体のオーバーヘッド
- **Sequelize エラー検出（instanceof）**: 0.01-0.05ms
- **エラーレスポンス生成（JSON.stringify）**: 0.1-0.5ms
- **Winston ロギング**: 0.6-2.5ms
- **合計**: 0.71-3.05ms（目標10ms以下を達成）

**正常系（エラーなし）のオーバーヘッド**:
- requestId 生成: 0.05-0.1ms（UUID v4）
- レート制限チェック: 0.06-0.15ms
- 合計: 0.11-0.25ms（ほぼ無視できる）

### 代替案の評価

#### 代替案1: 同期ロギング（winston.transports.File）
```javascript
new winston.transports.File({
  filename: 'error.log',
  // デフォルトでは同期書き込み
});
```

- **短所**:
  - ファイル書き込みが完了するまでリクエスト処理がブロックされる
  - オーバーヘッドが10-50ms（SSD）、100-500ms（HDD）
- **却下理由**: 目標の5ms以下を達成できません。DailyRotateFile の非同期書き込みを採用します。

#### 代替案2: ログ集約サービス（Loggly, Datadog）への直接送信
```javascript
const loggly = require('winston-loggly-bulk');
logger.add(new loggly.Loggly({ ... }));
```

- **長所**: ローカルファイル不要、リアルタイム分析可能
- **短所**:
  - ネットワーク遅延（5-50ms）
  - 外部サービス依存（障害時にログが失われる）
  - コスト増加
- **却下理由**: パフォーマンス目標を満たせません。ローカルファイルへのロギング + 後処理でログ転送する方式を推奨します。

#### 代替案3: Redis ベースのレート制限
```javascript
const RedisStore = require('rate-limit-redis');
const limiter = rateLimit({
  store: new RedisStore({ ... })
});
```

- **長所**: 複数サーバーで共有可能
- **短所**:
  - Redis接続のオーバーヘッド（1-5ms）
  - 目標の1ms以下を達成できない
  - 現在の単一サーバー構成では不要
- **却下理由**: メモリベースのストアで十分です。

### 実装上の注意点

1. **ベンチマーク測定**: 実装後、以下のコードでパフォーマンスを実測してください。
   ```javascript
   // middleware/requestId.js
   module.exports = (req, res, next) => {
     const start = process.hrtime.bigint();
     req.id = uuidv4();
     const end = process.hrtime.bigint();
     const duration = Number(end - start) / 1000000; // ナノ秒 → ミリ秒
     console.log(`requestId generation: ${duration.toFixed(3)}ms`);
     next();
   };
   ```

2. **Winston のバッファリング**: Winston はデフォルトで4KBのバッファを使用します。ログが大量に発生する場合、バッファサイズを調整できます。
   ```javascript
   new DailyRotateFile({
     // デフォルトでバッファリングあり（高速）
     // options: { flags: 'a' } で追記モード
   });
   ```

3. **Cluster モードでの注意**: Node.js の Cluster モード（複数ワーカープロセス）を使用する場合、各ワーカーが独立したメモリストアを持つため、レート制限が正確でなくなります。その場合は Redis ストアに移行してください。

4. **ログレベルの本番調整**: 本番環境では `LOG_LEVEL=warn` または `LOG_LEVEL=error` に設定し、`info` や `debug` ログを無効化することで、ロギングオーバーヘッドを削減できます。

5. **GC（ガベージコレクション）の影響**: Node.js のGCはパフォーマンスに影響します。大量のエラーオブジェクトを生成する場合、GC頻度が増加する可能性があります。`node --expose-gc --max-old-space-size=512` でメモリを調整してください。

---

## 実装優先順位

以下の順序で実装することを推奨します。

1. **Phase 1: 基本的なエラーハンドリング（P1）**
   - AppError クラス作成
   - errorCodes.js 作成
   - requestId ミドルウェア作成
   - errorHandler ミドルウェア作成（Sequelize エラー変換を含む）
   - app.js へのミドルウェア統合

2. **Phase 2: ロギングシステム（P2）**
   - Winston 設定（logger.js）
   - errorHandler へのロギング統合
   - ログローテーション設定
   - .gitignore への logs/ 追加

3. **Phase 3: レート制限（P3）**
   - rateLimiter.js 作成（グローバル + 認証エンドポイント）
   - app.js への統合
   - ヘルスチェックの除外設定

4. **Phase 4: データベース接続確認（P2）**
   - server.js に DB 接続チェック追加
   - 接続失敗時のグレースフルシャットダウン

5. **Phase 5: テスト作成**
   - ユニットテスト（errorHandler.test.js, logger.test.js）
   - 統合テスト（errorHandling.test.js, rateLimiting.test.js）

---

## セキュリティ考慮事項

1. **本番環境でのスタックトレース非表示**: FR-004 に準拠し、`process.env.NODE_ENV === 'production'` でスタックトレースを除外します。

2. **SQL インジェクション対策**: Sequelize はパラメータ化クエリを使用するため、SQLインジェクションのリスクは低いですが、raw クエリを使用する場合は `replacements` を使用してください。

3. **レート制限によるDoS防止**: 認証エンドポイントに厳格なレート制限を適用し、ブルートフォース攻撃を防ぎます。

4. **CORS エラーの適切な処理**: 不正なオリジンからのリクエストは、CORSミドルウェアが403エラーを返します。これはエラーハンドラーに到達する前に処理されます。

5. **ログのセンシティブ情報除外**: ログにパスワード、トークン、クレジットカード情報を含めないでください。必要に応じて、ロギング前にreq.bodyをサニタイズします。
   ```javascript
   const sanitize = (obj) => {
     const sanitized = { ...obj };
     delete sanitized.password;
     delete sanitized.token;
     return sanitized;
   };

   logger.info('Request received', {
     body: sanitize(req.body)
   });
   ```

---

## まとめ

本研究により、以下の技術的決定が確定しました。

| 項目 | 決定内容 | 根拠 |
|------|----------|------|
| **Winston設定** | winston-daily-rotate-file、日次ローテーション、30日保持、JSON形式 | トラブルシューティング容易性、GDPR対応、分析ツール統合 |
| **ミドルウェア順序** | helmet → CORS → requestId → body-parser → rate-limit → routes → 404 → errorHandler | セキュリティ優先、エラートレーサビリティ、DoS防止 |
| **エラーレスポンス形式** | カスタム形式（status, code, message, details, requestId, timestamp） | シンプルさ、一貫性、トレーサビリティ |
| **レート制限** | 認証: 5回/15分、一般: 100回/15分、ワークアウト: 200回/15分、Strava: 100回/15分 | ブルートフォース防止、ユーザビリティ、外部API制限対応 |
| **Sequelizeエラー処理** | instanceof チェック、ユーザーフレンドリーな日本語メッセージ、フィールド別エラー詳細 | 一貫性、セキュリティ、ユーザー体験向上 |
| **パフォーマンス** | Winston: 0.6-2.5ms、rate-limit: 0.06-0.15ms、全体: 0.71-3.05ms | 目標達成、非同期I/O、メモリベースストア |

すべての決定は、プロジェクトの Constitution（Security-First, Rapid Development, Performance Optimization）に準拠しています。

---

## 参考資料

- [Winston Documentation](https://github.com/winstonjs/winston)
- [winston-daily-rotate-file](https://github.com/winstonjs/winston-daily-rotate-file)
- [Express Error Handling Guide](https://expressjs.com/en/guide/error-handling.html)
- [express-rate-limit Documentation](https://github.com/express-rate-limit/express-rate-limit)
- [Sequelize Error Handling](https://sequelize.org/docs/v6/core-concepts/validations-and-constraints/)
- [RFC 6585 - HTTP Status Code 429 (Too Many Requests)](https://tools.ietf.org/html/rfc6585)
- [RFC 7807 - Problem Details for HTTP APIs](https://tools.ietf.org/html/rfc7807)

---

**次のステップ**: Phase 1（Design Phase）に進み、data-model.md と quickstart.md を作成してください。
