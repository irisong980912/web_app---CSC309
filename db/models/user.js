/* user.js User model */

const mongoose = require('mongoose');

// Credit to Илья Зеленько
// Accessed on 4/2/2019 
// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(length) {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < length; i++)
	  text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
  }

function getTheme() {
	const arr = ['frogideas', 'sugarsweets', 'heatwave', 'daisygarden', 'seascape', 'summerwarmth', 'bythepool', 'duskfalling', 'berrypie']
	return arr[Math.floor(Math.random()* arr.length)]
}

function getShape() {
	const arr = ['/isogrids/', '/spaceinvaders/', '/squares/']
	return arr[Math.floor(Math.random()*arr.length)]
}
const User = mongoose.model('User', {
	email:{
		type: String,
		required: true,
		minlength: 1,
		trim: true
	},
	name: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
	}, 
	icon:{
		type: String,
		default: 'http://tinygraphs.com' + getShape() + makeid(5) + '?theme=' + getTheme()
	},
	intro: {
		type: String,
		default: "I am a good student."
	},
	year: {
		type: Number,
		required: true,
		default: 1
	},
	courses_taken:{
		type: Array
	},
	projects:{
		type: Array,
		default:[]
	},
	skills:{
		type: Array
	},
	rating:{
		type: Number,
		default: 5.0
	},
	rate_received:{
		type: Number,
		default: 0
	}
})

module.exports = { User }