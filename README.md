cantina-mysql
=============

Enables a [Cantina](https://github.com/cantina/cantina) app to use
[mysql](https://github.com/felixge/node-mysql).

Provides
--------
- **app.mysql.query** - A connection-pooled version of `connection.query` that
**mysql** exposes.

Configuration
-------------
- **pool** - The size of connection pool to use.
- **...** - All other configuraiton is passed to the `createConnection()`
            constructor.

**Defaults**

```js
{
  mysql: {
    pool: 10,

    // Implied from node-mysql ...

    // The hostname of the database you are connecting to.
    host: 'localhost',

    // The port number to connect to.
    port: 3306,

    // The path to a unix domain socket to connect to. When used host and
    // port are ignored.
    socketPath: null,

    // The MySQL user to authenticate as.
    user: 'root',

    // The password of that MySQL user.
    password: null,

    // Name of the database to use for this connection (Optional).
    database: null,

    // The charset for the connection.
    charset: 'UTF8_GENERAL_CI',

    // Allow connecting to MySQL instances that ask for
    // the old (insecure) authentication method.
    insecureAuth: false,

    // Determines if column values should be converted to native
    // JavaScript types.
    typeCast: true,

    // Prints protocol details to stdout.
    debug: false,

    // Allow multiple mysql statements per query.
    // Be careful with this, it exposes you to SQL
    // injection attacks.
    multipleStatements: false
  }
}
```

- - -

### Developed by [Terra Eclipse](http://www.terraeclipse.com)
Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Santa Cruz, CA and Washington, D.C.
