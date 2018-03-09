const express = require('express')
const router = express.Router();
const path = require('path');
const guid = require("guid")
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const usersDataService = require('../dataServices/usersDataService');
const imagesService = require('../services/imagesService');

router.use(function(req, res, next) {
	next();
});

router.get('/:id', function(req, res) {
	var imageId = req.params.id;
	imagesService.getImage(imageId)
		.then(result => {
			imagesService.showImage(result, res);
		}).catch(err => {
			throw err;
		});
});

router.get('/avatar/:id', function(req, res) {
	var userId = req.params.id;
	usersDataService.getUserById(userId)
		.then(user => {
			imagesService.getImage(user.avatar)
				.then(result => {
					imagesService.showImage(result, res);
				}).catch(err => {
					res.send('');
				});
		})
		.catch(err => {
			res.send('');
		})

});

router.get('/:id/static/', function(req, res) {
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

module.exports = router
