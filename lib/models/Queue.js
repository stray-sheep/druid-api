
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var QueueSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  user:         { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  organization: { type: Schema.Types.ObjectId, default: null, ref: 'Organization' },
  created:      { type: Date, default: Date.now },
  tasks:        { type: Number, default: 0 },
  done:         { type: Number, default: 0 }
});

module.exports = mongoose.model('Queue', QueueSchema);
