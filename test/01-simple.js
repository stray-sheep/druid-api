
var hippie = require('hippie'),
    server = require('../lib/Server');

describe('API', function () {
  it('/', function (done) {
    hippie(server)
      .json()
      .get('/')
      .expectStatus(200)
      .end(function(err, res, body) {
        if (err) throw err;
        done();
      });
  });
});

