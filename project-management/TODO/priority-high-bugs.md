# 🔴 優先度: 高 - 既知のバグ

緊急対応が必要なバグと重要な不具合を管理します。

## アクティブなバグ

### 1. 新規登録後のナビゲーション問題
- **ファイル**: `frontend/src/components/Register.jsx:46`
- **問題**: 新規登録完了後、`/dashboard`への遷移が`/login`にリダイレクトされる
- **原因**: 登録APIはトークンを返さないため、PrivateRouteがユーザーを未認証として扱う
- **解決案**:
  1. 登録後に明示的にログイン画面へ誘導（セキュアだがUXが1ステップ増える）
  2. 登録APIでトークンも返すよう変更（一般的なモダンアプリのパターン）
  3. 登録後に自動ログインを実装（フロントエンドで登録後すぐにログインAPIを呼ぶ）
- **関連ファイル**:
  - `frontend/src/components/Register.jsx`
  - `frontend/src/components/PrivateRoute.jsx`
  - `frontend/src/components/AuthContext.tsx`
  - `backend/routes/authRoutes.js`
- **詳細**: [`../bugs/registration-navigation-redirect.md`](../bugs/registration-navigation-redirect.md)

### 2. ワークアウトフォームのリセット問題
- **詳細**: [`../bugs/workout-form-submit-reset-not-working.md`](../resolved-bugs/workout-form-submit-reset-not-working.md)
- **ステータス**: 部分的に解決済み

### 3. 複数ワークアウトの重複問題
- **詳細**: [`../bugs/multiple-workouts-duplicate-issue.md`](../bugs/multiple-workouts-duplicate-issue.md)
- **ステータス**: 調査中

### 4. Strava連携の接続エラー
- **詳細**: [`../bugs/strava-sync-connection-failed.md`](../bugs/strava-sync-connection-failed.md)
- **ステータス**: 未着手

## 対応優先順位の判断基準

1. **データ整合性への影響**: データの重複や欠損を引き起こすか
2. **ユーザー体験への影響**: 主要機能が使えなくなるか
3. **影響範囲**: 影響を受けるユーザー数
4. **セキュリティリスク**: セキュリティ上の脆弱性があるか

## 統計

| 項目 | 件数 |
|------|------|
| 未着手 | 1 |
| 調査中 | 1 |
| 対応中 | 1 |
| 部分解決 | 1 |
| **合計** | **4** |

## 更新履歴

- 2025-01-30: ファイル分割、初版作成

---

[← TOPに戻る](./README.md)