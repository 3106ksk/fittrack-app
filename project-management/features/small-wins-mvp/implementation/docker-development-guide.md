# Docker環境でのInsightモデル実装ガイド

**文書番号**: DOC-SW-001
**バージョン**: 1.0.0
**作成日**: 2025-09-25
**ステータス**: Docker Development Guide

## 📋 Docker開発のベストプラクティス選択

### 🎯 推奨アプローチ: **Docker-First開発**

**選択理由**:
1. **環境の一貫性**: ローカルPostgreSQLは不要、全てDocker内で完結
2. **チーム開発**: 「Works on my machine」問題を完全回避
3. **本番環境との同一性**: 開発・ステージング・本番で同じ環境
4. **依存関係管理**: PostgreSQL、Node.js、npmパッケージのバージョン統一
5. **クリーンな開発環境**: ローカルマシンを汚さない

### ❌ 非推奨アプローチ

**ローカルDB + Docker併用**:
- 問題: 環境差異によるバグ発生リスク
- 問題: ポート競合、バージョン不一致
- 問題: 設定ファイルの二重管理

## 🚀 実装手順

### Step 1: Docker環境の準備と確認

```bash
# 1. 現在のDocker環境を停止（クリーンスタート）
docker-compose down -v  # -v でボリュームも削除（データリセット）

# 2. Docker環境を起動
docker-compose up -d postgres

# 3. PostgreSQLコンテナが起動しているか確認
docker-compose ps
# fittrack_postgres   postgres:16   "docker-entrypoint.s…"   postgres   Up   5432/tcp, 0.0.0.0:5433->5432/tcp

# 4. データベース接続テスト
docker exec -it fittrack_postgres psql -U fittrack_user -d fittrack_db -c '\dt'
```

### Step 2: Sequelizeモデルの作成

#### 2.1 Insightモデルファイル作成

```bash
# ホストマシンで実行（ファイル作成のみ）
touch backend/models/Insight.js
```

**ファイル内容**: `/backend/models/Insight.js`

```javascript
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Insight extends Model {
    static associate(models) {
      // User との関係定義
      Insight.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE'
      });
    }

    // カスタムメソッド: 最新のインサイト取得
    static async findLatestForUser(userId) {
      return await this.findOne({
        where: { userId },
        order: [['date', 'DESC']]
      });
    }
  }

  Insight.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    totalScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_score',
      validate: {
        min: 0,
        max: 100
      }
    },
    cardioScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'cardio_score',
      validate: {
        min: 0,
        max: 100
      }
    },
    strengthScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'strength_score',
      validate: {
        min: 0,
        max: 100
      }
    },
    whoCardioAchieved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'who_cardio_achieved'
    },
    whoStrengthAchieved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'who_strength_achieved'
    },
    metrics: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    healthMessage: {
      type: DataTypes.STRING(255),
      field: 'health_message'
    },
    recommendations: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    calculatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'calculated_at'
    },
    version: {
      type: DataTypes.STRING(10),
      defaultValue: '1.0.0'
    }
  }, {
    sequelize,
    modelName: 'Insight',
    tableName: 'insights',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'date'],
        name: 'unique_user_date'
      },
      {
        fields: ['user_id', 'date'],
        name: 'idx_user_date'
      },
      {
        fields: ['user_id', 'total_score'],
        name: 'idx_user_score'
      }
    ]
  });

  return Insight;
};
```

### Step 3: マイグレーションファイルの作成

#### 3.1 マイグレーション生成（Docker内で実行）

```bash
# backendコンテナに入る
docker exec -it fittrack_backend bash

# コンテナ内でSequelize CLIを使用
npx sequelize-cli migration:generate --name create-insights-table

# コンテナから出る
exit
```

**注意**: もしbackendコンテナが起動していない場合:

```bash
# backend も含めて起動
docker-compose up -d

# 起動確認後、上記のコマンドを実行
```

#### 3.2 マイグレーションファイル編集

生成されたファイル: `/backend/migrations/[timestamp]-create-insights-table.js`

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // insights テーブル作成
    await queryInterface.createTable('insights', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      total_score: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      cardio_score: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      strength_score: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      who_cardio_achieved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      who_strength_achieved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      metrics: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      health_message: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      recommendations: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: []
      },
      calculated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      version: {
        type: Sequelize.STRING(10),
        defaultValue: '1.0.0'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // インデックス追加
    await queryInterface.addIndex('insights', ['user_id', 'date'], {
      unique: true,
      name: 'unique_user_date'
    });

    await queryInterface.addIndex('insights', ['user_id', 'date'], {
      name: 'idx_user_date'
    });

    await queryInterface.addIndex('insights', ['user_id', 'total_score'], {
      name: 'idx_user_score'
    });

    // 既存の workouts テーブルを拡張
    await queryInterface.addColumn('workouts', 'exercise_details', {
      type: Sequelize.JSONB,
      defaultValue: {},
      allowNull: true
    });

    // 初期データ投入（過去7日分のデフォルトインサイト）
    const { Op } = require('sequelize');
    const sequelize = queryInterface.sequelize;

    const users = await sequelize.query(
      `SELECT DISTINCT "userID" as user_id
       FROM workouts
       WHERE date >= CURRENT_DATE - INTERVAL '7 days'`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (users.length > 0) {
      const initialInsights = users.map(user => ({
        user_id: user.user_id,
        date: new Date(),
        total_score: 50,
        cardio_score: 50,
        strength_score: 50,
        metrics: JSON.stringify({ initial: true }),
        created_at: new Date(),
        updated_at: new Date()
      }));

      await queryInterface.bulkInsert('insights', initialInsights, {
        ignoreDuplicates: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // ロールバック: テーブル削除
    await queryInterface.removeColumn('workouts', 'exercise_details');
    await queryInterface.dropTable('insights');
  }
};
```

### Step 4: マイグレーション実行

#### 4.1 Docker環境でのマイグレーション実行

```bash
# 1. backendコンテナ内でマイグレーション実行
docker exec -it fittrack_backend npx sequelize-cli db:migrate

# 成功メッセージ例:
# == 20250925123456-create-insights-table: migrating =======
# == 20250925123456-create-insights-table: migrated (0.234s)

# 2. マイグレーション状態確認
docker exec -it fittrack_backend npx sequelize-cli db:migrate:status

# 3. データベース内のテーブル確認
docker exec -it fittrack_postgres psql -U fittrack_user -d fittrack_db -c '\dt'
```

#### 4.2 トラブルシューティング

**エラー: "relation users does not exist"**
```bash
# 既存のマイグレーションを先に実行
docker exec -it fittrack_backend npx sequelize-cli db:migrate
```

**エラー: "column exercise_details already exists"**
```bash
# 既存カラムをスキップするように修正
await queryInterface.addColumn('workouts', 'exercise_details', {
  type: Sequelize.JSONB,
  defaultValue: {}
}).catch(err => {
  console.log('Column might already exist:', err.message);
});
```

### Step 5: モデルの動作確認

#### 5.1 テスト用スクリプト作成

```bash
# テストスクリプト作成
cat > backend/test-insight-model.js << 'EOF'
const db = require('./models');

async function testInsightModel() {
  try {
    // 1. テストユーザー取得
    const user = await db.User.findOne();
    if (!user) {
      console.log('No users found. Creating test user...');
      const newUser = await db.User.create({
        username: 'test_user',
        email: 'test@example.com',
        password: 'hashed_password'
      });
      user = newUser;
    }

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
      },
      healthMessage: 'WHO推奨カーディオ達成！',
      recommendations: ['筋トレをあと1日追加']
    });

    console.log('✅ Insight created:', insight.toJSON());

    // 3. 検索テスト
    const found = await db.Insight.findLatestForUser(user.id);
    console.log('✅ Latest insight found:', found.toJSON());

    // 4. アソシエーションテスト
    const withUser = await db.Insight.findOne({
      where: { id: insight.id },
      include: [{
        model: db.User,
        as: 'user'
      }]
    });
    console.log('✅ With user association:', withUser.user.username);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.sequelize.close();
  }
}

testInsightModel();
EOF

# テスト実行
docker exec -it fittrack_backend node test-insight-model.js
```

### Step 6: 環境変数の設定

#### 6.1 Docker用環境変数ファイル作成

```bash
# backend/.env.docker を作成（存在しない場合）
cat > backend/.env.docker << 'EOF'
NODE_ENV=development
PORT=8000

# Database (Docker内部ネットワーク用)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=fittrack_db
DB_USER=fittrack_user
DB_PASSWORD=secure_password_2024

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=debug
EOF
```

### Step 7: Docker環境の再起動と確認

```bash
# 1. 全体を再起動して設定を反映
docker-compose down
docker-compose up -d

# 2. ログ確認
docker-compose logs -f backend

# 3. ヘルスチェック
curl http://localhost:8000/api/health
```

## 📝 開発フロー（日常作業）

### 毎日の開発開始時

```bash
# 1. Docker環境起動
docker-compose up -d

# 2. マイグレーション状態確認
docker exec -it fittrack_backend npx sequelize-cli db:migrate:status

# 3. ログ監視開始
docker-compose logs -f backend
```

### モデル変更時

```bash
# 1. モデルファイル編集（ホストマシン）
code backend/models/Insight.js

# 2. マイグレーション作成（コンテナ内）
docker exec -it fittrack_backend npx sequelize-cli migration:generate --name update-insights-add-field

# 3. マイグレーション実行
docker exec -it fittrack_backend npx sequelize-cli db:migrate

# 4. 変更確認
docker exec -it fittrack_postgres psql -U fittrack_user -d fittrack_db -c '\d insights'
```

### 開発終了時

```bash
# ログを残したまま停止
docker-compose stop

# または完全停止（データは保持）
docker-compose down

# データも含めて完全リセット（注意！）
docker-compose down -v
```

## ⚠️ 注意事項

### DOとDON'T

**DO ✅**:
- Docker環境内で全ての操作を完結させる
- ホストマシンではコード編集のみ
- docker-compose logsで常にログを確認
- 定期的にdocker-compose pullで最新イメージ取得

**DON'T ❌**:
- ローカルにPostgreSQLをインストールしない
- ローカルでnpm installを実行しない（package.json変更時を除く）
- ポート5432を他のアプリで使用しない
- production用のシークレットをコミットしない

## 🔧 トラブルシューティング

### よくある問題と解決策

| 問題 | 原因 | 解決策 |
|-----|------|--------|
| "Cannot connect to database" | コンテナ間通信エラー | `docker-compose restart` |
| "Port 5433 already in use" | 別プロセスがポート使用 | `lsof -i :5433` でプロセス確認 |
| "Migration failed" | 依存関係エラー | 既存マイグレーションを先に実行 |
| "JSONB column error" | PostgreSQLバージョン | postgres:16 イメージを確認 |

---

**作成日**: 2025-09-25
**作成者**: FitStart Tech Lead
**次のステップ**: SmallWinsEngineサービスの実装