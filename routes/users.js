const express = require('express')
const router = express.Router()
const multer = require('multer')
const app = express();
const Guid = require('guid')
const fs = require('fs');
const path = require('path')
const usersDataService = require('../dataServices/usersDataService');
const startupData = require('../models/startupData');
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const jwt = require('jsonwebtoken');
const config = require('../config.dev');

router.use(function(req, res, next) {
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

router.get('/details/:id', function(req, res) {
	var userId = req.params.id;
	usersDataService.getUserById(userId, function(response) {
		if (response) {
			res.send(response);
		}
		else {
			res.send('');
		}
	});
});

router.post('/settings', function(req, res) {
	var userId = req.body.userId;
	var settings = req.body.settings;
	usersDataService.saveUserSettings(userId, settings, function(response) {
		if (response.isSuccess) {
			res.send(jsonSuccess());
		}
		else {
			res.send(jsonFailure());
		}
	});
});

router.post('/prefferences', function(req, res) {
	var userId = req.body.userId;
	usersDataService.getUserPrefferences(userId, function(response) {

	});
});

router.put('/prefferences', function(req, res) {
	var userId = req.body.userId;
	var prefferences = req.body.prefferences;
	usersDataService.saveUserPrefferences(userId, prefferences, function(response) {

	});
});

module.exports = router;
