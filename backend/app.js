const express = require('express');
const app = express();
const cors = require('cors');
const authRouter = require("./routes/authRoutes");
const workouts = require('./routes/workouts');

app.use(cors({
  origin: process.env.CORS_ORIGIN
}));

app.use(express.json());
app.use("/authrouter", authRouter);
app.use("/workouts", workouts);

module.exports = app;
