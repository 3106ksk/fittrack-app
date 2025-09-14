# ⚡ ACQUIRE クイックテンプレート

> バックエンドとフロントエンドの完全な整合性を実現したエラーハンドリング設計

---

## 🎯 何を学んだか（1 行）

```
バックエンドAPIのレスポンス形式を正確に分析し、フロントエンドのエラーハンドリングとテストを完全に整合させる重要性
```

## 📝 状況説明（3 行以内）

```
[何を作っていた]: Login.jsxのエラーハンドリングテスト実装

[何が起きた]: バックエンドの実際のレスポンス形式（400: {errors: array}, 401: [{message}], 500: {message}）と、フロントエンドの想定する形式が不整合
[どう解決した]: バックエンドAPIを詳細分析し、フロントエンドのエラーハンドリング処理を修正、現実的なテストケースを実装
```

## 💻 コード（最小限）

### Before（問題のコード）

```typescript
// フロントエンド: 単純な想定でレスポンス処理
if (error.response.data && error.response.data.message) {
  setErrorMessage(error.response.data.message);
}

// テスト: バックエンドと整合しない形式
mockLogin.mockRejectedValueOnce({
  response: { status: 401, data: {} }, // ❌ 実際は配列
});
```

### After（解決策）

```typescript
// フロントエンド: バックエンド形式に完全対応
if (status === 400) {
  // バリデーションエラー: {errors: [{msg: "..."}]}
  if (data.errors && data.errors.length > 0) {
    setErrorMessage(data.errors[0].msg);
  }
} else if (status === 401) {
  // 認証エラー: [{message: "..."}]
  if (Array.isArray(data) && data.length > 0 && data[0].message) {
    setErrorMessage(data[0].message);
  }
} else if (status === 500) {
  // サーバーエラー: {message: "..."}
  const message = data.message || 'デフォルトメッセージ';
  setErrorMessage(message);
}

// テスト: バックエンドの実際のレスポンス形式
mockLogin.mockRejectedValueOnce({
  response: { 
    status: 401, 
    data: [{ message: "This user is not found" }] // ✅ 実際の形式
  },
});
```

## 💡 学んだこと（箇条書き 3 つ）

- **API設計とテスト設計の連動性**: バックエンドのレスポンス形式がフロントエンドの実装とテストの設計を決定する
- **レスポンス形式の統一の重要性**: 400/401/500でレスポンス構造が異なると複雑なエラーハンドリングが必要
- **現実的なテストシナリオ**: フロントエンドバリデーション通過後にサーバーで発生するエラーのみテスト対象

## 🔍 バックエンドAPIレスポンス分析

| エラータイプ | ステータス | レスポンス形式 | 実際の内容 |
|------------|-----------|--------------|-----------|
| **バリデーションエラー** | 400 | `{errors: array}` | `{errors: [{msg: "Email is required"}]}` |
| **ユーザー不存在** | 401 | `[{message}]` | `[{message: "This user is not found"}]` |
| **パスワード不一致** | 401 | `[{message}]` | `[{message: "Incorrect password"}]` |
| **サーバーエラー** | 500 | `{message}` | `{message: "Internal server error"}` |

## 🎯 現実的テストシナリオ

### ✅ テスト対象（フロントエンド通過後のサーバーエラー）
- 401: 形式的に正しいが存在しないメール（nonexistent@example.com）
- 401: 既存ユーザーの間違ったパスワード
- 500: サーバー内部エラー
- Network: レスポンスオブジェクトなしのネットワークエラー

### ❌ テスト不要（現実的に発生しない）
- 400: フロントエンドとバックエンドの二重バリデーションで発生しない

## 🔗 参考リンク

- [API Design Best Practices](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design): 一貫したエラーレスポンス設計
- [Frontend Backend Integration Testing](https://martinfowler.com/articles/practical-test-pyramid.html): 統合テストの設計パターン

## 🏷️ タグ

```
#API整合性 #エラーハンドリング #フロントエンドバックエンド統合 #現実的テスト設計
```

---

### 📋 コマンド用データ

```bash
# これをそのままコピペして実行
claude-code learning acquire \
  --topic "バックエンドとフロントエンドの完全な整合性を実現したエラーハンドリング設計" \
  --context "authRoutes.jsのレスポンス分析とLogin.jsxの修正で整合性実現" \
  --category integration \
  --stack react/node/express/api-design \
  --priority high
```