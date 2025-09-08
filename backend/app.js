const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const authRouter = require("./routes/authRoutes");
const workouts = require('./routes/workouts');
const stravaRoutes = require('./routes/stravaRoutes');


const getCorsConfig = () => {
  const currentEnv = process.env.NODE_ENV || 'development';
  const isProduction = currentEnv === 'production';
  if (isProduction) {
    return {
      origin: process.env.CORS_ORIGIN_PROD || 'https://fitstart-frontend.vercel.app',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    };
  } else {
    return {
      origin: [
        process.env.CORS_ORIGIN_DEV || 'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    };
  }
};

// セキュリティミドルウェアの設定
app.use(helmet());
app.use(cors(getCorsConfig()));

// JSONリクエストボディの解析を有効化
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/ok', (_req, res) => res.json({ ok: true })); 

// ヘルスチェックエンドポイント（Docker用）
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'FitTrack API',
    version: '1.0.0'
  });
});

app.use("/authrouter", authRouter);
app.use("/workouts", workouts);
app.use("/api/strava", stravaRoutes);


app.use((err, _req, res, _next) => {

  if (err.name === 'UnauthorizedError') {

    if (err.code === 'credentials_required') {
      return res.status(401).json({
        error: '認証エラー - リクエストにユーザー情報がありません'
      });
    }

    if (err.code === 'invalid_token') {
      if (err.inner && err.inner.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: '認証エラー - トークンが無効です'
        });
      }

      if (err.inner && err.inner.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: "認証エラー - トークンの有効期限が切れています"
        });
      }

      return res.status(401).json({
        error: '認証エラー - 予期しないエラーが発生しました'
      });
    }
  }

  // その他の認証エラー
  return res.status(401).json({
    error: '認証エラー - 予期しないエラーが発生しました'
  });
});

module.exports = app;
