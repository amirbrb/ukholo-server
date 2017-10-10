module.exports = function(firstName, lastName, avatar, uid){
	return {
		"fullName": firstName + ' ' + lastName,
		"imageUrl": avatar,
		"userId": uid
	}
}