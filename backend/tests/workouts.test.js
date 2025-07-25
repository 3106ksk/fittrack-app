// backend/tests/workouts.test.js
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

describe('ワークアウト機能', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    testUser = await createTestUser();
    authToken = jwt.sign(
      { userId: testUser.id }, 
      process.env.JWT_SECRET || 'test-secret'
    );
  });

  describe('POST /workouts', () => {
    test('認証済みユーザーがワークアウトを作成できる', async () => {
      const workoutData = {
        exerciseName: 'ベンチプレス',
        exerciseType: 'strength',
        repsDetail: [
          { set: 1, reps: 10, weight: 60 },
          { set: 2, reps: 8, weight: 65 },
          { set: 3, reps: 6, weight: 70 }
        ]
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.exerciseName).toBe(workoutData.exerciseName);
      expect(response.body.exerciseType).toBe(workoutData.exerciseType);
      expect(response.body.userId).toBe(testUser.id);
    });

    test('認証なしでワークアウト作成に失敗する', async () => {
      const workoutData = {
        exerciseName: 'ベンチプレス',
        exerciseType: 'strength',
        repsDetail: [{ set: 1, reps: 10, weight: 60 }]
      };

      await request(app)
        .post('/workouts')
        .send(workoutData)
        .expect(401);
    });

    test('無効なトークンでワークアウト作成に失敗する', async () => {
      const workoutData = {
        exerciseName: 'ベンチプレス',
        exerciseType: 'strength',
        repsDetail: [{ set: 1, reps: 10, weight: 60 }]
      };

      await request(app)
        .post('/workouts')
        .set('Authorization', 'Bearer invalid-token')
        .send(workoutData)
        .expect(401);
    });
  });

  describe('GET /workouts', () => {
    test('ユーザーのワークアウト一覧を取得できる', async () => {
      // テスト用ワークアウトを作成
      await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          exerciseName: 'スクワット',
          exerciseType: 'strength',
          repsDetail: [{ set: 1, reps: 15, weight: 80 }]
        });

      const response = await request(app)
        .get('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].exerciseName).toBe('スクワット');
      expect(response.body[0].userId).toBe(testUser.id);
    });
  });
});