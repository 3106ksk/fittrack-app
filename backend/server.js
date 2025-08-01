require('dotenv').config();
const app = require('./app');
const port = process.env.PORT;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = app;




