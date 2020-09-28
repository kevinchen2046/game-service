var ws = require('ws');
var config = require('./../src/config');
var utils = require('./../src/utils')
var logger = require('./../src/logger')
var task = require('./../src/task');

logger.recorde = true;

var WebSocketServer = ws.Server;
var wss = new WebSocketServer({ port: config.appport["build-service"] });
var clients = [];
function syscState(ws) {
    ws.send(JSON.stringify({
        type: 'state',
        task: task._taskstate,
    }))
}

task.statechange = function () {
    console.log('task statechange:', clients.length);
    for (var ws of clients) {
        syscState(ws);
    }
}

logger.addhandler = function (content, id) {
    console.log('log add:', content);
    for (var ws of clients) {
        ws.send(JSON.stringify({
            type: 'log',
            id: id,
            content: content
        }));
    }
}

wss.on('error', (ws) => {
    var index = clients.indexOf(ws);
    if (index >= 0) {
        clients.splice(index, 1);
        console.log('客户端已关闭.');
    }
})

wss.on('connection', function (ws) {
    console.log('客户端已连接...');
    clients.push(ws);
    syscState(ws);
    ws.on('message', function (message) {
        var msg = JSON.parse(message);
        logger.log(message);
        switch (msg.build) {
            case 'all':
            case 'client':
            case 'server':
            case 'config':
            case 'proto':
            case 'resource':
                task.exec(msg.build)
                break;
            case "state":
                break;
        }
        syscState(ws);
    });
    ws.on('close', () => {
        var index = clients.indexOf(ws);
        if (index >= 0) {
            clients.splice(index, 1);
            console.log('客户端已关闭.');
        }
    });
});

utils.runCmd(`http-server ${config.workpath.client} --cors -c0 -p ${config.appport["client-service"]}`, null, false);
utils.runCmd(`http-server ${__dirname}/../www --cors -c0 -p ${config.appport["console-service"]}`, null, false);
setTimeout(() => {
    process.title = '西行记Web服务[允许跨域][不允许缓存][Client端口' + config.appport["client-service"] + '][服务端口' + config.appport["build-service"] + '][控制台端口' + config.appport["console-service"] + ']';
}, 200);
