'use strict';

const logHandler = async (ctx,next)=>{
    console.log(`>>>>>>${ctx.path}`);
    await next();
    console.log(`<<<<<<${ctx.path}`);
}

const commonHandler = async (ctx,next)=>{
    console.log(`IP:${ctx.ip} browse ${ctx.path}`);
    ctx.body =`Hello koa2!\r\n "commonHandler" \r\n You ip:${ctx.ip} browse ${ctx.path}`
};


const paramsHandler = async (ctx,next)=>{
    console.log(`IP:${ctx.ip} browse ${ctx.path}, params:${ctx.params["path"]}`)
    ctx.body =`Hello koa2! \r\n "paramsHandler" \r\n You ip:${ctx.ip} browse ${ctx.path}`
};

const resexpHandler = async (ctx,next)=>{
    console.log(`IP:${ctx.ip} browse ${ctx.path}, params:${ctx.params["path"]}`)
    ctx.body =`Hello koa2! \r\n "resexpHandler" \r\n You ip:${ctx.ip} browse ${ctx.path}`
};



module.exports = function (app) {
  require('./api')(app.route('/api'));
  require('./user')(app.route('/user'));

  app.route(/^data/).all(resexpHandler);
  app.route('/:path').all(paramsHandler).before(logHandler);
  app.route('/*').all(logHandler,commonHandler);
  app.route(/^end/).all(resexpHandler) //this Wrong usage
};
