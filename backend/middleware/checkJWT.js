const { expressjwt: jwt } = require("express-jwt");
require('dotenv').config();

const authMiddleware = jwt({
  secret: process.env.JWT_SECRET_KEY,
  algorithms: ['HS256'],
  requestProperty: 'user'
});


module.exports = authMiddleware;