# 月次目標機能 - データベース設計書 v2

**文書番号**: DDD-MG-002
**バージョン**: 2.0.0
**作成日**: 2025-09-13
**ステータス**: Draft

## 1. テーブル設計

### 1.1 goals テーブル

#### 物理設計
```sql
CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255),
  target_count INTEGER NOT NULL,
  period_type VARCHAR(20) NOT NULL DEFAULT 'monthly',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  reward_title VARCHAR(255),
  reward_note TEXT,
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_goals_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT chk_target_count
    CHECK (target_count > 0),

  CONSTRAINT chk_period_type
    CHECK (period_type IN ('monthly', 'custom')),

  CONSTRAINT chk_date_range
    CHECK (start_date < end_date),

  CONSTRAINT chk_reward_claimed
    CHECK ((reward_claimed = false AND reward_claimed_at IS NULL)
           OR (reward_claimed = true AND reward_claimed_at IS NOT NULL))
);
```

#### インデックス設計
```sql
-- 主要な検索パターン用
CREATE INDEX idx_goals_user_dates
  ON goals(user_id, start_date, end_date);

-- アクティブな目標の検索用
CREATE INDEX idx_goals_user_active
  ON goals(user_id, is_active)
  WHERE is_active = true;

-- 期間重複チェック用
CREATE INDEX idx_goals_period_overlap
  ON goals(user_id, start_date, end_date, is_active);
```

#### トリガー（期間重複防止）
```sql
CREATE OR REPLACE FUNCTION check_goal_period_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM goals
    WHERE user_id = NEW.user_id
      AND id != COALESCE(NEW.id, -1)
      AND is_active = true
      AND NEW.is_active = true
      AND (NEW.start_date, NEW.end_date) OVERLAPS (start_date, end_date)
  ) THEN
    RAISE EXCEPTION 'Active goal period overlaps with existing goal';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_goal_overlap
BEFORE INSERT OR UPDATE ON goals
FOR EACH ROW
EXECUTE FUNCTION check_goal_period_overlap();
```

### 1.2 既存テーブルの変更

#### workouts テーブル
- `started_at` カラムを追加（まだない場合）
```sql
ALTER TABLE workouts
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

-- 既存データの移行（dateカラムから）
UPDATE workouts
SET started_at = date::timestamp AT TIME ZONE 'Asia/Tokyo'
WHERE started_at IS NULL;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_workouts_user_started
  ON workouts(user_id, started_at);
```

## 2. Sequelizeモデル実装

### 2.1 Goalモデル定義
```javascript
// models/Goal.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Goal = sequelize.define('Goal', {
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
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'title',
    },
    targetCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'target_count',
      validate: {
        min: 1,
      },
    },
    periodType: {
      type: DataTypes.ENUM('monthly', 'custom'),
      allowNull: false,
      defaultValue: 'monthly',
      field: 'period_type',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date',
    },
    rewardTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'reward_title',
    },
    rewardNote: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'reward_note',
    },
    rewardClaimed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'reward_claimed',
    },
    rewardClaimedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reward_claimed_at',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'goals',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (goal, options) => {
        // デフォルトタイトルの設定
        if (!goal.title) {
          goal.title = `ワークアウト${goal.targetCount}回`;
        }

        // 月次目標の場合、日付を自動設定
        if (goal.periodType === 'monthly' && !goal.startDate) {
          const now = new Date();
          goal.startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          goal.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }
      },
      beforeSave: async (goal, options) => {
        // 期間重複チェック（アプリケーション層）
        const overlap = await Goal.findOne({
          where: {
            userId: goal.userId,
            id: { [sequelize.Op.ne]: goal.id },
            isActive: true,
            [sequelize.Op.or]: [
              {
                startDate: {
                  [sequelize.Op.between]: [goal.startDate, goal.endDate]
                }
              },
              {
                endDate: {
                  [sequelize.Op.between]: [goal.startDate, goal.endDate]
                }
              }
            ]
          }
        });

        if (overlap) {
          throw new Error('Active goal period overlaps with existing goal');
        }
      }
    }
  });

  Goal.associate = (models) => {
    Goal.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  // インスタンスメソッド
  Goal.prototype.calculateProgress = async function() {
    const { Workout } = sequelize.models;
    const { Op } = sequelize;

    // 日次達成カウント（タイムゾーン考慮）
    const result = await sequelize.query(`
      SELECT COUNT(DISTINCT DATE_TRUNC('day', started_at AT TIME ZONE :tz)) as count
      FROM workouts
      WHERE user_id = :userId
        AND started_at BETWEEN :startDate AND :endDate
        ${Workout.rawAttributes.status ? "AND status = 'completed'" : ''}
    `, {
      replacements: {
        userId: this.userId,
        startDate: this.startDate,
        endDate: this.endDate,
        tz: 'Asia/Tokyo'  // TODO: ユーザー設定から取得
      },
      type: sequelize.QueryTypes.SELECT
    });

    const count = parseInt(result[0].count) || 0;
    const percent = Math.min(100, Math.round((count / this.targetCount) * 100));

    return {
      count,
      target: this.targetCount,
      percent,
      exampleLabel: `${this.title} ${count}/${this.targetCount}${this.rewardTitle ? ` 【${this.rewardTitle}】` : ''}`
    };
  };

  // クラスメソッド
  Goal.getActiveForUser = async function(userId) {
    const now = new Date();
    return await this.findOne({
      where: {
        userId,
        isActive: true,
        startDate: { [sequelize.Op.lte]: now },
        endDate: { [sequelize.Op.gte]: now }
      }
    });
  };

  return Goal;
};
```

### 2.2 マイグレーションファイル
```javascript
// migrations/YYYYMMDDHHMMSS-create-goals.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('goals', {
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
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      target_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      period_type: {
        type: Sequelize.ENUM('monthly', 'custom'),
        allowNull: false,
        defaultValue: 'monthly',
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      reward_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      reward_note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reward_claimed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      reward_claimed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.addIndex('goals',
      ['user_id', 'start_date', 'end_date'],
      { name: 'idx_goals_user_dates' }
    );

    await queryInterface.addIndex('goals',
      ['user_id', 'is_active'],
      {
        name: 'idx_goals_user_active',
        where: { is_active: true }
      }
    );

    // workoutsテーブルの更新
    const tableInfo = await queryInterface.describeTable('workouts');
    if (!tableInfo.started_at) {
      await queryInterface.addColumn('workouts', 'started_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });

      // 既存データの移行
      await queryInterface.sequelize.query(`
        UPDATE workouts
        SET started_at = date::timestamp AT TIME ZONE 'Asia/Tokyo'
        WHERE started_at IS NULL
      `);

      await queryInterface.addIndex('workouts',
        ['user_id', 'started_at'],
        { name: 'idx_workouts_user_started' }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('goals');
    // workoutsの変更は残す（データ保護のため）
  },
};
```

## 3. パフォーマンス考慮事項

### 3.1 クエリ最適化
- 日次達成カウントは DATE_TRUNC で効率化
- 部分インデックスでアクティブな目標の検索を高速化
- 期間重複チェックは専用インデックスで対応

### 3.2 キャッシュ戦略
- 進捗計算結果は頻繁に変わるため、短時間キャッシュ（5分程度）
- Redis導入時: `goals:progress:{userId}:{goalId}` キー

### 3.3 スケーラビリティ
- 将来的なパーティショニング対応（年月別）
- 古い非アクティブ目標のアーカイブテーブル移行

## 4. データ整合性

### 4.1 トランザクション管理
```javascript
// リワードclaim時のトランザクション例
await sequelize.transaction(async (t) => {
  const goal = await Goal.findByPk(goalId, {
    transaction: t,
    lock: true
  });

  const progress = await goal.calculateProgress();

  if (progress.count < goal.targetCount) {
    throw new Error('Goal not achieved yet');
  }

  await goal.update({
    rewardClaimed: true,
    rewardClaimedAt: new Date()
  }, { transaction: t });
});
```

### 4.2 制約の実装レベル
- DB層: 外部キー制約、CHECK制約、トリガー
- アプリ層: Sequelizeバリデーション、フック
- 両層で二重チェック（防御的プログラミング）

## 5. 監視項目

### 5.1 メトリクス
- 日次達成カウントクエリの実行時間
- アクティブ目標の数/ユーザー
- リワードclaim率

### 5.2 アラート設定
- クエリ実行時間 > 1秒
- エラー率 > 1%
- デッドロック発生