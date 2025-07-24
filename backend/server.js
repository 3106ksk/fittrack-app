const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT;
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authRouter = require("./routes/authRoutes");
const workouts = require('./routes/workouts');

app.use(cors({
  origin: process.env.CORS_ORIGIN
}));

app.use(express.json());
app.use("/authrouter", authRouter);
app.use("/workouts", workouts);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
