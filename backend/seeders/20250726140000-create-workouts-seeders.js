'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ユーザーIDを取得
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users ORDER BY id ASC;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // ユーザーが存在するか確認
    if (!users || users.length < 2) {
      console.error('ユーザーデータが不足しています。先にユーザーシードを実行してください。');
      return;
    }

    const userId1 = users[0].id;
    const userId2 = users[1].id;

    await queryInterface.bulkInsert('workouts', [
      {
        userID: userId1, // 最初のユーザーID
        date: '2024-07-26',
        exercise: 'スクワット',
        exerciseType: 'strength',
        sets: 3,
        reps: 30, // 3セット×10回の合計
        repsDetail: JSON.stringify([
          { setNumber: 1, reps: 10 },
          { setNumber: 2, reps: 10 },
          { setNumber: 3, reps: 10 }
        ]),
        intensity: '中',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userID: userId1,
        date: '2024-07-27',
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        sets: 3,
        reps: 24, // 3セット×8回の合計
        repsDetail: JSON.stringify([
          { setNumber: 1, reps: 8 },
          { setNumber: 2, reps: 8 },
          { setNumber: 3, reps: 8 }
        ]),
        intensity: '高',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userID: userId2, // 2番目のユーザーID
        date: '2024-07-26',
        exercise: 'ジョギング',
        exerciseType: 'cardio',
        sets: null,
        reps: null,
        distance: 5.0, // 5.0km
        duration: 30, // 30分
        intensity: '中',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userID: userId1,
        date: '2024-07-28',
        exercise: 'デッドリフト',
        exerciseType: 'strength',
        sets: 5,
        reps: 25, // 5セット×5回の合計
        repsDetail: JSON.stringify([
          { setNumber: 1, reps: 5 },
          { setNumber: 2, reps: 5 },
          { setNumber: 3, reps: 5 },
          { setNumber: 4, reps: 5 },
          { setNumber: 5, reps: 5 }
        ]),
        intensity: '高',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userID: userId2,
        date: '2024-07-27',
        exercise: 'ウォーキング',
        exerciseType: 'cardio',
        sets: null,
        reps: null,
        distance: 3.0, // 3.0km
        duration: 45, // 45分
        intensity: '低',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userID: userId1,
        date: '2024-07-29',
        exercise: 'プッシュアップ',
        exerciseType: 'strength',
        sets: 4,
        reps: 60, // 4セット (20, 15, 15, 10)
        repsDetail: JSON.stringify([
          { setNumber: 1, reps: 20 },
          { setNumber: 2, reps: 15 },
          { setNumber: 3, reps: 15 },
          { setNumber: 4, reps: 10 }
        ]),
        intensity: '中',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('workouts', null, {}); // 全てのレコードを削除
  }
};