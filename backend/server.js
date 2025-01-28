const express = require('express');
const app = express();
const port = 8000;
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Workout, User } = require('./models');
const userRouter = require("./routes/userRoutes");

app.use(express.json());
app.use("/userrouter", userRouter);

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.get('/workouts', async (req, res) => {
  try {
    const workouts = await Workout.findAll();
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
