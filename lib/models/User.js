
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email:    { type: String, required: true },
  member:   { type: [mongoose.Schema.Types.ObjectId], default: [], ref: 'Organization' },
  active:   { type: Boolean, required: false, default: true }
});

module.exports = mongoose.model('User', UserSchema);
