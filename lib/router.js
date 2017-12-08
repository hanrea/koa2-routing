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
        let self = this;
        self.routes = [];
        app.route = function(path,domain) {
            self.routes.map(function(_rut){
                // todo 
                if(_rut._domain !== domain || _rut.path !== path){
                    //
                }else{
                    // 
                }
                //同域名下不能有相同的路径  * 下不能有相同的  *需要最后追加   domain 和path 都不能对 正则进行判断，需要自行校验
                assert( _rut._domain !== domain || _rut.path !== path ,`You already defined path"${path}" for "${domain}"`)
            })

            let route = new Route(path,domain);
            self.routes.push(route);
            return route;
        };
        return this;
    }
    assert(app, 'You must provide app instance to use routing');
    // return middleware for dispatching requests
    app.use(new Router(app).middleware())
    return ;
}

/**
 * Middleware for dispatching requests.
 * If route is matched it calls handler function
 *
 * @api private
 */

Router.prototype.middleware = function() {
    let self = this;
    return async function (ctx,next) {
        console.log("Routetet")
        // search for route
        for (let i = 0; i < self.routes.length; i++) {

            let cbs;
            if ((cbs = self.routes[i].match(ctx.request))) {
                ctx.params = ctx.request.params;
                if (self.routes[i]._beforeFn) {
                    cbs = self.routes[i]._beforeFn.concat(cbs)
                }
                return await  compose(cbs)(ctx,next)
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
