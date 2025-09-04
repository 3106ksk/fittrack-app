const { expressjwt: jwt } = require("express-jwt");
require('dotenv').config();

// JWT秘密鍵のバリデーション
const validateJWTSecret = () => {
  const secret = process.env.JWT_SECRET_KEY;
  
  if (!secret) {
    throw new Error('JWT_SECRET_KEY環境変数が設定されていません');
  }
  
  if (secret.length < 32) {
    throw new Error('JWT_SECRET_KEYはセキュリティ上、32文字以上である必要があります');
  }
  
  // 開発用固定値の使用を警告
  if (secret === 'c80c122bb8663d27520e22e9ca14bb6692be10431153940e11d3633eb0ba291e') {
    console.warn('⚠️  警告: 開発用JWT秘密鍵が使用されています。本番環境では新しい鍵を生成してください！');
  }
  
  return secret;
};

const authMiddleware = jwt({
  secret: validateJWTSecret(),
  algorithms: ['HS256'],
  requestProperty: 'user'
});

module.exports = authMiddleware;