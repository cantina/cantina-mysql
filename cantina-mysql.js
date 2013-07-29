var app = require('cantina')
  , mysql = require('mysql')
  , _ = require('underscore')
  , conf;

app.mysql = {
  connections: [],
  _activeQueries: 0,
  _completeQueries: 0
};

// Default conf.
app.conf.add({
  mysql: {
    user: 'root',
    pool: 10
  }
});

// Get conf.
conf = app.conf.get('mysql');

// Set up a simple pool of connections.
for (var i = 0; i < conf.pool; i++) {
  newConnection(conf);
}

// Provide a balanced, pooled query method.
app.mysql.query = function () {
  var conn, query, cb;

  // Perform the query on the least busiest connection.
  app.mysql.connections.sort(function (a, b) {
    if (a._activeQueries === b._activeQueries) return 0;
    return a._activeQueries > b._activeQueries ? 1 : -1;
  });

  conn = app.mysql.connections[0];
  if (!conn) {
    // connections in pool may have all been shut down.
    // make a new one so we can continue.
    newConnection(conf);
    conn = app.mysql.connections[0];
  }
  conn._activeQueries++;
  app.mysql._activeQueries++;

  query = conn.query.apply(conn, arguments);
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
    cb = query._callback;
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
  var query = '';

  parts = _.defaults(parts, {
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

  query += 'SELECT ' + parts.select.join(', ') + '\n';
  query += 'FROM ' + parts.from.join(', ') + '\n';
  if (parts.join.length) {
    query += parts.join.join('\n') + '\n';
  }
  if (parts.where.length) {
    query += 'WHERE ' + parts.where.join(' AND ') + '\n';
  }
  if (parts.group.length) {
    query += 'GROUP BY ' + parts.group.join(', ') + '\n';
  }
  if (parts.order.length) {
    query += 'ORDER BY ' + parts.order.join(', ') + '\n';
  }
  if (parts.limit) {
    query += 'LIMIT ' + parts.limit + '\n';
  }
  if (parts.offset) {
    query += 'OFFSET ' + parts.offset;
  }

  return query;
};
