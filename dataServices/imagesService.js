const mongoConnector = require("./mongoConnector");

module.exports = {
    uploadImage: function(file, next) {
        mongoConnector.uploadImage(file, next, function(error) {
            console.log(error);
            throw error;
        });
    },
    getImage: function(imageId, next) {
        mongoConnector.getImage(imageId, next, function(error) {
            console.log(error);
            throw error;
        });
    }
}
