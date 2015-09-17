
var mongoose = require('mongoose'),
    Organization = require('../models/Organization.js');

exports.add = function(req, res, next) {
  var data = req.body;
  var organization = new Organization(data);
  
  organization.save( function(err, organization) {
    if (err) { console.log(err) }
    else { res.json(organization) }
  });
};

exports.get = function(req, res, next) {
  Organization.findOne({ _id: req.params.id }, function (err, organization) {
    if (err) { console.log(err) }
    else {
      if (organization) { res.json(organization) }
      else { res.status(404); res.json({ success: false, message: 'Organization not found.' }); }
    }
  });
};

exports.del = function(req, res, next) {
  Organization.findByIdAndRemove( req.params.id, function (err, organization) {
    if (err) { console.log(err) }
    else { 
      if (organization) { res.json({ success: true, message: 'Organization removed.' }); }
      else { res.status(404); res.json({ success: false, message: 'Organization not found.' }); }
    }
  });
};

exports.list = function(req, res, next) {
  Organization.find( {}, function (err, organizations) {
    if (err) { console.log(err) }
    else {
      if (organizations) { res.json(organizations) }
      else { res.status(404); res.json({ success: false, message: 'Organizations not found.' }); }
    }
  });
};
