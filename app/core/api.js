'use strict';

const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

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

	app.get('/api/raiders', function(req, res) {
		fs.readFile(config.files.raiders, 'utf8', function(err, data) {
			if(err) throw err;
			res.json(JSON.parse(data));
		})
	})

	app.post('/api/raiders', function(req, res) {
		fs.readFile(config.files.raiders, 'utf8', function(err, data) {
			if(err) throw err;
			data = JSON.parse(data);
			data = data.concat(req.body);
			fs.writeFile(config.files.raiders, JSON.stringify(data, null, 4), function(err) {
				if(err) throw err;
				res.json(data);
			})
		})
	})

	app.delete('/api/raider/:name', function(req, res) {
		fs.readFile(config.files.raiders, 'utf8', function(err, data) {
			if(err) throw err;
			data = JSON.parse(data);
			let found = false;
			data.forEach(function(raider, key) {
				if(raider.name.toLowerCase() == req.params.name) {
					data.splice(key, 1);
					found = true;
				}
			})
			if(found) {
				fs.writeFile(config.files.raiders, JSON.stringify(data, null, 4), function(err) {
					if(err) throw err;
					res.json(data);
				})
			}
			else {
				res.sendStatus(404);
			}
		})
	})
}