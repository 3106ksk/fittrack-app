'use strict';


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        username: 'user1',
        email: 'user1@example.com',
        password: 'user123', // ハッシュ化されたパスワードを挿入
      },
      {
        username: 'user2',
        email: 'user2@example.com',
        password: 'user345', // ハッシュ化された別のパスワードを挿入
      },
      {
        username: 'user3',
        email: 'user3@example.com',
        password: 'user678', // ハッシュ化されたパスワードを挿入
      },
      // 他のユーザーデータも同様に追加
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {}); // 全てのレコードを削除
  }
};