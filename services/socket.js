var ws = require('ws');

var clients = [];

class SocketRespond {
    initialize(ws, data) {
        this._ws = ws;
        this._data = data;
        return this;
    }
    get msg() { return this._data }
    end(data) {
        this._ws.send(JSON.stringify(data))
    }
}
var respond = new SocketRespond();
module.exports = class ServiceServer {
    static initialize(config) {
        var WebSocketServer = ws.Server;
        var wss = new WebSocketServer({ port: config.appport["build-service"] });
        wss.on('error', (ws) => {
            var index = clients.indexOf(ws);
            if (index >= 0) {
                clients.splice(index, 1);
                console.log('客户端已关闭.');
            }
        })

        wss.on('connection', function (ws) {
            try {
                console.log('客户端已连接...');
                clients.push(ws);
                respond.initialize(ws);
                ServiceServer.__connection && ServiceServer.__connection(respond);
            } catch (e) {
                console.error(e.message);
            }
            ws.on('message', function (message) {
                var msg = JSON.parse(message);
                ServiceServer.__message && ServiceServer.__message(respond.initialize(ws, msg));
            });
            ws.on('close', () => {
                var index = clients.indexOf(ws);
                if (index >= 0) {
                    clients.splice(index, 1);
                    console.log('客户端已关闭.');
                }
            });
        });
    }

    static onconnection(method) {
        ServiceServer.__connection = method;
    }

    static onmessage(method) {
        ServiceServer.__message = method;
    }

    static send(data) {
        for (var ws of clients) {
            ws.send(JSON.stringify(data));
        }
    }
}
