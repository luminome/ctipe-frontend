const express = require('express');
const router = express.Router();
const {spawn} = require('child_process');
/* GET quotes listing. */
router.get('/', function (req, res, next) {
    try {
        let dataToSend;
        const python = spawn('python3', ['server/sample.py']);

        python.stdout.on('data', function (data) {
            console.log('Pipe data from python script ...');
            dataToSend = data.toString();
        });
        // in close event we are sure that stream from child process is closed
        python.on('close', (code) => {
            console.log(`child process close all stdio with code ${code}`);
            // send data to browser
            res.send(dataToSend);
        });

        console.log('tested');

    } catch (err) {
        res.json(err.message);
        console.error(`Error while getting what `, err.message);
        next(err);
    }
});


module.exports = router;