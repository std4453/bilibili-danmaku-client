"use strict";

require("core-js/modules/web.dom.iterable");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var EventEmitter = require('events');

var _require = require('lodash'),
    defaultsDeep = _require.defaultsDeep;

var log = require('debug')('bilibili-danmaku-client/client');

var SectorSocket = require('./SectorSocket');

var _require2 = require('./middlewares'),
    Middleware = _require2.Middleware,
    all = _require2.all; // TODO: make this more elegant.

/**
 * The Middleware that manages the lifecycle of DanmakuClient.
 * This middleware is necessary for DanmakuClient to work correctly and is so closely
 * related to the internal mechanics of DanmakuClient so that it must be placed in
 * DanmakuClient.js.
 *
 * Lifecycle of DanmakuClient instance are described with their state attribute.
 * A list of all possible lifecycle states are:
 * 'idle': When the client is not yet started.
 * 'connecting': When the client is started and trying to connect to the remote server.
 * 'opened': When the WebSocket connection is opened and ready to send and receive data.
 * 'reconnecting': When the DanmakuClient is in keepAlive mode and waiting to reconnect.
 * 'terminating': When the termination is request and waiting for the actual termination
 *     to take place.
 * 'terminated': When the client is terminated.
 *
 * Each DanmakuClient has a mode, keepAlive or non-keepAlive, configured by setting
 * conf.keepAlive.enabled.
 * In non-keepAlive mode, the client terminates directly after the WebSocket is closed
 * or gets an error. In keepAlive mode, the client waits for some time interval and then
 * tries to reconnecto to the server again.
 *
 * State transitions are as follows:
 * Start from 'idle'.
 * 'idle' -> 'connecting' on start()
 * 'connecting' -> 'terminated' on non-keepAlive and connection error
 *              -> 'opened' on successful connection
 *              -> 'terminating' on terminate()
 * 'opened' -> 'terminated' on non-keepAlive and connection close / error
 *          -> 'reconnecting' on keepAlive and connection close / error
 *          -> 'terminating' on terminate()
 * 'reconnecting' -> 'connecting' after some time interval
 *                -> 'terminating' on terminate()
 * 'terminating' -> 'terminated' on connection close / next setState() call
 * 'terminated' is the final state.
 */


var manageLifecycle = new Middleware(function (ws, conf, client) {
  // If terminate is requested, switch to terminated and return false, else return true.
  var checkTerminate = function checkTerminate() {
    if (client.state === 'terminating') {
      client.setState('terminated');
      return false;
    }

    return true;
  };

  if (!checkTerminate()) return;
  client.setState('connecting');
  ws.on('open', function () {
    if (checkTerminate()) client.setState('opened');
  });
  var closeAction = conf.keepAlive.enabled ? function () {
    if (!checkTerminate()) return;
    if (client.state === 'reconnecting') return;
    var reconnStr = conf.keepAlive.reconnectInterval.toFixed(0);
    log("Connection to " + conf.url + " closed / got an error while in keepAlive mode, therefore DanmakuClient will auto-reconnect after " + reconnStr + " seconds.");
    log('To terminate the client, call terminate().');
    client.setState('reconnecting');

    var reconnect = function reconnect() {
      if (checkTerminate()) client.connect();
    };

    setTimeout(reconnect, conf.keepAlive.reconnectInterval);
  } : function () {
    if (checkTerminate()) client.setState('terminated');
  };
  ['close', 'error'].forEach(function (name) {
    return ws.on(name, closeAction);
  });
  client.once('terminate', function () {
    return ws.terminate();
  });
}, {
  keepAlive: {
    enabled: true,
    reconnectInterval: 5000
  }
});
var defaultConf = {
  url: 'wss://broadcastlv.chat.bilibili.com:2245/sub',
  room: 1,
  uid: 0,
  // without a user
  middlewares: all,
  // use all middlwares
  options: {
    rejectUnauthorized: false
  } // avoid unauthorized error

};

var DanmakuClient =
/*#__PURE__*/
function (_EventEmitter) {
  _inheritsLoose(DanmakuClient, _EventEmitter);

  /**
   * Constructs the DanmakuClient instance.
   * After initialization, the state of this DanmakuClient is set to 'idle',
   * applications should call start() to actually start the client.
   *
   * @param {*} conf The conf object.
   */
  function DanmakuClient(conf) {
    var _this;

    _this = _EventEmitter.call(this) || this;
    _this.conf = defaultsDeep(conf, defaultConf);
    _this.state = 'idle';
    return _this;
  }
  /**
   * Build connection to the Danmaku server, configurating all the middlewares.
   * The socket is not saved in the DanmakuClient interface, applications should use
   * middlewares to add functionality.
   * This is an internal method.
   * For details of how this methods works, see documentation of manageLifecycle.
   */


  var _proto = DanmakuClient.prototype;

  _proto.connect = function connect() {
    var _this2 = this;

    var socket = new SectorSocket(this.conf.url, this.conf.options);
    this.conf.middlewares.concat([manageLifecycle]).forEach(function (middleware) {
      return middleware.config(socket, _this2.conf, _this2);
    });
  };
  /**
   * Start this DanmakuClient.
   * The DanmakuClient instance can be started only when its state is 'idle'.
   * For details of how this methods works, see documentation of manageLifecycle.
   */


  _proto.start = function start() {
    if (this.state === 'idle') this.connect();
  };
  /**
   * Terminate this DanmakuClient.
   * On terminate(), the client isn't terminated immediately. In fact, it first
   * switches to 'terminating' state, and will eventually switch to 'terminated'
   * state after some time.
   * If the current state is 'terminating', 'terminated' or 'idle', nothing happens.
   * For details of how this methods works, see documentation of manageLifecycle.
   */


  _proto.terminate = function terminate() {
    if (['terminating', 'terminated', 'idle'].indexOf(this.state) !== -1) return;
    this.setState('terminating');
    this.emit('terminate');
  };
  /**
   * Set the current state of this DanmakuClient.
   * States MUST be switched using this method, except in the constructor. setState()
   * sets the state and emits an event with the name being the new state so that
   * applications can listen to the lifecycle changes of the client.
   * This is an internal method.
   *
   * @param {string} state The state to switch to.
   */


  _proto.setState = function setState(state) {
    if (this.state !== state) {
      this.state = state;
      this.emit(state);
    }
  };

  return DanmakuClient;
}(EventEmitter);

module.exports = DanmakuClient;
//# sourceMappingURL=DanmakuClient.js.map