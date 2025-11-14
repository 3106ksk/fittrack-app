# データモデル: バックエンドエラーハンドリング実装

**機能**: 005- バックエンドエラーハンドリング実装
**作成日**: 2025-11-13
**フェーズ**: Phase 1 - Design

## 概要

このドキュメントは、エラーハンドリングシステムで使用されるデータモデルを定義します。これらのエンティティは、永続化されるデータではなく、ランタイムで生成・処理される構造化データです。

## エンティティ定義

### 1. ErrorResponse（エラーレスポンス）

**目的**: APIエラーレスポンスの標準形式。すべてのエンドポイントで一貫したエラー情報をクライアントに返すために使用。

**属性**:

| フィールド | 型 | 必須 | 説明 | 例 |
|-----------|-----|------|------|-----|
| `status` | Number | ✅ | HTTPステータスコード | `400`, `401`, `500` |
| `code` | String | ✅ | エラーの種類を示すコード | `VALIDATION_ERROR`, `UNAUTHORIZED`, `DATABASE_ERROR` |
| `message` | String | ✅ | ユーザーに表示する人間が読めるエラーメッセージ（日本語） | `"メールアドレスの形式が正しくありません"` |
| `details` | Object/Array | ❌ | エラーの詳細情報（オプション） | `[{field: "email", message: "無効な形式"}]` |
| `requestId` | String (UUID) | ✅ | リクエストを一意に識別するID | `"550e8400-e29b-41d4-a716-446655440000"` |
| `timestamp` | String (ISO 8601) | ✅ | エラー発生時刻 | `"2025-11-13T10:30:45.123Z"` |

**バリデーションルール**:
- `status`: 100-599の範囲のHTTPステータスコード
- `code`: 大文字英字とアンダースコアのみ（例: `VALIDATION_ERROR`）
- `message`: 空文字列不可、最大500文字
- `requestId`: UUID v4形式
- `timestamp`: ISO 8601形式（UTC）

**使用例（JSON）**:

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

**環境別の動作**:
- **開発環境**: `details`にスタックトレースを含める
- **本番環境**: `details`にスタックトレースを含めない（セキュリティ）

---

### 2. StructuredLog（構造化ログエントリ）

**目的**: 構造化されたログエントリ。エラーの追跡、デバッグ、分析に使用。Winstonによって記録される。

**属性**:

| フィールド | 型 | 必須 | 説明 | 例 |
|-----------|-----|------|------|-----|
| `timestamp` | String (ISO 8601) | ✅ | ログ記録時刻 | `"2025-11-13T10:30:45.123Z"` |
| `level` | String (Enum) | ✅ | ログレベル: `error`, `warn`, `info`, `debug` | `"error"` |
| `requestId` | String (UUID) | ✅ | リクエストID（ErrorResponseと同一） | `"550e8400-e29b-41d4-a716-446655440000"` |
| `userId` | Number | ❌ | ユーザーID（認証済みの場合） | `123` |
| `endpoint` | String | ✅ | APIエンドポイントパス | `"/api/workouts"` |
| `method` | String (Enum) | ✅ | HTTPメソッド: `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | `"POST"` |
| `statusCode` | Number | ✅ | レスポンスステータスコード | `500` |
| `errorType` | String | ✅ | エラーの種類 | `"SequelizeValidationError"`, `"UnauthorizedError"` |
| `message` | String | ✅ | エラーメッセージ | `"Database connection failed"` |
| `stack` | String | ❌ | スタックトレース（errorレベルのみ） | `"Error: Database connection failed\n at ..."` |
| `metadata` | Object | ❌ | 追加のコンテキスト情報 | `{ip: "192.168.1.1", userAgent: "..."}` |

**バリデーションルール**:
- `level`: `error`, `warn`, `info`, `debug`のいずれか
- `method`: HTTPメソッドのみ（GET, POST, PUT, PATCH, DELETE, OPTIONS）
- `statusCode`: 100-599の範囲
- `stack`: errorレベルの場合のみ記録

**使用例（JSON）**:

```json
{
  "timestamp": "2025-11-13T10:30:45.123Z",
  "level": "error",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": 123,
  "endpoint": "/api/workouts",
  "method": "POST",
  "statusCode": 500,
  "errorType": "SequelizeDatabaseError",
  "message": "connection to server at \"localhost\" (::1), port 5432 failed",
  "stack": "Error: connection to server...\n at Connection._handleErrorMessage...",
  "metadata": {
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**ログレベル別の使用**:
- **error**: システムエラー、予期しない例外
- **warn**: レート制限警告、非推奨API使用
- **info**: リクエスト処理開始/完了、認証成功
- **debug**: 詳細なデバッグ情報（開発環境のみ）

---

### 3. RateLimitConfig（レート制限設定）

**目的**: API エンドポイントごとのレート制限設定を定義。express-rate-limitで使用される。

**属性**:

| フィールド | 型 | 必須 | 説明 | 例 |
|-----------|-----|------|------|-----|
| `endpoint` | String (Pattern) | ✅ | 対象エンドポイントパターン | `"/api/auth/login"` |
| `windowMs` | Number | ✅ | 時間枠（ミリ秒） | `900000`（15分） |
| `maxRequests` | Number | ✅ | 時間枠内の最大リクエスト数 | `100` |
| `message` | String | ✅ | レート制限到達時のメッセージ | `"リクエスト上限に達しました。15分後に再試行してください"` |
| `skipSuccessfulRequests` | Boolean | ❌ | 成功したリクエストをカウントしないか | `true`（認証エンドポイント） |
| `skipFailedRequests` | Boolean | ❌ | 失敗したリクエストをカウントしないか | `false` |

**バリデーションルール**:
- `windowMs`: 正の整数、最小60000（1分）
- `maxRequests`: 正の整数、最小1
- `message`: 空文字列不可、最大200文字

**エンドポイント別の推奨設定**:

| エンドポイント | windowMs | maxRequests | skipSuccessfulRequests | 理由 |
|---------------|----------|-------------|------------------------|------|
| `/api/auth/login` | 15分 | 5 | `true` | ブルートフォース攻撃防止 |
| `/api/auth/register` | 60分 | 3 | `false` | スパム登録防止 |
| `/api/workouts/*` | 15分 | 200 | `false` | 頻繁な更新を許容 |
| `/api/strava/*` | 15分 | 100 | `false` | Strava API制限に合わせる |
| その他のAPI | 15分 | 100 | `false` | デフォルト設定 |

**使用例（JavaScript設定）**:

```javascript
const authLoginLimit = {
  endpoint: '/api/auth/login',
  windowMs: 15 * 60 * 1000, // 15分
  maxRequests: 5,
  message: 'ログイン試行回数が上限に達しました。15分後に再試行してください',
  skipSuccessfulRequests: true,
  skipFailedRequests: false
};
```

---

## データフロー

### エラー発生時のデータフロー

```
1. エラー発生
   ↓
2. ErrorHandlerミドルウェアがキャッチ
   ↓
3. requestIdを取得（既にミドルウェアで付与済み）
   ↓
4. ErrorResponseオブジェクトを生成
   - status, code, message, details, requestId, timestamp
   ↓
5. StructuredLogエントリを生成
   - timestamp, level, requestId, userId, endpoint, method, statusCode, errorType, message, stack, metadata
   ↓
6. Winstonでログを記録（非同期）
   ↓
7. クライアントにErrorResponseを返す
```

### レート制限チェックのデータフロー

```
1. リクエスト受信
   ↓
2. RateLimiterミドルウェアがチェック
   ↓
3. RateLimitConfigを参照
   - endpoint, windowMs, maxRequests
   ↓
4. リクエストカウントをインクリメント（メモリストア）
   ↓
5. 制限超過の場合:
   - HTTP 429レスポンス
   - Retry-Afterヘッダー設定
   - ErrorResponseを返す
   ↓
6. 制限内の場合:
   - 次のミドルウェアへ
```

---

## データ保存

### ログファイル保存

**保存場所**: `logs/`ディレクトリ

**ファイル構成**:
- `error.log`: errorレベルのログのみ
- `combined.log`: すべてのレベルのログ
- `YYYY-MM-DD.log`: 日次ローテーションファイル（30日保持）
- `exceptions.log`: 未処理の例外
- `rejections.log`: 未処理のPromise rejection

**ローテーション設定**:
- 日次ローテーション（毎日0時UTC）
- または10MBサイズ到達時
- 30日以上古いログは自動削除
- 古いログはgzip圧縮

**フォーマット**: JSON Lines形式（1行1JSONオブジェクト）

---

## セキュリティ考慮事項

### 1. スタックトレースの扱い

- **開発環境**: ErrorResponse.detailsとStructuredLog.stackに含める
- **本番環境**: ErrorResponseには含めない、StructuredLog.stackのみに記録

### 2. センシティブ情報のマスキング

ログ記録時に以下をマスキング:
- パスワード（`password`, `pass`, `pwd`フィールド）
- トークン（`token`, `jwt`, `authorization`ヘッダー）
- クレジットカード番号
- 個人情報（メールアドレス、電話番号）

**マスキング方法**: `"****"`に置換

### 3. リクエストID

- UUID v4形式を使用（推測不可能）
- すべてのエラーレスポンスとログに含める
- ユーザーサポート時の問い合わせIDとして利用

---

## パフォーマンス考慮事項

### ログ記録のパフォーマンス

- **非同期書き込み**: Winstonの非同期トランスポートを使用
- **バッファリング**: メモリバッファを使用してディスクI/Oを最小化
- **目標**: エラーログ記録のオーバーヘッドは5ms以下

### レート制限のパフォーマンス

- **メモリストア**: インメモリカウンターで高速チェック
- **目標**: レート制限チェックは1ms以下

---

## 今後の拡張

### Phase 2以降で検討

1. **ログ集約サービス連携**: Logtail, Datadog, CloudWatch Logsへの送信
2. **エラーアラート**: 特定エラーパターンの検出時にSlack/Email通知
3. **エラーメトリクス**: エラー発生率、エンドポイント別エラー統計のダッシュボード
4. **分散トレーシング**: マイクロサービス化時のリクエストトレーシング（OpenTelemetry）

---

**作成者**: Claude Code
**最終更新**: 2025-11-13
