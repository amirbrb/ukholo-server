const express = require('express')
const router = express.Router()
const fs = require('fs');
const path = require('path')
const usersDataService = require('../dataServices/usersDataService');
const startupData = require('../models/startupData');
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');

router.use(function(req, res, next) {
	next();
});

router.post('/register', function(req, res) {
	var mail = req.body.mail;
	var password = req.body.password;
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var phoneNumber = req.body.phoneNumber;

	var registrationResponse = usersDataService.register(mail, password, firstName, lastName, phoneNumber);
	if (registrationResponse.isSuccess) {
		debugger;
		var dir = path.resolve('./img/users/' + registrationResponse.registrationData.userId);

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		res.send(jsonSuccess(startupData(registrationResponse.registrationData)))
	}
	else {
		res.send(jsonFailure(registrationResponse.registrationError))
	}
});

router.post('/login', function(req, res) {
	var mail = req.body.mail;
	var password = req.body.password;

	var loginResponse = usersDataService.login(mail, password);
	if (loginResponse.isSuccess) {
		res.send(jsonSuccess(startupData(loginResponse.loginData)))
	}
	else {
		res.send(jsonFailure(loginResponse.loginError))
	}

});

router.post('/relogin', function(req, res) {
	var mail = req.body.mail;
	var loginResponse = usersDataService.getUserByName(mail);
	if (loginResponse.isSuccess) {
		res.send(jsonSuccess(startupData(loginResponse.loginData)))
	}
	else {
		res.send(jsonFailure(loginResponse.loginError))
	}
});

router.post('/settings', function(req, res) {
	var userId = req.body.userId;
	var settings = req.body.settings;
	var response = usersDataService.saveUserSettings(userId, settings);
	if (response.isSuccess) {
		res.send(jsonSuccess());
	}
	else {
		res.send(jsonFailure());
	}
});

module.exports = router
