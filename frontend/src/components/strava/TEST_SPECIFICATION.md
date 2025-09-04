# Stravaコンポーネント テスト仕様書 - 面接対応版 v2.0

**🎯 面接準備重視設計 - 9月13日目標達成のための戦略的テスト実装**

## 概要

このドキュメントは、**面接で技術力を効果的にアピールする**ためのStravaコンポーネントテスト戦略を定義します。限られた時間で最大の成果を上げ、フロントエンドカバレッジ7%→30%達成を目指します。

## 🎯 面接対応戦略

### 面接でのアピールポイント
1. **外部API統合スキル**: Strava API連携の実装能力
2. **テスト設計力**: モック活用・エラーハンドリングテストの実装
3. **時間管理能力**: 限られた時間での効率的な成果創出
4. **実用的思考**: ユーザビリティを重視した現実的なテスト設計

### 目標KPI（9月13日時点）
```javascript
const interviewTargets = {
  "テスト成功率": "100%（現在:82.6%）",
  "カバレッジ向上": "+15%以上（Strava部分）",
  "実装時間": "2-3時間完了",
  "面接デモ価値": "高（差別化要素として強力）"
}
```

## 📊 コンポーネント分析 - 面接観点

### 面接価値の高い技術要素

#### StravaConnect（認証・接続管理）
```javascript
// 面接でアピールできる技術ポイント
const technicalHighlights = {
  "OAuth統合": "外部サービス認証フローの理解",
  "状態管理": "React hooksを活用した複雑状態の管理", 
  "エラーハンドリング": "ネットワークエラー・認証失敗への対応",
  "UX配慮": "ローディング状態・フィードバックの実装"
}
```

#### StravaSync（データ同期処理）
```javascript
const syncFeatureValue = {
  "非同期処理": "API呼び出し・タイマー制御",
  "UI状態遷移": "idle→syncing→completed/failedの適切な制御",
  "実用性": "同期結果の分かりやすい表示",
  "自動化": "結果の自動非表示機能"
}
```

## 🚀 戦略的テスト分類（面接重視）

### 🔴 Must to Do（絶対実装 - 90分）
**面接で致命的なNG判定を避けるための必須テスト**

### 🟡 Important（推奨実装 - 60分）
**技術力アピール・品質向上のための重要テスト**

### 🟠 Better（時間余裕時 - 30分）
**完成度向上・差別化のための追加テスト**

---

## 🔴 Must to Do テスト詳細（90分完了目標）

### M1. 基本状態表示テスト - StravaConnect (20分)

#### M1-1. 接続済み状態の正しい表示 🔴
**面接価値**: 外部API結果を正しくパーシング・表示できる能力
```javascript
// MSWモック: 接続済みレスポンス
const connectedResponse = {
  connected: true,
  athlete_id: "12345", 
  last_sync: "2024-01-15T10:30:00Z"
}

// 期待結果
- "接続済み"メッセージ表示
- Athlete ID表示
- 最終同期日時表示
- 連携解除ボタン表示
```

#### M1-2. 未接続状態の正しい表示 🔴
**面接価値**: 条件分岐UIレンダリングの実装能力
```javascript
// MSWモック: 未接続レスポンス
const disconnectedResponse = {
  connected: false,
  athlete_id: null,
  last_sync: null
}

// 期待結果
- "接続"ボタン表示
- 説明文表示
- 接続関連情報非表示
```

### M2. APIエラーハンドリングテスト (30分)

#### M2-1. 認証URL取得失敗時のエラー表示 🔴
**面接価値**: 外部APIエラーの適切なハンドリング能力
```javascript
// MSWモック: 500 Internal Server Error
const authErrorResponse = {
  status: 500,
  error: "Failed to get auth URL"
}

// 期待結果
- エラーアラート表示
- ローディング状態解除
- ボタンが再度押せる状態に
```

#### M2-2. 同期処理失敗時のエラー表示 🔴
**面接価値**: 非同期処理のエラーハンドリング能力
```javascript
// MSWモック: 同期処理エラー
const syncErrorResponse = {
  status: 500,
  error: "Sync failed"
}

// 期待結果
- エラーアラート表示
- 「闇じる」ボタン表示
- 5秒後の自動非表示
```

### M3. UI状態遷移テスト (25分)

#### M3-1. 同期処理中のUI状態制御 🔴
**面接価値**: React状態管理とUIフィードバックの実装能力
```javascript
// 期待状態遷移
const stateTransitions = {
  idle: {
    ボタン: "データを同期",
    アイコン: "SyncIcon",
    無効化: false
  },
  syncing: {
    ボタン: "同期中...",
    アイコン: "CircularProgress",
    無効化: true,
    プログレスバー: 表示
  },
  completed: {
    ボタン: "同期完了",
    アイコン: "CheckCircleIcon",
    アラート: 成功表示
  }
}
```

#### M3-2. 成功結果の詳細表示 🔴
**面接価値**: データ処理結果の適切なユーザーフィードバック
```javascript
// MSWモック: 成功レスポンス
const successResponse = {
  synced: 5,
  skipped: 2,
  errors: 0
}

// 期待結果
- "新規追加: 5件"表示
- "スキップ: 2件"表示
- 成功アラートの表示
```

### M4. ユーザビリティテスト (15分)

#### M4-1. ローディング状態の適切な表示 🔴
**面接価値**: ユーザーエクスペリエンスへの配慮
```javascript
// ローディング状態時の期待表示
const loadingState = {
  StravaConnect: {
    スピナー: 表示,
    テキスト: "接続状況を確認中...",
    ボタン: 非表示
  },
  StravaSync: {
    プログレスバー: 表示,
    テキスト: "データを取得しています...",
    ボタン: 無効化
  }
}
```

---

## 🟡 Important テスト詳細（60分完了目標）

### I1. 高度なエラーハンドリングテスト (30分)

#### I1-1. 接続解除時の401認証エラー処理 🟡
**面接価値**: HTTPステータスコードに応じた適切なエラーハンドリング

#### I1-2. ネットワークタイムアウトエラーの処理 🟡
**面接価値**: 外部API統合時の実用的なエラーシナリオへの対応

### I2. 状態管理の高度なテスト (30分)

#### I2-1. 親コンポーネントへの状態通知テスト 🟡
**面接価値**: コンポーネント間通信・Callback関数の適切な使用

#### I2-2. 自動状態リセットのタイマーテスト 🟡
**面接価値**: 非同期処理とタイマー制御の理解

---

## 🟠 Better テスト詳細（30分完了目標）

### B1. アクセシビリティテスト (15分)

#### B1-1. ARIAラベルとキーボードナビゲーション 🟠
**面接価値**: アクセシビリティへの配慮と品質へのこだわり

### B2. パフォーマンステスト (15分)

#### B2-1. メモリリーク検証とクリーンアップテスト 🟠
**面接価値**: コンポーネントライフサイクルへの理解とベストプラクティス

---

## 🛠️ 実装ガイドライン

### フェーズ1: テスト環境セットアップ (15分)
```bash
# ファイル作成
mkdir -p src/components/strava/__tests__
touch src/components/strava/__tests__/StravaConnect.test.jsx
touch src/components/strava/__tests__/StravaSync.test.jsx
touch src/components/strava/__tests__/testUtils.js
```

### フェーズ2: MSWハンドラー作成 (15分)
```javascript
// src/test/mocks/handlers/strava.js 作成
export const stravaHandlers = [
  // GET /api/strava/status - 接続済み
  http.get('*/api/strava/status', () => 
    HttpResponse.json({ connected: true, athlete_id: '12345' })
  ),
  // POST /api/strava/auth - 認証成功
  http.post('*/api/strava/auth', () =>
    HttpResponse.json({ authUrl: 'https://strava.com/oauth/...' })
  ),
  // POST /api/strava/sync - 同期成功
  http.post('*/api/strava/sync', () =>
    HttpResponse.json({ synced: 5, skipped: 2, errors: 0 })
  )
]
```

### フェーズ3: Must to Doテスト実装 (90分)
**実装順序**:
1. M1-1, M1-2 (基本状態表示) → 20分
2. M2-1, M2-2 (エラーハンドリング) → 30分  
3. M3-1, M3-2 (UI状態遷移) → 25分
4. M4-1 (ユーザビリティ) → 15分

### 最終確認チェックリスト ✅
- [ ] 全テストが成功している
- [ ] カバレッジが15%以上向上している
- [ ] 面接で説明できる状態にある
- [ ] 90分以内でMust to Doが完了している

---

## 🎆 面接でのアピールポイント

### 技術的ハイライト
1. **外部APIモックテスト**: MSWを活用した現実的なテスト環境構築
2. **React状態管理**: hooksを使った複雑状態の管理とテスト
3. **エラーハンドリング**: 実用的なエラーシナリオへの対応
4. **UX配慮**: ユーザーフィードバックへの細かい配慮

### 成果物のアピール方法
- "実用的なエラーハンドリングにより、ユーザーがストレスなく使えるアプリを実現"
- "タイマーや状態管理で適切なフィードバックを提供し、操作の直感性を向上"
- "MSWを使ったテストで、実際のサービス運用で起こり得るシナリオを網羅"

**この仕様書により、3時間以内で面接で最大のインパクトを与えるStravaコンポーネントテストを完成できます。** 🏆

#### A1-2. 接続済み状態の表示
**目的**: 既存のStrava接続が正しく表示される
**手順**:
1. MSWで接続済みレスポンスをモック
2. コンポーネントをマウント

**期待値**:
- 「Stravaアカウントに接続済み」メッセージ
- Athlete IDが表示される
- 最終同期日時が表示される（存在する場合）
- 連携解除ボタンが表示される

**MSWモック**:
```json
{
  "connected": true,
  "athlete_id": "12345",
  "last_sync": "2024-01-15T10:30:00Z"
}
```

#### A1-3. 未接続状態の表示
**目的**: Strava未接続状態の適切な表示
**手順**:
1. MSWで未接続レスポンスをモック
2. コンポーネントをマウント

**期待値**:
- 「Stravaアカウントと連携して...」説明文が表示
- 「Stravaに接続」ボタンが表示される
- 接続関連情報は表示されない

**MSWモック**:
```json
{
  "connected": false,
  "athlete_id": null,
  "last_sync": null
}
```

### A2. 接続処理テスト

#### A2-1. 正常な認証フロー開始
**目的**: OAuth認証フローの正常開始
**手順**:
1. 未接続状態でコンポーネントをマウント
2. 「Stravaに接続」ボタンをクリック
3. MSWで正常なレスポンスをモック

**期待値**:
- `POST /api/strava/auth` が呼ばれる
- ローディング状態が表示される
- `window.location.href` が認証URLに設定される

**MSWモック**:
```json
{
  "authUrl": "https://www.strava.com/oauth/authorize?client_id=..."
}
```

**モック必要箇所**: `window.location.href` の設定

#### A2-2. 認証URL取得失敗
**目的**: 認証URL取得エラーの適切な処理
**手順**:
1. MSWで500エラーレスポンスをモック
2. 「Stravaに接続」ボタンをクリック

**期待値**:
- エラーメッセージが表示される
- ローディング状態が解除される
- ボタンが再度押せる状態になる

**MSWモック**: HTTP 500 Internal Server Error

### A3. 接続解除テスト

#### A3-1. 正常な接続解除
**目的**: 接続解除処理の正常動作
**手順**:
1. 接続済み状態でコンポーネントをマウント
2. 「連携解除」ボタンをクリック
3. 確認ダイアログで「OK」を選択

**期待値**:
- 確認ダイアログが表示される
- `DELETE /api/strava/disconnect` が呼ばれる
- 接続状態確認APIが再呼び出しされる
- 未接続状態に変更される

**MSWモック**: 
- `/api/strava/disconnect`: 204 No Content
- `/api/strava/status`: 未接続レスポンス

**モック必要箇所**: `window.confirm` の返り値

#### A3-2. 接続解除のキャンセル
**目的**: ユーザーがキャンセルした場合の処理
**手順**:
1. 接続済み状態でコンポーネントをマウント
2. 「連携解除」ボタンをクリック
3. 確認ダイアログで「キャンセル」を選択

**期待値**:
- APIが呼ばれない
- 接続状態が変更されない
- エラーメッセージが表示されない

#### A3-3. 接続解除時の認証エラー
**目的**: 認証失敗時の適切なエラー処理
**手順**:
1. MSWで401エラーレスポンスをモック
2. 接続解除処理を実行

**期待値**:
- 「Strava認証が必要です。再度接続してください。」エラーメッセージ
- ローディング状態が解除される

**MSWモック**: HTTP 401 Unauthorized

### A4. 状態通知テスト

#### A4-1. 親コンポーネントへの状態通知
**目的**: onStatusChangeコールバックの正常動作
**手順**:
1. onStatusChangeプロップを設定してマウント
2. 接続状態が変更される操作を実行

**期待値**:
- 接続状態変更時にコールバックが呼ばれる
- 正しい状態が引数として渡される

**テスト対象**:
- 初期状態確認後の通知
- 接続成功後の通知
- 接続解除後の通知
- エラー発生時の通知

## StravaSync コンポーネント

### B1. 初期状態テスト

#### B1-1. アイドル状態の表示
**目的**: 初期状態の適切な表示
**手順**:
1. StravaSyncコンポーネントをマウント

**期待値**:
- 「データを同期」ボタンが表示される
- 同期アイコンが表示される
- プログレスバーは表示されない
- ヒントメッセージが表示される

### B2. 同期処理テスト

#### B2-1. 正常な同期処理
**目的**: データ同期の正常な実行と結果表示
**手順**:
1. 「データを同期」ボタンをクリック
2. MSWで成功レスポンスをモック

**期待値**:
1. 同期中状態:
   - ボタンテキストが「同期中...」に変更
   - プログレスバーが表示される
   - ボタンが無効化される

2. 完了状態:
   - 成功アラートが表示される
   - 同期結果が表示される（新規追加、スキップ、エラー件数）
   - 5秒後に自動的にアイドル状態に戻る

**MSWモック**:
```json
{
  "synced": 5,
  "skipped": 2,
  "errors": 0
}
```

#### B2-2. 部分的成功の同期処理
**目的**: 一部エラーを含む同期結果の表示
**手順**:
1. 同期処理を実行
2. エラーを含む成功レスポンスをモック

**期待値**:
- 成功アラート内にエラー件数が警告色で表示される
- その他の成功情報も正しく表示される

**MSWモック**:
```json
{
  "synced": 3,
  "skipped": 1,
  "errors": 2
}
```

#### B2-3. 同期処理失敗
**目的**: 同期失敗時のエラー処理
**手順**:
1. MSWで500エラーレスポンスをモック
2. 同期処理を実行

**期待値**:
- エラーアラートが表示される
- 「閉じる」ボタンが表示される
- 5秒後に自動的にアイドル状態に戻る
- ボタンが再度押せる状態になる

**MSWモック**: HTTP 500 Internal Server Error

### B3. UI状態遷移テスト

#### B3-1. ボタン状態の遷移
**目的**: 同期状態に応じたボタン表示の検証
**手順**:
1. 各同期状態でボタンの表示を確認

**期待値**:
- idle: 「データを同期」+ 同期アイコン + enabled
- syncing: 「同期中...」+ ローディングスピナー + disabled
- completed: 「同期完了」+ チェックアイコン + disabled
- failed: 「同期失敗」+ エラーアイコン + enabled

#### B3-2. 自動状態リセット
**目的**: タイマーによる自動状態リセットの検証
**手順**:
1. 同期完了状態になる
2. 5秒待機

**期待値**:
- 5秒後にアイドル状態に自動復帰する
- 結果表示が非表示になる

**テストユーティリティ**: `vi.useFakeTimers()` でタイマー制御

### B4. エラー処理テスト

#### B4-1. ネットワークエラー
**目的**: ネットワーク関連エラーの処理
**手順**:
1. MSWでネットワークエラーをシミュレート
2. 同期処理を実行

**期待値**:
- 適切なエラーメッセージが表示される
- 状態が失敗状態に変更される

#### B4-2. タイムアウトエラー
**目的**: リクエストタイムアウトの処理
**手順**:
1. MSWで長時間のレスポンス遅延をシミュレート
2. 同期処理を実行

**期待値**:
- タイムアウトエラーが適切に処理される
- ユーザーにわかりやすいエラーメッセージが表示される

## パフォーマンステスト

### P1. レンダリングパフォーマンス
**目的**: コンポーネントの効率的なレンダリング確認
**手順**:
1. React.Profiler でレンダリング回数を測定
2. 不要な再レンダリングの検証

### P2. メモリリーク検証
**目的**: タイマーやイベントリスナーのクリーンアップ確認
**手順**:
1. コンポーネントのマウント・アンマウント
2. タイマーの適切なクリアを確認

## アクセシビリティテスト

### A1. キーボードナビゲーション
**目的**: キーボードのみでの操作可能性確認
**手順**:
1. Tabキーでフォーカス移動
2. Enterキーでボタン操作

### A2. スクリーンリーダー対応
**目的**: アリアラベル・セマンティクスの確認
**手順**:
1. testing-library の `getByRole` で要素特定
2. アリアラベルの適切性確認

## テスト実装優先度

### 🔴 高優先度 (Critical)
1. **A1-2**: 接続済み状態の表示
2. **A1-3**: 未接続状態の表示
3. **A2-1**: 正常な認証フロー開始
4. **B2-1**: 正常な同期処理
5. **B2-3**: 同期処理失敗

### 🟡 中優先度 (High)
1. **A1-1**: 初期ローディング状態
2. **A3-1**: 正常な接続解除
3. **B1-1**: アイドル状態の表示
4. **B3-1**: ボタン状態の遷移
5. **A4-1**: 親コンポーネントへの状態通知

### 🟢 低優先度 (Medium)
1. **A2-2**: 認証URL取得失敗
2. **A3-3**: 接続解除時の認証エラー
3. **B2-2**: 部分的成功の同期処理
4. **B3-2**: 自動状態リセット

### 🔵 改善優先度 (Low)
1. **A3-2**: 接続解除のキャンセル
2. **B4-1, B4-2**: その他のエラーパターン
3. **P1, P2**: パフォーマンステスト
4. **A1, A2**: アクセシビリティテスト

## MSWハンドラー設計

### Strava API モックハンドラー
```typescript
// /api/strava/status
export const stravaStatusHandlers = {
  success: {
    connected: http.get('*/api/strava/status', () => 
      HttpResponse.json({ connected: true, athlete_id: '12345', last_sync: '2024-01-15T10:30:00Z' })
    ),
    disconnected: http.get('*/api/strava/status', () => 
      HttpResponse.json({ connected: false, athlete_id: null, last_sync: null })
    )
  },
  error: {
    serverError: http.get('*/api/strava/status', () => 
      HttpResponse.json({ error: 'Internal server error' }, { status: 500 })
    )
  }
}

// /api/strava/auth
export const stravaAuthHandlers = {
  success: http.post('*/api/strava/auth', () =>
    HttpResponse.json({ authUrl: 'https://www.strava.com/oauth/authorize?client_id=...' })
  ),
  error: http.post('*/api/strava/auth', () =>
    HttpResponse.json({ error: 'Failed to get auth URL' }, { status: 500 })
  )
}

// /api/strava/disconnect
export const stravaDisconnectHandlers = {
  success: http.delete('*/api/strava/disconnect', () => 
    new HttpResponse(null, { status: 204 })
  ),
  unauthorized: http.delete('*/api/strava/disconnect', () =>
    HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
  )
}

// /api/strava/sync
export const stravaSyncHandlers = {
  success: http.post('*/api/strava/sync', () =>
    HttpResponse.json({ synced: 5, skipped: 2, errors: 0 })
  ),
  partialSuccess: http.post('*/api/strava/sync', () =>
    HttpResponse.json({ synced: 3, skipped: 1, errors: 2 })
  ),
  error: http.post('*/api/strava/sync', () =>
    HttpResponse.json({ error: 'Sync failed' }, { status: 500 })
  )
}
```

## テスト実装戦略

### 1. テストファイル構成
```
src/components/strava/__tests__/
├── StravaConnect.test.tsx          # メインテストファイル
├── StravaSync.test.tsx             # メインテストファイル
├── testUtils.ts                    # 共通テストユーティリティ
└── mocks/
    ├── handlers.ts                 # MSWハンドラー
    └── data.ts                     # テストデータ
```

### 2. 共通テストユーティリティ
- コンポーネントラッパー
- MSWハンドラー切り替えヘルパー
- カスタムレンダー関数
- モックプロップス生成

### 3. テスト実装ガイドライン
- **Arrange**: テストデータとモックの準備
- **Act**: ユーザーインタラクションの実行
- **Assert**: 期待値との比較・検証

### 4. CI/CD統合
- 全テストが通過した場合のみマージ許可
- カバレッジ80%以上の維持
- テスト失敗時の詳細レポート

## まとめ

この仕様書は、Stravaコンポーネントの品質と信頼性を確保するための包括的なテスト戦略を提供します。外部API統合の複雑性を考慮し、ユーザーエクスペリエンスの向上と開発効率の最適化を両立したテスト設計となっています。

実装は優先度に従って段階的に進め、各テストケースが実際のユーザーシナリオを反映するよう注意深く設計してください。