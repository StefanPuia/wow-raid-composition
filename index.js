'use strict';

const app = require('./app/core/express');
const api = require('./app/core/api')(app);

app.listen(8085, function() {
	console.log("Listening on 8085.");
})