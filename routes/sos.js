const express = require('express')
const router = express.Router()
const multer = require('multer')
const Guid = require('guid')
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const helpDataService = require('../dataServices/helpDataService');


var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        var userId = req.body.userId;
        callback(null, 'img/users/' + userId);
    },
    filename: function(req, file, callback) {
        var fileName = Guid.create();
        fileName += ".jpg";
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
    upload(req, res, function(err) {
        var uploadResult = helpDataService.addHelpCase(req.body.userId, req.body.title, req.body.description, req.body.lat, req.body.lng);
        res.send(uploadResult);

    })
});

module.exports = router
