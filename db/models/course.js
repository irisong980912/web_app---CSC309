const mongoose = require('mongoose');

const Course = mongoose.model('Course', {
	code:{
        type: String,
        unique: true,
		required: true
	},
	term:{
		type: String,
		required: true
	}
})

module.exports = { Course }