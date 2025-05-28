'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ユーザーが存在することを前提とした目標データ
    await queryInterface.bulkInsert('goals', [
      // ユーザー14の目標（進捗中）
      {
        userID: 14,
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
        userID: 14,
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
        userID: 14,
        exercise: 'プッシュアップ',
        exerciseType: 'strength',
        targetAmount: 50,
        progressAmount: 50,
        metricUnit: 'reps',
        status: 'completed',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-12')
      },

      // ユーザー15の目標（初心者向け）
      {
        userID: 15,
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
        userID: 15,
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
        userID: 15,
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        targetAmount: 20,
        progressAmount: 8,
        metricUnit: 'reps',
        status: 'paused',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-10')
      },

      // ユーザー16の目標（上級者向け）
      {
        userID: 16,
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
        userID: 16,
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
        userID: 16,
        exercise: 'ジョギング',
        exerciseType: 'cardio',
        targetAmount: 50,
        progressAmount: 22,
        metricUnit: 'distance',
        status: 'in_progress',
        createdAt: new Date('2024-01-06'),
        updatedAt: new Date('2024-01-15')
      },

      // 追加のテストデータ
      {
        userID: 14,
        exercise: 'レッグレイズ',
        exerciseType: 'strength',
        targetAmount: 60,
        progressAmount: 0,
        metricUnit: 'reps',
        status: 'in_progress',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        userID: 15,
        exercise: 'ジョギング',
        exerciseType: 'cardio',
        targetAmount: 120,
        progressAmount: 45,
        metricUnit: 'duration',
        status: 'in_progress',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-15')
      },
      {
        userID: 16,
        exercise: 'ウォーキング',
        exerciseType: 'cardio',
        targetAmount: 15,
        progressAmount: 15,
        metricUnit: 'distance',
        status: 'completed',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10')
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // 開発環境での全データ削除
    await queryInterface.bulkDelete('goals', null, {});
  }
}; 