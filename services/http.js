var http = require("http");

var urlib = require("url");
var config = require('./../src/config');
var utils = require('./../src/utils')
var logger = require('./../src/logger')
var task=require('./../src/task');

var server = http.createServer();
logger.recorde = true;

server.on("request", async (request, response) => {
    var url = request.url;
    console.log("--------------收到请求:" + request.url + "--------------");
    var urlobj = urlib.parse(url, true);
    switch (urlobj.query.build) {
        case 'all':
        case 'client':
        case 'server':
        case 'config':
        case 'resource':
            task.exec(urlobj.query.build)
            break;
    }
    response.setHeader("Access-Control-Allow-Origin", "*");
    var lastlog=logger.getLastHistory();
    var lastlogId=lastlog?lastlog.id:1;
    var startlogId=urlobj.query.historyid?urlobj.query.historyid:(logger.getFirstHistory()?logger.getFirstHistory().id:1);
    response.end(JSON.stringify({
        task: task._taskstate,
        historyid: lastlog?lastlog.id:1,
        log: (startlogId==lastlogId?undefined:logger.getHistory(urlobj.query.historyid))
    }));
});

server.listen(config.appport["build-service"], function () {
    console.log("服务已开启...客户端Web服务监听端口为:" + config.appport["build-service"]);
});

utils.runCmd(`http-server ${config.workpath.client} --cors -c0 -p ${config.appport["client-service"]}`,null,false);
utils.runCmd(`http-server ${__dirname}/www --cors -c0 -p ${config.appport["console-service"]}`,null,false);
setTimeout(() => {
    process.title = '西行记Web服务[允许跨域][不允许缓存][Client端口' + config.appport["client-service"] + '][服务端口' + config.appport["build-service"] + '][控制台端口' + config.appport["console-service"] + ']';
}, 200);