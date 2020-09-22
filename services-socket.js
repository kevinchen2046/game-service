var ws = require('ws');
var config = require('./src/config');
var utils = require('./src/utils')
var logger = require('./src/logger')
var task = require('./src/task');

logger.recorde = true;

var WebSocketServer = ws.Server;
var wss = new WebSocketServer({ port: config.appport["build-service"] });
var clients=[];
function syscState(ws) {
    var lastlog = logger.getLastHistory();
    var lastlogId = lastlog ? lastlog.id : 1;
    var startlogId = urlobj.query.historyid ? urlobj.query.historyid : (logger.getFirstHistory() ? logger.getFirstHistory().id : 1);
    ws.send(JSON.stringify({
        task: task._taskstate,
        historyid: lastlog ? lastlog.id : 1,
        log: (startlogId == lastlogId ? undefined : logger.getHistory(urlobj.query.historyid))
    }))
}

task.statechange=function(){
    for(var ws of clients){
        syscState(ws);
    }
}

wss.on('close',(ws)=>{
    var index=clients.indexOf(ws);
    if(index>=0){
        clients.splice(index,1);
        console.log('client close.');
    }
})
wss.on('error',(ws)=>{
    var index=clients.indexOf(ws);
    if(index>=0){
        clients.splice(index,1);
        console.log('client close.');
    }
})
wss.on('connection', function (ws) {
    console.log('client connected');
    ws.on('open',()=>{
        syscState(ws);   
        clients.push(ws); 
    });
    ws.on('message', function (message) {
        var msg = JSON.parse(message);
        console.log(message);
        switch (msg.build) {
            case 'all':
            case 'client':
            case 'server':
            case 'config':
            case 'resource':
                task.exec(msg.build)
                break;
            case "state":
                break;
        }
        syscState(ws);
    });
});

utils.runCmd(`http-server ${config.workpath.client} --cors -c0 -p ${config.appport["client-service"]}`, null, false);
utils.runCmd(`http-server ${__dirname}/www --cors -c0 -p ${config.appport["console-service"]}`, null, false);
setTimeout(() => {
    process.title = '西行记Web服务[允许跨域][不允许缓存][Client端口' + config.appport["client-service"] + '][服务端口' + config.appport["build-service"] + '][控制台端口' + config.appport["console-service"] + ']';
}, 200);
