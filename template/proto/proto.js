var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var proto;
(function (proto) {
    ///////////////////////POOL-START/////////////////////
    proto.poolenable = true;
    proto.destorytime = 1000 * 20;
    proto.destorychecktime = 5000;
    var pool = {};
    proto.get = function (id) {
        if(!proto.poolenable) return { __msgid__: id };
        var msg;
        if (pool[id] && pool[id].length) {
            msg = pool[id].pop();
        } else {
            msg = { __msgid__: id }
        }
        msg.__autorecover__ = true;
        return msg;
    }
    proto.to = function (protoobj) {
        if(!proto.poolenable) return;
        if (!protoobj || !protoobj.__msgid__) {
            console.error('proto is broken!');
            return;
        }
        if (!pool[protoobj.__msgid__]) {
            pool[protoobj.__msgid__] = [];
        }
        for (var key in protoobj) {
            delete protoobj[key];
        }
        protoobj.__pooltime = Date.now();
        pool[protoobj.__msgid__].push(protoobj);
    }
    proto.__debug__ = function () {
        console.log(pool);
    }

    function checkdestory() {
        for (var id in pool) {
            var list = pool[id];
            for (var i = 0; i < list.length; i++) {
                var obj = list[i];
                if (Date.now() - obj.__pooltime >= proto.destorytime) {
                    list.splice(i, 1);
                    i--;
                }
            }
        }
        setTimeout(checkdestory.bind(proto), proto.destorychecktime);
    }
    proto.poolenable&&checkdestory.call(proto);
    ///////////////////////POOL-END/////////////////////

    ///////////////////////GENERATE-START/////////////////////
    var bag;
    (function (bag) {
        bag.__moduleid__ = 67;
        bag.SAddItem = 12200;
        bag.SRemoveItem = 12201;
    })(bag || (bag = {}));
    proto.bag = bag;

    var activity;
    (function (activity) {
        activity.__moduleid__ = 68;
        activity.CAddItem = 13200;
        activity.CRemoveItem = 13201;
    })(activity || (activity = {}));
    proto.activity = activity;
    ///////////////////////GENERATE-END/////////////////////
    proto.getModuleId = function (cmd, moduleId) {
        if (moduleId != undefined && moduleId >= 0) return moduleId;
        return proto.__map__[cmd];
    }
    ///////////////////////Map-START[Server]/////////////////////
    proto.__map__[bag.SAddItem] = bag.__moduleid__;
    proto.__map__[bag.SRemoveItem] = bag.__moduleid__;
    proto.__map__[bag.CAddItem] = bag.__moduleid__;
    proto.__map__[bag.CRemoveItem] = bag.__moduleid__;
    ///////////////////////Map-End[Server]/////////////////////
})(proto || (proto = {}));

//#Server
exports.proto = proto;

