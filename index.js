var app = require('cantina'),
    mysql = require('mysql');

app.conf.add({
  mysql: {
    user: 'root',
    pool: 10
  }
});

app.on('init', function() {
  var conf = app.conf.get('mysql');

  // Set up a simple pool of connections.
  app.mysql = {
    connections: []
  };
  for (var i = 0; i < conf.pool; i++) {
    app.mysql.connections.push(mysql.createConnection(conf));
  }
  app.mysql.connections.forEach(function(connection, i) {
    handleDisconnect(connection, i);
    connection.connect();
  });

  // Expose app.mysql.query, which naively provides a round-robin'ed connection
  // query function.
  var poolCounter = 0;
  Object.defineProperty(app.mysql, 'query', {
    get: function () {
      if (poolCounter >= conf.pool) poolCounter = 0;
      var conn = app.mysql.connections[poolCounter++];
      return conn.query.bind(conn);
    },
    enumerable: true,
  });
});

function handleDisconnect(connection, i) {
  connection.on('error', function(err) {
    if (!err.fatal) {
      return;
    }

    // Emit non-connection-related fatals on the app.
    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      err.plugin = 'mysql';
      app.emit('error', err);
    }

    connection = mysql.createConnection(connection.config);
    app.mysql.connections.splice(i, 1, connection);
    handleDisconnect(connection, i);
    connection.connect();
  });
}