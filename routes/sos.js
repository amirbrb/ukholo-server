const express = require('express')
const router = express.Router()
const multer = require('multer')
const Guid = require('guid')
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');

var storage = multer.diskStorage({
	destination: function(req, file, callback){
		callback(null, 'img');
	},
	fileName: function(req, file, callback){
		callback(null, file.filename + '-' + Guid.create() + ".jpg");
	}
});

var upload = multer({storage: storage}).any();

router.use(function (req, res, next) {
  next();
});

router.post('/text', function (req, res) {
	var title = req.body.title;
	var description = req.body.description;
	var userId = req.body.userId;
});

router.post('/text/image', function (req, res) {
	upload(req, res, function(err){
		
	});
});

module.exports = router