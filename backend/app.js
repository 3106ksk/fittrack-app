const express = require('express');
const app = express();
const cors = require('cors');
const authRouter = require("./routes/authRoutes");
const workouts = require('./routes/workouts');

app.use(cors({
  origin: [
    process.env.CORS_ORIGIN,
    'http://localhost:5173'
  ],
  credentials: true,
}));

app.use(express.json());
app.use("/authrouter", authRouter);
app.use("/workouts", workouts);

app.use((err, req, res, next) => {

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

  return res.status(401).json({
    error: '認証エラー - 予期しないエラーが発生しました'
  });

  return res.status(500).json({
    error: 'サーバーエラー - 予期しないエラーが発生しました'
  });
});

module.exports = app;
