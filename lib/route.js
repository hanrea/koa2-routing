'use strict';

/**
 * koa2-routing
 *
 * @module route
 * @author Hanrea
 * @author Ivan Pusic
 * @license MIT
 */

var methods = require('methods'),
    pathToRegExp = require('path-to-regexp'),
    concat = require('concat-regexp'),
    util = require('./utils');

/**
 * Route object for saving route path and HTTP method handlers for route
 */

function Route(path) {

    /**
     * Cache for HTTP methods handlers
     */

    this.handlers = {};


    /**
     * nesteds route objects
     */

    this._nesteds = [];

    /**
     * defines function which will be executed before some set of routes
     */

    this._beforeFn = null;

    /**
     * path String object
     */

    this.path = path;

    /**
     * named parameters of route
     */

    this.params = [];

    /**
     * RegExp of path
     */

    this.pathRegex = path instanceof RegExp ? path : pathToRegExp(path, this.params);

    /**
     * return instance
     */

    return this;
}

/**
 * Function for matching route object with received koa request object
 *
 * @param {Object} request koa request object
 *
 * @return {Generator|null}
 * @api private
 */

Route.prototype.match = function (request) {
    if (this.pathRegex.test(request.path) && request.path.match(this.pathRegex)[0] === request.path) {
        if (!this.handlers[request.method] && !this.handlers['ALL']  && !this.handlers['redirect']) {
            // metched route, but no HTTP method
            return null;
        }

        if(this.handlers["redirect"]){
            return this.handlers["redirect"]
        }

        // get values of named parameters
        let paramsValues = request.path.match(this.pathRegex).slice(1),
            params = {};

        if(Object.keys(this.params).length > 0){
            for (let i = 0; i < paramsValues.length; i++) {
                params[this.params[i].name] = paramsValues[i];
            }
            // add named url parameters to ``request.params``
            request.params = params;
        }else{
            request.params = paramsValues;
        }

        // return handler for HTTP method
        if (this.handlers[request.method]) {
            return this.handlers[request.method];
        }

        // failback to all method
        return this.handlers['ALL'];
    } else if (this._nesteds.length) {
        let ret;

        for (let j = 0; j < this._nesteds.length; j++) {
            if ((ret = this._nesteds[j].match(request))) {
                return ret;
            }
        }
    }

    // route is not matched
    return null;
};

/**
 * Define supported HTTP methods for Route object
 * and all failback method
 */
if (methods[methods.length - 1] !== 'all') {
    methods.push('all');
}

methods.forEach(function (METHOD) {
    Route.prototype[METHOD] = function () {
        let cbs = Array.prototype.slice.apply(arguments),
            that = this;

        cbs.forEach(function (cb) {
            util.isGenerator(cb, that);
        });

        this.handlers[METHOD.toUpperCase()] = cbs;
        return this;
    };
});


/**
 * redirect to new path
 * @param toPath
 * @returns {Route}
 */
Route.prototype.redirect = function (toPath) {
    let that = this;
    let redirect = async (ctx,next)=>{
        ctx.redirect(toPath)
    };
    this.handlers["redirect"] = [redirect];
    return this;
};


/**
 * Ability to nest routes
 *
 * @param {String} path path of nested route
 * @param {Function} cb callback function after nested route is created
 *
 * @return {Route}
 * @api public
 */

Route.prototype.nested = function (path) {
    let route;
    if (this.path instanceof RegExp) {
        this._nesteds.push(new Route(concat(this.path, path)));
    } else {
        this._nesteds.push(new Route(this.path.concat(path)));
    }
    route = this._nesteds[this._nesteds.length - 1];
    route._beforeFn = this._beforeFn;
    return route;
};

/**
 * Function will be executed before each route HTTP method,
 * and before each nested route and it's defined HTTP methods
 *
 * @param { ...}  Functions whill be executed before routes
 *
 * @return {Route}
 * @api public
 */

Route.prototype.before = function () {
    let that = this;
    let cbs = Array.prototype.slice.apply(arguments);
    cbs.forEach(function (cb) {
        util.isGenerator(cb, that);
    });
    this._beforeFn = cbs;
    return this;
};



/**
 * Expose Route
 */

module.exports = Route;
