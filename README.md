# 🏋️‍♂️ **FitStart** - 運動習慣化支援フィットネストラッキングアプリ

<br>

### 📝 **テストアカウント情報**

アプリケーションの動作確認用に、以下のテストアカウントをご利用いただけます。

- **メールアドレス**: `test@gmail.com`
- **パスワード**: `password`

<br>

運動の継続を「見える化」でサポートし、身体と精神の健康向上を実現を目指した Web アプリケーション。医療連携を視野に入れた拡張性を持つヘルスケアプラットフォームです。

**サービス URL**: https://fitstart-frontend.vercel.app/

<br>

---

<br>

## **なぜ FitStart なのか？**

### **背景**

私自身の 3 つの体験から、このアプリケーションの開発に至りました：

<br>

### 🎯 **解決したい課題**

- 1. **健康リスクへの危機感**  
  祖父と父が生活習慣病で入院し苦しむ姿を目の当たりにし、予防医療の重要性を痛感

- 2. **高齢化による身体機能の低下**  
  私を育ててくれた祖父母の足腰が弱り、日常生活に支障が出ている現実

- 3. **運動の精神的な効果**  
  イギリスでのワーホリ生活での孤独な生活が、職場の仲間とのスポーツ活動によって充実したものに変化した経験

<br>

これらの経験から、運動習慣の継続は身体的健康だけでなく、精神的な健康と社会的つながりにも寄与すると確信しています。

<br>

### 🎯 **提供する価値**

- ✅ **統合管理**: 筋力トレーニングと有酸素運動の一元管理
- ✅ **データ可視化**: 進捗の可視化でモチベーション維持
- ✅ **継続サポート**: 直感的な UI/UX で習慣化促進

<br>

---

<br>

## 📸 **プロジェクトデモ**

### 🎯 **主要画面のスクリーンショット**

#### 🔐 **ログイン画面**

![ログイン画面](./docs/images/login-screen.png)
_FitStart のログイン画面 - シンプルで直感的なユーザーインターフェース_

<br>

#### 📊 **ダッシュボード**

![ダッシュボード](./docs/images/dashboard.png)
_ユーザー向けダッシュボード - トレーニング概要と統計情報の表示_

<br>

#### 📝 **ワークアウト記録フォーム**

![ワークアウト記録フォーム](./docs/images/workout-form.png)
_ワークアウト記録フォーム - カスタマイズ可能な運動種目の記録_

<br>

#### 📈 **ワークアウト履歴**

![ワークアウト履歴](./docs/images/workout-history.png)
_詳細なワークアウト履歴と統計データの可視化_

<br>

---

<br>

## 🏗️ **技術アーキテクチャ**

## 🛠️ **技術スタック**

### **コア技術**

- **フロントエンド**: React 18 + TypeScript + Vite
- **バックエンド**: Node.js + Express  
- **データベース**: PostgreSQL 17 + Sequelize ORM
- **認証**: JWT + bcrypt
- **UI**: Material-UI + React Hook Form

<br>

### **技術選定のポイント**

1. **セキュリティ重視**: 医療データ連携を見据えた堅牢な認証・暗号化
2. **型安全性**: TypeScriptによるランタイムエラーの削減
3. **スケーラビリティ**: マイクロサービス化を見据えたアーキテクチャ
4. **開発効率**: JavaScript統一によるフルスタック開発

<br>

### **アーキテクチャの特徴**

- RESTful API設計
- JWTによるステートレス認証
- PostgreSQLのJSONB型による柔軟なデータ構造
- Dockerによる環境構築の標準化

<br>

### **【フロントエンド技術選定理由】**

フィットネストラッキングアプリケーションは、Apple Health や Google Fit、Strava などのネイティブアプリが市場を占有しているため、Web アプリケーションでありながらもネイティブアプリに劣らない即座のレスポンスと滑らかな操作感を提供することを最優先に考えました。そのため、シングルページアプリケーション（SPA）の開発に最適で、かつ高速な開発環境を実現できる **React 18.2.0** と **Vite** を採用しました。

さらに、ユーザー体験を向上させるためには一貫した使いやすいデザインが重要だと考えたので、開発コストが低い **Material-UI（MUI）** を採用しました。統一したデザインシステムで、複雑なワークアウト入力フォームを直感的に操作可能にし、運動記録の心理的ハードルを下げることを狙いました。

<br>

### **【バックエンド技術選定理由】**

バックエンドには **Node.js + Express** を採用しました。最大の理由は、**フロントエンドと同じJavaScript/TypeScriptで統一することで得られる開発効率の向上**です。

<br>

**JavaScript統一による具体的なメリット：**

- **型定義の共有**: ワークアウトデータの複雑な型定義（セット数、レップ数配列、時間、距離など）をフロントエンド・バックエンド間で共有し、データ不整合を防止

- **バリデーションロジックの再利用**: Yupスキーマをクライアント・サーバー両側で使用し、二重のバリデーション実装を回避

- **開発者の学習コスト削減**: フロントエンド開発者がバックエンドAPIも理解・修正でき、チーム全体の生産性が向上

<br>

セキュリティ面では、Express の **ミドルウェアアーキテクチャ** を活用し、**Helmet.js によるセキュリティヘッダー設定**、**CORS による適切なオリジン制限**、**express-validator による入力検証** を多層的に実装。これにより、個人の健康データという**センシティブな情報を安全に管理**できる環境を実現しています。

<br>

### **【DB技術選定理由】**

PostgreSQLを選択した理由は、複雑なワークアウトデータ（配列型のレップ数など）をJSONB型で効率的に格納でき、将来的な**分析機能の拡張（時系列データ分析、パフォーマンストレンド）**にも対応できる拡張性を持つためです。

<br>
---
### **【インフラ構成図】**
### **【ER図】**
### ER Diagram

```mermaid
erDiagram
  USERS ||--o{ WORKOUTS : logs
  EXERCISES ||--o{ WORKOUTS : specified_in
  WORKOUTS ||--o{ SETS : contains
  USERS ||--o| STRAVA_ACCOUNTS : connects
  STRAVA_ACCOUNTS ||--o{ STRAVA_ACTIVITIES : imports
  WORKOUTS ||--o| STRAVA_ACTIVITIES : mapped_from

  USERS {
    int id PK
    string username
    string email UNIQUE
    string password_hash
    datetime last_login_at
    datetime created_at
    datetime updated_at
  }

  EXERCISES {
    int id PK
    string name UNIQUE
    string category "strength|cardio|mobility"
    string muscle_groups "comma-separated or array"
    numeric mets
    boolean is_active
    datetime created_at
    datetime updated_at
  }

  WORKOUTS {
    int id PK
    int user_id FK
    int exercise_id FK
    string exercise_name "free-text fallback"
    string exercise_type "strength|cardio"
    string intensity "low|medium|high"
    timestamp started_at
    timestamp ended_at
    int duration_min
    numeric distance_km
    decimal perceived_exertion
    jsonb metrics "avg_hr, calories, pace, elevation..."
    string source "manual|strava"
    text note
    datetime created_at
    datetime updated_at
  }

  SETS {
    int id PK
    int workout_id FK
    int set_index
    int reps
    numeric weight_kg
    decimal rpe
    int time_seconds
  }

  STRAVA_ACCOUNTS {
    int id PK
    int user_id FK UNIQUE
    bigint strava_athlete_id UNIQUE
    text access_token
    text refresh_token
    int expires_at_epoch
    datetime linked_at
  }

  STRAVA_ACTIVITIES {
    int id PK
    bigint strava_activity_id UNIQUE
    int user_id FK
    int workout_id FK UNIQUE
    string type
    numeric distance_km
    int moving_time_sec
    timestamp start_date
    jsonb raw_payload
    datetime imported_at
  }


<br>
### ER Diagram

```mermaid
erDiagram
  USERS ||--o{ WORKOUTS : logs
  EXERCISES ||--o{ WORKOUTS : specified_in
  WORKOUTS ||--o{ SETS : contains
  USERS ||--o| STRAVA_ACCOUNTS : connects
  STRAVA_ACCOUNTS ||--o{ STRAVA_ACTIVITIES : imports
  WORKOUTS ||--o| STRAVA_ACTIVITIES : mapped_from

  USERS {
    int id PK
    string username
    string email UNIQUE
    string password_hash
    datetime last_login_at
    datetime created_at
    datetime updated_at
  }

  EXERCISES {
    int id PK
    string name UNIQUE
    string category "strength|cardio|mobility"
    string muscle_groups "comma-separated or array"
    numeric mets
    boolean is_active
    datetime created_at
    datetime updated_at
  }

  WORKOUTS {
    int id PK
    int user_id FK
    int exercise_id FK
    string exercise_name "free-text fallback"
    string exercise_type "strength|cardio"
    string intensity "low|medium|high"
    timestamp started_at
    timestamp ended_at
    int duration_min
    numeric distance_km
    decimal perceived_exertion
    jsonb metrics "avg_hr, calories, pace, elevation..."
    string source "manual|strava"
    text note
    datetime created_at
    datetime updated_at
  }

  SETS {
    int id PK
    int workout_id FK
    int set_index
    int reps
    numeric weight_kg
    decimal rpe
    int time_seconds
  }

  STRAVA_ACCOUNTS {
    int id PK
    int user_id FK UNIQUE
    bigint strava_athlete_id UNIQUE
    text access_token
    text refresh_token
    int expires_at_epoch
    datetime linked_at
  }

  STRAVA_ACTIVITIES {
    int id PK
    bigint strava_activity_id UNIQUE
    int user_id FK
    int workout_id FK UNIQUE
    string type
    numeric distance_km
    int moving_time_sec
    timestamp start_date
    jsonb raw_payload
    datetime imported_at
  }

```

<br>

### **🧪 テスト実行**

```bash
# フロントエンドテスト
cd frontend
npm run test              # 基本テスト実行
npm run test:ui           # UI付きテスト実行
npm run test:coverage     # カバレッジ付きテスト

# バックエンドテスト
cd backend
npm run test              # 基本テスト実行
npm run test:coverage     # カバレッジ付きテスト
```

<br>

---

<br>

## 🚀 **API 概要**

### **ベースURL**
- **本番環境**: `https://fitstart-backend.vercel.app`
- **開発環境**: `http://localhost:8000`

### **認証方式**
保護されたエンドポイントは **JWT Bearer Token** が必要です：
1. `POST /authrouter/login` で `token` を取得
2. リクエストヘッダーに `Authorization: Bearer <token>` を付与

### **コアエンドポイント**

#### 🔐 **認証 (Authentication)**
| メソッド | パス | 認証 | 説明 |
|--------|------|------|------|
| POST | `/authrouter/register` | ❌ | 新規ユーザー登録 |
| POST | `/authrouter/login` | ❌ | ログイン（トークン発行） |
| GET | `/authrouter/me` | ✅ | 自分のプロフィール取得 |
| POST | `/authrouter/refresh-token` | ✅ | トークン更新 |

#### 💪 **ワークアウト (Workouts)**
| メソッド | パス | 認証 | 説明 |
|--------|------|------|------|
| POST | `/workouts` | ✅ | ワークアウト記録作成 |
| GET | `/workouts` | ✅ | 全ワークアウト取得 |
| GET | `/workouts/monthly` | ✅ | 月間ワークアウト取得 |
| GET | `/workouts/:workoutId` | ✅ | 特定ワークアウト詳細 |

#### 🏃 **Strava 連携**
| メソッド | パス | 認証 | 説明 |
|--------|------|------|------|
| POST | `/api/strava/auth` | ✅ | Strava認証URL生成（OAuth 2.0） |
| POST | `/api/strava/sync` | ✅ | アクティビティ同期 |
| GET | `/api/strava/status` | ✅ | 連携状態確認 |
| DELETE | `/api/strava/disconnect` | ✅ | 連携解除 |
| GET | `/api/strava/callback` | ❌ | OAuth コールバック（外部用） |

### **クイックスタート（curl）**

```bash
# 1) ユーザー登録
curl -X POST http://localhost:8000/authrouter/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@example.com","password":"password123"}'

# 2) ログイン → トークン取得
TOKEN=$(curl -X POST http://localhost:8000/authrouter/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}' | jq -r .token)

# 3) 保護API呼び出し（例：ワークアウト作成）
curl -X POST http://localhost:8000/workouts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise": "ランニング",
    "exerciseType": "cardio",
    "intensity": "中",
    "duration": 30,
    "distance": 5
  }'
```

<br>

---

