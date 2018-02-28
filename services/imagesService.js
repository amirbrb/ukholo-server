const mongoConnector = require("./mongoConnector");

module.exports = {
    uploadImage: function(file) {
        return new Promise(function(resolve, reject) {
            mongoConnector.uploadImage(file)
                .than(result => {
                    return result;
                }).catch(err => {
                    reject(err);
                });
        });
    },
    getImage: function(imageId) {
        return new Promise(function(resolve, reject) {
            mongoConnector.getImage(imageId)
                .than(result => {
                    return result;
                }).catch(err => {
                    reject(err);
                });
        });
    }
}
