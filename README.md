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
strategy firm located in Aptos, CA and Washington, D.C.

- - -

### License: MIT
Copyright (C) 2012 Terra Eclipse, Inc. ([http://www.terraeclipse.com](http://www.terraeclipse.com))

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.