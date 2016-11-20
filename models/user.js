var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/usermgmnt');

var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  name: String,
  username: String,
  password: String
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;