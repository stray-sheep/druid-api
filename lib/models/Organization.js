
var mongoose = require('mongoose');

var OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

module.exports = mongoose.model('Organization', OrganizationSchema);
