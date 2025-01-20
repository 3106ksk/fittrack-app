'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ダミーデータの挿入
    await queryInterface.bulkInsert('workouts', [
      {
        date: '2025-01-01',
        exercise: 'Push Ups',
        sets: 3,
        reps: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        date: '2025-01-02',
        exercise: 'Squats',
        sets: 4,
        reps: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        date: '2025-01-03',
        exercise: 'Plank',
        sets: 3,
        reps: 60, // 秒数を回数として扱う
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        date: '2025-01-04',
        exercise: 'Running',
        sets: 1,
        reps: 5000, // 距離をメートル単位で扱う
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        date: '2025-01-05',
        exercise: 'Pull Ups',
        sets: 3,
        reps: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // ダミーデータの削除
    await queryInterface.bulkDelete('workouts', null, {});
  },
};
