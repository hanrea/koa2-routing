const Koa = require("koa");
const routing = require("../");
const routers = require("./routers/index");


const app = new Koa();





app.use(routing(app));
routers(app);
app.listen("9090","0.0.0.0");


// GET http://127.0.0.1:9090/aaa
// GET http://127.0.0.1:9090/aaa/123
// GET http://127.0.0.1:9090/aaa/456
// GET http://127.0.0.1:9090/bbb/
// POST http://127.0.0.1:9090/bbb/

// GET http://127.0.0.1:9090/abcdre    for "/*"
// GET http://127.0.0.1:9090/data1234  for "/^data/"
// GET http://127.0.0.1:9090/end23425  for "/^end/" this is Wrong usage,


// browser  http://127.0.0.1:9090/jump
