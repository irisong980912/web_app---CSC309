/* commeent.js comment model */

const mongoose = require('mongoose');

const Comment = mongoose.model('Comment', {
	project_id:{
		type: String,
		required: true
	},
	sender:{
		type: String,
		required: true
	},
	sender_name:{
		type: String,
		required: true
	},
	receiver:{
		type: String,
		required: true
	},
	content:{
		type: String,
		required: true,
		minlength: 1
	},
	rating:{
		type: Number,
		required: true
	},
	flag:{
		type: Number,
		// Default value is 0 -- real name
		default: 0
	}
	
})

module.exports = { Comment }