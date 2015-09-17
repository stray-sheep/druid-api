
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email:    { type: String, required: false },
  member:   { type: [mongoose.Schema.Types.ObjectId], default: [], ref: 'Organization' }
});

module.exports = mongoose.model('User', UserSchema);
