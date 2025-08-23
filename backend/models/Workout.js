'use strict';

module.exports = (sequelize, DataTypes) => {
  const Workout = sequelize.define('Workout', {
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
      allowNull: true,
    },
    reps: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    repsDetail: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    distance: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    intensity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    external_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    source: {
      type: DataTypes.ENUM('manual', 'strava'),
      allowNull: false,
      defaultValue: 'manual',
    },
    raw_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    synced_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

  }, {
    tableName: 'workouts',
    timestamps: true,
  });

  Workout.associate = (models) => {
    Workout.belongsTo(models.User, { foreignKey: 'userID' });
  };

  return Workout;
};