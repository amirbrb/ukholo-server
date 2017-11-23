const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const Guid = require("guid");
const registrationResponse = require('../models/registration/registrationResponse');
const loginResponse = require('../models/registration/loginResponse');
const mongoConnector = require("./mongoConnector");
const config = require("./config/collections");

const loginType = {
	mail: 1,
	google: 2,
	facebook: 3
};

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
				alerts: {
					distance: 10000
				},
				sosControlLocation: {},
				viewType: 1,
				mapZoomLevel: 14
			},
			description: '',
			gender: 3
		};
		//insert user to db and return model
		mongoConnector.add(user, config.userCollection,
			next(registrationResponse(true, user)),
			function(err) {
				console.log(err);
				throw "an error occured registering user [mail=" + mail + "]";
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
			throw "an error occured logging user [mail=" + mail + "]";
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
			throw "an error occured getting user by name [mail=" + mail + "]";
		});
	},
	getUserById: function(userId, next) {
		mongoConnector.find({
			userId: userId
		}, config.userCollection, function(existingUser) {
			if (existingUser) {
				next(existingUser);
			}
			else {
				next();
			}
		}, function(err) {
			console.log(err);
			throw "an error occured getting user by id [id=" + userId + "]";
		});
	},
	saveUserSettings: function(userId, settings, next) {
		mongoConnector.find({
			uid: userId
		}, config.userCollection, function(existingUser) {
			if (existingUser) {
				existingUser.settings = settings;
				mongoConnector.edit({
					uid: userId
				}, existingUser, config.userCollection, function(response) {
					next(jsonSuccess());
				}, function(err) {
					console.log(err);
					throw "an error occured updating user settings by id [id=" + userId + "]";
				});
			}
			else {
				next(jsonFailure());
			}
		}, function(err) {
			console.log(err);
			throw "an error occured saving settings for user [id=" + userId + "]";
		});
	},
	setUserLoginData: function(userId, currentLocation, registrationId, next) {
		mongoConnector.edit({
			uid: userId
		}, {
			currentLocation: currentLocation,
			registrationId: registrationId
		}, config.userCollection, next, function(err) {
			console.log(err);
			throw "an error occured saving post login data for user [id=" + userId + "]";
		});
	}
}
