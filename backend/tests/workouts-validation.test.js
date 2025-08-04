const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { User, Workout } = require('../models');

describe('ワークアウトバリデーション', () => {
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

    describe('有酸素運動(cardio)バリデーション', () => {
    test('duration が不足している場合エラー', async () => {
      const workoutData = {
        exercise: 'ランニング',
        exerciseType: 'cardio',
        intensity: '中',
        distance: 5.0
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('時間は必須です');
    });
    
    test('durationが数値以外の場合エラー', async () => {
      const workoutData = {
        exercise: 'ランニング',
        exerciseType: 'cardio',
        intensity: '中',
        distance: 5.0,
        duration: 'invalid'
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('時間は数値で入力してください');
    });

    test('durationが0以下の場合エラー', async () => {
      const workoutData = {
        exercise: 'ランニング',
        exerciseType: 'cardio',
        intensity: '中',
        distance: 5.0,
        duration: 0
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('時間は0より大きい値を入力してください');
    });

    test('durationが負の値の場合エラー', async () => {
      const workoutData = {
        exercise: 'ランニング',
        exerciseType: 'cardio',
        intensity: '中',
        distance: 5.0,
        duration: -10
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('時間は0より大きい値を入力してください');
    });

    test('distance が不足している場合エラー', async () => {
      const workoutData = {
        exercise: 'ランニング',
        exerciseType: 'cardio',
        intensity: '中',
        duration: 30.0
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('距離は必須です');
    });

    test('distanceが数値以外の場合エラー', async () => {
      const workoutData = {
        exercise: 'ランニング',
        exerciseType: 'cardio',
        intensity: '中',
        distance: 'invalid',
        duration: 30.0
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('距離は数値で入力してください');
    });

    test('distanceが0以下の場合エラー', async () => {
      const workoutData = {
        exercise: 'ランニング',
        exerciseType: 'cardio',
        intensity: '中',
        distance: 0,
        duration: 30.0
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('距離は0より大きい値を入力してください');
    });

    test('distanceが負の値の場合エラー', async () => {
      const workoutData = {
        exercise: 'ランニング',
        exerciseType: 'cardio',
        intensity: '中',
        distance: -5.0,
        duration: 30.0
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('距離は0より大きい値を入力してください');
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

    test('setNumberが1未満の場合エラー', async () => {
      const workoutData = {
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        intensity: '中',
        setNumber: 0,
        repsNumber: [{ reps: 10 }]
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('セット数は1以上を入力してください');
    });

    test('setNumberが負の値の場合エラー', async () => {
      const workoutData = {
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        intensity: '中',
        setNumber: -1,
        repsNumber: [{ reps: 10 }]
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('セット数は1以上を入力してください');
    });

    test('repsNumberが配列以外の場合エラー', async () => {
      const workoutData = {
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        intensity: '中',
        setNumber: 1,
        repsNumber: 'not-an-array'
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('レップ数情報は配列形式で入力してください');
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

    test('レップ数データの形式が不正な場合エラー', async () => {
      const workoutData = {
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        intensity: '中',
        setNumber: 1,
        repsNumber: [{ invalidField: 10 }]
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('セット 1 のレップ数データが不正です');
    });

    test('レップ数データがnullの場合エラー', async () => {
      const workoutData = {
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        intensity: '中',
        setNumber: 1,
        repsNumber: [null]
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('セット 1 のレップ数データが不正です');
    });

    test('レップ数が1未満の場合エラー', async () => {
      const workoutData = {
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        intensity: '中',
        setNumber: 1,
        repsNumber: [{ reps: 0 }]
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('セット 1 のレップ数は1以上の整数を入力してください');
    });

    test('レップ数が負の値の場合エラー', async () => {
      const workoutData = {
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        intensity: '中',
        setNumber: 1,
        repsNumber: [{ reps: -5 }]
      };  

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('セット 1 のレップ数は1以上の整数を入力してください');
    });

    test('レップ数が数値以外の場合エラー', async () => {
      const workoutData = {
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        intensity: '中',
        setNumber: 1,
        repsNumber: [{ reps: 'invalid' }]
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('セット 1 のレップ数は1以上の整数を入力してください');
    });

    test('複数セットでレップ数が不正な場合エラー', async () => {
      const workoutData = {
        exercise: 'ベンチプレス',
        exerciseType: 'strength',
        intensity: '中',
        setNumber: 3,
        repsNumber: [
          { reps: 10 },
          { reps: 0 },
          { reps: 8 }
        ]
      };

      const response = await request(app)
        .post('/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400);

      expect(response.body.error).toBe('セット 2 のレップ数は1以上の整数を入力してください');
    });
  });
});



