const express = require('express');
const app = express();
const config = require('./config');
const port = process.env.PORT || config.default_port;
const pack = require('../package.json');

app.use(express.static('dist'));
app.use(express.static('static'));


// const map_router = require('./handler.js');
// console.log(map_router);

//#app.use('/test', map_router);


// app.get('/what', (req, res) => {
//  // var dataToSend;
//  // // spawn new child process to call the python script
//  // const python = spawn('python', ['script1.py']);
//   console.log(req);
// });


app.listen(port, () => {
  console.log(`${pack.name} app listening at http://localhost:${port}`);
});
