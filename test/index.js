/*jshint expr: true*/
'use strict';

const Koa = require('koa'),
    request = require('supertest'),
    routing = require('..');

const app =new Koa(),
    app2 = new Koa();
let   users;

describe('router is', function () {

    before(function () {
        app.use(routing(app));
        app2.use(routing(app2));

        app.route("/jump").redirect("https://www.nodejs.org/");

        users = app.route('/users');

        users.get( async (ctx,next)=> {
            ctx.body = {
                message: 'from users GET'
            };
            await next();
        });

        users.post( async (ctx,next)=> {
            ctx.body = 'from users POST';
            await next();
        });

        users.all( async (ctx,next) => {
            ctx.body = 'from users ALL';
            await next();
        });

        users.nested('/:id')
            .get( async (ctx,next)=> {
                ctx.body = ctx.request.params.id;
                await next();
            })
            .post( async (ctx,next)=> {
                ctx.body = {
                    message: 'ok'
                };
                await next();
            })
            .all( async (ctx,next)=> {
                ctx.body = 'ALL ok';
                await next();
            });


        app.route(/^\/date\/\d{4}-\d{2}-\d{2}\/?/)
            .get( async (ctx,next)=> {
                ctx.body = 'date sent';
                await next();
            })
            .post( async (ctx,next)=> {
                ctx.body = 'date sent from post';
                await next();
            })
            .all( async (ctx,next)=> {
                ctx.body = 'date sent from all';
                await next();
            })
            .nested(/\/add\/?/)
            .get( async (ctx,next)=> {
                ctx.body = 'added to date';
                await next();
            })
            .nested(/\/days/)
            .get( async (ctx,next)=> {
                ctx.body = 'added days to date';
                await next();
            })
            .post( async (ctx,next)=> {
                ctx.body = 'added days to date from POST';
                await next();
            })
            .all( async (ctx,next)=> {
                ctx.body = 'added days to date from all';
                await next();
            });

        app.route('/multipleMiddleware')
            .get( async (ctx,next)=> {
                ctx.body = '1';
                ctx.status = 200;
                await next();
            },  async (ctx,next)=> {
                ctx.body = '2';
                await next();
            });

        app.route('/before')
            .before( async (ctx,next)=> {
                await next();
                ctx.status = 300;
                ctx.body = "before:"+ ctx.body;
            })
            .get( async (ctx,next)=> {
                ctx.body = "Body has one 'before' prefix";
                ctx.status = 200;
                await next();
            });

        app2.route('/app2')
            .get( async (ctx,next)=>{
                ctx.body = 'should not be here';
                ctx.status = 200;
                await next();
            });

        app.route('/notdefer')
            .get( async (ctx,next)=>{
                ctx.defer = ctx.defer || 'false';
                ctx.body = 'defer is ' + ctx.defer;
                ctx.status = 200;
                await next();
            });

        app.use( async (ctx,next)=>{
            ctx.defer = 'true';
            await next();
        });



    });

    describe('goint into regular routes', function () {
        it('now should redirect to nodejs.org', function (done) {
            request(app.listen())
                .get('/jump')
                .expect('Redirecting to <a href="https://www.nodejs.org/">https://www.nodejs.org/</a>.')
                .expect(302, done);
        });


        it('now should GET /users', function (done) {
            request(app.listen())
                .get('/users')
                .expect('Content-Type', /json/)
                .expect({
                    message: 'from users GET'
                })
                .expect(200, done);
        });

        it('now should POST /users', function (done) {
            request(app.listen())
                .post('/users')
                .expect('from users POST')
                .expect(200, done);
        });

        it('now should ALL /users instead of PUT /users', function (done) {
            request(app.listen())
                .put('/users')
                .expect('from users ALL')
                .expect(200, done);
        });

        it('now should GET /users/:id where id is 1234', function (done) {
            request(app.listen())
                .get('/users/1234')
                .expect('1234')
                .expect(200, done);
        });

        it('now should not GET /users/:id/unknown', function (done) {
            request(app.listen())
                .get('/users/2/unknown')
                .expect(404, done);
        });

        it('now should not GET /users/:id/', function (done) {
            request(app.listen())
                .post('/users/2/')
                .expect({
                    message: 'ok'
                })
                .expect(200, done);
        });

        it('now should ALL /users/:id/ instead ot PUT /users/:id/', function (done) {
            request(app.listen())
                .put('/users/2/')
                .expect('ALL ok')
                .expect(200, done);
        });
    });

    describe('going into regex routes', function () {
        it('now should GET /date/2013-09-04', function (done) {
            request(app.listen())
                .get('/date/2013-09-04')
                .expect(200, done);
        });

        it('now should ALL /date/2013-09-04', function (done) {
            request(app.listen())
                .put('/date/2013-09-04')
                .expect('date sent from all')
                .expect(200, done);
        });

        it('now should GET /date/2013-09-04/add', function (done) {
            request(app.listen())
                .get('/date/2013-09-04/add')
                .expect('added to date')
                .expect(200, done);
        });

        it('now should not ALL /date/2013-09-04/add', function (done) {
            request(app.listen())
                .put('/date/2013-09-04/add')
                .expect(404, done);
        });

        it('now should not GET /date/2013-09-04/addd', function (done) {
            request(app.listen())
                .get('/date/2013-09-04/addd')
                .expect(404, done);
        });

        it('now should not ALL /date/2013-09-04/addd', function (done) {
            request(app.listen())
                .put('/date/2013-09-04/addd')
                .expect(404, done);
        });

        it('now should GET /date/2013-09-04/add/days', function (done) {
            request(app.listen())
                .get('/date/2013-09-04/add/days')
                .expect('added days to date')
                .expect(200, done);
        });

        it('now should not GET /date/2013-09-04/add/dayss', function (done) {
            request(app.listen())
                .get('/date/2013-09-04/add/dayss')
                .expect(404, done);
        });

        it('now should POST /date/2013-09-04/add/days', function (done) {
            request(app.listen())
                .post('/date/2013-09-04/add/days')
                .expect('added days to date from POST')
                .expect(200, done);
        });

        it('now should ALL /date/2013-09-04/add', function (done) {
            request(app.listen())
                .put('/date/2013-09-04/add/days')
                .expect('added days to date from all')
                .expect(200, done);
        });
    });

    describe('going into /before route for .before testing', function () {
        it('will be error expected for GET /before', function (done) {
            request(app.listen())
                .get('/before')
                .expect("before:Body has one 'before' prefix")
                .expect(300, done);
        });
    });

    describe('going into /before route for .before testing', function () {
        it('will be error expected for GET /before', function (done) {
            request(app.listen())
                .get('/before')
                .expect("before:Body has one 'before' prefix")
                .expect(300, done);
        });
    });

    describe('going into /multipleMiddleware route for multiple middleware testing', function () {
        it('will be error expected for GET /before', function (done) {
            request(app.listen())
                .get('/multipleMiddleware')
                .expect('2')
                .expect(200, done);
        });
    });

    describe('going into /app2 with app', function () {
        it('will be error expected for GET /app2', function (done) {
            request(app.listen())
                .get('/app2')
                .expect(404, done);
        });
    });

    describe('going into /app2 with app2', function () {
        it('should GET /app2', function (done) {
            request(app2.listen())
                .get('/app2')
                .expect(200, done);
        });
    });




});
