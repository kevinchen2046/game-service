const { urlencoded } = require('express');
var fs = require('fs');
var loggerMap = {};

class LoggerFile {

    constructor(filename, writeinterval) {
        this.writeinterval = !writeinterval ? 2000 : writeinterval;
        this.filename = filename;
        this.content = '';
        if (fs.existsSync(filename)) {
            this.content = fs.readFileSync(filename, 'utf-8');
        }
        this.queue = [];

    }

    static get(filename, writeinterval) {
        if (!loggerMap[filename]) {
            loggerMap[filename] = new LoggerFile(filename, writeinterval);
        }
        return loggerMap[filename];
    }

    add(content, tag) {
        this.queue.push((!tag ? '[LOG]' : `[${tag}]`) + ' ' + content);
        this.later();
    }

    later() {
        if (this.timeId) return;
        this.timeId = setTimeout(this.writeHandler.bind(this), this.writeinterval);
    }

    clean() {
        this.content = '';
    }

    writeHandler() {
        this.timeId = 0;
        this.content += this.queue.join('\r\n');
        this.queue.length = 0;
        fs.writeFileSync(this.filename, this.content, 'utf-8');
    }
}

module.exports = class Logger {
    static id = 0;
    static history = [];
    static log(content, tag, outfile,recorde) {
        if(recorde==undefined) recorde=true;
        var content = (!tag ? '[LOG]' : `[${tag}]`) + ' ' + content;
        console.log(content);
        if (outfile) {
            LoggerFile.get(outfile, 2000).add(content);
        }
        if(!recorde) return;
        if (Logger.history.length >= 100) {
            Logger.history.shift();
        }
        Logger.history.push({ id: ++Logger.id, content: content });
    }
    static cleanfile(outfile) {
        LoggerFile.get(outfile).clean();
    }

    /**获取记录 */
    static getHistory(starthistoryid) {
        var result;
        for (var i = 0; i < Logger.history.length; i++) {
            if (Logger.history[i].id == starthistoryid) {
                result = Logger.history.slice(i, Logger.history.length);
                break;
            }
        }
        if(result){
            for(var log of result){
                log.content=encodeURIComponent(log.content);
            }
        }
        return result;
    }
    static getFirstHistory(){
        return Logger.history.length?Logger.history[0]:null;
    }
    static getLastHistory(){
        return Logger.history.length?Logger.history[Logger.history.length - 1]:null;
    }
}