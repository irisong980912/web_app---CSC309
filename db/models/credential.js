/* user.js User model */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

// let's make a mongoose model a little differently
const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		minlength: 1,
		trim: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	}
})

// This function runs before saving user to database
UserSchema.pre('save', function(next) {
	const user = this

	if (user.isModified('password')) {
		bcrypt.genSalt(10, (error, salt) => {
			bcrypt.hash(user.password, salt, (error, hash) => {
				user.password = hash
				next()
			})
		})
	} else {
		next();
	}

})

// Our own student finding function 
UserSchema.statics.findByEmailPassword = function(email, password) {
	const Credential = this

	return Credential.findOne({email: email}).then((user) => {
		if (!user) {
			return Promise.reject()
		}
		return new Promise((resolve, reject) => {
			if (password == user.password) {
				resolve(user)
			}
			bcrypt.compare(password, user.password, (error, result) => {
				if (result) {
					resolve(user);
				} else {
					reject();
				}
			})
		})
	})
}

const Credential = mongoose.model('Credential', UserSchema);

module.exports = { Credential }







