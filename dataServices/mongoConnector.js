const MongoClient = require('mongodb').MongoClient;
const ConnectionString = 'mongodb://amirbrb:gfYsrN2Day@ds145039.mlab.com:45039/mustb';

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
    }
}
