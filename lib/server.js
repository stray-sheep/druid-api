
var config   = require('../config'),
    path     = require('path'),
    restify  = require('restify'),
    mongoose = require('mongoose'),
    jwt      = require('restify-jwt'),
    webtoken = require('jsonwebtoken'),
    morgan   = require('morgan');

// read config from file if available
if (process.argv.length == 3) {
  var file = process.argv[2];
  console.log('Reading config from: '+file);
  config = require(path.resolve(file));
}

// handle DB
if (mongoose.connection.readyState == 0) {  // if disconnected only
  mongoose.connect(config.db.base_url, function(err) {
    if (err) console.log('DB connection error: ', err);
    else console.log('DB connection successful to: '+config.db.base_url);
  });
}

var User = require('./models/User.js');  // FIXME

var controllers = {};
controllers['organizations'] = require('./controllers/organizations');
controllers['queues'] = require('./controllers/queues');
controllers['tasks'] = require('./controllers/tasks');

// server
var server = restify.createServer({ name: 'druid-api' });
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
//restify.CORS.ALLOW_HEADERS.push('Authorization');
//restify.CORS.ALLOW_HEADERS.push('X-Requested-With');
server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(jwt({ secret: config.secret }).unless({path: ['/auth/login','/']}));
server.use(morgan('dev'));
 server.use(function(req, res, next) {
   var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'X-Requested-With', 'Authorization'];
   res.header("Access-Control-Allow-Headers", allowHeaders.join(', '));
   var allowMethods = ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE' ];
   res.header("Access-Control-Allow-Methods", allowMethods.join(', '));
   res.header("Access-Control-Allow-Origin", '*');
   next();
 });

server.opts('/\.*/', function(req, res, next) { res.send(200); return next(); });  // FIXME

// routes
server.get("/", function(req, res) { res.json("druid-api"); });
server.get("/queues", controllers.queues.list);
server.get("/queues/:id", controllers.queues.get);
server.post("/queues", controllers.queues.add);
server.get("/tasks/:id", controllers.tasks.getQueueTasks);
server.post("/tasks/:id", controllers.tasks.addQueueTasks);
server.get("/task/:id", controllers.tasks.get);
server.del("/task/:id", controllers.tasks.del);
server.put("/task/:id", controllers.tasks.update);
server.get("/organizations", controllers.organizations.list);
server.post("/organizations", controllers.organizations.add);
server.get("/organizations/:id", controllers.organizations.get);
server.get("/reorder/:id1/:pos/:id2", controllers.tasks.reorder);
server.get("/chart1/:id", controllers.tasks.chart1);

// handle auth requests
server.post('/auth/login', function(req, res) {
  User.findOne({ username: req.body.username }, function(err, user) {
    if (err) throw err;

    if (!user) {
        res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
        // check if password matches
        if (user.password != req.body.password) {
            res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        } else {
            // if user is found and password is right
            // create a token
            var token = webtoken.sign(user, config.secret, {
                expiresInMinutes: 1440 // expires in 24 hours
            });
            res.json({ success: true, user: user, token: 'Bearer '+token });
        }
    }
  });
});


module.exports = server;
