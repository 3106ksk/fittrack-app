// backend/tests/auth.test.js
const request = require('supertest');
const app = require('../server');
const { User } = require('../models');

describe('認証機能', () => {
  describe('POST /authrouter/register', () => {
    test('正常なユーザー登録ができる', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'securePassword123'
      };

      const response = await request(app)
        .post('/authrouter/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(userData.username);
      expect(response.body.email).toBe(userData.email);
      expect(response.body).not.toHaveProperty('password');

      const savedUser = await User.findOne({ 
        where: { email: userData.email } 
      });
      expect(savedUser).toBeTruthy();
    });

    test('重複メールアドレスで登録に失敗する', async () => {
      // 既存ユーザーを作成
      await createTestUser();

      const userData = {
        username: 'newuser',
        email: 'test@example.com', // 既存のメールアドレス
        password: 'securePassword123'
      };

      const response = await request(app)
        .post('/authrouter/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('This email is already taken');
    });

    test('無効なメールアドレスで登録に失敗する', async () => {
      const userData = {
        username: 'newuser',
        email: 'invalid-email',
        password: 'securePassword123'
      };

      const response = await request(app)
        .post('/authrouter/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors[0]).toHaveProperty('msg', 'Invalid email format'); 
    });

    test('短すぎるパスワードで登録に失敗する', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: '123' // 短すぎるパスワード
      };

      const response = await request(app)
        .post('/authrouter/register')
        .send(userData)
        .expect(400);

      expect(response.body.errors[0]).toHaveProperty('msg', 'password is minimum 6characters');
    });

    test('ユーザー名が空で登録に失敗する', async () => {
      const userData = {
        username: '',
        email: 'newuser@example.com',
        password: 'securePassword123'
      };

      const response = await request(app)
        .post('/authrouter/register')
        .send(userData)
        .expect(400);

      expect(response.body.errors[0]).toHaveProperty('msg', 'Username is required');
    });
  });

});