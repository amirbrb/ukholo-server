const express = require('express')
const router = express.Router()
const multer = require('multer')
const app = express();
const Guid = require('guid')
const fs = require('fs');
const path = require('path')
const usersDataService = require('../dataServices/usersDataService');
const sosDataService = require('../dataServices/helpDataService');
const startupData = require('../models/startupData');
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const imageServices = require('../services/imagesService');
const jwtServices = require("../services/jwtService")
const imageType = require('../enumerations/imageType');

router.get('/:id/details/', function(req, res) {
	jwtServices.validateToken(req)
		.then(() => {
			var userId = req.params.id;
			usersDataService.getUserById(userId)
				.then(response => {
					if (response) {
						delete response.password;
						res.send(jsonSuccess(response));
					}
					else {
						res.send(jsonFailure('could not find user with ID ' + userId));
					}
				})
				.catch(err => {
					res.send(jsonFailure(err));
				})
		})
		.catch(err => {
			res.send(jsonFailure(err));
		})
});

router.get('/:id/events/', function(req, res) {
	jwtServices.validateToken(req)
		.then(() => {
			var userId = req.params.id;
			sosDataService.getHelpCasesByUserId(userId)
				.then(cases => {
					res.send(jsonSuccess(cases));
				})
				.catch(err => {
					res.send(jsonFailure(err));
				});
		})
		.catch(err => {
			res.send(jsonFailure(err));
		})
});

router.get('/:id/avatar/', function(req, res) {
	jwtServices.validateToken(req)
		.then(() => {
			var userId = req.params.id;
			usersDataService.getUserById(userId)
				.then(result => {
					if (result) {
						var imageId = result.avatar;
						imageServices.getImage(imageId)
							.then(result => {
								imageServices.showImage(result, res);
							}).catch(err => {
								res.send(jsonFailure(err));
							});
					}
					else {
						res.send('');
					}
				})
				.catch(err => {
					res.send(jsonFailure(err));
				});
		})
		.catch(err => {
			res.send(jsonFailure(err));
		})
});

router.post('/:id/preferences', function(req, res) {
	jwtServices.validateToken(req)
		.then(() => {
			var userId = req.params.id;
			var preferences = JSON.parse(req.body.preferences);
			usersDataService.saveUserPreferences(userId, preferences)
				.then(response => {
					res.send(jsonSuccess(response));
				})
				.catch(err => {
					res.send(jsonFailure(err))
				});
		})
		.catch(err => {
			res.send(jsonFailure(err));
		})
});

var saveProfileData = function(userId, profileData, res) {
	usersDataService.saveUserProfile(userId, profileData)
		.then(response => {
			res.send(jsonSuccess(response));
		})
		.catch(err => {
			res.send(jsonFailure(err));
		})
}


router.post('/:id/settings/profile', imageServices.uploadService.single('avatar'),
	function(req, res) {
		jwtServices.validateToken(req)
			.then(() => {
				var avatar = null;
				var profileData = JSON.parse(req.body.settings);
				var file = req.file;
				var userId = req.params.id;
				var options = {
					userId: userId,
					imageType: imageType.avatar,
					key: Guid.create().value
				};

				imageServices.uploadSingleFile(file, options)
					.then(fileName => {
						avatar = fileName;
						if (avatar) {
							profileData.avatar = avatar;
						}
						saveProfileData(userId, profileData, res)
					})
					.catch(err => {
						avatar = null;
					})
			})
			.catch(err => {
				res.send(jsonFailure(err));
			})
	});

router.post('/:id/settings/tools', function(req, res) {
	jwtServices.validateToken(req)
		.then(() => {
			var userId = req.params.id;
			var tools = JSON.parse(req.body.selectedTools);
			usersDataService.saveUserTools(userId, tools)
				.then(response => {
					res.send(jsonSuccess(response));
				})
				.catch(err => {
					res.send(jsonFailure(err))
				});
		})
		.catch(err => {
			res.send(jsonFailure(err));
		});
});

module.exports = router;
