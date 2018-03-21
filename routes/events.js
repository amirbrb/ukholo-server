const express = require('express')
const router = express.Router()
const multer = require('multer')
const Guid = require('guid')
const moment = require('moment')
const app = express();
const jwt = require('jsonwebtoken');
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const helpDataService = require('../dataServices/helpDataService');
const imageServices = require('../services/imagesService');
const imageType = require('../enumerations/imageType');
const jwtServices = require("../services/jwtService");

router.get('/', function(req, res) {
    jwtServices.validateToken(req)
        .then(() => {
            var location = req.query.location;
            var userId = req.query.userId;
            helpDataService.getHelpCases(location, userId)
                .then(cases => {
                    res.send(jsonSuccess(cases));
                })
                .catch(err => {
                    res.send(jsonFailure(err));
                })
        })
        .catch(err => {
            res.send(jsonFailure(err));
        })
});

router.post('/help', imageServices.uploadService.any(),
    function(req, res) {
        jwtServices.validateToken(req)
            .then(() => {
                var guid = Guid.create().value;
                var promises = [];
                var options = {
                    userId: req.body.userId,
                    imageType: imageType.event,
                    key: guid,
                    eventId: guid
                };
                for (var i = 0; i < req.files.length; i++) {
                    var file = req.files[i];
                    promises.push(imageServices.uploadSingleFile(file, options))
                }

                Promise.all(promises).then(function(results) {
                    res.send(jsonSuccess())
                })
                helpDataService.addHelpCase(guid,
                        req.body.userId,
                        req.body.title,
                        req.body.description,
                        req.body.lat,
                        req.body.lng)
                    .then(uploadResult => {
                        res.send(jsonSuccess(uploadResult));
                    })
                    .catch(err => {
                        res.send(jsonFailure(err));
                    })
            })
            .catch(err => {
                res.send(jsonFailure(err));
            })

    });

router.get('/:id/', function(req, res) {
    jwtServices.validateToken(req)
        .then(() => {
            var id = req.params.id;
            helpDataService.getHelpCaseById(id)
                .then(caseResult => {
                    res.send(jsonSuccess(caseResult))
                })
                .catch(err => {
                    res.send(jsonFailure(err));
                })
        })
        .catch(err => {
            res.send(jsonFailure(err));
        })
});

router.get('/:id/messages/', function(req, res) {
    jwtServices.validateToken(req)
        .then(() => {
            var id = req.params.id;
            helpDataService.getCaseMessages(id)
                .then(messages => {
                    messages = messages || [];
                    res.send(jsonSuccess({
                        messages: messages
                    }))
                })
                .catch(err => {
                    res.send(jsonFailure(err))
                })
        })
        .catch(err => {
            res.send(jsonFailure(err));
        })
})

module.exports = router
