// backend/tests/auth.test.js
const request = require('supertest');
const app = require('../server');
const { User } = require('../models');
const JWT = require('jsonwebtoken');

describe('認証機能', () => {
  describe('POST /authrouter/register', () => {
    test('正常なユーザー登録ができる', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'securePassword123',
      };

      const response = await request(app).post('/authrouter/register').send(userData).expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(userData.username);
      expect(response.body.email).toBe(userData.email);
      expect(response.body).not.toHaveProperty('password');

      const savedUser = await User.findOne({
        where: { email: userData.email },
      });
      expect(savedUser).toBeTruthy();
    });

    test('重複メールアドレスで登録に失敗する', async () => {
      // 既存ユーザーを作成
      await createTestUser();

      const userData = {
        username: 'newuser',
        email: 'test@example.com', // 既存のメールアドレス
        password: 'securePassword123',
      };

      const response = await request(app).post('/authrouter/register').send(userData).expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('This email is already taken');
    });

    test('無効なメールアドレスで登録に失敗する', async () => {
      const userData = {
        username: 'newuser',
        email: 'invalid-email',
        password: 'securePassword123',
      };

      const response = await request(app).post('/authrouter/register').send(userData).expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors[0]).toHaveProperty('msg', 'Invalid email format');
    });

    test('短すぎるパスワードで登録に失敗する', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: '123', // 短すぎるパスワード
      };

      const response = await request(app).post('/authrouter/register').send(userData).expect(400);

      expect(response.body.errors[0]).toHaveProperty('msg', 'password is minimum 6characters');
    });

    test('ユーザー名が空で登録に失敗する', async () => {
      const userData = {
        username: '',
        email: 'newuser@example.com',
        password: 'securePassword123',
      };

      const response = await request(app).post('/authrouter/register').send(userData).expect(400);

      expect(response.body.errors[0]).toHaveProperty('msg', 'Username is required');
    });
  });

  describe('POST /authrouter/login', () => {
    let testUser;
    beforeEach(async () => {
      testUser = await createTestUser();
    });

    test('正しい認証情報でログインできる', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app).post('/authrouter/login').send(loginData).expect(200);

      console.log(response.data);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id', testUser.id);
      expect(response.body.user.email).toBe(testUser.email);
    });

    test('間違ったパスワードでログインに失敗する', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app).post('/authrouter/login').send(loginData).expect(401);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('message');
      expect(response.body[0].message).toContain('Incorrect password');
    });

    test('存在しないメールアドレスでログインに失敗する', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app).post('/authrouter/login').send(loginData).expect(401);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('message');
      expect(response.body[0].message).toContain('This user is not found');
    });

    test('空のメールアドレスでログインに失敗する', async () => {
      const loginData = {
        email: '',
        password: 'password123',
      };

      const response = await request(app).post('/authrouter/login').send(loginData).expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('空のパスワードでログインに失敗する', async () => {
      const loginData = {
        email: 'test@example.com',
        password: '',
      };

      const response = await request(app).post('/authrouter/login').send(loginData).expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('リクエストボディが空の場合にエラーが発生する', async () => {
      const response = await request(app).post('/authrouter/login').send({}).expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('POST /authrouter/me', () => {
    let testUser;
    let token;

    beforeEach(async () => {
      testUser = await createTestUser();
      const loginResponse = await request(app).post('/authrouter/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      token = loginResponse.body.token;
    });

    test('正常なトークンが提供された場合、ユーザー情報が返される', async () => {
      const response = await request(app)
        .get('/authrouter/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('username', testUser.username);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    test('トークンなしでアクセスした場合401エラー', async () => {
      const response = await request(app).get('/authrouter/me').expect(401);

      expect(response.body).toEqual({ message: 'Unauthorized' });
    });

    test('無効なトークンでアクセスした場合403エラー', async () => {
      const response = await request(app)
        .get('/authrouter/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(403);

      expect(response.body).toEqual({ message: 'Forbidden' });
    });

    test('Bearerなしのトークンでアクセスした場合401エラー', async () => {
      const response = await request(app)
        .get('/authrouter/me')
        .set('Authorization', token)
        .expect(401);

      expect(response.body).toEqual({ message: 'Unauthorized' });
    });

    test('トークンが期限切れの場合403エラー', async () => {
      const expiredToken = JWT.sign({ id: testUser.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: '-1s',
      });

      const response = await request(app)
        .get('/authrouter/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);

      expect(response.body).toEqual({ message: 'Forbidden' });
    });
  });

  describe('POST /authrouter/refresh-token', () => {
    let testUser;
    let oldToken;

    beforeEach(async () => {
      testUser = await createTestUser();
      const loginResponse = await request(app).post('/authrouter/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      oldToken = loginResponse.body.token;
    });

    test('正常なトークンが提供された場合、新しいトークンが返される', async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await request(app)
        .post('/authrouter/refresh-token')
        .set('Authorization', `Bearer ${oldToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token).not.toBe(oldToken);
    });

    test('Bearerなしのトークンで401エラー', async () => {
      const response = await request(app)
        .post('/authrouter/refresh-token')
        .set('Authorization', oldToken)
        .expect(401);

      expect(response.body).toEqual({ message: 'トークンがありません' });
    });

    test('形式不正なトークンで403エラー', async () => {
      const response = await request(app)
        .post('/authrouter/refresh-token')
        .set('Authorization', `Bearer notajwt`)
        .expect(403);

      expect(response.body).toEqual({ message: '無効なトークンです' });
    });

    test('トークンなしでアクセスした場合401エラー', async () => {
      const response = await request(app).post('/authrouter/refresh-token').expect(401);

      expect(response.body).toEqual({ message: 'トークンがありません' });
    });

    test('期限切れトークンでも新しいトークンを取得できる', async () => {
      const expiredToken = JWT.sign({ id: testUser.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: '-1s',
      });

      const response = await request(app)
        .post('/authrouter/refresh-token')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('token');
    });

    test('署名が無効なトークンでリフレッシュに失敗する', async () => {
      const invalidToken = JWT.sign({ id: testUser.id }, 'invalid-secret', { expiresIn: '1h' });

      const response = await request(app)
        .post('/authrouter/refresh-token')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(403);

      expect(response.body).toEqual({ message: '無効なトークンです' });
    });

    test('存在しないユーザーのトークンでリフレッシュに失敗する', async () => {
      const nonExistingUserToken = JWT.sign({ id: 999999 }, process.env.JWT_SECRET_KEY, {
        expiresIn: '1h',
      });

      const response = await request(app)
        .post('/authrouter/refresh-token')
        .set('Authorization', `Bearer ${nonExistingUserToken}`)
        .expect(404);

      expect(response.body).toEqual({ message: 'ユーザーが見つかりません' });
    });
  });
});
