var assert = require('assert');

describe('db', function() {
  var app;

  beforeEach(function(done) {
    app = require('cantina').createApp();
    app.boot(done);
  });

  afterEach(function(done) {
    app.destroy(done);
  });

  it('Can connect to a database', function(done) {
    app.require('../');
    app.mysql.query("SHOW STATUS", function(err, results) {
      assert.ifError(err);
      done();
    });
  });

  it('Can handle a disconnected connection', function(done) {
    app.conf.set('mysql:pool', 1);
    app.require('../');

    var connErr = new Error('Boom');
    connErr.code = 'PROTOCOL_CONNECTION_LOST';
    connErr.fatal = true;
    app.mysql.connections[0].emit('error', connErr);

    app.mysql.query("SHOW STATUS", function(err, results) {
      assert.ifError(err);
      done();
    });
  });
});