const express = require('express')
const router = express.Router()
const multer = require('multer')
const Guid = require('guid')
const moment = require('moment')
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const helpDataService = require('../dataServices/helpDataService');


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

router.use(function(req, res, next) {
    next();
});

router.get('/', function(req, res) {
    var location = req.body.locaation;
    helpDataService.getHelpCases(location, function(cases) {
        res.send(cases);
    });
});

router.post('/text', function(req, res) {
    req.helpId = Guid.create();
    upload(req, res, function(err) {
        var images = req.files.map(img => {
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
                res.send(uploadResult);
            }
        );
    })
});

router.get('/:id/', function(req, res) {
    var id = req.params.id;
    helpDataService.getHelpCaseById(id, function(caseResult) {
        res.send(caseResult);
    });
});

router.post('/message/', function(req, res) {
    var caseId = req.body.caseId;
    var text = req.body.text;
    var sender = req.body.userId;
    var timestamp = moment().format();

    helpDataService.addCaseMessage(caseId, text, sender, timestamp,
        function(response) {
            res.send(response)
        }
    );
})

router.get('/messages/:id/', function(req, res) {
    var id = req.params.id;
    var lastQuery = req.query.q;
    helpDataService.getCaseMessages(id, lastQuery, function(messages) {
        messages = messages || [];
        var maxTimestamp = moment.max(messages.map(function(message) { return moment(message.timestamp); }));
        res.send({
            messages: messages,
            lastTimestamp: maxTimestamp
        })
    });
})

module.exports = router
