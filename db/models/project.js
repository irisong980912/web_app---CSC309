/* projects.js project model */

const mongoose = require('mongoose');

const Project = mongoose.model('Project', {
	course_code:{
		type: String,
		required: true
	},
	term:{
		type: String,
		resuired: true,
	},
	section:{
		type: String,
		resuired: true,
		default: "ALL"
	},
	name:{
		type: String,
		required: true
	},
	description:{
		type: String,
		default: "This group creater is too lazy to write any group description : ("
	},
	teammates:{
		type: Array,
		default: [] // an array of user objects
	},
	flag:{
		type: Number,
		// Default value is 0 -- this project has no finished yet
		default: 0
	}
})

module.exports = { Project }