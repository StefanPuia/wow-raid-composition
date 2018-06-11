'use strict';

const path = require('path');

module.exports = {
	files: {
		classes: path.join(__dirname, '../data/classes.json'),
		raiders: path.join(__dirname, '../data/raiders.json')
	},

	views: path.join(__dirname, '../views/'),

	static: path.join(__dirname, '../../static')
}