const Guid = require("guid");
const registrationResponse = require('../models/registration/registrationResponse');
const loginResponse = require('../models/registration/loginResponse');
const mongoConnector = require("./mongoConnector");
const config = require("./config/collections");
const unitTypes = require("../enumerations/unitType")
const extend = require("extend");
const cacheServices = require("./cacheServices");

module.exports = {
	register: function(mail, password, name, phoneNumber, avatar, next) {
		var existingUser = mongoConnector.find({
			mail: mail
		}, config.userCollection);

		if (existingUser) {
			next(registrationResponse(false, null, "sorry, provided mail is used"));
		}

		avatar = avatar || 'avatar.png';

		var guid = Guid.create();
		var user = {
			_id: guid.value,
			userId: guid.value,
			mail: mail,
			password: password,
			name: name,
			phoneNumber: phoneNumber,
			avatar: avatar,
			currentLocation: {},
			settings: {
				notificationSettings: {
					alertDistance: 5,
					showMeOnMap: false,
					onlyFriendsAlert: false
				},
				distanceUnitsType: 1,
				sosControlLocation: {},
				viewType: 1,
				mapZoomLevel: 14
			},
			unitType: unitTypes.metric,
			description: '',
			gender: 3
		};
		//insert user to db and return model
		mongoConnector.add(user, config.userCollection,
			next(registrationResponse(true, user)),
			function(err) {
				console.log(err);
				throw err;
			}
		);
	},
	login: function(mail, password, next) {

		mongoConnector.find({
			mail: mail
		}, config.userCollection, function(existingUser) {
			if (existingUser) {
				if (existingUser.password !== password)
					next(loginResponse(false, null, "sorry, password is incorrect"));
				else {
					next(loginResponse(true, existingUser));
				}
			}
			else {
				next(loginResponse(false, null, 'sorry, could not find this user'));
			}
		}, function(err) {
			console.log(err);
			throw err;
		});
	},
	getUserByName: function(mail, next) {
		mongoConnector.find({
			mail: mail
		}, config.userCollection, function(existingUser) {
			if (existingUser) {
				next(loginResponse(true, existingUser));
			}
			else {
				next(loginResponse(false, null, 'sorry, could not find this user'));
			}
		}, function(err) {
			console.log(err);
			throw err;
		});
	},
	getUserById: function(userId, next) {
		mongoConnector.find({
			userId: userId
		}, config.userCollection, function(existingUser) {
			next(existingUser);
		}, function(err) {
			console.log(err);
			throw err;
		});
	},
	saveUserPreferences: function(userId, preferences, next) {
		mongoConnector.find({
			userId: userId
		}, config.userCollection, function(existingUser) {
			if (existingUser) {
				existingUser.settings.sosControlLocation = preferences.sosControlLocation;
				existingUser.settings.viewType = preferences.viewType;
				existingUser.settings.mapZoomLevel = preferences.mapZoomLevel;
				mongoConnector.edit({
					userId: userId
				}, existingUser, config.userCollection, function(response) {
					next(response);
				}, function(err) {
					console.log(err);
					throw "an error occured updating user settings by id [id=" + userId + "]";
				});
			}
			else {
				next();
			}
		}, function(err) {
			console.log(err);
			throw err;
		});
	},
	saveUserSettings: function(userId, settings, next) {
		mongoConnector.find({
			userId: userId
		}, config.userCollection, function(existingUser) {
			if (existingUser) {
				existingUser = extend(existingUser, settings);
				mongoConnector.edit({
					userId: userId
				}, existingUser, config.userCollection, function(response) {
					next();
				}, function(err) {
					console.log(err);
					throw err;
				});
			}
			else {
				next();
			}
		}, function(err) {
			console.log(err);
			throw err;
		});
	},
	setUserLoginData: function(userId, currentLocation, registrationId, next) {
		mongoConnector.edit({
			userId: userId
		}, {
			currentLocation: currentLocation,
			registrationId: registrationId
		}, config.userCollection, next, function(err) {
			console.log(err);
			throw err;
		});
	}
}
