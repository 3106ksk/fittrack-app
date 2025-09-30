# 月次目標機能 - データベース設計書

**文書番号**: DDD-MG-001
**バージョン**: 1.0.0
**作成日**: 2025-09-13
**ステータス**: Draft

## 1. テーブル設計

### 1.1 monthly_goals テーブル

#### 物理設計
```sql
CREATE TABLE monthly_goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  year_month VARCHAR(7) NOT NULL,
  target_sessions INTEGER NOT NULL,
  target_duration_min INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_monthly_goals_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT chk_target_sessions
    CHECK (target_sessions > 0 AND target_sessions <= 999),

  CONSTRAINT chk_target_duration
    CHECK (target_duration_min > 0 AND target_duration_min <= 99999),

  CONSTRAINT chk_year_month_format
    CHECK (year_month ~ '^\d{4}-\d{2}$'),

  CONSTRAINT uq_user_month
    UNIQUE (user_id, year_month)
);
```

#### インデックス設計
```sql
-- 主要な検索パターンに対応
CREATE INDEX idx_monthly_goals_user_month
  ON monthly_goals(user_id, year_month);

-- 月別の集計クエリ用
CREATE INDEX idx_monthly_goals_year_month
  ON monthly_goals(year_month);
```

### 1.2 関連テーブル

#### users テーブル（既存）
- monthly_goals.user_id が参照
- CASCADE DELETE により、ユーザー削除時に目標も削除

#### workouts テーブル（既存）
- 進捗計算時に参照
- date カラムを使用して月次集計

## 2. Sequelizeモデル実装

### 2.1 モデル定義
```javascript
// models/MonthlyGoal.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const MonthlyGoal = sequelize.define('MonthlyGoal', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    yearMonth: {
      type: DataTypes.STRING(7),
      allowNull: false,
      field: 'year_month',
      validate: {
        is: {
          args: /^\d{4}-\d{2}$/,
          msg: 'yearMonth must be in YYYY-MM format',
        },
      },
    },
    targetSessions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'target_sessions',
      validate: {
        min: {
          args: 1,
          msg: 'targetSessions must be at least 1',
        },
        max: {
          args: 999,
          msg: 'targetSessions must be at most 999',
        },
      },
    },
    targetDurationMin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'target_duration_min',
      validate: {
        min: {
          args: 1,
          msg: 'targetDurationMin must be at least 1',
        },
        max: {
          args: 99999,
          msg: 'targetDurationMin must be at most 99999',
        },
      },
    },
  }, {
    tableName: 'monthly_goals',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'year_month'],
        name: 'uq_user_month',
      },
      {
        fields: ['user_id', 'year_month'],
        name: 'idx_monthly_goals_user_month',
      },
      {
        fields: ['year_month'],
        name: 'idx_monthly_goals_year_month',
      },
    ],
  });

  MonthlyGoal.associate = (models) => {
    MonthlyGoal.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return MonthlyGoal;
};
```

### 2.2 マイグレーションファイル
```javascript
// migrations/YYYYMMDDHHMMSS-create-monthly-goals.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('monthly_goals', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      year_month: {
        type: Sequelize.STRING(7),
        allowNull: false,
      },
      target_sessions: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      target_duration_min: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // インデックス追加
    await queryInterface.addIndex('monthly_goals',
      ['user_id', 'year_month'],
      {
        unique: true,
        name: 'uq_user_month',
      }
    );

    await queryInterface.addIndex('monthly_goals',
      ['user_id', 'year_month'],
      {
        name: 'idx_monthly_goals_user_month',
      }
    );

    await queryInterface.addIndex('monthly_goals',
      ['year_month'],
      {
        name: 'idx_monthly_goals_year_month',
      }
    );

    // 制約追加
    await queryInterface.addConstraint('monthly_goals', {
      fields: ['target_sessions'],
      type: 'check',
      name: 'chk_target_sessions',
      where: {
        target_sessions: {
          [Sequelize.Op.gt]: 0,
          [Sequelize.Op.lte]: 999,
        },
      },
    });

    await queryInterface.addConstraint('monthly_goals', {
      fields: ['target_duration_min'],
      type: 'check',
      name: 'chk_target_duration',
      where: {
        target_duration_min: {
          [Sequelize.Op.gt]: 0,
          [Sequelize.Op.lte]: 99999,
        },
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('monthly_goals');
  },
};
```

## 3. データアクセスパターン

### 3.1 主要なクエリパターン

#### 目標の取得（Upsert用）
```sql
SELECT * FROM monthly_goals
WHERE user_id = ? AND year_month = ?;
```

#### 進捗計算用のワークアウト集計
```sql
SELECT
  COUNT(*) as session_count,
  SUM(duration) as total_duration
FROM workouts
WHERE
  user_id = ?
  AND date >= ?
  AND date <= ?;
```

### 3.2 トランザクション設計

#### Upsert操作
```javascript
await sequelize.transaction(async (t) => {
  const [goal, created] = await MonthlyGoal.findOrCreate({
    where: {
      userId: userId,
      yearMonth: yearMonth,
    },
    defaults: {
      targetSessions: targetSessions,
      targetDurationMin: targetDurationMin,
    },
    transaction: t,
  });

  if (!created) {
    await goal.update({
      targetSessions: targetSessions,
      targetDurationMin: targetDurationMin,
    }, { transaction: t });
  }

  return goal;
});
```

## 4. パフォーマンス考慮事項

### 4.1 インデックス戦略
- `(user_id, year_month)`: 主要な検索パターン
- `year_month`: 月別集計・分析用

### 4.2 クエリ最適化
- N+1問題回避のため、必要に応じて `include` を使用
- 大量データ対策として、適切な `limit` と `offset` を設定

### 4.3 キャッシュ戦略
- 頻繁にアクセスされる当月データはメモリキャッシュを検討
- Redis導入時の拡張ポイントを考慮

## 5. データ整合性

### 5.1 制約
- UNIQUE制約: 1ユーザー1月1レコード
- CHECK制約: 正の整数値のみ許可
- 外部キー制約: ユーザー削除時の連鎖削除

### 5.2 バリデーション
- アプリケーション層: Sequelizeバリデーション
- データベース層: CHECK制約

## 6. 監視とメンテナンス

### 6.1 監視項目
- テーブルサイズの増加率
- インデックスの使用状況
- クエリ実行時間

### 6.2 メンテナンスタスク
- 月次でのVACUUM実行
- インデックスの再構築（必要に応じて）
- 古いデータのアーカイブ（将来的に）

## 7. 拡張性の考慮

### 7.1 将来の拡張ポイント
- カラム追加用の余地（target_distance, target_caloriesなど）
- パーティショニング対応（年別など）
- 履歴管理機能の追加

### 7.2 マイグレーション戦略
- カラム追加は ALTER TABLE で対応
- 大規模な構造変更は新テーブル作成 → データ移行