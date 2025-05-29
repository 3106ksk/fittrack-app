'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ユーザーIDを動的に取得
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users ORDER BY id ASC;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // ユーザーが存在するか確認
    if (!users || users.length < 3) {
      console.error('ユーザーデータが不足しています。先にユーザーシードを実行してください。');
      return;
    }

    const userId1 = users[0].id; // testuser
    const userId2 = users[1].id; // john_doe
    const userId3 = users[2].id; // jane_smith

    await queryInterface.bulkInsert('goals', [
      // testuser の目標（進捗中）
      {
        userID: userId1,
        exercise: 'スクワット',
        exerciseType: 'strength',
        targetAmount: 100,
        progressAmount: 35,
        metricUnit: 'reps',
        status: 'in_progress',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        userID: userId1,
        exercise: 'ジョギング',
        exerciseType: 'cardio',
        targetAmount: 10,
        progressAmount: 3,
        metricUnit: 'distance',
        status: 'in_progress',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-15')
      },
      {
        userID: userId1,
        exercise: 'プッシュアップ',
        exerciseType: 'strength',
        targetAmount: 50,
        progressAmount: 50,
        metricUnit: 'reps',
        status: 'completed',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-12')
      },

      // john_doe の目標（初心者向け）
      {
        userID: userId2,
        exercise: 'ウォーキング',
        exerciseType: 'cardio',
        targetAmount: 60,
        progressAmount: 15,
        metricUnit: 'duration',
        status: 'in_progress',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-15')
      },
      {
        userID: userId2,
        exercise: 'クランチ',
        exerciseType: 'strength',
        targetAmount: 30,
        progressAmount: 12,
        metricUnit: 'reps',
        status: 'in_progress',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15')
      },
      {
        userID: userId2,
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        targetAmount: 20,
        progressAmount: 8,
        metricUnit: 'reps',
        status: 'paused',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-10')
      },

      // jane_smith の目標（上級者向け）
      {
        userID: userId3,
        exercise: 'デッドリフト',
        exerciseType: 'strength',
        targetAmount: 80,
        progressAmount: 24,
        metricUnit: 'reps',
        status: 'in_progress',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-15')
      },
      {
        userID: userId3,
        exercise: '懸垂（チンニング）',
        exerciseType: 'strength',
        targetAmount: 40,
        progressAmount: 40,
        metricUnit: 'reps',
        status: 'completed',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-14')
      },
      {
        userID: userId3,
        exercise: 'ジョギング',
        exerciseType: 'cardio',
        targetAmount: 50,
        progressAmount: 22,
        metricUnit: 'distance',
        status: 'in_progress',
        createdAt: new Date('2024-01-06'),
        updatedAt: new Date('2024-01-15')
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // 開発環境での全データ削除
    await queryInterface.bulkDelete('goals', null, {});
  }
}; 