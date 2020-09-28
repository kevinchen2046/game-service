
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
        await utils.runcmd({
            cmd: `tsc --build ${config.workpath.server}/tsconfig_build.json`,
            timeout: 10 * 1000,
        });
    }

    static async compileclient() {
        await utils.runcmd(`egret build ${config.workpath.client}`);
    }

    static async exportconfig() {
        await excel();
    }

    static async exportproto() {
        await proto();
    }

    static async updateresource() {
        logger.log('svn update resource...');
        await utils.runcmd(`svn update ${config.workpath.client}/resource`);
    }

    static async updateclient() {
        logger.log('svn update client...');
        await utils.runcmd(`svn update ${config.workpath.client}`);
    }

    static async updateserver() {
        logger.log('svn update server...');
        await utils.runcmd(`svn update ${config.workpath.server}`);
    }

    static async updateclientconfig() {
        logger.log('svn update client config...');
        await utils.runcmd(`svn update ${config.workpath['client-config']}/`);
    }

    static async updateserverconfig() {
        logger.log('svn update server config...');
        await utils.runcmd(`svn update ${config.workpath['server-config']}/`);
    }

    static async updatexls() {
        logger.log('svn update xls...');
        await utils.runcmd(`svn update ${config.workpath.excel}/`);
    }

    static async updatproto() {
        logger.log('svn update proto...');
        await utils.runcmd(`svn update ${config.workpath.proto}/`);
    }

    static async commitclient() {
        logger.log('svn add client...');
        await utils.runcmd(`svn add ${config.workpath["client"]}/. --no-ignore --force`)
        logger.log('svn commit client...');
        await utils.runcmd(`svn commit ${config.workpath["client"]} -m 'build${Date.now()}'`)
    }

    static async commitserver() {
        logger.log('svn add server...');
        await utils.runcmd(`svn add ${config.workpath["server"]}/. --no-ignore --force`)
        logger.log('svn commit server...');
        await utils.runcmd(`svn commit ${config.workpath["server"]} -m 'build${Date.now()}'`)
    }

    static async commitclientconfig() {
        logger.log('svn add client...');
        await utils.runcmd(`svn add ${config.workpath["client-config"]}/. --no-ignore --force`)
        logger.log('svn commit client...');
        await utils.runcmd(`svn commit ${config.workpath["client-config"]} -m 'build${Date.now()}'`)
    }

    static async commitserverconfig() {
        logger.log('svn add server...');
        await utils.runcmd(`svn add ${config.workpath["server-config"]}/. --no-ignore --force`)
        logger.log('svn commit server...');
        await utils.runcmd(`svn commit ${config.workpath["server-config"]} -m 'build${Date.now()}'`)
    }

    static async syncserver() {
        var from = config.workpath["server-release"].from;
        var to = config.workpath["server-release"].to;
        utils.clearFolder(to);
        utils.copyFolder(from, to, '.svn');
    }

    static async run(name) {
        var list = Task._register[name];
        Task._taskstate[name].isrun = true;
        for (var i = 0; i < list.length; i++) {
            Task._taskstate[name].phase = i + 1;
            Task.statechange && Task.statechange();
            await list[i]();
        }
        Task._taskstate[name].isrun = false;
        Task._taskstate[name].phase = list.length + 1;
        Task.statechange && Task.statechange();
        logger.log('任务完成.');
    }

    static async exec(cmdname) {
        if (Task._curtask) return;
        if (!Task._register) {
            Task._register = {
                'all': [Task.updatexls, Task.updateclient, Task.updateserver, Task.exportconfig, Task.compileclient, Task.compileserver, Task.commitclient, Task.commitserver],
                'config': [Task.updatexls, Task.updateclientconfig, Task.updateserverconfig, Task.exportconfig, Task.commitclientconfig, Task.commitserverconfig, Task.syncserver],
                'proto': [Task.updatproto, Task.updateclient, Task.updateserver, Task.exportproto, Task.commitclient, Task.commitserver, Task.syncserver],
                'client': [Task.updateclient, Task.compileclient],
                'server': [Task.updateserver, Task.compileserver, Task.syncserver]
            }
        }
        Task._curtask = cmdname;
        if (Task._register[cmdname]) {
            Task.run(cmdname);
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