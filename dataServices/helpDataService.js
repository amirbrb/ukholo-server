const userDataService = require('./usersDataService');
const mongoConnector = require("./mongoConnector");
const config = require("./config/collections");
const notifier = require("./notifierService")

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
                    next(result);
                }, function(err) {
                    console.log(err);
                    throw err;
                });
            }
            else {
                next("could not find user with id " + userId);
            }
        });
    },
    getHelpCases(location, userId, next) {
        mongoConnector.search({
                userId: { $ne: userId }
            }, config.casesCollection,
            function(data) {
                next(data);
            },
            function(error) {
                console.log(error);
                throw error;
            });
    },
    getHelpCaseById(id, next) {
        mongoConnector.find({
            id: id
        }, config.casesCollection, function(existingCase) {
            if (existingCase) {
                mongoConnector.search({
                    caseId: id,
                }, config.chatCollection, function(messages) {
                    existingCase.messages = messages;
                    userDataService.getUserById(existingCase.userId, function(user) {
                        existingCase.user = user;
                        next(existingCase);
                    });
                }, function(error) {
                    console.log(error);
                    throw error;
                })
            }
            else {
                next({
                    message: 'could not fing case with id ' + id
                });
            }
        }, function(error) {
            console.log(error);
            throw error;
        });
    },
    getHelpCasesByUserId(userId, next) {
        mongoConnector.search({
            userId: userId
        }, config.casesCollection, function(existingCase) {
            next(existingCase);
        }, function(error) {
            console.log(error);
            throw error;
        });
    },
    addCaseMessage(caseId, text, sender, timestamp, next) {
        this.getHelpCaseById(caseId, function(caseData) {
            mongoConnector.add({
                caseId: caseId,
                senderId: sender,
                text: text,
                timestamp: timestamp
            }, config.chatCollection, function(result) {
                userDataService.getUserById(caseData.userId, function(user) {
                    notifier.notifyCaseMessage(user.registrationId, caseData);
                    next(result);
                })
            }, function(error) {
                console.log(error);
                throw error;
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
            throw error;
        });
    }
}
