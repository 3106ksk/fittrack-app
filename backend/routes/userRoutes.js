const router = require("express").Router();
const { body, query, validationResult } = require('express-validator');
const { User } = require('../models');
const bcrypt = require('bcrypt');



router.post("/register",
  [body("username").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("passward").isLength({ min: 6 }).withMessage("Passward is minimum 6characters")
  ], async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const passward = req.body.passward;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findOne({
        where: {
          username: username,
          email: email,
        }
      });

      if (user) {
        return res.status(400).json([
          {
            message: "this user is already existed",
          }
        ])
      }

    } catch (error) {
      console.error("Error finding user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }



  });


module.exports = router;