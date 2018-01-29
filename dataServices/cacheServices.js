const userDataService = require('./usersDataService');
var cache = {};

module.exports = {
    getOrAdd: function(key, addCallBack) {
        if (cache[key])
            return cache[key];

        var cacheObject = addCallBack();
        if (cacheObject)
            cache[key] = cacheObject;

        return cache[key];
    }
}
