const { Worker, isMainThread, parentPort, workerData, threadId } = require('worker_threads');

if (isMainThread) {
    var serviceServer = require('./socket');
    var httpserver = require('./httpserver');
    var config = require('./../src/config');
    
    var taskstate = null;
    serviceServer.initialize(config);
    serviceServer.onconnection((res) => {
        taskstate && res.end(taskstate);
    });
    serviceServer.onmessage((res) => {
        worker.postMessage(res.msg);
        taskstate && res.end(taskstate);
    });
    const worker = new Worker(__filename, {
        workerData: {}
    });
    worker.on('message', (data) => {
        switch (data.type) {
            case 'state': taskstate = data;
        }
        serviceServer.send(data);
    });
    worker.on('error', (e) => {
        console.error(e);
    });
    worker.on('exit', (code) => {
        if (code !== 0)
            new Error(`工作线程使用退出码 ${code} 停止`)
    });
    httpserver(config);
    setTimeout(() => {
        process.title = '西行记Web服务[允许跨域][不允许缓存][Client端口' + config.appport["client-service"] + '][服务端口' + config.appport["build-service"] + '][控制台端口' + config.appport["console-service"] + ']';
    }, 200);
} else {
    var task = require('./../src/task');
    task.statechange = function () {
        parentPort.postMessage({
            type: 'state',
            task: task._taskstate,
        });
    }
    //parentPort.postMessage(workerData);
    parentPort.on('message', (data) => {
        task.onmessage(data);
    });

    parentPort.postMessage({
        type: 'state',
        task: task._taskstate,
    });
}