## 🎯 何を学んだか（1 行）

```
React Hook FormのonSubmitモードでのバリデーション動作とMaterial-UIとの統合テスト手法を学んだ
```

## 📝 状況説明（3 行以内）

```
[何を作っていた]: Login.jsxのテスト実装でバリデーションエラー表示のテストが失敗していた

[何が起きた]: react-hook-formのバリデーションメッセージが表示されず、テストがタイムアウトしていた
[どう解決した]: react-hook-formのmode設定を明示し、テストをバリデーション動作に合わせて修正した
```

## 💻 コード（最小限）

### Before（問題のコード）

```typescript
// Login.jsx - react-hook-formの設定でmodeが未定義
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  defaultValues: {
    email: '',
    password: '',
  },
});

// Login.test.tsx - バリデーションメッセージを直接検索
await waitFor(() => {
  expect(screen.getByText('メールアドレスは必須です')).toBeInTheDocument();
  expect(screen.getByText('パスワードは必須です')).toBeInTheDocument();
}, { timeout: 3000 });
```

### After（解決策）

```typescript
// Login.jsx - mode: 'onSubmit'を明示的に設定
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  mode: 'onSubmit', // バリデーションは送信時に実行される
  defaultValues: {
    email: '',
    password: '',
  },
});

// Login.test.tsx - フォーム送信がブロックされることを検証
it('⚠️ 必須フィールド未入力でフォーム送信がブロックされる', async () => {
  await user.click(submitButton);
  
  await waitFor(() => {
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  }, { timeout: 1000 });
});
```

## 💡 学んだこと（箇条書き 3 つ）

- react-hook-formのデフォルトmode動作：明示的に設定しないとonSubmitモードで動作し、バリデーションは送信時にのみ実行される
- Material-UIのTextField統合：react-hook-formのエラーはhelperTextとして表示され、DOM構造内に埋め込まれる
- テスト戦略の重要性：UIの表示ではなく実際の動作（フォーム送信のブロック）をテストする方が確実

## 🔗 参考リンク

- [React Hook Form Modes](https://react-hook-form.com/docs/useform?utm_source=chatgpt.com#mode): バリデーションモードの設定方法
- [Testing Library Best Practices](https://testing-library.com/docs/guide-which-query/): 適切なクエリメソッドの選択

## 🏷️ タグ

```
#ReactHookForm #MaterialUI #Testing #ValidationError #onSubmitMode
```

---