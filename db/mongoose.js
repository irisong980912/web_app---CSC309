const mongoose = require('mongoose')
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@matchy-u4vme.mongodb.net/matchy?retryWrites=true"
// connect to our database
mongoose.connect(mongoURI, { useNewUrlParser: true});

module.exports = { mongoose }