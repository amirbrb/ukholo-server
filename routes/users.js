const express = require('express')
const router = express.Router()
const multer = require('multer')
const app = express();
const Guid = require('guid')
const fs = require('fs');
const path = require('path')
const jwt = require('jsonwebtoken');
const usersDataService = require('../dataServices/usersDataService');
const sosDataService = require('../dataServices/helpDataService');
const startupData = require('../models/startupData');
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const imageServices = require('../services/imagesService');

var validateToken = function(req, res, next) {
	var token = req.query.mb_token || req.body.mb_token || req.headers.mb_token;
	if (token) {
		jwt.verify(token, app.get('tokenSecret'), function(err, decoded) {
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

router.get('/cases/:id', function(req, res) {
	validateToken(req, res, function() {
		var userId = req.params.id;
		sosDataService.getHelpCasesByUserId(userId, function(cases) {
			res.send(cases);
		})
	})
});

router.post('/settings/profile', function(req, res) {
	validateToken(req, res, function() {
		req.uploadKey = Guid.create();
		upload(req, res, function(err) {
			var userId = req.body.userId;
			var profileData = JSON.parse(req.body.settings);
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

				profileData.avatar = userAvatar;
			}

			usersDataService.saveUserProfile(userId, profileData, function(response) {
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

router.post('/settings/tools', function(req, res) {
	validateToken(req, res, function() {
		req.uploadKey = Guid.create();
		upload(req, res, function(err) {
			var userId = req.body.userId;
			var selectedTools = req.body.selectedTools.split(',');
			var avatar = null
			usersDataService.saveUserTools(userId, selectedTools, function(response) {
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
