
var mongoose = require('mongoose'),
    Task = require('../models/Task.js');

var checkPerms = function(req, res, next, queue, result, finish) {
  if (queue.user._id == req.user._id || queue.user == req.user._id || // FIXME ugly hack!
       (queue.organization && req.user.member.indexOf(String(queue.organization._id)) > -1) ) {
    finish();
  }
  else {
    res.status(401); res.json({ success: false, message: 'Unauthorized.' });
  }
};

exports.getQueueTasks = function(req, res, next) {
  Task.find({ 'queue': req.params.id, 'archived': false }, function (err, tasks) {
    if (err) { console.log(err) }
    else {
      if (tasks.length > 0) {
        checkPerms(req, res, next, tasks[0].queue, tasks, function() {
          res.json(tasks);
        });
      }
      else {
        res.json([]);
      }
    }
  }).populate('queue').sort('order');
};

exports.addQueueTasks = function(req, res, next) {
  var task = new Task(req.body);
  task.save( function(err, task) {
    if (err) { console.log(err) }
    else { res.json(task) }
  });
};

exports.get = function(req, res, next) {
  Task.findOne({ _id: req.params.id }, function (err, task) {
    if (err) { console.log(err) }
    else {
      if (task) {
        checkPerms(req, res, next, task.queue, task, function() {
          res.send(task);
        });
      }
      else { res.status(404); res.json({ success: false, message: 'Task not found.' }); }
    }
  }).populate('queue');
};

exports.del = function(req, res, next) {
  Task.findByIdAndUpdate( req.params.id, { archived: true },
    function (err, task) {
    if (err) { console.log(err) }
    else { 
      if (task) {
        checkPerms(req, res, next, task.queue, task, function() {
          res.json({ success: true, message: 'Task archived.' });
        });
      }
      else { res.status(404); res.json({ success: false, message: 'Task not found.' }); }
    }
  });
};

exports.update = function(req, res, next) {
  var data = req.body;
  Task.findById( req.params.id, function(err, task) {
    if (err) { console.log(err) }
    else {
      if (task) {
        checkPerms(req, res, next, task.queue, task, function() {
          Task.findByIdAndUpdate( req.params.id, data, function (err, task) {
            if (err) { console.log(err) }
            else {
              if (task) { res.json(task) }
              else { res.status(404); res.json({ success: false, message: 'Task not found.' }); }
            }
          });
        });
      }
      else { res.status(404); res.json({ success: false, message: 'Task not found.' }); }
    }
  }).populate('queue');
};

exports.reorder = function(req, res, next) {
  Task.findByIdAndUpdate( req.params.id1, {order: req.params.pos}, function(err, task1) {
    if (err) { console.log(err); }
    else {
      if (task1) {
        Task.findByIdAndUpdate( req.params.id2, {order: task1.order}, function(err, task2) {
          if (err) { console.log(err); }
          else {
            if (task2) { res.json({ success: true, message: 'Task removed.' }); }
            else { res.status(404); res.json({ success: false, message: 'Task2 not found.' }); }
          }
        });
      }
      else { res.status(404); res.json({ success: false, message: 'Task1 not found.' }); }
    }
  });
};

exports.chart1 = function(req, res, next) {
  Task.find({ 'queue': req.params.id }, function (err, tasks) {
    if (err) { console.log(err) }
    else {
      var days = 4;
      var data = { queue: req.params.id, todo: [], done: [] }
      var now = new Date();
      var todo = 0, done = 0;
      var data2 = [];
      var weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
      var myx = 0;
      while ( days >= 0 ) {
        var ago = new Date();
        ago.setDate(ago.getDate()-days);

        for (var i = 0 ; i < tasks.length  ; i++) {
          var d = tasks[i].created;

          if ( d.getDate()===ago.getDate() && d.getMonth()===ago.getMonth() ) { todo++; }

          if (tasks[i].done && tasks[i].completed) {
            d = tasks[i].completed;
            if ( d.getDate()===ago.getDate() && d.getMonth()===ago.getMonth() ) { done++; }
          }
        }

        data.todo.push({ x: myx, label: weekday[ago.getDay()], y: todo });
        data.done.push({ x: myx, label: weekday[ago.getDay()], y: done });
        myx++;
        days--;
      }
      res.json(data);
    }
  });
};
