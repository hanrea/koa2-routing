'use strict';

const getHandler = async (ctx,next)=>{
    console.log(`IP:${ctx.ip} browse ${ctx.path}`)
    ctx.body =`Hello koa2! \r\n You ip:${ctx.ip} Get  ${ctx.path}`
}

const postHandler= async (ctx,next)=>{
    console.log(`IP:${ctx.ip} browse ${ctx.path}`)
    ctx.body =`Hello koa2! \r\n You ip:${ctx.ip} Post to ${ctx.path}`
}


module.exports = function (route) {
    route.get(getHandler);
    route.post(postHandler);
};
