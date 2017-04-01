'use strict';
const mware = async (ctx,next)=>{
    console.log(`IP:${ctx.ip} browse ${ctx.path}`)
    ctx.body =`Hello koa2! \r\n You ip:${ctx.ip} browse ${ctx.path}`
}


module.exports = function (route) {
    route.all(mware);
    route.nested("/123").all(mware);
    route.nested("/345").all(mware)
};
