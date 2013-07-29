var assert = require('assert');

describe('pool', function () {
  var app;

  before(function(done) {
    app = require('cantina');
    app.boot(function (err) {
      assert.ifError(err);
      app.conf.set('mysql:pool', 3);
      require('../');
      done();
    });
  });

  after(function(done) {
    app.destroy(done);
  });

  it('initialized ok', function () {
    assert.strictEqual(app.mysql.connections.length, 3);
    for (var idx in app.mysql.connections) {
      assert.strictEqual(app.mysql.connections[idx]._completeQueries, 0);
    }
  });

  it('load-balances queries', function (done) {
    var latch = 0;
    for (var n = 0; n < 30; n++) {
      latch++;
      if (n % 2) {
        app.mysql.query('SHOW STATUS', function (err, status) {
          assert.ifError(err);
          if (!--latch) done();
        });
      }
      else {
        var query = app.mysql.query('SHOW STATUS');
        query.on('error', done);
        query.on('end', function () {
          if (!--latch) done();
        });
      }
    }
  });

  it('stats look ok', function () {
    assert.strictEqual(app.mysql.connections.length, 3);
    assert.strictEqual(app.mysql._completeQueries, 30);
    for (var idx in app.mysql.connections) {
      assert.strictEqual(app.mysql.connections[idx]._activeQueries, 0);
      assert.strictEqual(app.mysql.connections[idx]._completeQueries, 10);
    }
  });
});