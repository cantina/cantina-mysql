var app = require('cantina'),
    mysql = require('mysql');

app.conf.add({
  mysql: {
    user: 'root',
    pool: 10
  }
});

app.mysql = {};

app.on('init', function() {
  var conf = app.conf.get('mysql');

  // Set up a simple pool of connections.
  app.mysql.connections = [];
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
      var query = conn.query.bind(conn);
      query._connection = conn;
      return query;
    },
    enumerable: true,
  });
});

// Used by the connections.
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

// Build select query from a nested structure.
app.mysql.build = function (parts) {
  // Defaults.
  app.utils.defaults(parts, {
    select: ['*'],
    from: [],
    join: [],
    where: [],
    group: [],
    order: [],
    limit: null,
    offset: null
  });

  // Cast to arrays.
  ['select', 'from', 'join', 'where', 'group', 'order'].forEach(function (key) {
    if (!Array.isArray(parts[key])) {
      parts[key] = [parts[key]];
    }
  });

  // Create query.
  var query = "";

  query += "SELECT " + parts.select.join(', ') + "\n";
  query += "FROM " + parts.from.join(', ') + "\n";
  if (parts.join.length) {
    query += parts.join.join("\n") + "\n";
  }
  if (parts.where.length) {
    query += "WHERE " + parts.where.join(" AND ") + "\n";
  }
  if (parts.group.length) {
    query += "GROUP BY " + parts.group.join(', ') + "\n";
  }
  if (parts.order.length) {
    query += "ORDER BY " + parts.order.join(', ') + "\n";
  }
  if (parts.limit) {
    query += "LIMIT " + parts.limit + "\n";
  }
  if (parts.offset) {
    query += "OFFSET " + parts.offset;
  }

  return query;
};
