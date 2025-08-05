const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { User, Workout } = require('../models');

describe('ワークアウト機能', () => {
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
    test('認証済みユーザーが筋トレワークアウトを作成できる', async () => {
      const workoutData = {
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        intensity: '中',
        setNumber: 3,
        repsNumber: [
          { reps: 10 },
          { reps: 8 },
          { reps: 6 }
        ]
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('workout');
      expect(response.body.workout.exercise).toBe(workoutData.exercise);
      expect(response.body.workout.exerciseType).toBe(workoutData.exerciseType);
      expect(response.body.workout.userID).toBe(testUser.id);
      expect(response.body.workout.sets).toBe(3);
      expect(response.body.workout.reps).toBe(24);
    });

    test('認証済みユーザーがカーディオワークアウトを作成できる', async () => {
      const workoutData = {
        exercise: 'ランニング',
        exerciseType: 'cardio',
        intensity: '高',
        distance: 10,
        duration: 30
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(201);

      expect(response.body.workout.distance).toBe(10);
      expect(response.body.workout.duration).toBe(30);
    });
  });

  describe('GET /workouts', () => {
  test('認証済みユーザーがワークアウト一覧を取得できる', async () => {
    await request(app)
      .post('/workouts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        exercise: 'スクワット',
        exerciseType: 'strength',
        intensity: '中',
        setNumber: 1,
        repsNumber: [{ reps: 15 }]
      });

    const response = await request(app)
      .get('/workouts')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('exercise');
    expect(response.body[0]).toHaveProperty('exerciseType');
    expect(response.body[0]).toHaveProperty('intensity');
  });
});

});


