'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = 10;
    
    // 現在の開発データベースからバックアップしたユーザーデータ
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', saltRounds),
      },
      {
        id: 2,
        username: 'john_doe',
        email: 'john@example.com',
        password: await bcrypt.hash('john123', saltRounds),
      },
      {
        id: 3,
        username: 'jane_smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('jane456', saltRounds),
      },
      {
        id: 4,
        username: 'admin',
        email: 'admin@fittrack.com',
        password: await bcrypt.hash('admin123', saltRounds),
      },
      {
        id: 5,
        username: 'テスト２号',
        email: 'test2@gmail.com',
        password: await bcrypt.hash('test123', saltRounds),
      },
      {
        id: 6,
        username: 'テスト３号',
        email: 'test3@gmail.com',
        password: await bcrypt.hash('test123', saltRounds),
      },
      {
        id: 8,
        username: 'テスト４号',
        email: 'test4@gmail.com',
        password: await bcrypt.hash('test123', saltRounds),
      },
    ], {});

    // IDシーケンスをリセット（PostgreSQL用）
    await queryInterface.sequelize.query(
      "SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};