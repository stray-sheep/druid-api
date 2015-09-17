
var config = require('./config');
    server = require('./lib/server');

// start server
server.listen(config.server.port, config.server.listen,  function () {
  console.log("Server started: "+config.server.listen+":"+config.server.port);
});
 
