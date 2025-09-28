'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    return queryInterface.bulkInsert('users', [
      {
        id: 1,
        username: 'demo_user',
        email: 'demo@example.com',
        password: hashedPassword,
        strava_athlete_id: null,
        strava_access_token: null,
        strava_refresh_token: null,
        strava_token_expires_at: null,
        strava_last_sync: null
      },
      {
        id: 2,
        username: 'active_user',
        email: 'active@example.com',
        password: hashedPassword,
        strava_athlete_id: null,
        strava_access_token: null,
        strava_refresh_token: null,
        strava_token_expires_at: null,
        strava_last_sync: null
      },
      {
        id: 3,
        username: 'beginner_user',
        email: 'beginner@example.com',
        password: hashedPassword,
        strava_athlete_id: null,
        strava_access_token: null,
        strava_refresh_token: null,
        strava_token_expires_at: null,
        strava_last_sync: null
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};