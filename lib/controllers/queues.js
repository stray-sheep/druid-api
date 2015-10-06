
var mongoose = require('mongoose'),
    Queue    = require('../models/Queue.js'),
    Task     = require('../models/Task.js'),
    async    = require('async');

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
  if (req.user.member) { ids.push(ids.concat(req.user.member)) }

  Queue.find( { $or: [ {"user":req.user._id}, {"organization": {$in: req.user.member}} ] }, function (err, queues) {
    if (err) { console.log(err) }
    else { res.json(queues) }
  }).populate('user organization');
};

exports.add = function(req, res, next) {
  var data = req.body;
  data.user = req.user._id;

  var queue = new Queue(data);
  queue.save( function(err, queue) {
    if (err) { console.log(err) }
    else { res.json(queue) }
  });
};

exports.stats = function(req, res, next) {
  var data = { todo: 0, done: 0, queue: req.params.id };

  Task.count({ queue: req.params.id, done: false}, function(err, c1) {
    if (err) { console.log(err); }
    if (c1) {
      data.todo = c1;
      Task.count({ queue: req.params.id, done: true}, function(err, c2) {
        if (err) { console.log(err); }
        if (c2) {
          data.done = c2;
          res.json(data);
        }
      });
    }
  })
};

exports.statsList = function(req, res, next) {
  var list = req.body.list;
  var data = {};

  async.eachSeries(list,
    function(item, cb) {
            Task.find({ queue: item }, function(err, tasks) {
              if (err) { console.log(err); }
              if (tasks) {
                var todo = 0, done = 0;
                for (var i = 0; i < tasks.length; i++) {
                  if (tasks[i].done === true) { done += 1; }
                }
                todo = tasks.length - done;
                data[item] = { todo: todo, done: done, queue: item };
                cb(null);
              }
            });
    },
    function(err) {
      if (err) { console.log(err); }
      console.log('all done')
      res.json(data);
    }
  );
};
