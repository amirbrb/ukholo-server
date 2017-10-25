const express = require('express')
const router = express.Router()
const multer = require('multer')
const Guid = require('guid')
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
    var issues = helpDataService.getHelpCases(location);
    res.send(issues);
});

router.post('/text', function(req, res) {
    req.helpId = Guid.create();
    upload(req, res, function(err) {
        var images = req.files.map(img => {
            return img.filename
        });
        var uploadResult = helpDataService.addHelpCase(req.helpId.value,
            req.body.userId,
            req.body.title,
            req.body.description,
            req.body.lat,
            req.body.lng,
            images
        );
        res.send(uploadResult);
    })
});

router.get('/:id/', function(req, res) {
    var id = req.params.id;
    var helpCaseResult = helpDataService.getHelpCaseById(id);
    res.send(helpCaseResult);
});

module.exports = router
