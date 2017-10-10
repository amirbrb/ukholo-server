module.exports = function(isSuccess, loginData, errorMessage){
	return {
		isSuccess: isSuccess,
		loginData: loginData,
		loginError: {
			message: errorMessage
		}
	}
}