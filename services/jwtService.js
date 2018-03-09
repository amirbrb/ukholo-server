const jwt = require('jsonwebtoken');
const configuration = require("../config/application." + process.env.ENV)
module.exports = {
    signUser: function(userData) {
        return jwt.sign(userData, configuration.tokenSecret, { expiresIn: '24h' });
    },
    validateToken: function(request) {
        return new Promise(function(resolve, reject) {
            var token = request.headers.mb_token;
            if (token) {
                jwt.verify(token, process.env.tokenSecret, function(err, decoded) {
                    if (err) {
                        reject('Failed to authenticate token.');
                    }
                    else {
                        resolve();
                    }
                });
            }
            else {
                reject('no token provided');
            }
        })
    }
}
