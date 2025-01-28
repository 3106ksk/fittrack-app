'use strict';
module.exports = (sequelize, DataTypes) => {
  const Workout = sequelize.define(
    'Workout', // モデル名（この名前がテーブル名とマッピングされる）
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      exercise: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sets: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reps: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      useId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'workouts', // PostgreSQL側のテーブル名を指定
      timestamps: false, // createdAt, updatedAtカラムを使用しない場合
    }
  );
  return Workout;
};
