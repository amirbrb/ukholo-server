const express = require('express')
const router = express.Router()
const multer = require('multer')
const Guid = require('guid')
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');

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

var upload = multer({storage: storage}).any();

router.use(function (req, res, next) {
  next();
});

router.post('/text', function (req, res) {
	upload(req, res, function (err) {
    	if (err) {
      		console.log(err);
	    }
	    else{
	    	console.log('ok');
	    }
  	})
});

module.exports = router