koa2-routing
================

[![Build Status](https://travis-ci.org/hanrea/koa2-routing.svg?branch=master)](https://travis-ci.org/hanrea/koa2-routing)

``express`` classic route style.
Manage koa2 routes on right way, forked from ivpusic/koa-routing.


## Installation
```
npm install koa2-routing
```

## Motivation
`koa-routing` is the best route I've ever used. So, I upgraded it to koa2.

It separate route definitions into multiple files. Also It  make easier to specify route handlers, and execute some methods before some set of routes, for example ensuring that user is authenticated before doing some action.

`koa-routing` 是我用过最好用的koa路由工具，所以我将它升级到koa2版本，未来仍将继续维护。
支持将路由定义分成多个文件。此外，你能更容易指定路由处理程序，并执行一些方法之前做一些其他操作，例如确保用户身份验证之前做一些行动。

## Usage

**/routing/index.js** file
```
module.exports = function (app) {
  require('./users')(app.route('/api/users').before(authenticate));
};
```

**/routing/users.js** file
```
/**
 * /api/users
 */

module.exports = function (route) {
  /* GET /api/users */
  route.get(r('user', 'getUsers'));

  /* GET /api/users/logout */
  route.nested('/logout').get(r('user', 'logout'));
};
```

So here you can see that we are specifying handlers for route with ``r('module', 'method')`` pattern, and we are also following DRY principle when we define our routes.

If you like ctx idea, you are on right place.

### Example

[Example app](https://github.com/hanrea/koa2-routing/blob/master/examples/app.js)

Let's define following routes:
- ``/users`` [GET, POST, PUT],
- ``/users/list`` [GET, PUT]

With ``koa2-routing`` you can nest routes, and on that way you can follow DRY principle.
Also ``koa2-routing`` architecture help you to separate route handlers into multiple files. That example will be shown also.

```
var Koa = require('koa'),
	routing = require('koa2-routing');

var app = new Koa();
app.use(routing(app));

app.route('/users')
  .get(async (ctx,next) {
    ctx.body = 'from get';
    await next();
  })
  .post(async (ctx,next) {
    ctx.body = 'from post';
    await next();
  })
  .put(async (ctx,next) {
    ctx.body = 'from put';
    await next();
  })
  .nested('/list')
    .get(async (ctx,next) {
      ctx.body = 'from users list GET';
      await next();
    });
    .put(async (ctx,next) {
      ctx.body = 'from users list PUT';
      await next();
    });

app.listen(4000);
```

As you can see, you can pass classic ``express`` route style, such as ``/user/:id``, and after that you can read received values from ``ctx.params`` or ``ctx.request.params`` object.

You can pass also regex as route path.




## API

#### route
``koa2-routing`` extends you application instance with ``route`` method.
You can use that method for defining route path.

```
app.route('/users/:id');
```

#### HTTP methods

After you define your route, you need set ``HTTP`` methods for that route.
In following example you need to replace ``someHTTPmethod`` with one of supported
``node`` ``HTTP`` methods. That can be ``GET``, ``POST``, ``PUT``, etc...

```
app.route('route path').someHTTPmethod(handler);
```

So you can type something like:
```
var handler = function * () {
  await next();
};

app.route('api/users').get(handler);
```

Keep in mind that every call returns router instance, so everything can be chained.

#### redirect

```
app.route('/jump').redirect("toUrl");
```

#### nested

Let's we say that you have for routes something like this:
- ``/api/users/profile/data``
- ``/api/users/profile/image``
- etc.

You see that you are repeating ``/api/users/profile`` for every route, and we don't want to do that.
``koa2-routing`` have nice solution for this with ``nested`` function.

```
// first you type fixed part
var route = app.route('/api/users/profile');

route.nested('/data')
  .get(async (ctx,next) { await next(); });
  // here you can also define other HTTP operations, like POST, PUT, etc
  // example of put...
  .put(async (ctx,next) { await next(); });

route.nested('/image')
  .get(async (ctx,next) { await next(); });
```

Keep in mind that nested creates new route for you and returns created route. You can continue nesting routes. It is up to you.

#### before

You can define functions which will be executed before each route method, and before all nested routes.
```
app.route('/someRoute')
	.before(async (ctx,next) {
		await next();
		ctx.status = 300;
        ctx.body = "before:"+ ctx.body;
	})
	.get(async (ctx,next) {
		ctx.body = "Body has one 'before' prefix";
		ctx.status = 200;
		await next();
	});
```


#### all

This function will be executed if there is no matching HTTP method.
```
app.route('/someRoute')
	.all(async (ctx,next) {
		ctx.body = 'will catch GET/POST/PUT... etc';
		ctx.status = 200;
		await next();
	})
```

## Other features

#### Multiple middlewares

With ``koa2-routing`` you can provide multiple middlewares for each route method:
```
app.route('/multipleMiddleware')
	.get(async (ctx,next) {
		ctx.body = '1';
		ctx.status = 200;
		await next();
	}, async (ctx,next) {
		ctx.body = '2';
		await next();
	});
```

If you go to this route you will receive ``2`` as a result, because request will be passed
to each defined handler.

#### Options

   In this version, removed option.I think next is sufficiency.

## Contributing

Feel free to send pull request with some new awesome feature or some bug fix.
But please provide some tests with your contribution.

## Thanks

  Tanks [ivpusic](https://gemnasium.com/ivpusic/) write koa-routing.

# License
**MIT**
