'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = 10;
    
    await queryInterface.bulkInsert('users', [
      {
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', saltRounds),
      },
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: await bcrypt.hash('john123', saltRounds),
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('jane456', saltRounds),
      },
      {
        username: 'admin',
        email: 'admin@fittrack.com',
        password: await bcrypt.hash('admin123', saltRounds),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};