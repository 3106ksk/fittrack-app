const router = require("express").Router();
const { body, query, validationResult } = require('express-validator');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const JWT = require("jsonwebtoken")

router.post("/register",
  [body("username").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").isLength({ min: 6 }).withMessage("password is minimum 6characters")
  ], async (req, res) => {
    const { username, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const existingUser = await User.findOne({ where: { username } });

      if (existingUser) {
        return res.status(400).json([{ message: "This username is already taken" }]);
      }

      let hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ username, email, password: hashedPassword });
      return res.status(201).json({ newUser });

    } catch (error) {
      console.error("Error finding user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (!existingUser) {
      return res.status(400).json([{ message: "This user is not found" }]);
    }
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json([{ message: "Incorrect password" }]);
    }

    const token = await JWT.sign({ email }, "SECRET_KEY", { expiresIn: "24h", });

    return res.json({ token });

  } catch (error) {
    console.error("Error finding user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;