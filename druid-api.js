
var config = require('./config');
    path   = require('path'),
    server = require('./lib/server');

// read config from file if available
if (process.argv.length == 3) {
  var file = process.argv[2];
  console.log('Reading config from: '+file);
  config = require(path.resolve(file));
}

// start server
server.listen(config.server.port, config.server.listen,  function () {
  console.log("Server started: "+config.server.listen+":"+config.server.port);
});
 
