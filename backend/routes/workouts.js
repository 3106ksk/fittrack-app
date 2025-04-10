const router = require("express").Router();
const { User } = require("../models");
const authMiddleware = require("../middleware/checkJWT");

router.post('/workouts', authMiddleware, async (req, res) => {

  router.get('/userworkout', authMiddleware, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized - No user data in request" });
    }
    const userId = req.user.id;

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const workouts = await user.getWorkouts();
      res.json(workouts);
    } catch (error) {
      console.error("Error in /userworkout:", error);
      res.status(500).json({ error: error.message });
    }
  });

  module.exports = router;