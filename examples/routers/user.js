'use strict';

const getHandler = async (ctx,next)=>{
    ctx.body = {
        "user":"test",
        "IP":ctx.ip
    }
};


module.exports = function (route) {
    route.get(getHandler);
    route.all(getHandler);
};
