const express = require('express');
const app = express();
const port = 8000;
const cors = require('cors');
const { Workout } = require('./models');

app.use(express.json());

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
