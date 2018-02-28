const express = require('express')
const router = express.Router()
const multer = require('multer')
const Guid = require('guid')
const jwt = require('jsonwebtoken');
const usersDataService = require('../dataServices/usersDataService');
const imageServices = require('../services/imagesService');
const startupData = require('../models/startupData');
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'img/');
    },
    filename: function(req, file, callback) {
        var key = req.registrationKey.value
        var fileName = key + '_' + file.originalname;
        callback(null, fileName);
    }
});

var upload = multer({ storage: storage }).any();

var signUser = function(userData) {
    var token = jwt.sign(userData, app.get('tokenSecret'), { expiresIn: '24h' });
    return token;
}

router.use(function(req, res, next) {
    next();
});

router.post('/register', function(req, res) {
    req.registrationKey = Guid.create();
    upload(req, res, function(err) {
        var userAvatar = req.files.map(img => {
            imageServices.uploadImage(img)
            .then(result => {
                return img.filename;
            })
            .catch(err=> {
                throw err;
            });
        })[0];

        var mail = req.body.mail;
        var password = req.body.password;
        var name = req.body.name;
        var phoneNumber = req.body.phoneNumber;
        var registrationId = req.body.gcmRegistrationId;
        var location = {
            lat: req.body.lat,
            lng: req.body.lng
        }

        usersDataService.register(mail, password, name, phoneNumber, userAvatar)
            .then(registrationResponse=> {
                if (registrationResponse.isSuccess) {
                        usersDataService.setUserLoginData(registrationResponse.registrationData.userId, location, registrationId)
                        .then(()=> {
                            var token = signUser(registrationResponse.registrationData);
                            res.send(jsonSuccess(startupData(registrationResponse.registrationData, token)));
                        }).
                        catch(err=>{

                        });
                    }
                    else {
                        res.send(jsonFailure(registrationResponse.registrationError));
                    }
                })
            .catch(err=> {
                throw err;
            });
    });
});

router.post('/login', function(req, res) {
    var mail = req.body.mail;
    var password = req.body.password;
    var registrationId = req.body.gcmRegistrationId;
    var currentLocation = {
        lat: req.body.lat,
        lng: req.body.lng,
    };

    usersDataService.login(mail,
        password,
        function(loginResponse) {
            if (loginResponse.isSuccess) {
                usersDataService.setUserLoginData(loginResponse.loginData.uid, currentLocation, registrationId, function() {
                    var token = signUser(loginResponse.loginData);
                    res.send(jsonSuccess(startupData(loginResponse.loginData, token)));
                });
            }
            else {
                res.send(jsonFailure(loginResponse.loginError));
            }
        });
});

router.post('/relogin', function(req, res) {
    var mail = req.body.mail;
    var registrationId = req.body.gcmRegistrationId;
    var currentLocation = {
        lat: req.body.lat,
        lng: req.body.lng,
    };

    usersDataService.getUserByName(mail, function(loginResponse) {
        if (loginResponse.isSuccess) {
            usersDataService.setUserLoginData(loginResponse.loginData.userId,
                currentLocation,
                registrationId,
                function() {
                    var token = signUser(loginResponse.loginData);
                    res.send(jsonSuccess(startupData(loginResponse.loginData, token)));
                }
            );
        }
        else {
            res.send(jsonFailure(loginResponse.loginError));
        }
    });
});

module.exports = router;
