// backend/tests/setup.js
const { sequelize } = require('../models');

// 各テストファイル実行前の初期化
beforeAll(async () => {
  await sequelize.sync({ force: true }); // テーブル再作成
});

// 各テスト実行後のクリーンアップ
afterEach(async () => {
  // 全テーブルのデータをクリア
  const models = Object.keys(sequelize.models);
  await Promise.all(
    models.map(model => sequelize.models[model].destroy({ 
      where: {}, 
      truncate: true 
    }))
  );
});

// 全テスト完了後の処理
afterAll(async () => {
  await sequelize.close();
});

// テスト用のユーティリティ関数
global.createTestUser = async (options = {}) => {
  const { User } = require('../models');
  const bcrypt = require('bcrypt');

  const {
    username = 'testuser',
    email = 'test@example.com',
    password = 'password123'
  } = options;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return await User.create({
    username,
    email,
    password: hashedPassword
  });
};