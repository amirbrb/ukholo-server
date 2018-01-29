const express = require('express')
const router = express.Router();
const path = require('path');
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const usersDataService = require('../dataServices/usersDataService');
const imagesService = require('../dataServices/imagesService');

router.use(function(req, res, next) {
	next();
});

var showImage = function(result, res) {
	if (result) {
		res.setHeader('content-type', result.contentType);
		var thumb = new Buffer(result.img, 'base64');
		res.send(thumb);
	}
	else {
		res.send('');
	}
}

router.get('/:id', function(req, res) {
	var imageId = req.params.id;
	imagesService.getImage(imageId, function(result) {
		showImage(result, res);
	})
});

router.get('/static/:id', function(req, res) {
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
			var imageId = response.avatar;
			imagesService.getImage(imageId, function(result) {
				showImage(result, res);
			})
		}
		else {
			res.send('');
		}
	});
});

module.exports = router
