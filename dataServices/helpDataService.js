const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const userDataService = require('./usersDataService');
const Guid = require('guid');

var sosData = [];

module.exports = {
    addHelpCase(userId, title, description, lat, lng) {
        var userData = userDataService.getUserById(userId);
        if (userData) {
            var guid = Guid.create();
            sosData.push({
                userImage: userData.imageUrl,
                location: {
                    lat: lat,
                    lng: lng
                },
                title: title,
                description: description,
                id: guid
            });

            return jsonSuccess();
        }

        return jsonFailure("could not find user with id " + userId);
    },
    getHelpCases(location) {
        return sosData;
    }
}
