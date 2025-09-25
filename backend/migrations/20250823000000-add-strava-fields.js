'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Usersテーブルの既存カラムをチェック
    const userTableInfo = await queryInterface.describeTable('users');

    // Stravaフィールドを条件付きで追加
    if (!userTableInfo.strava_athlete_id) {
      await queryInterface.addColumn('users', 'strava_athlete_id', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      });
    }

    if (!userTableInfo.strava_access_token) {
      await queryInterface.addColumn('users', 'strava_access_token', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!userTableInfo.strava_refresh_token) {
      await queryInterface.addColumn('users', 'strava_refresh_token', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!userTableInfo.strava_token_expires_at) {
      await queryInterface.addColumn('users', 'strava_token_expires_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    if (!userTableInfo.strava_last_sync) {
      await queryInterface.addColumn('users', 'strava_last_sync', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    // Workoutsテーブルの既存カラムをチェック
    const workoutTableInfo = await queryInterface.describeTable('workouts');

    if (!workoutTableInfo.external_id) {
      await queryInterface.addColumn('workouts', 'external_id', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      });
    }

    if (!workoutTableInfo.source) {
      await queryInterface.addColumn('workouts', 'source', {
        type: Sequelize.ENUM('manual', 'strava'),
        allowNull: false,
        defaultValue: 'manual'
      });
    }

    if (!workoutTableInfo.raw_data) {
      await queryInterface.addColumn('workouts', 'raw_data', {
        type: Sequelize.JSON,
        allowNull: true
      });
    }

    if (!workoutTableInfo.synced_at) {
      await queryInterface.addColumn('workouts', 'synced_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    console.log('✅ Strava fields migration completed (existing columns were skipped)');
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