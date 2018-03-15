const Guid = require("guid");
const registrationResponse = require('../models/registration/registrationResponse');
const loginResponse = require('../models/registration/loginResponse');
const mongoConnector = require("../services/mongoConnector");
const collections = require("../config/collections");
const unitTypes = require("../enumerations/unitType")
const imageTypes = require("../enumerations/imageType")
const imagesService = require("../services/imagesService");
const extend = require("extend");

module.exports = {
	getStartupData: function() {
		return {
			userTools: [
	    		{
	        		title: 'handy',
			        class: 'wrench',
			        selected: false,
			        id: 1
		    	}, 
		    	{
			        title: 'cooking',
			        class: 'coffee',
			        selected: false,
			        id: 2
		    	},
		    	{
			        title: 'tech',
			        class: 'tv',
			        selected: false,
			        id: 3
		    	},
			    {
			        title: 'pet',
			        class: 'paw',
			        selected: false,
			        id: 4
		    	}
	    	]
		}
	}
}
