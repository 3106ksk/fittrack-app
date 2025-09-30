# FitTrack アプリケーション分析：LLM活用とドキュメント参照の判断指針

## 概要

このドキュメントは、FitTrackフィットネス管理アプリケーションを対象に、開発時における以下の2つのケースを明確に分類し、具体的なファイル・関数・実装内容を示したものです：

- **ドキュメントを深掘りするべきケース** - クリティカル領域で慎重な検証が必要
- **LLMの提案を局所チェックで済ますケース** - 影響小・代替容易で迅速な開発が可能

## プロジェクト構成

**アーキテクチャ**: React (フロントエンド) + Express.js (バックエンド) + PostgreSQL

**主要技術スタック**:
- **フロントエンド**: React, Material-UI, Axios, Vite, Vitest
- **バックエンド**: Express, Sequelize ORM, JWT, bcrypt, Helmet
- **外部連携**: Strava OAuth API
- **セキュリティ**: AES-256暗号化, CORS, Input Validation

## 1. ドキュメントを深掘りするべきケース（クリティカル領域）

以下の実装では、公式ドキュメントの参照と慎重な検証が必須です。

| カテゴリ | 該当ファイル・関数 | 具体的な実装内容 | 深掘り必要な理由 |
|----------|-------------------|------------------|------------------|
| JWT認証 | `backend/middleware/checkJWT.js:validateJWTSecret()` | JWT秘密鍵の長さ検証（32文字以上）と開発環境警告機能 | JWT設定ミスは全システムのセキュリティを破綻させるため |
| 暗号化処理 | `backend/services/stravaService.js:encryptToken()`<br>`backend/services/stravaService.js:decryptToken()` | AES-256-CBC暗号化でStravaアクセストークンを保護 | 暗号化実装の脆弱性は個人情報漏洩に直結するため |
| OAuth認証フロー | `backend/services/stravaService.js:exchangeCodeForToken()`<br>`backend/services/stravaService.js:refreshAccessToken()` | Strava OAuth2認可コード交換とトークンリフレッシュ処理 | OAuth実装ミスは認可バイパス脆弱性となるため |
| パスワード暗号化 | `backend/routes/authRoutes.js:29-30` | bcrypt + 環境変数saltRoundsでパスワードハッシュ化 | ハッシュ化方式の選択ミスはパスワード漏洩リスクとなるため |
| CORS設定 | `backend/app.js:getCorsConfig()` | 本番環境での厳格なCORS設定（origin制限・メソッド制限） | CORS設定ミスはクロスオリジン攻撃に繋がるため |
| データベースマイグレーション | `backend/migrations/20250823000000-add-strava-fields.js` | Stravaトークン関連カラムの本番データベース追加 | マイグレーション失敗は本番データ破損を引き起こすため |
| 認証ミドルウェア | `backend/middleware/checkJWT.js:24-28` | express-jwt設定とHS256アルゴリズム指定 | JWT検証ロジックの脆弱性は認証バイパスに繋がるため |
| トークンリフレッシュ | `backend/routes/authRoutes.js:113-143` | ignoreExpirationオプション付きトークン更新処理 | 期限切れトークンの扱いが不適切だと認証突破されるため |
| セキュリティヘッダー | `backend/app.js:35` | Helmet.jsによるHTTPセキュリティヘッダー設定 | セキュリティヘッダー不備は様々な攻撃を許してしまうため |

### 重要な実装例

#### JWT秘密鍵検証 (`backend/middleware/checkJWT.js:5-22`)

```javascript
const validateJWTSecret = () => {
  const secret = process.env.JWT_SECRET_KEY;
  
  if (!secret) {
    throw new Error('JWT_SECRET_KEY環境変数が設定されていません');
  }
  
  if (secret.length < 32) {
    throw new Error('JWT_SECRET_KEYはセキュリティ上、32文字以上である必要があります');
  }
  
  // 開発用固定値の使用を警告
  if (secret === 'c80c122bb8663d27520e22e9ca14bb6692be10431153940e11d3633eb0ba291e') {
    console.warn('⚠️  警告: 開発用JWT秘密鍵が使用されています。本番環境では新しい鍵を生成してください！');
  }
  
  return secret;
};
```

#### AES暗号化実装 (`backend/services/stravaService.js:102-110`)

```javascript
encryptToken(token) {
  if (!token) return null;
  const key = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}
```

## 2. LLMの提案を局所チェックで済ますケース（影響小・代替容易）

以下の実装では、LLMの提案を採用し、局所的なテストで迅速に検証可能です。

| カテゴリ | 該当ファイル・関数 | 具体的な実装内容 | 局所チェック可能な理由 |
|----------|-------------------|------------------|----------------------|
| UIコンポーネント | `frontend/src/components/WorkoutForm.jsx`<br>`frontend/src/components/WorkoutHistoryTable.jsx` | ワークアウト入力フォームと履歴表示テーブル | UI変更は即座に視覚確認可能で、影響範囲が限定的 |
| ユーティリティ関数 | `frontend/src/utils/formatters.js` | 日付・数値のフォーマット処理関数 | 入出力が明確で単体テストで挙動確認可能 |
| 入力バリデーション | `backend/routes/workouts.js:42-123` | ワークアウトデータの入力検証ロジック | テストケースで全パターン検証可能 |
| テストヘルパー | `frontend/src/components/__tests__/WorkoutHistoryTable.testUtils.jsx` | テスト用のモックデータとユーティリティ | テスト環境でのみ使用され、本番影響なし |
| データフォーマッター | `backend/routes/workouts.js:245-270` | APIレスポンス用のワークアウトデータ整形 | 入力値に対する出力が予測可能で、すぐにテスト確認可能 |
| APIモック | `frontend/src/test/mocks/handlers/strava.js` | MSW使用のStrava APIモック設定 | テスト環境専用でリアルタイム確認可能 |
| 定数定義 | `backend/routes/workouts.js:6` | `VALID_INTENSITIES = ["低", "中", "高"]` | 静的な定数で影響範囲が明確 |
| データマッピング | `backend/services/stravaService.js:134-161` | Stravaアクティビティを内部ワークアウト形式に変換 | 変換ロジックで入出力が明確、すぐに動作確認可能 |
| フォームデフォルト | `frontend/src/utils/formDefaults.js` | フォーム初期値とデフォルト設定 | 静的設定で影響範囲が限定的 |

### 実装例

#### データフォーマッター (`backend/routes/workouts.js:245-270`)

```javascript
const formatWorkoutData = (workout) => {
  const baseData = {
    id: workout.id,
    date: workout.date,
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

## 判断指針まとめ

### ドキュメント深掘りが必要な判断基準

- **セキュリティ関連**: 認証、認可、暗号化、パスワード処理
- **外部API連携**: OAuth、トークン管理、API仕様変更リスク
- **データベース操作**: マイグレーション、制約、トランザクション
- **本番環境設定**: CORS、セキュリティヘッダー、環境変数

### LLM提案で迅速開発可能な判断基準

- **UIコンポーネント**: 見た目の変更、表示ロジック
- **ユーティリティ関数**: 純粋関数、フォーマッター、バリデーター
- **テストコード**: モック、テストヘルパー、テストデータ
- **設定・定数**: 静的な値、デフォルト設定

## 実践的な活用方法

- **新機能開発時**: まず上記分類表で該当箇所を確認
- **コードレビュー時**: クリティカル領域は必ずドキュメント照会を要求
- **リファクタリング時**: 影響範囲を評価して適切な検証レベルを選択
- **バグ修正時**: セキュリティ関連なら必ず仕様書確認、UI関連なら迅速修正

このガイドラインにより、開発効率とセキュリティ品質の両立を図ることができます。