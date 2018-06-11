'use strict';

const express = require('express');
const app = express();

const config = require('../config');

module.exports = app;

// log all requests to console
app.use('/', (req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }
    console.log(new Date(), ip, req.method, req.url);
    next();
});

app.use('/static', express.static(config.static));

app.get('/', function(req, res) {
	res.sendFile(config.views + 'index.html');
})