const mongoConnector = require("./mongoConnector");
const multer = require('multer')
var uploadService = multer({ storage: multer.memoryStorage() });
const guid = require("guid")

var uploadSingleFile = function(file, options) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if (!file) {
            resolve(null);
        }
        else {
            var fileName = options.key + file.originalname;
            file.internalId = fileName;
            file.userId = options.userId;
            file.eventId = options.eventId;
            file.imageType = options.imageType;
            self.uploadImage(file)
                .then(uploadedFile => {
                    resolve(uploadedFile);
                })
                .catch(() => {
                    reject('an error occured uploading file ' + file.fileName);
                });
        }
    })
}

module.exports = {
    uploadService: uploadService,
    uploadSingleFile: uploadSingleFile,
    uploadImage: function(file) {
        return new Promise(function(resolve, reject) {
            mongoConnector.uploadImage(file)
                .then(result => {
                    resolve(result);
                }).catch(err => {
                    reject(err);
                });
        });
    },
    getImage: function(imageId) {
        return new Promise(function(resolve, reject) {
            mongoConnector.getImage(imageId)
                .then(result => {
                    resolve(result);
                }).catch(err => {
                    reject(err);
                });
        });
    },
    showImage: function(result, res) {
        if (result) {
            res.setHeader('content-type', result.contentType);
            res.send(result.img.buffer);
        }
        else {
            res.send('');
        }
    }
}
