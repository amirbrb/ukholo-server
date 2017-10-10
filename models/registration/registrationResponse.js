module.exports = function(isSuccess, registrationData, errorMessage){
	return {
		isSuccess: isSuccess,
		registrationData: registrationData,
		registrationError: {
			message: errorMessage
		}
	}
}