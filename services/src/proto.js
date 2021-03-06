
var path = require('path');
var fs = require('fs');
var config = require('./config');
var utils = require('./utils');
var logger = require('./logger');
var template_dts = fs.readFileSync(`${__dirname}/../../${config.template.proto}/proto.d.ts`, 'utf-8');
var template_js = fs.readFileSync(`${__dirname}/../../${config.template.proto}/proto.js`, 'utf-8');

class TypeScriptParser {
    static parse(content) {
        var clazznames = content.match(/(?<=class)([\S\s]*?)(?={)/g);
        var clazzcontents = content.match(/(?<={)([\S\s]*?)(?=})/g);
        if (clazznames.length != clazzcontents.length) {
            console.error('解析错误...');
            return;
        }
        var results = {};
        for (var i = 0; i < clazznames.length; i++) {
            var properties = results[clazznames[i].replace(/ /g, '')] = [];
            var lines = clazzcontents[i].split('\r\n');
            var notes;
            for (var line of lines) {
                var linecontent = line.replace(/ /g, '');
                if (!linecontent) continue;
                var isnote = !!linecontent.match(/^[\/{1}*{2},\/{1}\/{2},*{1}]/);
                if (isnote) {
                    if (!notes) notes = [];
                    notes.push(linecontent);
                } else {
                    var p = linecontent.split(':');
                    if (p.length != 2) {
                        console.error('解析错误:', clazznames[i]);
                        continue;
                    }
                    properties.push({
                        filed: p[0].replace(/ /g, ''),
                        type: p[1].replace(/ /g, ''),
                        note: notes ? notes.join('').replace(/\//g, '').replace(/\*/g, '') : ''
                    })
                    notes = null;
                }
            }
        }
        return results;
    }
}

class Generater {

    static __Substring(source,startTag, endTag) {
        var start = startTag;
        var end = endTag;
        var sindex = source.indexOf(start) + start.length;
        var eindex = source.indexOf(end) - 1;
        return source.substring(sindex, eindex);
    }

    static createdts(files) {
        var moduleformat = `\r\ndeclare namespace proto.{modulename} {\r\n        {content}\r\n}`
        var classformat = `\r\n    class {classname} extends proto.Message {\r\n            {content}\r\n    }`
        var contents = [];
        for (var name in files) {
            var file = files[name];
            var filecontents = [];
            for (var classname in file) {
                if (classname == '__moduleid__') continue;
                var fileds = file[classname];
                var result = [];
                for (var filed of fileds) {
                    if (filed.filed == '__cmd__') continue;
                    if (filed.note) {
                        result.push(`/**${filed.note}**/`)
                    }
                    result.push(`${filed.filed}:${filed.type};`)
                }
                filecontents.push(classformat.replace('{classname}', classname).replace('{content}', result.join('\r\n        ')));
            }
            contents.push(moduleformat.replace('{modulename}', name).replace('{content}', filecontents.join('\r\n    ')))
        }
        var replacetext = Generater.__Substring(template_dts,'///////////////////////GENERATE-START/////////////////////','///////////////////////GENERATE-END/////////////////////');
        return template_dts.replace(replacetext, contents.join('\r\n'));
    }

    static createjs(files) {
        var moduleformat = `\r\n    var {modulename};\r\n    (function (bag) {\r\n    {modulename}.__moduleid__ = {moduleid};\r\n    {content}\r\n    })({modulename} || ({modulename} = {}));\r\n    proto.{modulename} = {modulename};`;
        var classformat = `    {modulename}.{classname} = {msgid};`;
        var mapformat = `    proto.__map__[{modulename}.{classname}] = bag.__moduleid__;`
        var contents = [];
        var mapcontents = [];
        for (var name in files) {
            var file = files[name];
            var filecontents = [];
            for (var classname in file) {
                if (classname == '__moduleid__') continue;
                var fileds = file[classname];
                console.log(fileds)
                var msgid;
                for (var filed of fileds) {
                    if (filed.filed == '__cmd__') {
                        msgid = file['__moduleid__']+filed.type;
                        continue;
                    }
                }
                filecontents.push(classformat.replace('{modulename}', name).replace('{classname}', classname).replace('{msgid}', msgid));
                mapcontents.push(mapformat.replace('{modulename}', name).replace('{classname}', classname));
            }
            contents.push(moduleformat.replace(/{modulename}/g, name).replace('{moduleid}', file['__moduleid__']).replace('{content}', filecontents.join('\r\n    ')))
        }
        var replacedefinetext = Generater.__Substring(template_js,'///////////////////////GENERATE-START/////////////////////','///////////////////////GENERATE-END/////////////////////');
        var replacemaptext= Generater.__Substring(template_js,'///////////////////////Map-START[Server]/////////////////////','///////////////////////Map-End[Server]/////////////////////');
        return template_js.replace(replacedefinetext, contents.join('\r\n') + '\r\n    ').replace(replacemaptext, '\r\n' + mapcontents.join('\r\n') + '\r\n    ');
    }
}

module.exports = async function () {
    return new Promise((reslove, reject) => {
        utils.clearFolder(config.workpath["client-proto"]);
        utils.clearFolder(config.workpath["server-proto"]);
        var filePath = config["workpath"]["proto"];
        var files = fs.readdirSync(filePath);
        var results = {};
        logger.log('开始解析协议文件...')
        for (var file of files) {
            if (file == '___.ts') continue;
            if (path.extname(file) != '.ts') continue;
            var content = fs.readFileSync(filePath + '/' + file).toString();
            var filename = file.replace(path.extname(file), '');
            var moduleid = -1;
            var name = filename;
            if (filename.indexOf('&') > 0) {
                var a = filename.split('&');
                name = a[0];
                moduleid = a[1];
            }
            results[name] = TypeScriptParser.parse(content);
            results[name]['__moduleid__'] = moduleid;
        }
        logger.log('生成定义文件...')
        var filets = Generater.createdts(results);
        logger.log('生成映射文件...')
        var filejs = Generater.createjs(results)

        logger.log('写入客户端协议...')
        utils.createFolder(`${config["workpath"]["client-proto"]}`);
        fs.writeFileSync(`${config["workpath"]["client-proto"]}/proto.d.ts`, filets);
        fs.writeFileSync(`${config["workpath"]["client-proto"]}/proto.js`, filejs.replace('//#Server\r\nexports.proto = proto;',''))
        utils.runcmd(`uglifyjs ${config["workpath"]["client-proto"]}/proto.js -o ${config["workpath"]["client-proto"]}/proto.min.js`, () => {
            logger.log('写入服务端协议...')
            utils.createFolder(`${config["workpath"]["server-proto"]}`);
            fs.writeFileSync(`${config["workpath"]["server-proto"]}/proto.d.ts`, filets);
            fs.writeFileSync(`${config["workpath"]["server-proto"]}/proto.js`, filejs.replace('proto.poolenable = true;', 'proto.poolenable = false;').replace('//#Client\r\nwindow.proto = proto;',''));
            logger.log('导出协议完成', 'LOG');
            reslove();
        });
    });
}


