# 研究: 新規登録後のナビゲーション問題修正

**日付**: 2025-11-02
**機能**: 004-post-registration-navigation-fix

## 概要

この研究ドキュメントでは、React Router v6 の location state を使用した登録成功メッセージの実装に関する技術的な決定事項、代替案、およびベストプラクティスを記録します。

---

## 1. React Router v6 の location state の信頼性

### 決定

**選択**: React Router v6 の `useNavigate` hook と `location.state` を使用して、ナビゲーション間で成功メッセージを保持します。

### 根拠

React Router v6 の location state は、以下の理由で一時的なメッセージ保持に最適です：

1. **ブラウザ履歴と統合**: location state はブラウザの履歴 API（History.state）に保存され、戻る/進むボタンでナビゲートしても保持されます
2. **ページリロード時はクリア**: ページリロード時に state がクリアされるのは**意図的な動作**です。これにより：
   - ユーザーがページをリロードした場合、古い成功メッセージが表示されない
   - ブックマークやURL共有時に state が含まれない
3. **サイズ制限**: ブラウザの History API の制限内（通常 640KB - 2MB）で十分対応可能
4. **標準的なパターン**: React Router の公式ドキュメントで推奨されている一時的なUI状態の保持方法

### 実装パターン

```javascript
// Register.jsx での使用
const navigate = useNavigate();

navigate('/login', {
  state: {
    message: 'アカウント作成が完了しました。ログインしてください。',
    type: 'success'
  }
});

// Login.jsx での使用
import { useLocation } from 'react-router-dom';

const Login = () => {
  const location = useLocation();
  const successMessage = location.state?.message;
  const messageType = location.state?.type;

  // メッセージを表示後、state をクリア（オプション）
  useEffect(() => {
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <>
      {successMessage && (
        <Alert severity={messageType || 'success'}>
          {successMessage}
        </Alert>
      )}
      {/* ログインフォーム */}
    </>
  );
};
```

### 検討した代替案

| 代替案 | 却下理由 |
|--------|---------|
| **LocalStorage** | ページリロード後も保持されるため、古いメッセージが表示される可能性がある。手動でのクリーンアップが必要 |
| **URL クエリパラメータ** | ブックマーク/共有されたURLにメッセージが含まれてしまう。セキュリティリスク（XSS攻撃の可能性） |
| **グローバル状態管理（Redux/Context）** | オーバーエンジニアリング。一時的なメッセージのために状態管理ライブラリを追加する必要性が低い |
| **バックエンドからのメッセージ取得** | 不要なAPI呼び出し。パフォーマンスへの悪影響 |

### 参考資料

- [React Router v6 Documentation - useLocation](https://reactrouter.com/en/main/hooks/use-location)
- [React Router v6 Documentation - navigate](https://reactrouter.com/en/main/hooks/use-navigate)
- [MDN - History.state](https://developer.mozilla.org/en-US/docs/Web/API/History/state)

---

## 2. Material-UI Alert の成功スタイリングベストプラクティス

### 決定

**選択**: Material-UI の `Alert` コンポーネントに `severity="success"` を使用し、既存のエラーメッセージパターンと一貫性を保ちます。

### 根拠

1. **既存パターンとの一貫性**:
   - Register.jsx と Login.jsx は既に `Alert` コンポーネントを使用してエラーメッセージを表示
   - 同じコンポーネントを使用することで、UI/UX の一貫性が保たれる

2. **アクセシビリティ組み込み**:
   - Material-UI の `Alert` は ARIA ラベル（`role="alert"`）を自動的に提供
   - `severity="success"` により、スクリーンリーダーが適切なコンテキストを読み上げ
   - セマンティックHTMLとアクセシビリティのベストプラクティスに準拠

3. **レスポンシブデザイン**:
   - `Alert` コンポーネントはモバイルファーストでレスポンシブ
   - Constitution IV. Mobile-First Responsive Design に準拠

4. **自動 vs 手動消去**:
   - **選択**: 手動消去（ユーザーアクションまで表示）
   - **理由**:
     - 成功メッセージは重要な情報であり、ユーザーが確実に読む必要がある
     - 自動消去（例：5秒後）はアクセシビリティ上の問題（読む時間が不十分）
     - ログイン送信またはページナビゲーションで自然にクリアされる

### 実装パターン

```javascript
// 現在の Register.jsx のエラーメッセージパターン（維持）
{errorMessage && (
  <Alert severity="error" sx={{ mt: 2 }}>
    {errorMessage}
  </Alert>
)}

// 新しい Login.jsx の成功メッセージパターン（追加）
{successMessage && (
  <Alert severity="success" sx={{ mb: 2 }}>
    {successMessage}
  </Alert>
)}
```

### スタイリングの詳細

- **色**: Material-UI のデフォルト成功色（緑系統）を使用
- **配置**: ログインフォームの上部、ヘッダーの下
- **マージン**: `sx={{ mb: 2 }}` でフォームとの適切な間隔を確保
- **アイコン**: `Alert` のデフォルト成功アイコン（チェックマーク）を使用

### 参考資料

- [Material-UI Alert Documentation](https://mui.com/material-ui/react-alert/)
- [WCAG 2.1 - Status Messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html)

---

## 3. 既存のエラーメッセージパターンとの一貫性

### 現在のパターン分析

#### Register.jsx の現在のメッセージ処理

```javascript
// Line 16: エラー状態
const [errorMessage, setErrorMessage] = useState(null);

// Line 38-89: 登録送信ハンドラ
const onSubmit = async (data) => {
  setIsLoading(true);
  try {
    await apiClient.post('/authrouter/register', {...});
    // 現在: /dashboard にリダイレクト（問題の原因）
    navigate('/dashboard', {
      state: {
        message: 'アカウント作成が完了しました。ログインしてください。',
      },
    });
  } catch (error) {
    // 詳細なエラー処理（400, 409, 422, 429, 500, 502-504）
    setErrorMessage(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

// Line 127-131: エラーメッセージ表示
{errorMessage && (
  <Alert severity="error" sx={{ mt: 2 }}>
    {errorMessage}
  </Alert>
)}
```

**観察**:
- ✅ エラー処理は包括的（複数のステータスコードに対応）
- ✅ フォーム入力は react-hook-form により保持される
- ✅ ローディング状態でボタンを無効化
- ❌ 成功時のリダイレクト先が `/dashboard`（修正が必要）

#### Login.jsx の現在のメッセージ処理

```javascript
// Line 18: エラー状態
const [errorMessage, setErrorMessage] = useState(null);

// Line 33-70: ログイン送信ハンドラ
const onSubmit = async (data) => {
  try {
    setIsLoading(true);
    setErrorMessage(null);
    await login(data);
    navigate('/dashboard');
  } catch (error) {
    // 詳細なエラー処理（400, 401, 500）
    setErrorMessage(message);
  } finally {
    setIsLoading(false);
  }
};

// Line 113-117: エラーメッセージ表示
{errorMessage && (
  <Alert severity="error" sx={{ mb: 6 }}>
    {errorMessage}
  </Alert>
)}
```

**観察**:
- ✅ エラー処理は適切
- ✅ ログイン前にエラー状態をクリア
- ❌ location.state からの成功メッセージ処理が未実装（追加が必要）

### 決定: 一貫したメッセージ処理パターン

**選択**: 既存のエラーメッセージパターンを成功メッセージにも適用し、以下の原則を維持します：

1. **状態管理の一貫性**:
   ```javascript
   // エラーメッセージ（既存）
   const [errorMessage, setErrorMessage] = useState(null);

   // 成功メッセージ（新規 - Login.jsx のみ）
   const [successMessage, setSuccessMessage] = useState(null);

   // または location.state から直接読み取り（推奨）
   const location = useLocation();
   const successMessage = location.state?.message;
   ```

2. **メッセージのライフサイクル**:
   - **エラーメッセージ**: フォーム再送信まで表示
   - **成功メッセージ**: ログイン送信またはページナビゲーションまで表示

3. **UI配置の一貫性**:
   - フォームの上部にメッセージを表示
   - エラーと成功で同じマージン設定を使用

4. **ローディング状態**:
   - 既存の `isLoading` 状態を維持
   - 送信中はボタンを無効化

### 修正が必要な箇所

#### Register.jsx の修正

```javascript
// 変更前（Line 46）
navigate('/dashboard', {
  state: {
    message: 'アカウント作成が完了しました。ログインしてください。',
  },
});

// 変更後
navigate('/login', {
  state: {
    message: 'アカウント作成が完了しました。ログインしてください。',
    type: 'success'
  },
});
```

#### Login.jsx の追加

```javascript
// location.state から成功メッセージを読み取り
import { useLocation } from 'react-router-dom';

const Login = () => {
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState(null);
  const successMessage = location.state?.message;

  // ログイン送信時に成功メッセージをクリア（オプション）
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // location.state をクリア
      if (location.state) {
        window.history.replaceState({}, document.title);
      }

      await login(data);
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 成功メッセージ（新規） */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* エラーメッセージ（既存） */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 6 }}>
          {errorMessage}
        </Alert>
      )}

      {/* ログインフォーム */}
    </>
  );
};
```

---

## まとめ

### 主要な技術的決定

| 決定項目 | 選択 | 根拠 |
|---------|------|------|
| **状態保持方法** | React Router location.state | 標準的、セキュア、ブラウザ履歴と統合 |
| **UIコンポーネント** | Material-UI Alert (severity="success") | 既存パターンとの一貫性、アクセシビリティ組み込み |
| **メッセージライフサイクル** | ログイン送信まで表示 | ユーザーが確実に読める、自然なクリア |
| **コード変更スコープ** | 2ファイルのみ（Register.jsx, Login.jsx） | 最小限の変更、リスク低減 |

### 実装の準備完了

すべての技術的な不明点が解決され、実装の準備が整いました：

- ✅ React Router v6 の location state の動作を理解
- ✅ Material-UI Alert の成功スタイリングパターンを決定
- ✅ 既存のエラーメッセージパターンとの一貫性を確保
- ✅ 修正が必要な具体的なコード箇所を特定

### 次のステップ

Phase 1（設計 & コントラクト）に進み、`quickstart.md` を作成します。
