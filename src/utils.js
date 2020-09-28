var fs = require('fs');
var logger = require('./logger');
var childProcess = require('child_process');
module.exports =
    class Util {
        /**
         * 执行命令
         * @param {cmd:string,timeout:number,log:boolean, recorde:boolean} operation 
         * @param {Function} method 
         */
        static runCmd(operation, method) {
            if (typeof operation == 'string') {
                operation = {
                    cmd: operation
                }
            }
            if (operation.log == undefined) operation.log = true;
            if (operation.recorde == undefined) operation.recorde = true;
            var logout=operation.recorde ? logger.log:console.log;
            logout('开始执行命令:' + operation.cmd)
            //var iconv = require('iconv-lite');
            var childprocess = childProcess.exec(operation.cmd, {
                encoding: 'buffer',
                timeout: operation.timeout ? operation.timeout : 0, /*子进程最长执行时间 */
                maxBuffer: 1024 * 1024
            });
            function stdotHandler(data) {
                //console.log(iconv.decode(data,'gbk'));
                if (operation.log) {
                    logout(data.toString())
                }
            }
            function stderrHandler(data) {
                //console.log(iconv.decode(data,'gbk'));	
                if (operation.log) {
                    logout(data.toString())
                }
            }
            function exitHandler(code) {
                childprocess.stdout.removeListener('data', stdotHandler);
                childprocess.stderr.removeListener('data', stderrHandler);
                childprocess.removeListener('exit', exitHandler);
                childprocess.removeListener('error', exitHandler);
                childprocess.removeListener('close', exitHandler);
                childprocess.removeListener('disconnect', exitHandler);
                if (code != 0) {
                    if (operation.log) {
                        logout('命令执行错误:' + operation.cmd, 'ERROR');
                    }
                }
                method && method();
                logout('结束命令执行:' + operation.cmd);
            }
            childprocess.stdout.on('data', stdotHandler);
            childprocess.stderr.on('data', stderrHandler);
            childprocess.on('exit', exitHandler);
            childprocess.on('error', exitHandler);
            childprocess.on('close', exitHandler);
            childprocess.on('disconnect', exitHandler);
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
        static copyFolder(fromPath, toPath, filters) {
            var files = fs.readdirSync(fromPath);
            for (var fileName of files) {
                if (filters && filters.indexOf(fileName) >= 0) continue;
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
