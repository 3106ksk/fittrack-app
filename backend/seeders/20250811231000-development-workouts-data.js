'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 現在の開発データベースからバックアップした代表的なワークアウトデータ
    await queryInterface.bulkInsert('workouts', [
      // カーディオエクササイズ（ランニング）
      {
        id: 18,
        userID: 1,
        date: '2025-07-10',
        exercise: 'ランニング',
        exerciseType: 'cardio',
        sets: null,
        reps: null,
        repsDetail: null,
        distance: 1.0,
        duration: 5,
        intensity: '高',
        createdAt: new Date('2025-07-11T05:12:30.859Z'),
        updatedAt: new Date('2025-07-11T05:12:30.859Z'),
      },
      // ストレングストレーニング（プッシュアップ）
      {
        id: 19,
        userID: 1,
        date: '2025-07-10',
        exercise: 'プッシュアップ',
        exerciseType: 'strength',
        sets: 3,
        reps: 75,
        repsDetail: JSON.stringify([
          {"setNumber": 1, "reps": 30},
          {"setNumber": 2, "reps": 25},
          {"setNumber": 3, "reps": 20}
        ]),
        distance: null,
        duration: null,
        intensity: '高',
        createdAt: new Date('2025-07-11T05:12:30.879Z'),
        updatedAt: new Date('2025-07-11T05:12:30.879Z'),
      },
      // ストレングストレーニング（スクワット）
      {
        id: 20,
        userID: 1,
        date: '2025-07-10',
        exercise: 'スクワット',
        exerciseType: 'strength',
        sets: 3,
        reps: 40,
        repsDetail: JSON.stringify([
          {"setNumber": 1, "reps": 15},
          {"setNumber": 2, "reps": 15},
          {"setNumber": 3, "reps": 10}
        ]),
        distance: null,
        duration: null,
        intensity: '高',
        createdAt: new Date('2025-07-11T05:12:30.884Z'),
        updatedAt: new Date('2025-07-11T05:12:30.884Z'),
      },
      // カーディオエクササイズ（ウォーキング）
      {
        id: 30,
        userID: 1,
        date: '2025-07-11',
        exercise: 'ウォーキング',
        exerciseType: 'cardio',
        sets: null,
        reps: null,
        repsDetail: null,
        distance: 4.5,
        duration: 25,
        intensity: '中',
        createdAt: new Date('2025-07-11T10:46:31.102Z'),
        updatedAt: new Date('2025-07-11T10:46:31.102Z'),
      },
      // 中強度ストレングストレーニング（プッシュアップ）
      {
        id: 31,
        userID: 1,
        date: '2025-07-11',
        exercise: 'プッシュアップ',
        exerciseType: 'strength',
        sets: 2,
        reps: 60,
        repsDetail: JSON.stringify([
          {"setNumber": 1, "reps": 30},
          {"setNumber": 2, "reps": 30}
        ]),
        distance: null,
        duration: null,
        intensity: '中',
        createdAt: new Date('2025-07-11T10:46:31.130Z'),
        updatedAt: new Date('2025-07-11T10:46:31.130Z'),
      },
      // 中強度ストレングストレーニング（スクワット）
      {
        id: 32,
        userID: 1,
        date: '2025-07-11',
        exercise: 'スクワット',
        exerciseType: 'strength',
        sets: 2,
        reps: 60,
        repsDetail: JSON.stringify([
          {"setNumber": 1, "reps": 30},
          {"setNumber": 2, "reps": 30}
        ]),
        distance: null,
        duration: null,
        intensity: '中',
        createdAt: new Date('2025-07-11T10:46:31.135Z'),
        updatedAt: new Date('2025-07-11T10:46:31.135Z'),
      },
      // 他のユーザーのデータも追加
      {
        id: 50,
        userID: 2,
        date: '2025-07-12',
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        sets: 4,
        reps: 32,
        repsDetail: JSON.stringify([
          {"setNumber": 1, "reps": 10},
          {"setNumber": 2, "reps": 8},
          {"setNumber": 3, "reps": 8},
          {"setNumber": 4, "reps": 6}
        ]),
        distance: null,
        duration: null,
        intensity: '高',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 51,
        userID: 3,
        date: '2025-07-12',
        exercise: 'サイクリング',
        exerciseType: 'cardio',
        sets: null,
        reps: null,
        repsDetail: null,
        distance: 15.0,
        duration: 45,
        intensity: '中',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});

    // IDシーケンスをリセット（PostgreSQL用）
    await queryInterface.sequelize.query(
      "SELECT setval('workouts_id_seq', (SELECT MAX(id) FROM workouts));"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('workouts', null, {});
  }
};