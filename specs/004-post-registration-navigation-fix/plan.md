# 実装計画: 新規登録後のナビゲーション問題修正

**ブランチ**: `004-post-registration-navigation-fix` | **日付**: 2025-11-02 | **仕様**: [spec.md](./spec.md)
**入力**: `/specs/004-post-registration-navigation-fix/spec.md` からの機能仕様

## 概要

新規登録成功後のナビゲーションフローを修正し、ユーザーが `/dashboard` → `/login` と無意味にリダイレクトされる問題を解決します。登録成功後は直接 `/login` ページに遷移し、React Routerの location state を使用して成功メッセージを保持・表示します。

**技術的アプローチ**: React Router v6 の `useNavigate` hook と location state を活用し、フロントエンドコンポーネントのみを修正します（バックエンド変更なし）。

## 技術コンテキスト

**言語/バージョン**: JavaScript (React 18.2.0, React Router v6)
**主要な依存関係**: react-router-dom, @mui/material, react-hook-form
**ストレージ**: N/A（一時的なナビゲーション状態のみ）
**テスト**: Vitest + React Testing Library
**対象プラットフォーム**: Web（モバイルファースト、レスポンシブデザイン）
**プロジェクトタイプ**: Web アプリケーション（frontend + backend 構造）
**パフォーマンス目標**: 成功メッセージ表示 <100ms、ページ読み込み後即座に表示
**制約**: React Router v6 のナビゲーション state 機能に依存、既存の認証フローを変更しない
**スケール/スコープ**: 2つのコンポーネント修正（Register.jsx, Login.jsx）、既存テストの更新

## Constitution Check

*ゲート: Phase 0 研究の前に通過する必要があります。Phase 1 設計後に再チェック。*

### ✅ I. Evidence-Based Health Metrics (NON-NEGOTIABLE)
**適用外** - この機能は健康メトリクスに関与しません（ナビゲーションUX改善のみ）

### ✅ II. Security-First Architecture (NON-NEGOTIABLE)
**遵守** - 既存のセキュリティアーキテクチャを変更しません
- JWT認証フローは変更なし
- バックエンドAPIは変更なし
- location stateは一時的なUI状態のみ（機密情報を含まない）

### ✅ III. Rapid Development & Portfolio Delivery
**遵守** - JavaScript実装、既存のReactパターンを使用
- React Router v6 の標準機能を使用
- Material-UI の Alert コンポーネントを再利用
- 新しい依存関係の追加なし

### ✅ IV. Mobile-First Responsive Design
**遵守** - モバイルファーストデザインに影響なし
- 既存のMaterial-UI Alertコンポーネントを使用（レスポンシブ対応済み）
- タッチ操作に影響を与える変更なし

### ✅ V. Performance Optimization & Scalability
**遵守** - パフォーマンスへの影響は最小限
- 追加のAPI呼び出しなし
- useMemo/useCallback の使用は不要（状態は単純で一時的）
- 再レンダリングのオーバーヘッドは無視できる程度

**結論**: すべての憲章原則に準拠しています。違反なし。

## プロジェクト構造

### ドキュメント（この機能）

```
specs/004-post-registration-navigation-fix/
├── plan.md              # このファイル（/speckit.plan コマンド出力）
├── research.md          # Phase 0 出力（/speckit.plan コマンド）
├── data-model.md        # N/A（この機能はデータモデルを変更しません）
├── quickstart.md        # Phase 1 出力（/speckit.plan コマンド）
├── contracts/           # N/A（バックエンドAPI変更なし）
└── tasks.md             # Phase 2 出力（/speckit.tasks コマンド - /speckit.plan では作成されません）
```

### ソースコード（リポジトリルート）

```
# Web アプリケーション構造
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/
  # この機能ではバックエンド変更なし

frontend/
├── src/
│   ├── components/
│   │   ├── Register.jsx          # 変更: navigate('/login', { state: {...} })
│   │   ├── Login.jsx              # 変更: location.state からメッセージを読み取り
│   │   ├── AuthContext.tsx        # 変更なし
│   │   └── PrivateRoute.jsx       # 変更なし
│   ├── pages/
│   │   └── Register.jsx           # 変更なし（Register コンポーネントをラップするだけ）
│   └── services/
│       └── api.js                 # 変更なし
└── tests/
    ├── components/
    │   ├── __tests__/
    │   │   ├── Register.test.tsx  # 更新: 新しいナビゲーション動作をテスト
    │   │   └── Login.test.tsx     # 更新: location.state メッセージ表示をテスト
    └── integration/               # オプション: エンドツーエンド登録フローテスト
```

**構造の決定**: 既存のWeb アプリケーション構造（frontend + backend）を使用します。この機能はフロントエンドのみに影響し、2つのコンポーネント（Register.jsx, Login.jsx）とそれらのテストファイルを変更します。

## 複雑性追跡

*Constitution Check に違反がある場合にのみ記入*

この機能には憲章違反がないため、このセクションは空です。

---

## Phase 0: アウトライン & 研究

### 研究が必要な項目

1. **React Router v6 の location state の信頼性**
   - ブラウザの戻る/進むボタン使用時の動作
   - ページリロード時の状態保持（保持されない - これは期待通り）
   - 状態のサイズ制限

2. **Material-UI Alert の成功スタイリングベストプラクティス**
   - severity="success" の使用法
   - 自動消去 vs 手動消去
   - アクセシビリティ考慮事項（ARIA ラベル、スクリーンリーダー対応）

3. **既存のエラーメッセージパターンとの一貫性**
   - 現在の Register.jsx と Login.jsx のエラー処理パターン
   - Alert コンポーネントの配置とスタイリング
   - メッセージのライフサイクル管理

### 研究タスク

- **タスク 1**: React Router v6 の location state ドキュメントを確認し、ベストプラクティスを特定
- **タスク 2**: 既存の Login.jsx と Register.jsx のメッセージ処理パターンを分析
- **タスク 3**: Material-UI Alert の成功メッセージのアクセシビリティガイドラインを確認

**出力**: `research.md` にすべての決定と根拠を記録

---

## Phase 1: 設計 & コントラクト

**前提条件**: `research.md` 完了

### データモデル

**N/A** - この機能は永続的なデータモデルを導入または変更しません。

一時的なナビゲーション状態のみ使用：
```javascript
// React Router location.state の形状
{
  message: string,  // 例: "アカウント作成が完了しました。ログインしてください。"
  type: 'success' | 'error'  // オプション: メッセージタイプ
}
```

### API コントラクト

**N/A** - この機能はバックエンドAPIエンドポイントを変更または追加しません。

既存の `/authrouter/register` エンドポイントはそのまま使用します（変更なし）。

### クイックスタート

開発者がこの機能を理解し、テストするためのガイド：

#### 開発環境のセットアップ

```bash
# フロントエンド開発サーバーを起動
cd frontend
npm install
npm run dev
```

#### ローカルでの動作確認

1. ブラウザで `http://localhost:5173/signup` を開く
2. 有効な認証情報で新規アカウントを作成
   - ユーザー名: test123
   - メール: test@example.com
   - パスワード: password123
3. 登録成功後、自動的に `/login` ページにリダイレクトされることを確認
4. ログインページの上部に緑色の成功メッセージが表示されることを確認
   - 「アカウント作成が完了しました。ログインしてください。」
5. 新しい認証情報でログインし、ダッシュボードにアクセスできることを確認

#### テストの実行

```bash
# 単体テスト
npm run test

# 特定のコンポーネントテスト
npm run test Register.test
npm run test Login.test

# カバレッジ付きテスト
npm run test:coverage
```

#### 主要なファイル

- `frontend/src/components/Register.jsx`: 登録成功時のナビゲーションロジック
- `frontend/src/components/Login.jsx`: 成功メッセージの表示ロジック
- `frontend/src/components/__tests__/Register.test.tsx`: 登録フローのテスト
- `frontend/src/components/__tests__/Login.test.tsx`: ログインページのメッセージ表示テスト

**出力**: `quickstart.md` に詳細な手順を記録

---

## Phase 2: タスク生成（このコマンドの範囲外）

Phase 2 は `/speckit.tasks` コマンドによって実行されます。このコマンド（`/speckit.plan`）は Phase 1 設計の完了後に停止します。

---

## 次のステップ

1. **Phase 0 を完了**: `research.md` を作成し、すべての技術的な不明点を解決
2. **Phase 1 を完了**: `quickstart.md` を作成し、開発者向けガイドを提供
3. **Constitution Check を再評価**: Phase 1 設計後にすべての憲章原則への準拠を確認
4. **`/speckit.tasks` を実行**: 実装タスクを生成し、依存関係順に整理
