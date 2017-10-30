const express = require('express')
const router = express.Router()
const multer = require('multer')
const Guid = require('guid')
const fs = require('fs');
const path = require('path')
const usersDataService = require('../dataServices/usersDataService');
const startupData = require('../models/startupData');
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');

router.use(function(req, res, next) {
	next();
});

var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, 'img/');
	},
	filename: function(req, file, callback) {
		var key = req.registrationKey.value
		var fileName = key + '_' + file.originalname;
		callback(null, fileName);
	}
});

var upload = multer({ storage: storage }).any();

router.post('/register', function(req, res) {
	req.registrationKey = Guid.create();
	upload(req, res, function(err) {
		var userAvatar = req.files.map(img => {
			return img.filename
		})[0];

		var mail = req.body.mail;
		var password = req.body.password;
		var firstName = req.body.firstName;
		var lastName = req.body.lastName;
		var phoneNumber = req.body.phoneNumber;
		var registrationId = req.body.gcmRegistrationId;
		console.log(registrationId);
		var registrationResponse = usersDataService.register(mail, password, firstName, lastName, phoneNumber, userAvatar, function(registrationResponse) {
			if (registrationResponse.isSuccess) {
				res.send(jsonSuccess(startupData(registrationResponse.registrationData)))
			}
			else {
				res.send(jsonFailure(registrationResponse.registrationError))
			}
		});
	})
});

router.post('/login', function(req, res) {
	var mail = req.body.mail;
	var password = req.body.password;
	var registrationId = req.body.gcmRegistrationId;
	console.log(registrationId);
	usersDataService.login(mail, password, function(loginResponse) {
		if (loginResponse.isSuccess) {
			res.send(jsonSuccess(startupData(loginResponse.loginData)))
		}
		else {
			res.send(jsonFailure(loginResponse.loginError))
		}
	});
});

router.post('/relogin', function(req, res) {
	var mail = req.body.mail;
	var registrationId = req.body.gcmRegistrationId;
	var loginResponse = usersDataService.getUserByName(mail, function(loginResponse) {
		if (loginResponse.isSuccess) {
			res.send(jsonSuccess(startupData(loginResponse.loginData)))
		}
		else {
			res.send(jsonFailure(loginResponse.loginError))
		}
	});
});

router.post('/settings', function(req, res) {
	var userId = req.body.userId;
	var settings = req.body.settings;
	var response = usersDataService.saveUserSettings(userId, settings, function(response) {
		if (response.isSuccess) {
			res.send(jsonSuccess());
		}
		else {
			res.send(jsonFailure());
		}
	});
});

router.get('/:id', function(req, res) {
	var userId = req.params.id;
	var response = usersDataService.getUserById(userId, function(response) {
		if (response.isSuccess) {
			res.send(jsonSuccess());
		}
		else {
			res.send(jsonFailure());
		}
	});
});

module.exports = router
