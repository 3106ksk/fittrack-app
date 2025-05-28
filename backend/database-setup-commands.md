# Goalモデル用データベースセットアップコマンド

## マイグレーション実行

### 1. マイグレーションファイルの作成
```bash
# バックエンドディレクトリに移動
cd backend

# マイグレーションファイルを生成
npx sequelize-cli migration:generate --name create-goals-table
```

### 2. マイグレーション実行
```bash
# マイグレーションを実行してテーブルを作成
npx sequelize-cli db:migrate

# マイグレーションの状態確認
npx sequelize-cli db:migrate:status
```

### 3. マイグレーションのロールバック（必要に応じて）
```bash
# 最後のマイグレーションを取り消し
npx sequelize-cli db:migrate:undo

# 全てのマイグレーションを取り消し
npx sequelize-cli db:migrate:undo:all
```

## シーダー実行

### 1. シーダーファイルの作成
```bash
# シーダーファイルを生成
npx sequelize-cli seed:generate --name demo-goals
```

### 2. シーダー実行
```bash
# 全てのシーダーを実行
npx sequelize-cli db:seed:all

# 特定のシーダーファイルのみ実行
npx sequelize-cli db:seed --seed YYYYMMDDHHMMSS-demo-goals.js
```

### 3. シーダーのアンドゥ（必要に応じて）
```bash
# 最後のシーダーを取り消し
npx sequelize-cli db:seed:undo

# 全てのシーダーを取り消し
npx sequelize-cli db:seed:undo:all

# 特定のシーダーファイルのみ取り消し
npx sequelize-cli db:seed:undo --seed YYYYMMDDHHMMSS-demo-goals.js
```

## 開発環境でのセットアップ手順

### 1. 完全なリセット（開発環境のみ）
```bash
# 全てのマイグレーションを取り消し
npx sequelize-cli db:migrate:undo:all

# 全てのシーダーを取り消し
npx sequelize-cli db:seed:undo:all

# マイグレーションを再実行
npx sequelize-cli db:migrate

# シーダーを実行
npx sequelize-cli db:seed:all
```

### 2. 新しいGoalモデルのみセットアップ
```bash
# Goalテーブルのマイグレーションのみ実行
npx sequelize-cli db:migrate

# Goalテーブルのシーダーのみ実行
npx sequelize-cli db:seed --seed YYYYMMDDHHMMSS-demo-goals.js
```

## 注意事項

1. **ユーザーデータの前提**: シーダーファイルはuserID 1, 2, 3のユーザーが存在することを前提としています
2. **本番環境**: 本番環境ではシーダーの実行に注意してください
3. **データの整合性**: マイグレーション実行前にデータベースのバックアップを取ることを推奨
4. **環境変数**: 適切なデータベース接続情報が.envファイルに設定されていることを確認

## トラブルシューティング

### マイグレーションエラーの場合
```bash
# マイグレーションの状態確認
npx sequelize-cli db:migrate:status

# 特定のマイグレーションを強制的に完了扱いにする
npx sequelize-cli migration:mark-as-completed --name YYYYMMDDHHMMSS-create-goals-table.js
```

### 外部キー制約エラーの場合
1. usersテーブルが存在し、適切なユーザーデータがあることを確認
2. 参照整合性制約の確認
3. 必要に応じてユーザーシーダーを先に実行 