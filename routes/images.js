const express = require('express')
const router = express.Router();
const path = require('path');
const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');

router.use(function(req, res, next) {
	next();
});

router.get('/:id', function(req, res) {
	var file = req.params.id;
	var options = {
		root: path.join(__dirname, '../img'),
		dotfiles: 'deny',
		headers: {
			'x-timestamp': Date.now(),
			'x-sent': true
		}
	};
	res.sendFile(file, options);
});

module.exports = router
