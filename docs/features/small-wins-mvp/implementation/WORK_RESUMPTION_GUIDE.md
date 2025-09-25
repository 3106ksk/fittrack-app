# 作業再開ガイド - Insightモデル段階的実装

**作成日**: 2025-09-25
**最終更新**: 2025-09-25 13:45 JST
**目的**: ターミナルを閉じた後でも、段階的にInsightモデルとマイグレーションを理解しながら実装できるようにする

## 📌 現在の環境状態

### ✅ 完了済み作業
1. **Docker環境の準備**
   - `.env.docker`ファイル作成済み（backend/frontend両方）
   - 適切な環境変数設定済み（JWT、Strava API、DB接続情報）
   - Docker Composeで全サービス起動確認済み

2. **既存データベース状態**
   ```
   テーブル: users, workouts, SequelizeMeta
   Stravaフィールド: 適用済み（users, workoutsテーブル）
   ```

3. **クリーンアップ済み**
   - Insightモデル: 削除済み（段階的実装のため）
   - Insightマイグレーション: 削除済み

### ⚠️ 注意事項
- **Stravaマイグレーション（20250823000000-add-strava-fields.js）**: 条件付き追加に修正済み
- データベースパスワード: Docker環境では`secure_password_2024`
- ポート: PostgreSQL は 5433（ホスト） → 5432（コンテナ内）

## 🚀 作業再開手順

### Step 1: Docker環境の起動
```bash
# 1. プロジェクトディレクトリに移動
cd /Users/310tea/Documents/fittrack-app

# 2. Docker環境の起動
docker-compose up -d

# 3. 起動確認（全てHealthyになるまで待つ）
docker-compose ps

# 期待される出力:
# fittrack_postgres   ... Up (healthy)
# fittrack_backend    ... Up (healthy)
# fittrack_frontend   ... Up (healthy)
```

### Step 2: データベース接続確認
```bash
# PostgreSQLへの接続テスト
docker exec -it fittrack_postgres psql -U fittrack_user -d fittrack_db -c '\dt'

# 期待される出力:
# users, workouts, SequelizeMeta の3テーブル
```

### Step 3: マイグレーション状態確認
```bash
# 現在のマイグレーション状態
docker exec fittrack_backend npx sequelize-cli db:migrate:status

# 期待される出力:
# up 20250125170319-create-users-table.js
# up 20250412120000-create-workouts-table.js
# up 20250823000000-add-strava-fields.js
```

## 📝 段階的実装ガイド

### Phase 1: Insightモデルの理解と作成
```javascript
// 1. モデルファイルの作成場所
backend/models/Insight.js

// 2. モデルの主要な責務
- WHO基準の健康スコア保存
- ユーザーとの1:N関係
- 日付ごとのユニーク制約
- JSONBフィールドによる拡張性

// 3. 重要なフィールド
- totalScore: 総合スコア（0-100）
- cardioScore: 有酸素運動スコア（WHO基準150分/週）
- strengthScore: 筋力トレーニングスコア（WHO基準2日/週）
- whoCardioAchieved: WHO有酸素基準達成フラグ
- whoStrengthAchieved: WHO筋力基準達成フラグ
- metrics: 詳細データ保存用JSONB
```

### Phase 2: マイグレーションの理解と実行
```bash
# 1. マイグレーション生成（Docker内で実行）
docker exec fittrack_backend npx sequelize-cli migration:generate --name create-insights-table

# 2. マイグレーションファイルの編集
# 生成されたファイル: backend/migrations/[timestamp]-create-insights-table.js

# 3. マイグレーション実行
docker exec fittrack_backend npx sequelize-cli db:migrate

# 4. 確認
docker exec fittrack_postgres psql -U fittrack_user -d fittrack_db -c '\d insights'
```

### Phase 3: モデルのテスト
```javascript
// backend/test-insight-model.js を作成してテスト
const db = require('./models');

async function testInsightModel() {
  try {
    // 1. ユーザー取得
    const user = await db.User.findOne();

    // 2. Insight作成
    const insight = await db.Insight.create({
      userId: user.id,
      date: new Date(),
      totalScore: 85,
      cardioScore: 100,
      strengthScore: 50,
      whoCardioAchieved: true,
      whoStrengthAchieved: false,
      metrics: {
        cardio: { weeklyMinutes: 165 },
        strength: { weeklyDays: 1 }
      }
    });

    console.log('✅ Insight created:', insight.toJSON());
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.sequelize.close();
  }
}

testInsightModel();
```

## 🔍 トラブルシューティング

### よくある問題と解決方法

| 問題 | 解決方法 |
|------|---------|
| `.env.docker not found` | このガイドの「現在の環境状態」セクションを確認し、ファイルを再作成 |
| `Cannot connect to database` | `docker-compose restart` で再起動 |
| `Migration already exists` | `SequelizeMeta`テーブルをチェックし、重複を削除 |
| `Column already exists` | マイグレーションファイルに条件チェックを追加 |

### Docker コマンドチートシート
```bash
# ログ確認
docker-compose logs -f backend

# コンテナ再起動
docker-compose restart backend

# 完全リセット（データも削除）
docker-compose down -v
docker-compose up -d

# バックエンドコンテナに入る
docker exec -it fittrack_backend bash

# PostgreSQLに直接接続
docker exec -it fittrack_postgres psql -U fittrack_user -d fittrack_db
```

## 📚 参考ドキュメント

1. **設計書**
   - `/docs/features/small-wins-mvp/requirements/mvp-feature-classification.md` - MVP機能分類
   - `/docs/features/small-wins-mvp/design/database-design.md` - データベース設計
   - `/docs/features/small-wins-mvp/design/insight-model-analysis.md` - モデル詳細解説

2. **実装ガイド**
   - `/docs/features/small-wins-mvp/implementation/docker-development-guide.md` - Docker開発手順
   - `/docs/features/small-wins-mvp/implementation/implementation-guide.md` - 実装ガイド

## 💡 実装のポイント

### なぜInsightテーブルが必要か？
1. **パフォーマンス**: 毎回計算するより高速
2. **履歴管理**: 医療連携時の証跡として必要
3. **トレンド分析**: 時系列での健康改善を可視化
4. **拡張性**: JSONBフィールドで将来の機能追加に対応

### WHO基準の重要性
- **有酸素運動**: 週150分で心疾患リスク30%減
- **筋力トレーニング**: 週2日で総死亡リスク40%減
- **科学的根拠**: BMJ 2022年の研究結果に基づく

## 🎯 次のステップ

1. **モデル作成**: `backend/models/Insight.js`
2. **マイグレーション実行**: データベースにテーブル作成
3. **サービス層実装**: `SmallWinsEngine`クラス作成
4. **API実装**: エンドポイント追加
5. **UI実装**: React コンポーネント作成

---

**注意**: このファイルを読み込めば、いつでも作業を再開できます。
各フェーズは独立しているため、理解しながら段階的に進められます。