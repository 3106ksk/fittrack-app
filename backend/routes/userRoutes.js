const router = require("express").Router();
const { body, query, validationResult } = require('express-validator');


router.get("/", (req, res) => {
  res.send("hello");
});

router.post("/users",
  [body("username").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("passward").isLength({ min: 6 }).withMessage("Passward is minimum 6characters")
  ], (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const passward = req.body.passward;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

  });


module.exports = router;