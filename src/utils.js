var fs = require('fs');
var logger = require('./logger');

module.exports =
    class Util {
        static runCmd(cmd, method, logrecorde) {
            if (logrecorde == undefined) logrecorde = true;
            logrecorde ? logger.log('执行命令:' + cmd) : console.log('执行命令:' + cmd);
            var childProcess = require('child_process');
            //var iconv = require('iconv-lite');
            var handler = childProcess.exec(cmd, {
                encoding: 'buffer',
                timeout: 0, /*子进程最长执行时间 */
                maxBuffer: 1024 * 1024
            });
            function stdotHandler(data) {
                //console.log(iconv.decode(data,'gbk'));
                logrecorde ? logger.log(data.toString()) : console.log(data.toString());
            }
            function stderrHandler(data) {
                //console.log(iconv.decode(data,'gbk'));	
                logrecorde ? logger.log(data.toString()) : console.log(data.toString());
            }
            function exitHandler(code) {
                handler.stdout.removeListener('data', stdotHandler);
                handler.stderr.removeListener('data', stderrHandler);
                handler.removeListener('exit', exitHandler);
                if (code != 0) {
                    logrecorde ? logger.log(cmd + '运行错误...') : console.log(cmd + '运行错误...');
                }
                method && method();
            }
            handler.stdout.on('data', stdotHandler);
            handler.stderr.on('data', stderrHandler);
            handler.on('exit', exitHandler);
        }

        /** 
        * 清空文件夹
        * @param folderPath 文件夹路径
        */
        static clearFolder(folderPath) {
            if (!fs.existsSync(folderPath)) return;
            if (!fs.statSync(folderPath).isDirectory()) {
                return;
            }
            var files = fs.readdirSync(folderPath);
            for (var name of files) {
                var curPath = folderPath + '/' + name;
                if (fs.statSync(curPath).isFile()) {
                    fs.unlinkSync(curPath);
                }
            }
        }
        /** 
        * 创建文件夹-强制
        * @param path 文件夹路径
        */
        static createFolder(path) {
            if (!path) return;
            path = path.replace(/\\/, '/');
            path = path.replace(/\/\//, '/');
            // if (path.indexOf(':')>=0) {
            //     path = path.substring(path.indexOf(':') + 1, path.length);
            // }
            var paths = path.split('/');
            while (true) {
                if (!paths[0]) {
                    paths.shift();
                    continue;
                }
                break;
            }
            var fullP = '';
            for (var p of paths) {
                fullP += p + '/';
                //logger.log(fullP);
                if (!fs.existsSync(fullP)) {
                    //console.log('create:',fullP);
                    fs.mkdirSync(fullP);
                }
            }
        }

        /** 
        * 复制文件夹
        * @param fromPath 复制源文件夹
        * @param toPath 目标文件夹
        */
        static copyFolder(fromPath, toPath) {
            var files = fs.readdirSync(fromPath);
            for (var fileName of files) {
                var path = fromPath + '/' + fileName;
                if (fs.statSync(path).isDirectory()) {
                    if (!fs.existsSync(toPath + '/' + fileName)) {
                        fs.mkdirSync(toPath + '/' + fileName);
                    }
                    Util.copyFolder(path, toPath + '/' + fileName);
                } else {
                    fs.writeFileSync(toPath + '/' + fileName, fs.readFileSync(path));
                }
            }
        }
    }
