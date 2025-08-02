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

    describe('POST /workouts - 認証エラー', () => {
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

  describe('POST /workouts - バリデーションエラー', () => {
    describe('基本必須フィールド', () => {
      test('exerciseフィールドが不足している場合にエラーとなる', async () => {
        const workoutData = {
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

        expect(response.body.error).toBe('エクササイズ名は必須です');
      });

      test('exerciseTypeフィールドが不足している場合にエラーとなる', async () => {
          const workoutData = {
          exercise: 'ベンチプレス',
          intensity: '中',
          setNumber: 1,
          repsNumber: [{ reps: 10 }]
        };

        const response = await request(app)
          .post('/workouts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(workoutData)
          .expect(400);

        expect(response.body.error).toBe('エクササイズタイプは必須です');
      });

      test('intensity が不足している場合にエラーとなる', async () => {
        const workoutData = {
          exercise: 'ベンチプレス',
          exerciseType: 'strength'
        };

        const response = await request(app)
          .post('/workouts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(workoutData)
          .expect(400);

        expect(response.body.error).toBe('強度は必須です');
      });

      test('無効な強度値でエラーとなる', async () => {
        const workoutData = {
          exercise: 'ベンチプレス',
          exerciseType: 'strength',
          intensity: '無効',
          setNumber: 1,
          repsNumber: [{ reps: 10 }]
        };

        const response = await request(app)
          .post('/workouts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(workoutData)
          .expect(400);

        expect(response.body.error).toBe('強度の値が無効です');
        expect(response.body.validValues).toBe('低、中、高');
      });
    });
    
  });

  describe('筋トレ(strength)バリデーション', () => {
      test('setNumber が不足している場合にエラーとなる', async () => {
        const workoutData = {
          exercise: 'ベンチプレス',
          exerciseType: 'strength',
          intensity: '中',
          repsNumber: [{ reps: 10 }]
        };

        const response = await request(app)
          .post('/workouts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(workoutData)
          .expect(400);

        expect(response.body.error).toBe('セット数は数値で入力してください');
      });

      test('repsNumber が不足している場合にエラーとなる', async () => {
        const workoutData = {
          exercise: 'ベンチプレス',
          exerciseType: 'strength',
          intensity: '中',
          setNumber: 1
        };

        const response = await request(app)
          .post('/workouts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(workoutData)
          .expect(400);

        expect(response.body.error).toBe('レップ数情報は必須です');
      });

      test('セット数とレップ数データが一致しない場合エラー', async () => {
        const workoutData = {
          exercise: 'ベンチプレス',
          exerciseType: 'strength',
          intensity: '中',
          setNumber: 3,
          repsNumber: [{ reps: 10 }] 
        };

        const response = await request(app)
          .post('/workouts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(workoutData)
          .expect(400);

        expect(response.body.error).toContain('セット数(3)とレップ数データの数(1)が一致しません');
      });
    });

    describe('有酸素運動(cardio)バリデーション', () => {
      test('duration が不足している場合エラー', async () => {
        const workoutData = {
          exercise: 'ランニング',
          exerciseType: 'cardio',
          intensity: '中',
          distance: 5.0
          // duration が不足
        };

        const response = await request(app)
          .post('/workouts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(workoutData)
          .expect(400);

        expect(response.body.error).toBe('時間は必須です');
      });

      test('distance が不足している場合エラー', async () => {
        const workoutData = {
          exercise: 'ランニング',
          exerciseType: 'cardio',
          intensity: '中',
          duration: 30.0
          // distance が不足
        };

        const response = await request(app)
          .post('/workouts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(workoutData)
          .expect(400);

        expect(response.body.error).toBe('距離は必須です');
      });
    });
});


