const express = require('express');
const app = express();
const port = 8000;
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Workout, User } = require('./models');
const authRouter = require("./routes/authRoutes");
const crypto = require('crypto');
const workouts = require('./routes/workouts');
const goalRouter = require('./routes/goalRoutes');
require('dotenv').config();

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());
app.use("/authrouter", authRouter);
app.use("/workouts", workouts);
app.use("/goals", goalRouter);





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
