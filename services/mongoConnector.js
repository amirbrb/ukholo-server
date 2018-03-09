const MongoClient = require('mongodb').MongoClient;
const fs = require('fs-extra');
const Guid = require("guid");
const collections = require("../config/collections");
const configuration = require('../config/application.' + process.env.ENV);


var connect = function(client, db) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(configuration.mongoConnection, (err, client) => {
            if (err) {
                reject(err);
            }
            else {
                var database = client.db(configuration.mongoDbName);
                resolve(client, database);
            }
        });
    });
}

module.exports = {
    add: function(data, collectionName) {
        return new Promise(function(resolve, reject) {
            connect().then(client => {
                try {
                    var collection = client.db(configuration.mongoDbName).collection(collectionName);
                    collection.insertOne(data)
                        .then(result => {
                            resolve(result);
                        })
                        .catch(err => {
                            reject(err);
                        });
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    },
    edit: function(query, data, collectionName) {
        return new Promise(function(resolve, reject) {
            connect().then((client) => {
                try {
                    var collection = client.db(configuration.mongoDbName).collection(collectionName);
                    collection.updateOne(query, { $set: data })
                        .then(result => {
                            client.close();
                            resolve(result);
                        })
                        .catch(err => {
                            reject(err);
                        });
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    },
    find: function(query, collectionName) {
        return new Promise(function(resolve, reject) {
            connect().then((client) => {
                try {
                    var collection = client.db(configuration.mongoDbName).collection(collectionName);
                    collection.findOne(query)
                        .then(result => {
                            client.close();
                            resolve(result);
                        })
                        .catch(err => {
                            reject(err);
                        });
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    },
    search: function(query, collectionName) {
        return new Promise(function(resolve, reject) {
            connect().then((client) => {
                try {
                    var collection = client.db(configuration.mongoDbName).collection(collectionName);
                    collection.find(query).toArray(function(err, items) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            client.close();
                            resolve(items);
                        }
                    });
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    },
    findAll: function(collectionName) {
        return new Promise(function(resolve, reject) {
            connect().then((client) => {
                try {
                    var collection = client.db(configuration.mongoDbName).collection(collectionName);
                    collection.find()
                        .then(result => {
                            client.close();
                            resolve(result);
                        })
                        .catch(err => {
                            reject(err);
                        });
                }
                catch (e) {
                    reject(e);
                }
            });
        })
    },
    uploadImage: function(file) {
        return new Promise(function(resolve, reject) {
            connect().then((client) => {
                try {
                    var newItem = {
                        contentType: file.mimetype,
                        size: file.size,
                        img: file.buffer,
                        imageId: file.internalId,
                        eventId: file.eventId,
                        userId: file.userId,
                        imageType: file.imageType
                    };

                    var collection = client.db(configuration.mongoDbName).collection(collections.imagesCollection);
                    collection
                        .insertOne(newItem)
                        .then(result => {
                            client.close();
                            resolve(file.internalId);
                        })
                        .catch(err => {
                            reject(err);
                        });
                }
                catch (e) {
                    reject(e);
                }
            });
        })
    },
    getImage: function(imageId) {
        return new Promise(function(resolve, reject) {
            connect().then((client) => {
                try {
                    var collection = client.db(configuration.mongoDbName).collection(collections.imagesCollection);
                    collection
                        .findOne({
                            imageId: imageId
                        })
                        .then(result => {
                            client.close();
                            resolve(result);
                        })
                        .catch(err => {
                            reject(err);
                        });
                }
                catch (e) {
                    reject(e);
                }
            });
        })
    }
}
