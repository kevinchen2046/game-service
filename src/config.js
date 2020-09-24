var fs = require('fs');
var config = {
    "workpath": {
        "client": "",
        "server": "",
        "excel": "",
        "client-config": "",
        "server-config": "",
        "server-release-config": "",
        "proto":"",
        "client-proto":"",
        "server-proto":""
    },
    "template":{
        "proto":""
    },
    "appport": {
        "client-service": 0,
        "console-service": 0,
        "build-service": 0
    }
}
config = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`, 'utf-8'));
// config.workpath.proto=`${__dirname}/../proto`;
// config.workpath['client-proto']=`${__dirname}/../out/client`;
// config.workpath['server-proto']=`${__dirname}/../out/server`;

module.exports = config;