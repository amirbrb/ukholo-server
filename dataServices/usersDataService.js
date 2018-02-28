const Guid = require("guid");
const registrationResponse = require('../models/registration/registrationResponse');
const loginResponse = require('../models/registration/loginResponse');
const mongoConnector = require("../services/mongoConnector");
const collections = require("../config/collections");
const unitTypes = require("../enumerations/unitType")
const extend = require("extend");

module.exports = {
	register: function(mail, password, name, phoneNumber, avatar) {
		return new Promise(function(resolve, reject){
			mongoConnector.find({
				mail: mail
			}, collections.userCollection)
				.then(existingUser=> {
					if (existingUser) {
						resolve(registrationResponse(false, null, "sorry, provided mail is used"));
					}	
				})
				.catch(err=> {
					reject(err);
				});

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
			mongoConnector.add(user, collections.userCollection)
				.then(()=>{
					resolve(registrationResponse(true, user));
				})
				.catch(err=> {
					reject(err);
				});
		});
	},
	login: function(mail, password) {
		return new Promise(function(resolve, reject){
			mongoConnector.find({
				mail: mail
			}, collections.userCollection)
			.then(existingUser=> {
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
			.catch(err=> {
				reject(err);
			});
		});
	},
	getUserByName: function(mail) {
		return new Promise(function(resolve, reject){
			mongoConnector.find({
				mail: mail
			}, collections.userCollection)
			.then(existingUser=> {
				if (existingUser) {
					resolve(loginResponse(true, existingUser));
				}
				else {
					resolve(loginResponse(false, null, 'sorry, could not find this user'));
				}
			})
			.catch(err=> {
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
					resolve(result);
				})
				.catch(err => {
					reject(err);
				})
		});
	},
	saveUserProfile: function(userId, profile) {
		return new Promise(function(resolve, reject) {
			mongoConnector.find({
				userId: userId
			}, collections.userCollection)
				.then(existingUser => {
					if (existingUser) {
						existingUser = extend(existingUser, profile);
						mongoConnector.edit({
							userId: userId
						}, existingUser, collections.userCollection)
							.then(()=>{
								resolve();
							})
							.cacth(err=> {
								reject(err);
							});
					}
					else {
						reject('could not find user with ID [' + userId +']');
					}
				})
				.catch(err => {
					reject(err);
				})
		});
	},
	saveUserTools: function(userId, tools) {
		return new Promise(function(resolve, reject){
			mongoConnector.find({
				userId: userId
			}, collections.userCollection)
				.then(existingUser=> {
					if (existingUser) {
						existingUser.tools = tools;
						mongoConnector.edit({
							userId: userId
						}, existingUser, collections.userCollection)
							.then(() => {
								resolve()
							})
							.catch(err=> {
								reject(err);
							});
					}
					else {
						reject('could not find user with ID [' + userId +']');
					}	
				})
		});
	},
	setUserLoginData: function(userId, currentLocation, registrationId) {
		return new Promise(function(resolve, reject){
			mongoConnector.edit({
				userId: userId
			}, {
				currentLocation: currentLocation,
				registrationId: registrationId
			}, collections.userCollection)
				.then(()=> {
					resolve();
				})
				.catch(err=> {
					reject(err);
				})
		});
	},
	getUsersCloseBy: function(lat, lng, userId, next) {
		return new Promise(function(resolve, reject){
			var self = this;
			mongoConnector.search({
				$where: function() {
					return this.userId != userId &&
						self.farwaway(this.currentLocation.lat, this.currentLocation.lng, lat, lng) < 10;
				}
			}, collections.userCollection)
				.then(result=> {
					resolve(result);
				})
				.catch(err=> {
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
