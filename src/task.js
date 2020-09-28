
var excel = require('./excel');
var proto = require('./proto');
var config = require('./config');
var utils = require('./utils')
var logger = require('./logger')
module.exports = class Task {
    static statechange = null;
    static _register = null;
    static _curtask = '';
    static _taskstate = {
        client: { phase: 0, isrun: false },
        server: { phase: 0, isrun: false },
        config: { phase: 0, isrun: false },
        proto: { phase: 0, isrun: false },
        all: { phase: 0, isrun: false }
    };

    static async compileserver() {
        return new Promise((reslove) => {
            utils.runCmd({
                cmd:`tsc --build ${config.workpath.server}/tsconfig_build.json`,
                timeout:10*1000,
            }, (log) => reslove(log));
        });
    }

    static async compileclient() {
        return new Promise((reslove) => {
            utils.runCmd(`egret build ${config.workpath.client}`, (log) => reslove(log));
        });
    }

    static async exportconfig() {
        await excel();
    }

    static async exportproto() {
        await proto();
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

    static async updateclientconfig() {
        return new Promise((reslove) => {
            logger.log('svn update client config...');
            utils.runCmd(`svn update ${config.workpath.client}/resource/config`, reslove);
        });
    }

    static async updateserverconfig() {
        return new Promise((reslove) => {
            logger.log('svn update server config...');
            utils.runCmd(`svn update ${config.workpath.server}/conftab`, reslove);
        });
    }

    static async updatexls() {
        return new Promise((reslove) => {
            logger.log('svn update xls...');
            utils.runCmd(`svn update ${config.workpath.excel}`, reslove);
        });
    }

    static async updatproto() {
        return new Promise((reslove) => {
            logger.log('svn update proto...');
            utils.runCmd(`svn update ${config.workpath.proto}`, reslove);
        });
    }

    static async commitclient() {
        return new Promise((reslove) => {
            logger.log('svn add client...');
            utils.runCmd(`svn add ${config.workpath["client"]}/. --no-ignore --force`, () => {
                logger.log('svn commit client...');
                utils.runCmd(`svn commit ${config.workpath["client"]} -m 'build at ${Date.now()}'`, () => {
                    reslove();
                })
            })
        })
    }

    static async commitserver() {
        return new Promise((reslove) => {
            logger.log('svn add server...');
            utils.runCmd(`svn add ${config.workpath["server"]}/. --no-ignore --force`, () => {
                logger.log('svn commit server...');
                utils.runCmd(`svn commit ${config.workpath["server"]} -m 'build at ${Date.now()}'`, () => {
                    reslove();
                })
            })
        })
    }

    static async commitclientconfig() {
        return new Promise((reslove) => {
            logger.log('svn add client...');
            utils.runCmd(`svn add ${config.workpath["client-config"]}/resource/config/. --no-ignore --force`, () => {
                logger.log('svn commit client...');
                utils.runCmd(`svn commit ${config.workpath["client-config"]} -m 'build at ${Date.now()}'`, () => {
                    reslove();
                })
            })
        })
    }

    static async commitserverconfig() {
        return new Promise((reslove) => {
            logger.log('svn add server...');
            utils.runCmd(`svn add ${config.workpath["server-config"]}/conftab/. --no-ignore --force`, () => {
                logger.log('svn commit server...');
                utils.runCmd(`svn commit ${config.workpath["server-config"]} -m 'build at ${Date.now()}'`, () => {
                    reslove();
                })
            })
        })
    }

    static async syncserver() {
        var from = config.workpath["server-release"].from;
        var to = config.workpath["server-release"].to;
        utils.clearFolder(to);
        utils.copyFolder(from, to,'.svn');
    }

    static async run(list, name) {
        var list = Task._register[name];
        Task._taskstate[name].isrun = true;
        for (var i = 0; i < list.length; i++) {
            Task._taskstate[name].phase = i + 1;
            Task.statechange && Task.statechange();
            await list[i]();
        }
        Task._taskstate[name].isrun = false;
        Task._taskstate[name].phase = list.length+1;
        Task.statechange && Task.statechange();
    }

    static async exec(cmdname) {
        if (Task._curtask) return;
        if (!Task._register) {
            Task._register = {
                'all': [Task.updatexls, Task.updateclient, Task.updateserver, Task.exportconfig, Task.compileclient, Task.compileserver, Task.commitclient, Task.commitserver],
                'config': [Task.updatexls, Task.updateclientconfig, Task.updateserverconfig, Task.exportconfig, Task.commitclientconfig, Task.commitserverconfig,Task.syncserver],
                'proto': [Task.updatproto, Task.updateclient, Task.updateserver, Task.exportproto, Task.commitclient, Task.commitserver,Task.syncserver],
                'client': [Task.updateclient, Task.compileclient],
                'server': [Task.updateserver, Task.compileserver,Task.syncserver]
            }
        }
        Task._curtask = cmdname;
        if (Task._register[cmdname]) {
            Task.run(Task._register[cmdname], cmdname);
        } else {
            switch (cmdname) {
                case 'resource':
                    await Task.updateresource();
                    break;
            }
        }
        Task._curtask = '';
    }

    static onmessage(msg) {
        try {
            switch (msg.build) {
                case 'all':
                case 'client':
                case 'server':
                case 'config':
                case 'proto':
                case 'resource':
                    Task.exec(msg.build);
                    break;
                case "state":
                    break;
            }
        } catch (e) {
            console.error(e.message);
        }
    }
}