# クイックスタート: 新規登録後のナビゲーション問題修正

**機能**: 004-post-registration-navigation-fix
**日付**: 2025-11-02

## 概要

この機能は、新規登録成功後のナビゲーションフローを修正し、ユーザーが `/dashboard` → `/login` と無意味にリダイレクトされる問題を解決します。

**主な変更**:
- Register.jsx: 登録成功後に `/login` へ直接リダイレクト
- Login.jsx: React Router の location.state から成功メッセージを読み取り表示

---

## 前提条件

### 必要な環境

- **Node.js**: v18 以上
- **npm**: v9 以上
- **Git**: 最新版

### 必要な知識

- React 18 の基本（Hooks: useState, useEffect, useNavigate, useLocation）
- React Router v6 のナビゲーションと location.state
- Material-UI コンポーネントの使用法
- Vitest と React Testing Library の基本

---

## 開発環境のセットアップ

### 1. リポジトリのクローンと依存関係のインストール

```bash
# リポジトリのルートディレクトリに移動
cd /Users/310tea/Documents/fittrack-app

# 機能ブランチに切り替え
git checkout 004-post-registration-navigation-fix

# バックエンドの依存関係をインストール（変更はないが確認のため）
cd backend
npm install

# フロントエンドの依存関係をインストール
cd ../frontend
npm install
```

### 2. 開発サーバーの起動

```bash
# ターミナル1: バックエンドサーバーを起動
cd backend
npm run dev
# → http://localhost:3000 で起動

# ターミナル2: フロントエンド開発サーバーを起動
cd frontend
npm run dev
# → http://localhost:5173 で起動
```

### 3. データベースの準備

```bash
# PostgreSQL が起動していることを確認
# 開発用データベースが存在することを確認

cd backend

# マイグレーションを実行（必要に応じて）
npm run migrate

# シードデータを投入（オプション）
npm run seed
```

---

## 機能の動作確認

### シナリオ 1: 正常な登録フロー（P1: 最重要）

**目的**: 登録成功後に `/login` にリダイレクトされ、成功メッセージが表示されることを確認

**手順**:

1. ブラウザで `http://localhost:5173/signup` を開く

2. 有効な認証情報で新規アカウントを作成:
   ```
   ユーザー名: testuser001
   メール: testuser001@example.com
   パスワード: password123
   パスワード確認: password123
   ```

3. 「アカウント作成」ボタンをクリック

4. **期待される動作**:
   - ✅ 自動的に `/login` ページにリダイレクトされる（`/dashboard` にリダイレクトされない）
   - ✅ ログインページの上部に緑色の成功メッセージが表示される
     - 「アカウント作成が完了しました。ログインしてください。」
   - ✅ メッセージは `Alert` コンポーネント（`severity="success"`）で表示される

5. 新しく作成した認証情報でログイン:
   ```
   メール: testuser001@example.com
   パスワード: password123
   ```

6. **期待される動作**:
   - ✅ 正常にログインできる
   - ✅ `/dashboard` にリダイレクトされる
   - ✅ ダッシュボードが正しく表示される

### シナリオ 2: 成功メッセージの可視性（P2）

**目的**: 成功メッセージが適切なスタイリングで表示され、ユーザーアクションまで保持されることを確認

**手順**:

1. シナリオ 1 の手順 1-4 を実行し、ログインページで成功メッセージを表示

2. **成功メッセージの確認**:
   - ✅ メッセージはログインフォームの上部に表示される
   - ✅ 緑色の背景（Material-UI のデフォルト成功色）
   - ✅ チェックマークアイコンが表示される
   - ✅ テキストは読みやすい（コントラスト比が適切）

3. ログインフォームに入力を開始（ログインはしない）:
   ```
   メール: testuser001@example.com
   ```

4. **期待される動作**:
   - ✅ 入力中も成功メッセージが表示され続ける
   - ✅ メッセージが自動的に消えない

5. ページをリロード（F5 または Cmd+R）

6. **期待される動作**:
   - ✅ 成功メッセージが消える（location.state はリロードでクリアされる）
   - ✅ エラーメッセージは表示されない
   - ✅ 通常のログインページが表示される

### シナリオ 3: 登録エラー処理の一貫性（P3）

**目的**: 登録失敗時に適切なエラーメッセージが表示され、フォームデータが保持されることを確認

**手順**:

1. ブラウザで `http://localhost:5173/signup` を開く

2. **テスト 3-1: 重複メールエラー（409）**

   既に登録済みのメールアドレスで登録を試みる:
   ```
   ユーザー名: duplicatetest
   メール: existing@example.com  # 既に登録済み
   パスワード: password123
   パスワード確認: password123
   ```

   **期待される動作**:
   - ✅ `/signup` ページに留まる（リダイレクトされない）
   - ✅ 赤色のエラーメッセージが表示される
     - 「このメールアドレスは既に登録されています。別のメールアドレスをお試しください。」
   - ✅ ユーザー名とメールの入力値が保持される
   - ✅ パスワードフィールドはクリアされる（セキュリティ上の理由）

3. **テスト 3-2: 短いパスワードエラー（422）**

   無効なパスワードで登録を試みる:
   ```
   ユーザー名: shortpass
   メール: shortpass@example.com
   パスワード: 123  # 6文字未満
   パスワード確認: 123
   ```

   **期待される動作**:
   - ✅ `/signup` ページに留まる
   - ✅ エラーメッセージが表示される
     - 「パスワードは6文字以上で入力してください」
   - ✅ フォーム入力が保持される（パスワードを除く）

4. エラーを修正して再送信:
   ```
   メール: newuser@example.com
   パスワード: password123
   パスワード確認: password123
   ```

   **期待される動作**:
   - ✅ 登録が成功する
   - ✅ `/login` にリダイレクトされる
   - ✅ エラーメッセージがクリアされている
   - ✅ 成功メッセージが表示される

### エッジケースのテスト

#### エッジケース 1: ブラウザの戻るボタン

**手順**:
1. 登録成功後、ログインページで成功メッセージを確認
2. ブラウザの戻るボタンをクリック

**期待される動作**:
- ✅ `/signup` ページに戻る
- ✅ 成功メッセージは**表示されない**（登録ページには成功メッセージを表示しない）

#### エッジケース 2: ログイン済みユーザーが `/signup` にアクセス

**手順**:
1. 既にログインしている状態で `http://localhost:5173/signup` にアクセス

**期待される動作**:
- ✅ PublicRoute により `/dashboard` にリダイレクトされる
- ✅ 登録フォームは表示されない

#### エッジケース 3: ダブルサブミット防止

**手順**:
1. 登録フォームに有効なデータを入力
2. 「アカウント作成」ボタンを素早く連続クリック

**期待される動作**:
- ✅ 最初のクリック後、ボタンが無効化される
- ✅ 「登録中...」というテキストが表示される
- ✅ 複数のリクエストが送信されない

---

## テストの実行

### 単体テスト

```bash
cd frontend

# すべてのテストを実行
npm run test

# Register コンポーネントのテストのみ実行
npm run test Register.test

# Login コンポーネントのテストのみ実行
npm run test Login.test

# Watch モードでテスト実行（開発中に便利）
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage
```

### テストカバレッジの確認

```bash
# カバレッジレポートを生成
npm run test:coverage

# ブラウザでカバレッジレポートを開く
open coverage/index.html  # macOS
# または
xdg-open coverage/index.html  # Linux
```

**目標カバレッジ**:
- Register.jsx: 80%以上
- Login.jsx: 80%以上

### 主要なテストケース

#### Register.test.tsx

- ✅ 登録成功時に `/login` にナビゲート（`/dashboard` ではない）
- ✅ ナビゲーション時に success message を location.state に含む
- ✅ エラー時に `/signup` ページに留まる
- ✅ エラー時にフォーム入力を保持（パスワードを除く）
- ✅ 送信中にボタンを無効化

#### Login.test.tsx

- ✅ location.state に message がある場合、成功メッセージを表示
- ✅ 成功メッセージに `severity="success"` を使用
- ✅ location.state がない場合、メッセージを表示しない
- ✅ ログイン送信時に location.state をクリア
- ✅ エラー時にエラーメッセージを表示

---

## トラブルシューティング

### 問題 1: 成功メッセージが表示されない

**症状**: 登録成功後、ログインページで成功メッセージが表示されない

**確認事項**:
1. ブラウザの開発者ツール（Console）でエラーがないか確認
2. React DevTools で Login コンポーネントの `location.state` を確認
3. Register.jsx の navigate 呼び出しで state が正しく渡されているか確認

**解決策**:
```javascript
// Register.jsx の navigate 呼び出しを確認
navigate('/login', {
  state: {
    message: 'アカウント作成が完了しました。ログインしてください。',
    type: 'success'
  }
});
```

### 問題 2: 登録後に `/dashboard` にリダイレクトされる

**症状**: 修正前の動作（`/dashboard` → `/login` とリダイレクト）が発生

**原因**: Register.jsx の修正が適用されていない

**解決策**:
1. Register.jsx の Line 46 付近を確認
2. `navigate('/dashboard', ...)` が `navigate('/login', ...)` に変更されているか確認
3. 変更を保存し、ブラウザをリロード

### 問題 3: テストが失敗する

**症状**: `npm run test` でテストが失敗する

**確認事項**:
1. テストファイルが最新の実装に合わせて更新されているか確認
2. モックデータとテスト期待値が正しいか確認

**解決策**:
```bash
# テストキャッシュをクリア
npm run test -- --clearCache

# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# テストを再実行
npm run test
```

---

## デバッグのヒント

### React DevTools の使用

1. **コンポーネント階層の確認**:
   - Login コンポーネントを選択
   - Props タブで `location.state` を確認

2. **状態の追跡**:
   - `successMessage` と `errorMessage` の値を確認
   - 再レンダリングのタイミングを監視

### ブラウザ開発者ツールの使用

1. **Network タブ**:
   - `/authrouter/register` のリクエスト/レスポンスを確認
   - ステータスコードを確認（200: 成功, 409: 重複, 422: バリデーションエラー）

2. **Console タブ**:
   - エラーメッセージやログを確認
   - `console.log(location.state)` を追加してデバッグ

3. **Application タブ > Storage**:
   - localStorage や sessionStorage に意図しないデータが残っていないか確認

---

## 関連ファイル

### 変更が必要なファイル

| ファイル | パス | 変更内容 |
|---------|------|---------|
| Register.jsx | `frontend/src/components/Register.jsx` | Line 46: `navigate('/dashboard', ...)` → `navigate('/login', ...)` |
| Login.jsx | `frontend/src/components/Login.jsx` | location.state から成功メッセージを読み取り表示 |
| Register.test.tsx | `frontend/src/components/__tests__/Register.test.tsx` | 新しいナビゲーション動作のテストを追加/更新 |
| Login.test.tsx | `frontend/src/components/__tests__/Login.test.tsx` | 成功メッセージ表示のテストを追加 |

### 参照するファイル（変更不要）

| ファイル | パス | 参照目的 |
|---------|------|---------|
| App.tsx | `frontend/src/App.tsx` | ルート設定の確認 |
| PrivateRoute.jsx | `frontend/src/components/PrivateRoute.jsx` | 認証保護の仕組み理解 |
| PublicRoute.jsx | `frontend/src/components/PublicRoute.jsx` | ログイン済みユーザーのリダイレクト確認 |
| AuthContext.tsx | `frontend/src/components/AuthContext.tsx` | 認証フローの理解 |

---

## 次のステップ

クイックスタートで機能を理解したら、次は実装タスクに進みます：

```bash
# タスク生成コマンドを実行
/speckit.tasks
```

これにより、実装タスクが依存関係順に生成され、段階的に機能を実装できます。

---

## 参考資料

### 公式ドキュメント

- [React Router v6 - useNavigate](https://reactrouter.com/en/main/hooks/use-navigate)
- [React Router v6 - useLocation](https://reactrouter.com/en/main/hooks/use-location)
- [Material-UI - Alert Component](https://mui.com/material-ui/react-alert/)
- [Vitest - Getting Started](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### プロジェクト内ドキュメント

- [機能仕様書](./spec.md)
- [実装計画](./plan.md)
- [研究ドキュメント](./research.md)
- [プロジェクト憲章](../../.specify/memory/constitution.md)

---

**最終更新**: 2025-11-02
