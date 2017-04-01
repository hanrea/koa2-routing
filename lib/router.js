'use strict';

/**
 * koa2-routing
 *
 * @module router
 * @author Hanrea
 * @author Ivan Pusic
 * @license MIT
 */

const methods = require('methods'),
  assert = require('assert'),
  Route = require('./route'),
  utils = require('./utils'),
  compose = require('koa-compose');

/**
 * Extending koa app with ``route`` method
 *
 * @param {Object} app Koa app instance
 *
 * @return {}
 * @api private
 */

function extendApp(app) {
  /**
   * Method for defining path to match
   *
   * @param {String|RegExp} path Route path. You can pass String or RegExp instance
   *
   * @return {Route}
   * @api public
   */
  let self = this;
  app.route = function(path) {
    assert.equal(utils.anyBy(self.routes, 'path', path), false, 'You already defined this path');
    self.routes.push(new Route(path));
    return self.routes[self.routes.length - 1];
  };
}

/**
 * Router initialization.
 * You must provide application instance in order to use ``koa2-routing``.
 * After this function you will be able to set your routes via ``route`` method,
 * which will be added to your application instance.
 *
 * @param {Object} app koa app
 *
 * @return {Router}
 * @api public
 */

function Router(app) {
  if (this instanceof Router) {
    /**
     * cache for ``Route`` objects
     */
    this.routes = [];
    // exend passed app with koa2-routing`` methods
    extendApp.call(this, app);
    return this;
  }
  assert(app, 'You must provide app instance to use routing');
  // return middleware for dispatching requests
  return new Router(app).middleware();
}

/**
 * Middleware for dispatching requests.
 * If route is matched it calls handler function
 *
 * @api private
 */

Router.prototype.middleware = function() {
  let cbs;
  let self = this;
  return async function (ctx,next) {
    for (let i = 0; i < self.routes.length; i++) {
      // search for route
      if ((cbs = self.routes[i].match(ctx.request))) {
        // add named url parameters to ``ctx.params``
        ctx.params = ctx.request.params;
        if (self.routes[i]._beforeFn) {
          cbs.splice(0, 0, self.routes[i]._beforeFn);
        }
        let com =  compose(cbs);
        return await com(ctx,next)
      }
    }

    // none of routes are matched...
    return await next();
  };
};
/**
 * Expose Router
 */
module.exports = Router;
