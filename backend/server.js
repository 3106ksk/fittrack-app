require('dotenv').config();
const app = require('./app');
const port = process.env.PORT;



const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = server;



