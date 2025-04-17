'use strict';

module.exports = (sequelize, DataTypes) => {
  const Workout = sequelize.define('Workout', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: { // Note: Capitalized userID matches your migration
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    exercise: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    exerciseType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sets: {
      type: DataTypes.INTEGER,
      allowNull: true, // カーディオの場合は不要
    },
    reps: {
      type: DataTypes.INTEGER,
      allowNull: true, // カーディオの場合は不要
    },
    repsDetail: {
      type: DataTypes.JSON,
      allowNull: true, // 詳細なセットごとの回数情報
    },
    distance: {
      type: DataTypes.FLOAT,
      allowNull: true, // 筋トレの場合は不要
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true, // 筋トレの場合は不要
    },
    intensity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // createdAt and updatedAt are handled automatically by Sequelize if timestamps: true is set
  }, {
    tableName: 'workouts', // Matches your migration's table name
    timestamps: true,      // Enables automatic createdAt and updatedAt
    // underscored: true,  // If you want Sequelize to automatically convert camelCase to snake_case
  });

  Workout.associate = (models) => {
    Workout.belongsTo(models.User, { foreignKey: 'userID' }); // Correct foreign key
  };

  return Workout;
};