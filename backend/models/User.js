'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    strava_athlete_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    strava_access_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    strava_refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    strava_token_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    strava_last_sync: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'users',
    timestamps: false,
  });

  User.associate = (models) => {
    User.hasMany(models.Workout, { foreignKey: 'userID' });
  };

  return User;
};