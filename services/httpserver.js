var utils=require('../src/utils');
module.exports = (config) => {
    utils.runCmd(`http-server ${config.workpath.client} --cors -c0 -p ${config.appport["client-service"]}`, null, false, false);
    utils.runCmd(`http-server ${__dirname}/../www --cors -c0 -p ${config.appport["console-service"]}`, null, false, false);
}