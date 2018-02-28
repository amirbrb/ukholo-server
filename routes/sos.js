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
const config = require('../config.dev');
const imageServices = require('../services/imagesService');

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'img/');
    },
    filename: function(req, file, callback) {
        var caseId = req.helpId.value;
        var fileName = caseId + '_' + file.originalname;
        callback(null, fileName);
    }
});

var upload = multer({ storage: storage }).any();

var validateToken = function(req, res, next) {
    var token = req.query.mb_token || req.body.mb_token || req.headers.mb_token;
    if (token) {
        jwt.verify(token, config.tokenSecret, function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            }
            else {
                next();
            }
        });
    }
    else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
}

router.get('/', function(req, res) {
    validateToken(req, res, function() {
        var location = req.query.location;
        var userId = req.query.userId;
        helpDataService.getHelpCases(location, userId, function(cases) {
            res.send(jsonSuccess(cases));
        });
    });
});

router.post('/text', function(req, res) {
    validateToken(req, res, function() {
        req.helpId = Guid.create();
        upload(req, res, function(err) {
            var images = req.files.map(img => {
                imageServices.uploadImage(img,
                    function(response) {

                    },
                    function(error) {

                    });
                return img.filename
            });
            helpDataService.addHelpCase(req.helpId.value,
                req.body.userId,
                req.body.title,
                req.body.description,
                req.body.lat,
                req.body.lng,
                images,
                function(uploadResult) {
                    res.send(jsonSuccess(uploadResult));
                }
            );
        })
    });
});

router.get('/:id/', function(req, res) {
    validateToken(req, res, function() {
        var id = req.params.id;
        helpDataService.getHelpCaseById(id, function(caseResult) {
            res.send(jsonSuccess(caseResult));
        });
    });
});

router.post('/message/', function(req, res) {
    validateToken(req, res, function() {
        var caseId = req.body.caseId;
        var text = req.body.text;
        var sender = req.body.userId;
        var timestamp = moment().format();

        helpDataService.addCaseMessage(caseId, text, sender, timestamp,
            function(response) {
                res.send(jsonSuccess(response))
            }
        );
    });
})

router.get('/messages/:id/', function(req, res) {
    validateToken(req, res, function() {
        var id = req.params.id;
        var lastQuery = req.query.q;
        helpDataService.getCaseMessages(id, lastQuery, function(messages) {
            messages = messages || [];
            var maxTimestamp = lastQuery;
            if (messages.length > 0) {
                maxTimestamp = moment.max(messages.map(function(message) { return moment(message.timestamp); }));
            }
            res.send(jsonSuccess({
                messages: messages,
                lastTimestamp: maxTimestamp
            }))
        });
    });
})

module.exports = router
