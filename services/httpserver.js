var utils=require('../src/utils');
module.exports = (config) => {
    utils.runCmd({
        cmd:`http-server ${config.workpath.client} --cors -c0 -p ${config.appport["client-service"]}`,
        log:false
    });
    utils.runCmd({
        cmd:`http-server ${__dirname}/../www --cors -c0 -p ${config.appport["console-service"]}`,
        log:false
    });
}