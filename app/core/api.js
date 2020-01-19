'use strict';

const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const sha256 = require('sha256');

const config = require('../config');


let classes = {};

fs.readFile(config.files.classes, 'utf8', function(err, data) {
	if(err) throw err;
	classes = JSON.parse(data);
})

module.exports = function(app) {
	app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

	app.get('/api/classes', function(req, res) {
		res.json(classes);
	})

	app.get('/api/build/:hash', function(req, res) {
		fs.readFile(config.files.raiders, 'utf8', function(err, data) {
			if(err) throw err;
			data = JSON.parse(data);
			if(data[req.params.hash]){
				res.json(data[req.params.hash]);
			}
			else {
				res.sendStatus(404);
			}
		})
	})

	app.post('/api/build', function(req, res) {
		fs.readFile(config.files.raiders, 'utf8', function(err, data) {
			if(err) throw err;
			data = JSON.parse(data);
			let hash = sha256(req.body.export).substr(0, 7);
			if(data[hash]) hash = sha256(hash).substr(0, 8);
			data[hash] = req.body.export;
			fs.writeFile(config.files.raiders, JSON.stringify(data), function(err) {
				if(err) throw err;
				res.json({hash: hash});
			})
		})
	})
}