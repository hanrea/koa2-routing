'use strict';
const apiHandle = async (ctx,next)=>{
    ctx.body = {
        "code":0,
        "const":"this is api handler"
    }
};



const jsonp = async (ctx,next)=>{
    await next();
    let cbName = ctx.query["callback"];
    if(cbName){
        ctx.set("Content-Type", "application/javascript; charset=utf-8");
        ctx.body = cbName +"("+JSON.stringify(ctx.body)+")"
    }
};

const push = async (ctx,next)=>{
    await next();
    ctx.body["test"] = true;
};


module.exports = function (route) {
    route.before(jsonp,push);
    route.all(apiHandle);
    route.nested("/123").all(apiHandle);
    route.nested("/345").all(apiHandle)
};