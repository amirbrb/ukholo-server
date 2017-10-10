const jsonSuccess = require('../models/jsonSuccess');
const userModel = require('../models/user');
const registrationResponse = require('../models/registration/registrationResponse');
const loginResponse = require('../models/registration/loginResponse');

const mockUserData = [{
	"uid": "1",
	"mail": "amirbrb@gmail.com", 
	"password": "aaa", 
	"firstName": "amir",
	"lastName": "mishori",
	"phoneNumber": "0547772344",
	"avatar": "avatar.jpg",
	"showLocation": false,
}];

module.exports = {
	register: function(mail, password, firstName, lastName, phoneNumber){
		
		var existingUser = mockUserData.find(function(user){
			return user.mail === mail;
		});

		if(existingUser){
			return registrationResponse(false, null, "sorry, provided mail is used");	
		}

		//insert user to db and return model
		let userId = mockUserData.length + 1;
		let user = userModel(firstName, lastName, 'avatar.png', userId);
		return registrationResponse(true, user);
	},
	login: function(mail, password){
		
		var existingUser = mockUserData.find(function(user){
			return user.mail === mail;
		});

		if(existingUser){
			if(existingUser.password !== password)
				return loginResponse(false, null, "sorry, password is incorrect");	
			else
			{
				let user = userModel(existingUser.firstName, existingUser.lastName, existingUser.avatar, existingUser.uid)
				return loginResponse(true, user);	
			}
		}else{
			return loginResponse(false, null, 'sorry, could not find this user');	
		}
	}
}