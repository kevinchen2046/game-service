module.exports = class Utils {
    static request(url,time,callback,formatjson) {
        var urlrequest = new XMLHttpRequest();
        var timeout = false;
        var timer = setTimeout(function () {
            timeout = true;
            urlrequest.abort();
        }, time);
        urlrequest.open("GET", url);
        urlrequest.onreadystatechange = function () {
            if (urlrequest.readyState !== 4) return;
            if (timeout) return;
            clearTimeout(timer);
            if (urlrequest.status === 200) {
                callback(formatjson?JSON.parse(urlrequest.responseText):urlrequest.responseText);
            }
        }
        urlrequest.send(null);
    }

    static load(url,callback,formatjson) {
        if(formatjson==undefined) formatjson=true;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url+'?'+Math.random(),true);
        xhr.addEventListener("load", function () {
            //xhr.removeEventListener('load', arguments.callee, false);
            callback(formatjson?JSON.parse(xhr.response):xhr.response);
        });
        xhr.send(null);
    }
}