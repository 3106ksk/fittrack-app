const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { User, Workout } = require('../models');

describe('ワークアウト認証', () => {

  let testUser;
  let authToken;

  beforeEach(async () => {
    await Workout.destroy({ where: {} });
    await User.destroy({ where: {} });
    testUser = await createTestUser();
    const loginResponse = await request(app)
      .post('/authrouter/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    authToken = loginResponse.body.token;
  });

  describe('POST /workouts', () => {
    test('認証なしではワークアウトを作成できない', async () => {
      const workoutData = {
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        intensity: '中',
        setNumber: 1,
        repsNumber: [
          { reps: 10 }
        ]
      };

      const response = await request(app)
        .post('/workouts')
        .send(workoutData)
        .expect(401);

      expect(response.body.error).toBe('認証エラー - リクエストにユーザー情報がありません');
    });
    
    test('無効なトークンでワークアウト作成に失敗する', async () => {
      const workoutData = {
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        intensity: '中',
        setNumber: 1,
        repsNumber: [{ reps: 10 }]
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', 'Bearer invalid-token')
        .send(workoutData)
        .expect(401);

      expect(response.body.error).toBe('認証エラー - トークンが無効です');
    });

    test('トークンの有効期限が切れている場合、ワークアウト作成に失敗する', async () => {
      const expiredToken = jwt.sign(
        { id: testUser.id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '-1s' }
      );

      const workoutData = {
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        intensity: '中',
        setNumber: 1,
        repsNumber: [{ reps: 10 }]
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send(workoutData)
        .expect(401);

      expect(response.body.error).toBe('認証エラー - トークンの有効期限が切れています');
    });
  });
});