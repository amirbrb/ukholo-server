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
    add: function(data, collectionName, next, error) {
        connect().then((db) => {
            var col = db.collection(collectionName);
            col.insertOne(data)
                .then(result => {
                    db.close();
                    next(result);
                })
                .catch(err => {
                    error(err);
                });
        });

    },
    edit: function(query, data, collectionName, next, error) {
        connect().then((db) => {
            var collection = db.collection(collectionName);
            collection.updateOne(query, { $set: data })
                .then(result => {
                    db.close();
                    next(result);
                })
                .catch(err => {
                    error(err);
                });
        });
    },
    find: function(query, collectionName, next, error) {
        connect().then((db) => {
            var collection = db.collection(collectionName);
            collection.findOne(query)
                .then(result => {
                    db.close();
                    next(result);
                })
                .catch(err => {
                    error(err);
                });
        });
    },
    search: function(query, collectionName, next, error) {
        connect().then((db) => {
            var collection = db.collection(collectionName);
            collection.find(query).toArray(function(err, items) {
                if (err)
                    error(err);
                else {
                    db.close();
                    var arr = [];
                    arr.push.apply(arr, items)
                    next(arr);
                }
            });
        });
    },
    findAll: function(collectionName, next, error) {
        connect().then((db) => {
            var collection = db.collection(collectionName);
            collection.find().toArray(function(err, items) {
                if (err)
                    error(err);
                else {
                    db.close();
                    var arr = [];
                    arr.push.apply(arr, items)
                    next(arr);
                }
            });
        });
    },
    uploadImage: function(file, next, error) {
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
                    fs.remove(file.path, function(err) {
                        if (err) {
                            error(err)
                        }
                        else {
                            db.close();
                            next(result);
                        }
                    })
                })
                .catch(err => {
                    error(err);
                });
        });
    },
    getImage: function(imageId, next, error) {
        connect().then((db) => {
            db.collection(config.imagesCollection)
                .findOne({
                    imageId: imageId
                }).then(result => {
                    db.close();
                    next(result);
                })
                .catch(err => {
                    error(err);
                });
        });
    }
}
