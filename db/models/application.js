/* application.js application model */

const mongoose = require('mongoose');

const Application = mongoose.model('Application', {
	sender:{
		type: String,
		required: true
	},
	receiver:{
		type: String,
		required: true
	},
	project_id: {
		type: String,
	}
})

module.exports = { Application }