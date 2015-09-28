
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var TaskSchema = new mongoose.Schema({
  text:      { type: String, required: true },
  queue:     { type: Schema.Types.ObjectId, ref: 'Queue' },
  created:   { type: Date, default: Date.now },
  done:      { type: Boolean, default: false},
  archived:  { type: Boolean, default: false},
  completed: Date,
  partial:   { type: Number, default: 0 },
  order:     Number,
  date:      String,
  tags:      [String] 
});

module.exports = mongoose.model('Task', TaskSchema);
