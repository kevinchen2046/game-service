var fs = require('fs');
var config = {
    "workpath": {
        "client": "",
        "server": "",
        "excel": "",
        "client-config": "",
        "server-config": "",
        "server-release-config": ""
    },
    "appport": {
        "client-service": 0,
        "console-service": 0,
        "build-service": 0
    }
}
config = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`, 'utf-8'));
module.exports = config;