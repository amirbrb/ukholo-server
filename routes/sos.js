const express = require('express')
const router = express.Router()
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');

router.use(function (req, res, next) {
  next();
});

router.post('/help/text', function (req, res) {
	
});

router.post('/help/audio', function (req, res) {

});

module.exports = router