const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const userDataService = require('./usersDataService');
const Guid = require('guid');
const mongoConnector = require("./mongoConnector");
const CASES_COLLECTION = "cases";
const CHAT_COLLECTION = "chat";

module.exports = {
    addHelpCase(caseId, userId, title, description, lat, lng, images, next) {
        userDataService.getUserById(userId, function(userData) {
            if (userData) {

                mongoConnector.add({
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
                }, CASES_COLLECTION, function(result) {
                    next(jsonSuccess());
                }, function(err) {
                    console.log(err);
                    throw "an error occured adding case data to db";
                });
            }

            next(jsonFailure("could not find user with id " + userId));
        });
    },
    getHelpCases(location, next) {
        mongoConnector.findAll(CASES_COLLECTION,
            function(data) {
                next(data || []);
            },
            function(error) {
                console.log(error);
                throw "an error occured querying case data";
            });
    },
    getHelpCaseById(id, next) {
        var existingCase = mongoConnector.find({
            id: id
        }, CASES_COLLECTION, function(existingCase) {
            if (existingCase) {
                next(jsonSuccess({
                    helpCase: existingCase
                }));
            }
            else {
                next(jsonFailure({
                    message: 'could not fing case with id ' + id
                }));
            }
        }, function(error) {
            console.log(error);
            throw "an error occured querying case data";
        });
    },
    addCaseMessage(caseId, text, sender, timestamp, next) {
        userDataService.getUserById(sender, function(user) {
            mongoConnector.add({
                caseId: caseId,
                sender: user.fullName,
                senderId: user.userId,
                text: text,
                timestamp: timestamp
            }, CHAT_COLLECTION, function(result) {
                next(result);
            }, function(error) {
                console.log(error);
                throw "an error occured adding case chat message";
            });
        });
    },
    getCaseMessages(id, lastQuery, next) {
        mongoConnector.search({
            caseId: id,
            timestamp: { $gt: lastQuery }
        }, CHAT_COLLECTION, function(messages) {
            next(messages);
        }, function(error) {
            console.log(error);
            throw "an error occured querying case messages";
        });
    }
}
