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
const imageType = require('../enumerations/imageType');
const jwtServices = require("../services/jwtService")

router.use(function(req, res, next) {
    next();
});

router.post('/register', imageServices.uploadService.single('avatar'),
    function(req, res) {
        var key = Guid.create().value;
        var options = {
            imageType: imageType.avatar,
            key: key,
            userId: key
        }
        imageServices.uploadSingleFile(req.file, options)
            .then(avatar => {
                var mail = req.body.mail;
                var password = req.body.password;
                var name = req.body.name;
                var phoneNumber = req.body.phoneNumber;
                var registrationId = req.body.gcmRegistrationId;
                var location = {
                    lat: req.body.lat,
                    lng: req.body.lng
                }

                usersDataService.register(mail, password, name, phoneNumber, key, avatar)
                    .then(registrationResponse => {
                        if (registrationResponse.isSuccess) {
                            usersDataService.setUserLoginData(registrationResponse.registrationData.userId, location, registrationId)
                                .then(() => {
                                    var token = jwtServices.signUser(registrationResponse.registrationData);
                                    res.send(jsonSuccess(startupData(registrationResponse.registrationData, token)));
                                }).
                            catch(err => {
                                //CRA: should log
                                res.send(jsonFailure(err.message));
                            });
                        }
                        else {
                            res.send(jsonFailure(registrationResponse.registrationError));
                        }
                    })
                    .catch(err => {
                        res.send(jsonFailure(err.message));
                    });
            })
    });

router.post('/login', function(req, res) {
    var mail = req.body.mail;
    var password = req.body.password;
    var registrationId = req.body.gcmRegistrationId;
    var currentLocation = {
        lat: req.body.lat,
        lng: req.body.lng,
    };

    usersDataService.login(mail, password)
        .then(loginResponse => {
            if (loginResponse.isSuccess) {
                var token = jwtServices.signUser(loginResponse.loginData);
                delete loginResponse.loginData.password;
                res.send(jsonSuccess(startupData(loginResponse.loginData, token)));
                usersDataService.setUserLoginData(loginResponse.loginData.uid, currentLocation, registrationId)
                    .then(() => {
                        res.send(jsonSuccess(startupData(loginResponse.loginData, token)));
                    })
                    .catch(err => {
                        //CRA: should log
                        res.send(jsonFailure(err.message));
                    });
            }
            else {
                res.send(jsonFailure(loginResponse.loginError));
            }
        })
        .catch(err => {
            //CRA: should log
            res.send(jsonFailure(err.message));
        });
});

router.post('/relogin', function(req, res) {
    var mail = req.body.mail;
    var password = req.body.password;
    var registrationId = req.body.gcmRegistrationId;
    var currentLocation = {
        lat: req.body.lat,
        lng: req.body.lng,
    };

    usersDataService.getUserByName(mail)
        .then(loginResponse => {
            if (loginResponse.isSuccess) {
                if (loginResponse.loginData.password == password) {
                    var token = jwtServices.signUser(loginResponse.loginData);
                    delete loginResponse.loginData.password;
                    usersDataService.setUserLoginData(loginResponse.loginData.userId,
                            currentLocation,
                            registrationId)
                        .then(() => {
                            res.send(jsonSuccess(startupData(loginResponse.loginData, token)));
                        })
                        .catch(err => {
                            //CRA: should log
                            res.send(jsonFailure(err.message));
                        })
                }
                else {
                    res.send(jsonFailure('passwords does not match'));
                }
            }
            else {
                res.send(jsonFailure(loginResponse.loginError));
            }
        })
        .catch(err => {
            res.send(jsonFailure(err.message))
        })
});

module.exports = router;
