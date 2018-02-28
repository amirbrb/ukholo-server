const MongoClient = require('mongodb').MongoClient;
const ConnectionString = 'mongodb://amirbrb:gfYsrN2Day@ds145039.mlab.com:45039/mustb';
const fs = require('fs-extra');
const Guid = require("guid");
const config = require("./config/collections");


var connect = function(db) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(ConnectionString, (err, db) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(db);
            }
        });
    });
}

module.exports = {
    add: function(data, collectionName) {
        return new Promise(function(resolve, reject) {
            connect().then((db) => {
                var col = db.collection(collectionName);
                col.insertOne(data)
                    .then(result => {
                        db.close();
                        resolve(result);
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        });
    },
    edit: function(query, data, collectionName) {
        return new Promise(function(resolve, reject) {
            connect().then((db) => {
                var collection = db.collection(collectionName);
                collection.updateOne(query, { $set: data })
                    .then(result => {
                        db.close();
                        resolve(result);
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        });
    },
    find: function(query, collectionName) {
        return new Promise(function(resolve, reject) {
            connect().then((db) => {
                var collection = db.collection(collectionName);
                collection.findOne(query)
                    .then(result => {
                        db.close();
                        resolve(result);
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        });
    },
    search: function(query, collectionName, next, error) {
        return new Promise(function(resolve, reject) {
            connect().then((db) => {
                var collection = db.collection(collectionName);
                collection.find(query)
                    .then(result => {
                        db.close();
                        resolve(result);
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        });
    },
    findAll: function(collectionName, next, error) {
        return new Promise(function(resolve, reject) {
            connect().then((db) => {
                var collection = db.collection(collectionName);
                collection.find()
                    .then(result => {
                        db.close();
                        resolve(result);
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        })
    },
    uploadImage: function(file, next, error) {
        return new Promise(function(resolve, reject) {
            connect().then((db) => {
                var newImg = fs.readFileSync(file.path);
                var encImg = newImg.toString('base64');
                var fileName
                var newItem = {
                    contentType: file.mimetype,
                    size: file.size,
                    img: encImg,
                    imageId: file.filename
                };

                db.collection(config.imagesCollection)
                    .insertOne(newItem)
                    .then(result => {
                        db.close();
                        resolve(result);
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        })
    },
    getImage: function(imageId, next, error) {
        return new Promise(function(resolve, reject) {
            connect().then((db) => {
                db.collection(config.imagesCollection)
                    .findOne({
                        imageId: imageId
                    })
                    .then(result => {
                        db.close();
                        resolve(result);
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        })
    }
}
