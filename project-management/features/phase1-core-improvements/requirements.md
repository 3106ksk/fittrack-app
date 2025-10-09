# Phase 1: コア機能改善 + セキュリティ基盤 - 要件定義書

**作成日**: 2025-10-09
**期間**: 2025年10月（Month 1）
**工数**: 26時間（週6.5時間 × 4週間）
**担当**: Keisuke Sato

---

## 📋 目次

1. [概要](#概要)
2. [目的とゴール](#目的とゴール)
3. [機能要件](#機能要件)
4. [非機能要件](#非機能要件)
5. [制約条件](#制約条件)
6. [成功基準](#成功基準)

---

## 概要

### 背景
現在のFitTrackは以下の課題を抱えている：
- ワークヒストリー機能が詳細すぎて、コア価値（運動→健康効果）と乖離
- 4つの高優先度バグが未解決
- セキュリティ対策が不十分（医療データ拡張に向けて強化が必要）

### Phase 1 の位置づけ
医療データ拡張ロードマップの**第1フェーズ**として、以下を実現：
1. コア価値への集中（ワークヒストリー統合）
2. 全バグ修正による安定性向上
3. セキュリティ基盤の構築（Phase 2以降の土台）

---

## 目的とゴール

### 目的
> **「800行削減 + 全バグ修正 + セキュリティ基盤構築」で面接で語れるストーリーを作る**

### ゴール

#### 1. ユーザー価値
- ✅ シンプルで使いやすいダッシュボード
- ✅ 安定した動作（バグゼロ）
- ✅ セキュリティの向上（ユーザーには見えないが重要）

#### 2. 面接評価
- ✅ 戦略的判断力の証明（800行削減の意思決定）
- ✅ セキュリティ意識の高さ
- ✅ フルスタック実装力

#### 3. 医療準備度
- ✅ 20%達成（監査ログ基盤、XSS対策完了）

---

## 機能要件

### FR-1: ワークヒストリー統合（Pattern C改良版）

#### FR-1.1 過去ログ表示機能
**優先度**: P0（必須）

**要件**:
- ダッシュボードに「直近のログを見る」Accordionを追加
- 直近10件のワークアウトを日付グループ化して表示
- 1日に複数回トレーニングした場合は時刻も表示

**受け入れ基準**:
- [ ] Accordionはデフォルトで閉じている
- [ ] クリックで展開・折りたたみ可能
- [ ] 日付ごとにグループ化されている
- [ ] 同日に2回以上トレーニングがある場合、時刻（HH:MM）が表示される
- [ ] セット回数がバラバラ（30,27,35など）でも正しく表示される

**データ仕様**:
```typescript
interface WorkoutDisplay {
  id: number;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO 8601 timestamp
  exercise: string;
  exerciseType: 'cardio' | 'strength';
  // cardio
  distance?: number;
  duration?: number;
  // strength
  reps?: number;
  sets?: number;
  repsDetail?: Array<{setNumber: number, reps: number}>;
}
```

**UI仕様**:
```
┌─ 今週のアクティビティ ──────────┐
│ [5回] [320レップ] [15km]        │
│                                  │
│ ▼ 直近のログを見る（10件）       │
│ ┌────────────────────────────┐ │
│ │ 1/30                        │ │
│ │ ┃ 🏃 Running  5km  [07:30] │ │
│ │ ┃ 💪 Squat    20×3 [08:00] │ │
│ │                             │ │
│ │ 1/29                        │ │
│ │ ┃ 💪 Squat    30,27,35 (3set)│
│ └────────────────────────────┘ │
└──────────────────────────────┘
```

---

#### FR-1.2 旧ワークヒストリー機能の削除
**優先度**: P0（必須）

**要件**:
- 以下のファイルを削除
  - `frontend/src/pages/WorkoutHistory.jsx`
  - `frontend/src/components/WorkoutHistoryTable.jsx`
  - `frontend/src/components/WorkoutCustomizationDrawer.jsx`
  - `frontend/src/hooks/useWorkoutConfig.js`
- `/workout-history` ルートを削除
- ナビゲーションメニューから「履歴」リンクを削除

**受け入れ基準**:
- [ ] 約800行のコードが削除されている
- [ ] `/workout-history` へアクセスすると404エラー
- [ ] ナビゲーションに「履歴」リンクがない
- [ ] ビルドエラーがない
- [ ] 既存のテストが全て通る（WorkoutHistory関連テストは削除）

---

#### FR-1.3 バックエンドAPI拡張
**優先度**: P0（必須）

**要件**:
- `GET /workouts` のレスポンスに `createdAt` フィールドを追加
- 既存の `formatWorkoutData` 関数を修正

**受け入れ基準**:
- [ ] APIレスポンスに `createdAt` が含まれる
- [ ] `createdAt` はISO 8601形式（例: "2025-01-30T07:30:00.000Z"）
- [ ] 既存のフロントエンドに影響がない（後方互換性）

**実装ファイル**:
- `backend/routes/workouts.js:245-269`

---

### FR-2: バグ修正

#### FR-2.1 新規登録後のナビゲーション問題
**優先度**: P0（必須）

**現状の問題**:
新規登録完了後、`/dashboard` への遷移が `/login` にリダイレクトされる

**原因**:
登録APIはトークンを返さないため、PrivateRouteがユーザーを未認証として扱う

**解決策**:
登録APIでトークンも返すよう変更（Option 2採用）

**受け入れ基準**:
- [ ] 新規登録後、自動的に `/dashboard` へ遷移する
- [ ] ログイン状態が維持される
- [ ] トークンがレスポンスに含まれる

**実装ファイル**:
- `backend/routes/authRoutes.js:38-43`
- `frontend/src/components/Register.jsx`

---

#### FR-2.2 ワークアウトフォームのリセット問題
**優先度**: P0（必須）

**現状の問題**:
ワークアウト送信後、フォームがリセットされない

**受け入れ基準**:
- [ ] ワークアウト送信成功後、全フォームフィールドがクリアされる
- [ ] セット数のカウンターが初期値にリセットされる
- [ ] エラーメッセージがクリアされる

**実装ファイル**:
- `frontend/src/pages/WorkoutForm.jsx`

---

#### FR-2.3 複数ワークアウトの重複問題
**優先度**: P0（必須）

**現状の問題**:
同じワークアウトが複数回作成される可能性がある

**受け入れ基準**:
- [ ] 同一ユーザー、同一日時、同一種目のワークアウトは1件のみ作成可能
- [ ] 重複作成を試みた場合、適切なエラーメッセージが表示される
- [ ] DB レベルでユニーク制約が設定されている

**実装ファイル**:
- `backend/routes/workouts.js`
- `backend/migrations/add-unique-constraint-workouts.js`（新規）

---

#### FR-2.4 Strava連携の接続エラー
**優先度**: P1（高）

**現状の問題**:
Strava連携時に接続エラーが発生する

**受け入れ基準**:
- [ ] Strava OAuth フローが正常に動作する
- [ ] エラー時に適切なエラーメッセージが表示される
- [ ] リトライロジックが実装されている
- [ ] タイムアウト設定が適切

**実装ファイル**:
- `backend/routes/stravaRoutes.js`
- `backend/services/stravaService.js`

---

### FR-3: セキュリティ強化

#### FR-3.1 CSP（Content Security Policy）実装
**優先度**: P0（必須）

**要件**:
Helmet を使用してCSPを実装し、XSS攻撃を防ぐ

**受け入れ基準**:
- [ ] CSPヘッダーが設定されている
- [ ] インラインスクリプトが許可されていない（nonce使用）
- [ ] 外部スクリプトは許可されたドメインのみ
- [ ] 開発環境と本番環境で適切に設定が分かれている

**実装ファイル**:
- `backend/app.js`（Helmet設定）
- `backend/config/security.js`（新規）

**設定例**:
```javascript
helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'nonce-{RANDOM}'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  },
})
```

---

#### FR-3.2 Rate Limiting 実装
**優先度**: P0（必須）

**要件**:
DDoS攻撃を防ぐため、API Rate Limitingを実装

**受け入れ基準**:
- [ ] 認証API: 5回/分/IP
- [ ] ワークアウトAPI: 100回/時/IP
- [ ] 制限超過時に適切なエラーメッセージ（429 Too Many Requests）
- [ ] レート制限情報がレスポンスヘッダーに含まれる

**実装ファイル**:
- `backend/middleware/rateLimiter.js`（新規）
- `backend/routes/authRoutes.js`
- `backend/routes/workouts.js`

**設定例**:
```javascript
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分
  max: 5,
  message: 'Too many login attempts, please try again later.'
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 100,
  message: 'Too many requests, please try again later.'
});
```

---

#### FR-3.3 監査ログ基盤（Winston Logger）
**優先度**: P0（必須）

**要件**:
将来の医療データ拡張に向けて、監査ログの基盤を構築

**受け入れ基準**:
- [ ] Winston Logger が導入されている
- [ ] ファイルローテーション設定済み（日次、最大30日保持）
- [ ] ログレベルが定義されている（error, warn, info, debug）
- [ ] 重要操作がログに記録される
  - ユーザー登録・ログイン
  - ワークアウト作成・更新・削除
  - Strava連携

**ログフォーマット**:
```json
{
  "timestamp": "2025-02-09T10:30:00.000Z",
  "level": "info",
  "userId": 123,
  "action": "workout.create",
  "resourceId": 456,
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "message": "Workout created successfully"
}
```

**実装ファイル**:
- `backend/utils/logger.js`（新規）
- `backend/middleware/auditLogger.js`（新規）

---

## 非機能要件

### NFR-1: パフォーマンス
- [ ] ダッシュボードのロード時間: 2秒以内
- [ ] API応答時間: 200ms以内（P95）
- [ ] ワークヒストリー表示: 1秒以内（10件表示）

### NFR-2: 可用性
- [ ] サーバー稼働率: 99.9%
- [ ] エラーレート: 1%未満

### NFR-3: セキュリティ
- [ ] XSS攻撃対策: CSPで防御
- [ ] DDoS攻撃対策: Rate Limitingで防御
- [ ] ログ保持: 30日間（Phase 3で7年に拡張）

### NFR-4: 保守性
- [ ] コードカバレッジ: 60%以上
- [ ] ESLint警告: 0件
- [ ] TypeScript型エラー: 0件

### NFR-5: 互換性
- [ ] ブラウザ: Chrome, Firefox, Safari（最新2バージョン）
- [ ] モバイル: iOS Safari, Android Chrome
- [ ] 後方互換性: 既存APIのレスポンス形式を維持

---

## 制約条件

### 時間的制約
- **期間**: 1ヶ月（2025年2月）
- **工数**: 週7時間以内（就活並行）
- **週次完結**: 各週で完結するタスク分割

### 技術的制約
- **既存技術スタック**: React 18, Node.js, PostgreSQL を維持
- **新規パッケージ**: helmet, express-rate-limit, winston のみ追加
- **データベース**: 既存スキーマの破壊的変更なし

### リソース制約
- **開発者**: 1名（Keisuke Sato）
- **環境**: ローカル開発環境のみ（本番デプロイはPhase 4後）

---

## 成功基準

### 定量的基準

| 指標 | 目標値 | 測定方法 |
|-----|--------|---------|
| コード削減 | -800行 | Git diff |
| バグ修正 | 4件完了 | GitHub Issues |
| テストカバレッジ | 60%以上 | Jest/Vitest coverage |
| ビルド時間 | 30秒以内 | CI/CD metrics |
| CSP違反 | 0件 | Browser console |
| Rate Limit動作 | 100%機能 | 手動テスト |

### 定性的基準

#### ユーザー体験
- [ ] ダッシュボードがシンプルで分かりやすい
- [ ] バグによるストレスがない
- [ ] 過去ログへのアクセスが簡単

#### 開発者体験
- [ ] コードが読みやすく、保守しやすい
- [ ] ログで問題を追跡しやすい
- [ ] セキュリティ対策が明確

#### 面接評価
- [ ] 戦略的判断（800行削減）を5分で説明できる
- [ ] セキュリティ対策を具体的に説明できる
- [ ] 医療データ拡張への布石を語れる

---

## リスクと対応策

### リスク1: 工数超過
**発生確率**: 中
**影響度**: 高

**対応策**:
- 週次で進捗チェック
- タスク優先度の見直し（P0のみに集中）
- バッファタスクの削除

### リスク2: 既存機能への影響
**発生確率**: 低
**影響度**: 高

**対応策**:
- 段階的な実装（小さなPR）
- テストケースの充実
- ステージング環境での検証

### リスク3: セキュリティ設定ミス
**発生確率**: 中
**影響度**: 中

**対応策**:
- セキュリティベストプラクティスに従う
- OWASP Top 10のチェックリスト確認
- ピアレビュー（可能であれば）

---

## 次のステップ

1. [Phase 1 設計書](./design.md) の確認
2. Phase 1 Week 1 の実装開始
3. 週次レビューの実施

---

**最終更新**: 2025-10-09
**承認者**: Keisuke Sato
**次回レビュー**: 2025-11-01（Phase 1完了時）
