const Guid = require("guid");
const registrationResponse = require('../models/registration/registrationResponse');
const loginResponse = require('../models/registration/loginResponse');
const mongoConnector = require("../services/mongoConnector");
const config = require("../config/collections");
const unitTypes = require("../enumerations/unitType")
const extend = require("extend");

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
	getUserById: function(userId) {
		return new Promise(function(resolve, reject) {
			mongoConnector.find({
					userId: userId
				}, config.userCollection)
				.then(result => {
					resolve(result);
				})
				.catch(err => {
					reject(err);
				})
		});
	},
	saveUserProfile: function(userId, profile, next) {
		mongoConnector.find({
			userId: userId
		}, config.userCollection, function(existingUser) {
			if (existingUser) {
				existingUser = extend(existingUser, profile);
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
	saveUserTools: function(userId, tools, next) {
		mongoConnector.find({
			userId: userId
		}, config.userCollection, function(existingUser) {
			if (existingUser) {
				existingUser.tools = tools;
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
	},
	getUsersCloseBy: function(lat, lng, userId, next) {
		var self = this;
		mongoConnector.search({
			$where: function() {
				return this.userId != userId &&
					self.farwaway(this.currentLocation.lat, this.currentLocation.lng, lat, lng) < 10;
			}
		}, config.userCollection, next, function(err) {
			console.log(err);
			throw err;
		});
	},
	farwaway: function(lat, lng, lat2, lng2) {
		var R = 6371; // Radius of the earth in km
		var dLat = this.deg2rad(lat2 - lat); // deg2rad below
		var dLon = this.deg2rad(lng2 - lng);
		var a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(this.deg2rad(lat)) * Math.cos(this.deg2rad(lat2)) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c; // Distance in km

		return Math.round(d, 2);
	},
	deg2rad: function(deg) {
		return deg * (Math.PI / 180)
	}
}
