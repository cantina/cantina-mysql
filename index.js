var app = require('cantina'),
    mysql = require('mysql');

app.conf.add({
  mysql: {
    user: 'root',
    pool: 10
  }
});

app.mysql = {};

var conf = app.conf.get('mysql');

// Set up a simple pool of connections.
app.mysql.connections = [];
for (var i = 0; i < conf.pool; i++) {
  newConnection(conf);
}

app.mysql._activeQueries = 0;
app.mysql._completeQueries = 0;

app.mysql.query = function () {
  // perform the query on the least busiest connection.
  app.mysql.connections.sort(function (a, b) {
    if (a._activeQueries === b._activeQueries) return 0;
    return a._activeQueries > b._activeQueries ? 1 : -1;
  });
  var conn = app.mysql.connections[0];
  conn._activeQueries++;
  app.mysql._activeQueries++;
  var query = conn.query.apply(conn, arguments);
  query._connection = conn;
  if (!query._callback) {
    query.once('end', function () {
      conn._activeQueries--;
      app.mysql._activeQueries--;
      conn._completeQueries++;
      app.mysql._completeQueries++;
    });
  }
  else {
    var cb = query._callback;
    query._callback = function () {
      conn._activeQueries--;
      app.mysql._activeQueries--;
      conn._completeQueries++;
      app.mysql._completeQueries++;
      cb.apply(query, arguments);
    };
  }
  return query;
};

// Create a new connection
function newConnection (config) {
  var conn = mysql.createConnection(config);
  conn._activeQueries = 0;
  conn._completeQueries = 0;
  conn.on('error', function (err) {
    if (!err.fatal) {
      return;
    }

    // Emit non-connection-related fatals on the app.
    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      err.plugin = 'mysql';
      app.emit('error', err);
    }

    for (var idx in app.mysql.connections) {
      if (app.mysql.connections[idx] === conn) {
        app.mysql.connections.splice(idx, 1);
        newConnection(conn.config);
        break;
      }
    }
  });
  conn.connect();
  app.mysql.connections.push(conn);
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
