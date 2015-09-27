
var mongoose = require('mongoose'),
    Queue = require('../models/Queue.js');

exports.get = function(req, res, next) {
  Queue.findOne({ '_id': req.params.id }, function (err, queue) {
    if (err) { console.log(err) }
    else {
      if (queue.user._id == req.user._id ||
          (queue.organization && req.user.member.indexOf(String(queue.organization._id)) > -1) ) {
        res.json(queue);
      }
      else {
        res.status(401); res.json({ success: false, message: 'Unauthorized.' });      }
    }
  }).populate('user organization');
};

exports.list = function(req, res, next) {
  var ids = [];
  ids.push(req.user._id);
  if (req.user.member) { ids = ids.concat(req.user.member) }

  Queue.find( { $or: [ {"user":req.user._id}, {"organization": {$in: req.user.member}} ] }, function (err, queues) {
    if (err) { console.log(err) }
    else { res.json(queues) }
  }).populate('user organization');
};

exports.add = function(req, res, next) {
  var queue = new Queue(req.body);
  queue.save( function(err, queue) {
    if (err) { console.log(err) }
    else { res.json(queue) }
  });
};
