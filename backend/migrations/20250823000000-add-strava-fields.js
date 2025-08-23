'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Usersテーブルにストラヴァフィールドを追加
    await queryInterface.addColumn('users', 'strava_athlete_id', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });
    
    await queryInterface.addColumn('users', 'strava_access_token', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'strava_refresh_token', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'strava_token_expires_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'strava_last_sync', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Workoutsテーブルに外部データ識別フィールドを追加
    await queryInterface.addColumn('workouts', 'external_id', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });
    
    await queryInterface.addColumn('workouts', 'source', {
      type: Sequelize.ENUM('manual', 'strava'),
      allowNull: false,
      defaultValue: 'manual'
    });
    
    await queryInterface.addColumn('workouts', 'raw_data', {
      type: Sequelize.JSON,
      allowNull: true
    });
    
    await queryInterface.addColumn('workouts', 'synced_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Usersテーブルからストラヴァフィールドを削除
    await queryInterface.removeColumn('users', 'strava_athlete_id');
    await queryInterface.removeColumn('users', 'strava_access_token');
    await queryInterface.removeColumn('users', 'strava_refresh_token');
    await queryInterface.removeColumn('users', 'strava_token_expires_at');
    await queryInterface.removeColumn('users', 'strava_last_sync');

    // Workoutsテーブルから外部データフィールドを削除
    await queryInterface.removeColumn('workouts', 'external_id');
    await queryInterface.removeColumn('workouts', 'source');
    await queryInterface.removeColumn('workouts', 'raw_data');
    await queryInterface.removeColumn('workouts', 'synced_at');
  }
};