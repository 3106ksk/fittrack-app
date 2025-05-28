// backend/models/Goal.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Goal = sequelize.define('Goal', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    exercise: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'トレーニング種目名（WorkoutFormのexerciseと同じ）'
    },
    exerciseType: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '運動タイプ（strength または cardio）'
    },
    targetAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1 // 正の値のみ許可
      },
      comment: '達成したい目標値（回数・距離・時間など）'
    },
    progressAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0 // 0以上の値のみ許可
      },
      comment: '現在までの進捗量'
    },
    metricUnit: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '測定単位（reps:回数）'
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'completed', 'paused'),
      defaultValue: 'in_progress'
    }
  }, {
    tableName: 'goals',
    timestamps: true, // createdAt と updatedAt を自動生成
    comment: 'ユーザーのトレーニング目標を管理するテーブル'
  });

  Goal.associate = (models) => {
    // ユーザーとの関連付け (多対1)
    Goal.belongsTo(models.User, {
      foreignKey: 'userID',
      as: 'user'
    });
  };

  return Goal;
};