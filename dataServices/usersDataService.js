const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const userModel = require('../models/user');
const Guid = require("guid");
const registrationResponse = require('../models/registration/registrationResponse');
const loginResponse = require('../models/registration/loginResponse');
const mongoConnector = require("./mongoConnector");
const USERS_COLLECTION = "users";


const loginType = {
	mail: 1,
	google: 2,
	facebook: 3
}

var usersData = [];

module.exports = {
	register: function(mail, password, firstName, lastName, phoneNumber, avatar, next) {
		var existingUser = mongoConnector.find({
			mail: mail
		}, USERS_COLLECTION);

		if (existingUser) {
			next(registrationResponse(false, null, "sorry, provided mail is used"));
		}


		var guid = Guid.create();
		//insert user to db and return model
		var user = userModel(firstName, lastName, avatar, guid.value, {
			sosControlLocation: {}
		});

		mongoConnector.add({
			_id: guid.value,
			uid: guid.value,
			mail: mail,
			password: password,
			firstName: firstName,
			lastName: lastName,
			phoneNumber: phoneNumber,
			avatar: avatar || 'avatar.png',
			settings: {
				loginType: loginType.mail,
				sosControlLocation: {

				},
				showLocation: false,
				viewType: 1,
				mapZoomLevel: 14
			}
		}, USERS_COLLECTION, function() {
			next(registrationResponse(true, user));
		}, function(err) {
			console.log(err);
			throw "an error occured registering user [mail=" + mail + "]";
		});
	},
	login: function(mail, password, next) {

		mongoConnector.find({
			mail: mail
		}, USERS_COLLECTION, function(existingUser) {
			if (existingUser) {
				if (existingUser.password !== password)
					next(loginResponse(false, null, "sorry, password is incorrect"));
				else {
					var imageUrl = existingUser.avatar;
					var user = userModel(existingUser.firstName, existingUser.lastName, imageUrl, existingUser.uid, {
						sosControlLocation: existingUser.settings.sosControlLocation,
						viewType: existingUser.settings.viewType,
						mapZoomLevel: existingUser.settings.mapZoomLevel
					})
					next(loginResponse(true, user));
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

		var existingUser = mongoConnector.find({
			mail: mail
		}, USERS_COLLECTION, function(existingUser) {
			if (existingUser) {
				var imageUrl = '/images/' + existingUser.avatar;
				var user = userModel(existingUser.firstName, existingUser.lastName, imageUrl, existingUser.uid, {
					sosControlLocation: existingUser.settings.sosControlLocation,
					viewType: existingUser.settings.viewType,
					mapZoomLevel: existingUser.settings.mapZoomLevel
				})
				next(loginResponse(true, user));
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
		var existingUser = mongoConnector.find({
			uid: userId
		}, USERS_COLLECTION, function(existingUser) {
			if (existingUser) {
				var imageUrl = existingUser.avatar;
				var user = userModel(existingUser.firstName, existingUser.lastName, imageUrl, existingUser.uid, {
					sosControlLocation: existingUser.settings.sosControlLocation,
					viewType: existingUser.settings.viewType,
					mapZoomLevel: existingUser.settings.mapZoomLevel
				})
				next(user);
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
		var existingUser = mongoConnector.find({
			uid: userId
		}, USERS_COLLECTION, function(existingUser) {
			if (existingUser) {
				existingUser.settings = settings;
				mongoConnector.edit({
					uid: userId
				}, existingUser, USERS_COLLECTION, function(response) {
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
	}
}
