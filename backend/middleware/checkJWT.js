const { expressjwt: jwt } = require("express-jwt");
require('dotenv').config();

const authMiddleware = jwt({
  secret: "23d3b7c1dfc3eac7307ca97b5e345ff526e8534ae10bf1bb66f292291099910e",
  algorithms: ['HS256']
});

const usingtken = process.env.JWT_SECRET_KEY;
console.log("ミドルウェア:", usingtken);


module.exports = authMiddleware;