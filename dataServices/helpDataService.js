const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const userDataService = require('./usersDataService');
const mongoConnector = require("./mongoConnector");
const config = require("./config/collections");

module.exports = {
    addHelpCase(caseId, userId, title, description, lat, lng, images, next) {
        userDataService.getUserById(userId, function(userData) {
            if (userData) {
                var created = new Date();
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
                    images: images,
                    isActive: true,
                    created: created,
                }, config.casesCollection, function(result) {
                    next(jsonSuccess());
                }, function(err) {
                    console.log(err);
                    throw "an error occured adding case data to db";
                });
            }
            else {
                next(jsonFailure("could not find user with id " + userId));
            }
        });
    },
    getHelpCases(location, userId, next) {
        mongoConnector.findAll(config.casesCollection,
            function(data) {
                data = data || [];
                data = data.filter(function(d) {
                    return d.userId !== userId;
                });
                next(data || []);
            },
            function(error) {
                console.log(error);
                throw "an error occured querying case data";
            });
    },
    getHelpCaseById(id, next) {
        mongoConnector.find({
            id: id
        }, config.casesCollection, function(existingCase) {
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
                senderId: user.userId,
                text: text,
                timestamp: timestamp
            }, config.chatCollection, function(result) {
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
        }, config.chatCollection, function(messages) {
            next(messages);
        }, function(error) {
            console.log(error);
            throw "an error occured querying case messages";
        });
    }
}
