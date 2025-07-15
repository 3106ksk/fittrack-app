require('dotenv').config();
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
      const existingEmail = await User.findOne({ where: { email } });

      if (existingEmail) {
        return res.status(409).json([{ message: "This email is already taken" }]);
      }

      let hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ username, email, password: hashedPassword });
      return res.status(201).json(newUser);

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

    const token = await JWT.sign(
      { id: existingUser.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );
    return res.json({
      token,
      user: {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email
      }
    });

  } catch (error) {
    console.error("Error finding user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decoded.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "no found user" });
    }
    return res.json(user);


  } catch (error) {
    console.error("Error finding user:", error);
    return res.status(403).json({ message: "Forbidden" });
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    const oldToken = req.headers.authorization?.split(" ")[1];
    if (!oldToken) {
      return res.status(401).json({ message: "トークンがありません" });
    }

    const decoded = JWT.verify(oldToken, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "ユーザーが見つかりません" });
    }

    const token = await JWT.sign(
      { id: user.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    return res.json({ token });
  } catch (error) {
    console.error("トークン更新エラー:", error);
    return res.status(403).json({ message: "無効なトークンです" });
  }
});

module.exports = router;