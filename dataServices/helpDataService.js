const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const userDataService = require('./usersDataService');
const Guid = require('guid');

var sosData = [];

module.exports = {
    addHelpCase(caseId, userId, title, description, lat, lng, images, next) {
        userDataService.getUserById(userId, function(userData) {
            if (userData) {
                sosData.push({
                    userImage: userData.imageUrl,
                    location: {
                        lat: lat,
                        lng: lng
                    },
                    title: title,
                    description: description,
                    id: caseId,
                    userId: userId,
                    images: images
                });

                next(jsonSuccess());
            }

            next(jsonFailure("could not find user with id " + userId));
        });
    },
    getHelpCases(location) {
        return sosData;
    },
    getHelpCaseById(id) {
        var existingCase = sosData.find(function(helpCase) {
            return helpCase.id === id;
        });

        if (existingCase) {
            return jsonSuccess({
                helpCase: existingCase
            })
        }

        return jsonFailure({
            message: 'could not fing case with id ' + id
        })
    }
}
