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
        this.timeId = setTimeout(this.writeHandler, this.writeinterval);
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
    static log(content, tag, outfile) {
        var content = (!tag ? '[LOG]' : `[${tag}]`) + ' ' + content;
        console.log(content);
        if (outfile) {
            LoggerFile.get(outfile, 2000).add(content);
        }
        if (Logger.history.length >= 100) {
            Logger.history.shift();
        }
        Logger.history.push({ id: ++Logger.id, content: content });
    }
    static cleanfile(outfile) {
        LoggerFile.get(outfile).clean();
    }
}