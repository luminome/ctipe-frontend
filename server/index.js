const express = require('express');
const app = express();
const config = require('./config');
const port = process.env.PORT || config.default_port;

app.use(express.static('dist'));

app.listen(port, () => {
  console.log(`sandbox app listening at http://localhost:${port}`);
});