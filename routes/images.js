const express = require('express')
const router = express.Router();
const path = require('path');
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const usersDataService = require('../dataServices/usersDataService');

router.use(function(req, res, next) {
	next();
});

router.get('/:id', function(req, res) {
	var file = req.params.id;
	var options = {
		root: path.join(__dirname, '../img'),
		dotfiles: 'deny',
		headers: {
			'x-timestamp': Date.now(),
			'x-sent': true
		}
	};
	res.sendFile(file, options);
});

router.get('/avatar/:id', function(req, res) {
	var userId = req.params.id;
	usersDataService.getUserById(userId, function(response) {
		if (response) {
			var imageUrl = response.avatar;
			var options = {
				root: path.join(__dirname, '../img'),
				dotfiles: 'deny',
				headers: {
					'x-timestamp': Date.now(),
					'x-sent': true
				}
			};
			res.sendFile(imageUrl, options);
		}
		else {
			res.send('');
		}
	});
});

module.exports = router
