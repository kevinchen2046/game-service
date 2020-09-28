var xlsx = require('node-xlsx');
var path = require('path');
var fs = require('fs');
var logger = require('./logger');
var config=require('./config');
var utils=require('./utils');
// const Excel = require('exceljs');
// const workbook = new Excel.Workbook();
//         await workbook.xlsx.readFile(folderpath + '/' + file)
//         workbook.eachSheet((sheet,id)=>{
//             for(var a=0;a<sheet.columnCount;a++){
//                 console.log(sheet.columns[a].values);
//             }
//         })
//         return;
let Tags = {
    client: '客户端字段',
    server: '服务器字段',
    common: '通用字段',
    ignore: '忽略字段',
    list: ['客户端字段', '服务器字段', '通用字段', '忽略字段']
}

function format(array) {
    var content = "";
    for (var row of array) {
        content += row.join('	') + '\r\n';
    }
    return content;
}
class Generater {
    static export(filepath) {
        logger.log('正在导出文件:' + filepath, 'LOG', 'config.log');
        var result = {
            clients: [],
            servers: []
        }
        var sheets = xlsx.parse(filepath);
        //console.log(workbook)
        for (var key in sheets) {
            var sheet = sheets[key];
            if (sheet.name.match(/^[\u4e00-\u9fa5]/)) continue;
            var tags = sheet.data[0];
            if (!tags || !tags.length) continue;
            if (Tags.list.indexOf(tags[0]) == -1) {
                logger.log('表头错误:' + sheet.name, 'ERROR', 'config.log');
                return result;
            }
            logger.log('正在导出表:' + sheet.name, 'LOG', 'config.log');
            var length = 0;
            for (var i = 0; i < tags.length; i++) {
                if (!tags[i] || Tags.list.indexOf(tags[i]) == -1) {
                    break;
                }
                length = i + 1;
            }
            var clients = [];
            var servers = [];
            for (var a = 1; a < sheet.data.length; a++) {
                var row = sheet.data[a];
                var rowclient = [];
                var rowserver = [];
                var notEmpty = false;
                for (var b = 0; b < length; b++) {
                    var value = row[b];
                    if (value != undefined && value != null && value.toString() != '') notEmpty = true;
                    if (tags[b] == Tags.client || tags[b] == Tags.common) {
                        rowclient.push(value);
                    }
                    if (tags[b] == Tags.server || tags[b] == Tags.common) {
                        rowserver.push(value);
                    }
                }
                if (!notEmpty && (rowclient.length || rowserver.length)) {
                    logger.log('忽略行:' + [sheet.name, notEmpty, rowclient.length, rowserver.length, 'row:', rowclient, rowserver].join(','), 'WARN', 'config.log', false);
                }
                notEmpty && rowclient.length && clients.push(rowclient);
                notEmpty && rowserver.length && servers.push(rowserver);
            }
            clients.length && result.clients.push({ name: sheet.name, content: format(clients) })
            servers.length && result.servers.push({ name: sheet.name, content: format(servers) })
            logger.log('导出表' + sheet.name + '成功', 'LOG', 'config.log');
        }
        return result;
    }
}

module.exports = function () {
    logger.cleanfile('config.log');
    utils.clearFolder(config.workpath["client-config"]);
    utils.clearFolder(config.workpath["server-config"]);
    var files = fs.readdirSync(config.workpath.excel);
    for (var file of files) {
        if (path.extname(file) != '.xls') continue;
        var result = Generater.export(config.workpath.excel + '/' + file);
        for (var resclient of result.clients) {
            fs.writeFileSync(config.workpath["client-config"] + '/' + resclient.name + '.txt', resclient.content, 'utf-8');
        }
        for (var resserver of result.servers) {
            fs.writeFileSync(config.workpath["server-config"] + '/' + resserver.name + '.txt', resserver.content, 'utf-8');
            // fs.writeFileSync(config.workpath["server-release-config"] + '/' + resserver.name + '.txt', resserver.content, 'utf-8');
        }
    }
    logger.log('导出表完成', 'LOG', 'config.log');
}