'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('workouts', [
      {
        userID: 1, // 既存の users テーブルの id を参照
        date: '2024-07-26',
        exercise: 'スクワット',
        sets: 3,
        reps: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userID: 1,
        date: '2024-07-27',
        exercise: 'ベンチプレス',
        sets: 3,
        reps: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userID: 2, // 別のユーザーの id を参照
        date: '2024-07-26',
        exercise: 'ランニング',
        sets: 1,
        reps: 30, // reps は時間や距離などに合わせて調整
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userID: 1,
        date: '2024-07-28',
        exercise: 'デッドリフト',
        sets: 5,
        reps: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // 他のワークアウトデータも同様に追加
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('workouts', null, {}); // 全てのレコードを削除
  }
};