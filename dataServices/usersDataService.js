const Guid = require("guid");
const registrationResponse = require('../models/registration/registrationResponse');
const loginResponse = require('../models/registration/loginResponse');
const mongoConnector = require("../services/mongoConnector");
const collections = require("../config/collections");
const unitTypes = require("../enumerations/unitType")
const imageTypes = require("../enumerations/imageType")
const imagesService = require("../services/imagesService");
const extend = require("extend");

module.exports = {
	register: function(mail, password, name, phoneNumber, key, avatar) {
		return new Promise(function(resolve, reject) {
			mongoConnector.find({
					mail: mail
				}, collections.userCollection)
				.then(existingUser => {
					if (existingUser) {
						resolve(registrationResponse(false, null, "sorry, provided mail is used"));
					}
				})
				.catch(err => {
					reject(err);
				});

			var user = {
				_id: key,
				userId: key,
				password: password,
				currentLocation: {},
				settings: {
					notificationSettings: {
						alertDistance: 5,
						showMeOnMap: false,
						onlyFriendsAlert: false
					},
					distanceUnitsType: 1,
				},
				preferences: {
					viewType: 1,
					mapZoomLevel: 14,
					unitType: unitTypes.metric,
					sosControlLocation: {

					},
				},
				profile: {
					mail: mail,
					avatar: avatar,
					name: name,
					phoneNumber: phoneNumber,
					description: '',
					gender: 3,
				},
				tools: []
			};
			//insert user to db and return model
			mongoConnector.add(user, collections.userCollection)
				.then(() => {
					resolve(registrationResponse(true, user));
				})
				.catch(err => {
					reject(err);
				});
		});
	},
	login: function(mail, password) {
		return new Promise(function(resolve, reject) {
			mongoConnector.find({
					"profile.mail": mail
				}, collections.userCollection)
				.then(existingUser => {
					if (existingUser) {
						if (existingUser.password !== password)
							resolve(loginResponse(false, null, "sorry, password is incorrect"));
						else {
							resolve(loginResponse(true, existingUser));
						}
					}
					else {
						resolve(loginResponse(false, null, 'sorry, could not find this user'));
					}
				})
				.catch(err => {
					reject(err);
				});
		});
	},
	getUserByName: function(mail) {
		return new Promise(function(resolve, reject) {
			mongoConnector.find({
					"profile.mail": mail
				}, collections.userCollection)
				.then(existingUser => {
					if (existingUser) {
						resolve(loginResponse(true, existingUser));
					}
					else {
						resolve(loginResponse(false, null, 'sorry, could not find this user'));
					}
				})
				.catch(err => {
					reject(err);
				});
		});
	},
	getUserById: function(userId) {
		return new Promise(function(resolve, reject) {
			mongoConnector.find({
					userId: userId
				}, collections.userCollection)
				.then(result => {
					mongoConnector.find({
							userId: userId,
							imageType: imageTypes.avatar
						}, collections.imagesCollection)
						.then(avatar => {
							result.avatar = avatar.imageId;
							resolve(result);
						}).catch(err => {
							reject(err);
						})
				})
				.catch(err => {
					reject(err);
				})
		});
	},
	saveUserProfile: function(userId, profile) {
		return new Promise(function(resolve, reject) {
			mongoConnector.edit({
				userId: userId
			}, { 
				profile: profile
			}, collections.userCollection).then(() => {
				resolve();
			})
			.catch(err => {
				reject(err);
			});
		});
	},
	saveUserTools: function(userId, tools) {
		return new Promise(function(resolve, reject) {
			mongoConnector.edit({
					userId: userId
				}, {
					tools: tools
				}, collections.userCollection)
				.then(() => {
					resolve();
				})
				.catch(err => {
					reject(err);
				})
		});
	},
	setUserLoginData: function(userId, currentLocation, registrationId) {
		return new Promise(function(resolve, reject) {
			mongoConnector.edit({
					userId: userId
				}, {
					currentLocation: currentLocation,
					registrationId: registrationId
				}, collections.userCollection)
				.then(() => {
					resolve();
				})
				.catch(err => {
					reject(err);
				})
		});
	},
	getUsersCloseBy: function(lat, lng, userId) {
		return new Promise(function(resolve, reject) {
			var self = this;
			mongoConnector.search({
					$where: function() {
						return this.userId != userId &&
							self.farwaway(this.currentLocation.lat, this.currentLocation.lng, lat, lng) < 10;
					}
				}, collections.userCollection)
				.then(result => {
					resolve(result);
				})
				.catch(err => {
					reject(err);
				})
		});
	},
	saveUserPreferences: function(userId, preferences) {
		return new Promise(function(resolve, reject) {
			mongoConnector.edit({
					userId: userId
				}, {
					preferences: preferences
				}, collections.userCollection)
				.then(() => {
					resolve();
				})
				.catch(err => {
					reject(err);
				})
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
