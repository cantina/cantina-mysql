var assert = require('assert');

describe('db', function() {
  var app;

  beforeEach(function(done) {
    app = require('cantina');
    app.load(done);
  });

  afterEach(function() {
    delete require.cache[require.resolve('cantina')];
    delete require.cache[require.resolve('../')];
  });

  it('Can connect to a database', function(done) {
    require('../');
    app.init(function(err) {
      assert.ifError(err);
      app.mysql.query("SHOW STATUS", function(err, results) {
        assert.ifError(err);
        done();
      });
    });
  });

  it('Can handle a disconnected connection', function(done) {
    app.conf.set('mysql:pool', 1);
    require('../');
    app.init(function(err) {
      assert.ifError(err);

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

});