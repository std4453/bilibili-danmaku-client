"use strict";

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.object.assign");

/**
 * The middlewares module.
 * This module contain the class definition of Middleware and implementations of most
 * middlewares used by DanmakuClient. Up till now, only the middleware that manages
 * the lifecycle of DanmakuClient isn't included in middlewares.js, which has good
 * reasons to do so. For more information, see documentation of manageLifecycle in
 * DanmakuClient.js.
 *
 * When writing new Middlewares, it is recommended that implementations only take
 * advantage of the following knowledge to avoid breaking functionalities
 * accidentally:
 * 1. DanmakuClient extends EventEmitter, and 'terminating' is a reserved event name.
 * 2. config() of middleware takes a SectorSocket, a merged conf object, and a
 *    DanmakuClient instance as arguments.
 * 3. Raw conf objects are merged with the default conf object using lodash.defaultsDeep().
 *
 * @module biliDanmakuClient/middlewares
 */
var _require = require('lodash'),
    defaultsDeep = _require.defaultsDeep,
    fromPairs = _require.fromPairs;

var log = require('debug')('bilibili-danmaku-client/middlewares');

var _require2 = require('./sectors'),
    InitSector = _require2.InitSector,
    InitAckSector = _require2.InitAckSector,
    HeartbeatSector = _require2.HeartbeatSector,
    DataSector = _require2.DataSector;

var _require3 = require('./transformers'),
    all = _require3.all;
/**
 * Middleware are used to config the SectorSocket and the DanmakuClient instance.
 * Middleware instances can be reused arbitrary times, across different SectorSocket
 * and DanmakuClient instances. In fact, it can be called multiple times in an
 * keepAlive connection.
 */


var Middleware =
/*#__PURE__*/
function () {
  /**
   * Constructs the Middleware instance.
   * Different middlewares do not create new classes. Instead, middlewares are merely
   * a config function and a default conf object, and using the constructor of
   * Middleware to create instances. The Middleware class is to enable the
   * middleware.config() pattern and add conf merging ability.
   *
   * @param {Function} config The config function.
   * @param {*} defaultConf The default conf object, optional.
   * @see #config
   */
  function Middleware(config, defaultConf) {
    if (defaultConf === void 0) {
      defaultConf = {};
    }

    this.configFn = config;
    this.defaultConf = defaultConf;
  }
  /**
   * Config the Middleware with the given parameters.
   * The conf parameter is the raw input without default values, since config()
   * merges it with this.defaultConf and builds the actual conf object and call
   * this.configFn() to run the configuration.
   *
   * There are some attributes that are merged automatically and do not need
   * to be merged by middlewares:
   *     url: The url that the SectorSocket is connecting to.
   *     room: The room that the SectorSocket is watching.
   *     uid: The contextual user id. 0 if not specified.
   *     options: The options object passed into constructor of Websocket, to support
   *              customization of the connection.
   *
   * @param {SectorSocket} ws The SectorSocket instance.
   * @param {*} conf The raw config object.
   * @param {DanmakuClient} client The DanmakuClient instance.
   */


  var _proto = Middleware.prototype;

  _proto.config = function config(ws, conf, client) {
    var merged = defaultsDeep(conf, this.defaultConf);
    this.configFn(ws, merged, client);
  };

  return Middleware;
}();

var sendInitial = new Middleware(function (ws, conf) {
  return ws.on('open', function () {
    ws.send(new InitSector(Object.assign({}, conf.initial, {
      uid: conf.uid,
      roomid: conf.room
    })));
  });
}, {
  initial: {
    protover: 1,
    platform: 'web',
    clientver: '1.4.3'
  }
});
var invokeTransformer = new Middleware(function (ws, conf, client) {
  ws.on('sector', function (sector) {
    if (!(sector instanceof DataSector)) return;
    var msg = sector.data;
    if (!('cmd' in msg)) return;

    if (msg.cmd in conf.transformers) {
      var transformer = conf.transformers[msg.cmd];
      client.emit(transformer.name, transformer.transform(msg));
    } else {
      log('Untransformed data sector:');
      log(msg);
    }
  });
}, {
  transformers: fromPairs(all.map(function (t) {
    return [t.name, t];
  })),
  logUntransformed: true
});
var sendHeartbeat = new Middleware(function (ws, conf) {
  if (!conf.heartbeat.enabled) return;
  var handle = setInterval(function () {
    return ws.send(new HeartbeatSector());
  }, conf.heartbeat.interval);

  var clear = function clear() {
    return clearInterval(handle);
  };

  ws.on('close', clear);
  ws.on('error', clear);
}, {
  heartbeat: {
    enabled: true,
    interval: 30000 // 30s

  }
});
var logLifecycle = new Middleware(function (ws, conf) {
  if (!conf.logging) return;
  log("Connecting to " + conf.url + "...");
  ws.on('open', function () {
    return log('Connection opened, sending initial sector...');
  });
  ws.on('sector', function (sector) {
    if (sector instanceof InitAckSector) {
      log("Init ACK Sector received: room=" + conf.room + ", uid=" + conf.uid + ".");
    }
  });
  ws.on('close', function (code, reason) {
    return log("Connection closed: code=" + code + ", reason=" + reason + ".");
  });
  ws.on('error', function (error) {
    return log("Server error: " + error);
  });
}, {
  logging: true
});
var middlewares = {
  sendInitial: sendInitial,
  invokeTransformer: invokeTransformer,
  sendHeartbeat: sendHeartbeat,
  logLifecycle: logLifecycle
};
module.exports = Object.assign({
  Middleware: Middleware
}, middlewares, {
  all: Object.keys(middlewares).map(function (key) {
    return middlewares[key];
  })
});
//# sourceMappingURL=middlewares.js.map