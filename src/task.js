var fs = require('fs');
var path = require('path');
var excel = require('./excel');
var config = require('./config');
var utils = require('./utils')
var logger = require('./logger')
module.exports=class Task {
    static statechange=null;
    static _curtask = '';
    static _taskstate={
        client:{phase:0,isrun:false},
        server:{phase:0,isrun:false},
        config:{phase:0,isrun:false},
        all:{phase:0,isrun:false}
    };

    static async buildall() {
        Task._taskstate.all.isrun=true;
        Task._taskstate.all.phase = 1;
        Task.statechange&&Task.statechange();
        await Task.updatexls();
        Task._taskstate.all.phase = 2;
        Task.statechange&&Task.statechange();
        await Task.updateclient();
        Task._taskstate.all.phase = 3;
        Task.statechange&&Task.statechange();
        await Task.updateserver()
        Task._taskstate.all.phase = 4;
        Task.statechange&&Task.statechange();
        await Task.exportconfig();
        Task._taskstate.all.phase = 5;
        Task.statechange&&Task.statechange();
        await Task.commitclient();
        Task._taskstate.all.phase = 6;
        Task.statechange&&Task.statechange();
        await Task.commitserver();
        Task._taskstate.all.phase = 7;
        Task.statechange&&Task.statechange();
        await Task.compileclient();
        Task._taskstate.all.phase = 8;
        Task.statechange&&Task.statechange();
        await Task.commitserver();
        Task._taskstate.all.phase = 9;
        Task._taskstate.all.isrun=false;
        Task.statechange&&Task.statechange();
    }

    static async buildconfig() {
        Task._taskstate.config.isrun=true;
        Task._taskstate.config.phase = 1;
        Task.statechange&&Task.statechange();
        await Task.updatexls();
        Task._taskstate.config.phase = 2;
        Task.statechange&&Task.statechange();
        await Task.exportconfig();
        Task._taskstate.config.phase = 3;
        Task.statechange&&Task.statechange();
        await Task.commitclient();
        Task._taskstate.config.phase = 4;
        Task.statechange&&Task.statechange();
        await Task.commitserver();
        Task._taskstate.config.phase = 5;
        Task._taskstate.config.isrun=false;
        Task.statechange&&Task.statechange();
    }

    static async buildserver() {
        Task._taskstate.server.isrun=true;
        Task._taskstate.server.phase = 1;
        Task.statechange&&Task.statechange();
        await Task.updateserver();
        Task._taskstate.server.phase = 2;
        Task.statechange&&Task.statechange();
        await Task.compileserver();
        Task._taskstate.server.phase = 3;
        Task._taskstate.server.isrun=false;
        Task.statechange&&Task.statechange();
    }

    static async buildclient() {
        Task._taskstate.client.isrun=true;
        Task._taskstate.client.phase = 1;
        Task.statechange&&Task.statechange();
        await Task.updateclient();
        Task._taskstate.client.phase = 2;
        Task.statechange&&Task.statechange();
        await Task.compileclient();
        Task._taskstate.client.phase = 3;
        Task._taskstate.client.isrun=false;
        Task.statechange&&Task.statechange();
    }

    static async compileserver() {
        return new Promise((reslove) => {
            utils.runCmd(`tsc --build ${config.workpath.server}/tsconfig_build.json`, (log) => reslove(log));
        });
    }

    static async compileclient() {
        return new Promise((reslove) => {
            utils.runCmd(`egret build ${config.workpath.client}`, (log) => reslove(log));
        });
    }

    static async exportconfig() {
        return new Promise((reslove) => {
            utils.runCmd(`svn update ${config.workpath.excel}`, () => {
                logger.cleanfile('config.log');
                utils.clearFolder(config.workpath["client-config"]);
                utils.clearFolder(config.workpath["server-config"]);
                var files = fs.readdirSync(config.workpath.excel);
                for (var file of files) {
                    if (path.extname(file) != '.xls') continue;
                    var result = excel(config.workpath.excel + '/' + file);
                    for (var resclient of result.clients) {
                        fs.writeFileSync(config.workpath["client-config"] + '/' + resclient.name + '.txt', resclient.content, 'utf-8');
                    }
                    for (var resserver of result.servers) {
                        fs.writeFileSync(config.workpath["server-config"] + '/' + resserver.name + '.txt', resserver.content, 'utf-8');
                        fs.writeFileSync(config.workpath["server-release-config"] + '/' + resserver.name + '.txt', resserver.content, 'utf-8');
                    }
                }
                logger.log('导出表完成', 'LOG', 'config.log');
                reslove();
            });
        });
    }

    static async updateresource() {
        return new Promise((reslove) => {
            logger.log('svn update resource...');
            utils.runCmd(`svn update ${config.workpath.client}/resource`, reslove);
        });
    }

    static async updateclient() {
        return new Promise((reslove) => {
            logger.log('svn update client...');
            utils.runCmd(`svn update ${config.workpath.client}`, reslove);
        });
    }

    static async updateserver() {
        return new Promise((reslove) => {
            logger.log('svn update server...');
            utils.runCmd(`svn update ${config.workpath.server}`, reslove);
        });
    }

    static async updatexls() {
        return new Promise((reslove) => {
            logger.log('svn update xls...');
            utils.runCmd(`svn update ${config.workpath.excel}`, reslove);
        });
    }

    static async commitclient() {
        return new Promise((reslove) => {
            logger.log('svn add client...');
            utils.runCmd(`svn add ${config.workpath["client-config"]}/*`, () => {
                logger.log('svn commit client...');
                utils.runCmd(`svn commit ${config.workpath["client-config"]} -m 'buildconfig-${Date.now()}'`, () => {
                    reslove();
                })
            })
        })
    }

    static async commitserver() {
        return new Promise((reslove) => {
            logger.log('svn add server...');
            utils.runCmd(`svn add ${config.workpath["server-config"]}/*`, () => {
                logger.log('svn commit server...');
                utils.runCmd(`svn commit ${config.workpath["server-config"]} -m 'buildconfig-${Date.now()}'`, () => {
                    reslove();
                })
            })
        })
    }

    static async exec(cmdname) {
        if (Task._curtask) return;
        Task._curtask = cmdname;
        switch (cmdname) {
            case 'all':
                await Task.buildall();
                break;
            case 'client':
                await Task.buildclient();
                break
            case 'server':
                await Task.buildserver();
                break
            case 'config':
                await Task.buildconfig();
                break
            case 'resource':
                await Task.updateresource();
                break;
        }
        Task._curtask = '';
    }
}