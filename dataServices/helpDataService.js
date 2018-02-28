const userDataService = require('./usersDataService');
const mongoConnector = require("../services/mongoConnector");
const collections = require("../config/collections");
const notifier = require("../services/notifierService")

module.exports = {
    addHelpCase(caseId, userId, title, description, lat, lng, images) {
        return new Promise(function(resolve, reject){
            userDataService.getUserById(userId)
                .then(userData=> {
                    if (userData) {
                        var created = new Date();
                        var eventData = {
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
                        };
                        mongoConnector.add(eventData, collections.casesCollection)
                            .then(result=>  {
                                var closeByUsers = userDataService.getUsersCloseBy(lat, lng, userId)
                                    .then(users=>  {
                                        var registrationIds = users.map(function(user) {
                                            return user.registrationId;
                                        });
                                        notifier.notifyEvent(registrationIds, eventData)    
                                    })
                                    .catch(err=> {

                                    });
                                })    
                                resolve(result);
                    }
                    else {
                        reject("could not find user with id " + userId);
                    }
                })
                .catch(err=> {
                    reject(err);
                });
        });
    },
    getHelpCases(location, userId) {
        return new Promise(function(resolve, reject){
            mongoConnector.search({
                userId: { $ne: userId }
            }, config.casesCollection)
                .then(result=> {
                    resolve(result);
                })
                .catch(err=> {
                    reject(err);
                });
        });
    },
    getHelpCaseById(id) {
        return new Promise(function(resolve, reject){
            mongoConnector.find({
                id: id
            }, collections.casesCollection)
                .then(existingCase=> {
                    if (existingCase) {
                        mongoConnector.search({
                            caseId: id,
                        }, collections.chatCollection)
                            .then(messages=> {
                                existingCase.messages = messages;
                                userDataService.getUserById(existingCase.userId)
                                    .then(user=> {
                                        existingCase.user = user;
                                        resolve(existingCase);    
                                    })
                                    .catch(err=> {
                                        reject(err);
                                    });
                            })
                            .catch(err=> {
                                reject(err);
                            })
                    }
                    else {
                        reject('could not fing case with id ' + id);
                    }    
                })
        });
    },
    getHelpCasesByUserId(userId) {
        return new Promise(function(resolve, reject){
            mongoConnector.search({
                userId: userId
            }, collections.casesCollection)
                .then(existingCase=>{
                    resolve(existingCase);
                })
                .catch(err=> {
                    reject(err);
                });
        });
    },
    addCaseMessage(caseId, text, sender, timestamp) {
        var self = this;
        return new Promise(function(resolve, reject){
            self.getHelpCaseById(caseId)
                .then(caseData=> {
                    mongoConnector.add({
                        caseId: caseId,
                        senderId: sender,
                        text: text,
                        timestamp: timestamp
                    }, collections.chatCollection)
                        .then(result=> {
                            userDataService.getUserById(caseData.userId)
                                .then(user=> {
                                    notifier.notifyEventMessage(user.registrationId, caseData);
                                    resolve(result);
                                })
                                .catch(err=> {
                                    reject(err)
                                });
                            })
                        })
                        .catch(err=> {
                            reject(err);
                        }) 
                })
                .catch(err=> {
                    reject(err);
                })
    },
    getCaseMessages(id, lastQuery, next) {
        return new Promise(function(resolve, reject){
            mongoConnector.search({
                caseId: id,
                timestamp: { $gt: lastQuery }
            }, collections.chatCollection)
                .then(messages=> {
                    resolve(messages);
                })
                .catch(err=> {
                    reject(err);
                });
        });
    }
}
