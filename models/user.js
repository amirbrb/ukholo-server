module.exports = function(firstName, lastName, avatar, uid, userSettings){
	return {
		"fullName": firstName + ' ' + lastName,
		"imageUrl": avatar,
		"userId": uid,
		"settings": userSettings
	}
}