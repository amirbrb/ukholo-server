const express = require('express')
const router = express.Router()
const multer = require('multer')
const app = express();
const Guid = require('guid')
const fs = require('fs');
const path = require('path')
const usersDataService = require('../dataServices/usersDataService');
const helpDataService = require('../dataServices/helpDataService');
const startupData = require('../models/startupData');
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const imageServices = require('../dataServices/imagesService');
const jwt = require('jsonwebtoken');
const config = require('../config.dev');


var validateToken = function(req, res, next) {
	var token = req.query.mb_token || req.body.mb_token || req.headers.mb_token;
	if (token) {
		jwt.verify(token, config.tokenSecret, function(err, decoded) {
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });
			}
			else {
				next();
			}
		});
	}
	else {
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});

	}
}

var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, 'img/');
	},
	filename: function(req, file, callback) {
		var fileName = req.uploadKey.value + file.originalname;
		callback(null, fileName);
	}
});

var upload = multer({ storage: storage }).any();

router.get('/details/:id', function(req, res) {
	validateToken(req, res, function() {
		var userId = req.params.id;
		usersDataService.getUserById(userId, function(response) {
			if (response) {
				delete response.password;
				res.send(response);
			}
			else {
				res.send('');
			}
		});
	})
});

router.get('/events/:id', function(req, res) {
	validateToken(req, res, function() {
		var userId = req.params.id;
		helpDataService.getHelpCasesByUserId(userId, function(response) {
			if (response) {
				res.send(jsonSuccess(response));
			}
			else {
				res.send(jsonFailure());
			}
		});
	})
});

router.post('/preferences', function(req, res) {
	var userId = req.body.userId;
	var userPreferences = JSON.parse(req.body.settings);
	usersDataService.saveUserPreferences(userId, userPreferences, function(response) {
		if (response) {
			res.send(jsonSuccess());
		}
		else {
			res.send(jsonFailure());
		}
	});
})

router.post('/settings', function(req, res) {
	validateToken(req, res, function() {
		req.uploadKey = Guid.create();
		upload(req, res, function(err) {
			var userId = req.body.userId;
			var userData = JSON.parse(req.body.settings);
			var avatar = null;
			if (req.files && req.files.length > 0) {
				var userAvatar = req.files.map(img => {
					imageServices.uploadImage(img,
						function(response) {

						},
						function(error) {

						});
					return img.filename
				})[0];

				userData.avatar = userAvatar;
			}

			usersDataService.saveUserSettings(userId, userData, function(response) {
				if (response.isSuccess) {
					res.send(jsonSuccess());
				}
				else {
					res.send(jsonFailure());
				}
			});
		});
	});
});

module.exports = router;
