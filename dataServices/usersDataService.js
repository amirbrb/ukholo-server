const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const userModel = require('../models/user');
const registrationResponse = require('../models/registration/registrationResponse');
const loginResponse = require('../models/registration/loginResponse');


const loginType = {
	mail: 1,
	google: 2,
	facebook: 3
}

var usersData = [];

module.exports = {
	register: function(mail, password, firstName, lastName, phoneNumber) {
		var existingUser = usersData.find(function(user) {
			return user.mail === mail;
		});

		if (existingUser) {
			return registrationResponse(false, null, "sorry, provided mail is used");
		}

		//insert user to db and return model
		var userId = usersData.length + 1;
		var user = userModel(firstName, lastName, null, userId, {
			sosControlLocation: {}
		});

		usersData.push({
			uid: userId,
			mail: mail,
			password: password,
			firstName: firstName,
			lastName: lastName,
			phoneNumber: phoneNumber,
			avatar: null,
			showLocation: false,
			settings: {
				loginType: loginType.mail,
				sosControlLocation: {

				}
			}
		})

		return registrationResponse(true, user);
	},
	login: function(mail, password) {

		var existingUser = usersData.find(function(user) {
			return user.mail === mail;
		});

		if (existingUser) {
			if (existingUser.password !== password)
				return loginResponse(false, null, "sorry, password is incorrect");
			else {
				var imageUrl = '/images/user/' + existingUser.uid + '/' + existingUser.avatar;
				var user = userModel(existingUser.firstName, existingUser.lastName, imageUrl, existingUser.uid, {
					sosControlLocation: existingUser.settings.sosControlLocation
				})
				return loginResponse(true, user);
			}
		}
		else {
			return loginResponse(false, null, 'sorry, could not find this user');
		}
	},
	getUserByName: function(mail) {

		var existingUser = usersData.find(function(user) {
			return user.mail === mail;
		});

		if (existingUser) {
			var imageUrl = existingUser.avatar ?
				'/user/' + existingUser.uid + '/' + existingUser.avatar :
				'/avatar.png';
			var user = userModel(existingUser.firstName, existingUser.lastName, imageUrl, existingUser.uid, {
				sosControlLocation: existingUser.settings.sosControlLocation
			})
			return loginResponse(true, user);
		}
		else {
			return loginResponse(false, null, 'sorry, could not find this user');
		}
	},
	getUserById: function(userId) {

		var existingUser = usersData.find(function(user) {
			return user.uid === parseInt(userId);
		});

		if (existingUser) {
			var imageUrl = existingUser.avatar ?
				'/user/' + existingUser.uid + '/' + existingUser.avatar :
				'/avatar.png';
			var user = userModel(existingUser.firstName, existingUser.lastName, imageUrl, existingUser.uid, {
				sosControlLocation: existingUser.settings.sosControlLocation
			})
			return user;
		}
		else {
			return null;
		}
	},
	saveUserSettings: function(userId, settings) {
		var existingUser = usersData.find(function(user) {
			return user.uid === userId;
		});

		if (existingUser) {
			existingUser.settings = settings;
			return jsonSuccess();
		}
		else {
			return jsonFailure();
		}
	}
}
