const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { User, Workout } = require('../models');

describe('POST /workouts - エラーハンドリング', () => {
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
    console.log(loginResponse.body.user.id);
  });

  test('存在しないユーザーの場合404エラー', async () => {
    const invalidUserToken = jwt.sign(
      { id: 999999 },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
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
      .set('Authorization', `Bearer ${invalidUserToken}`)
      .send(workoutData)
      .expect(404);
      
    expect(response.body.error).toBe('ユーザーが見つかりません');
  });

  test('SequelizeValidationErrorの場合400エラー', async () => {

    jest.spyOn(User, 'findByPk').mockResolvedValue({ id: 1 });
    
    const validationError = new Error('Validation Error');
    validationError.name = 'SequelizeValidationError';
    validationError.errors = [
      { message: 'exercise cannot be null' },
      { message: 'intensity is invalid' }
    ];
    
    jest.spyOn(Workout, 'create').mockRejectedValue(validationError);
    
    const workoutData = {
      exercise: 'ベンチプレス',
      exerciseType: 'strength',
      intensity: '中',
      setNumber: 1,
      repsNumber: [{ reps: 10 }]
    };
    
    const response = await request(app)
      .post('/workouts')
      .set('Authorization', `Bearer ${authToken}`)
      .send(workoutData)
      .expect(400);
      
    expect(response.body.error).toBe('入力データが無効です');
    expect(response.body.details).toEqual([
      'exercise cannot be null',
      'intensity is invalid'
    ]);
  });

  test('SequelizeDatabaseErrorの場合400エラー', async () => {

    jest.spyOn(User, 'findByPk').mockResolvedValue({ id: 1 });
    
    const databaseError = new Error('Database connection failed');
    databaseError.name = 'SequelizeDatabaseError';
    
    jest.spyOn(Workout, 'create').mockRejectedValue(databaseError);
    
    const workoutData = {
      exercise: 'ベンチプレス',
      exerciseType: 'strength',
      intensity: '中',
      setNumber: 1,
      repsNumber: [{ reps: 10 }]
    };
    
    const response = await request(app)
      .post('/workouts')
      .set('Authorization', `Bearer ${authToken}`)
      .send(workoutData)
      .expect(400);
      
    expect(response.body.error).toBe('データベースエラーが発生しました');
    expect(response.body.message).toBe('Database connection failed');
  });

  test('予期しないエラーの場合500エラー', async () => {

    jest.spyOn(User, 'findByPk').mockResolvedValue({ id: 1 });
    
    const unexpectedError = new Error('Unexpected error occurred');
    jest.spyOn(Workout, 'create').mockRejectedValue(unexpectedError);
    
    const workoutData = {
      exercise: 'ベンチプレス',
      exerciseType: 'strength',
      intensity: '中',
      setNumber: 1,
      repsNumber: [{ reps: 10 }]
    };
    
    const response = await request(app)
      .post('/workouts')
      .set('Authorization', `Bearer ${authToken}`)
      .send(workoutData)
      .expect(500);
      
    expect(response.body.error).toBe('サーバーエラーが発生しました');
    expect(response.body.message).toBe('Unexpected error occurred');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});

