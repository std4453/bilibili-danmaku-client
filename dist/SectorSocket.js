"use strict";

require("core-js/modules/web.dom.iterable");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

var WebSocket = require('x-platform-ws');

var EventEmitter = require('events');

var _require = require('./encoding'),
    encode = _require.encode,
    decode = _require.decode;
/**
 * SectorSocket is a wrapper WebSocket transfering only Sectors, by conforming to the
 * internal protocols of the Bilibili Live Websocket Interface.
 * Sectors are defined in ./sectors.js.
 *
 * EVENTS
 * 'open': When this socket is opened.
 * 'close': When this socket is closed. arg(s): code, reason
 * 'error': When the server sends an error. arg(s): error
 * 'sector': When a sector is received. arg(s): sector
 */


var SectorSocket =
/*#__PURE__*/
function (_EventEmitter) {
  _inheritsLoose(SectorSocket, _EventEmitter);

  /**
   * Construct a new SectorSocket object, connecting to the given url.
   * The 'options' parameter is used to enable customization of the WebSocket connection,
   * like setting the proxy, adding headers, etc.. For more details, see documentation
   * of ws.
   * Note that the WebSocket will be opening after this constructor returns, however, due
   * to the single-thread nature of Javascript, it is still possible to add middlewares
   * with use.
   *
   * @param {string} url The url to connect to.
   * @param {*} options The options used to customize the WebSocket connection, optional.
   * @see use
   */
  function SectorSocket(url, options) {
    var _this;

    if (options === void 0) {
      options = {};
    }

    _this = _EventEmitter.call(this) || this;
    var ws = new WebSocket(url, undefined, options);
    _this.ws = ws;
    ws.on('message', _this.onMessage.bind(_assertThisInitialized(_assertThisInitialized(_this))));
    ['open', 'close', 'error'].forEach(function (eventName) {
      ws.on(eventName, function () {
        var _this2;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return (_this2 = _this).emit.apply(_this2, [eventName].concat(args));
      });
    });
    return _this;
  }
  /**
   * Use the middleware for the current SectorSocket.
   * This method should be called directly after the SectorSocket() constructor.
   * Middlewares are used to add functionality to this plain socket, while enhancing
   * modularization. The idea was taken from the Express middlewares.
   * Middlewares are functions, invoked only once, at the invocation of use(), taking
   * the current SectorSocket object as argument.
   * It is typical to add listeners in middlewares, since SectorSocket extends
   * EventEmitter.
   * It is safe to assume that the SectorSocket is not yet opened nor closed then the
   * middleware is applied.
   *
   * @param {Function} middleware The middleware to use.
   */


  var _proto = SectorSocket.prototype;

  _proto.use = function use(middleware) {
    middleware(this);
  };
  /**
   * Called on the 'message' event of the underlying WebSocket, decoding Buffer or
   * Buffer[] data to sectors and emitting 'sector' events.
   * This is an internal method.
   *
   * @param {string|Buffer|Buffer[]} data The data of the message.
   */


  _proto.onMessage = function onMessage(data) {
    var _this3 = this;

    var onBuffer = function onBuffer(buf) {
      return decode(buf).forEach(function (sector) {
        return _this3.emit('sector', sector);
      });
    };

    if (data instanceof Buffer) onBuffer(data);else if (data instanceof Array) {
      data.filter(function (el) {
        return el instanceof Buffer;
      }).forEach(onBuffer);
    }
  };
  /**
   * Send the given sectors, one by one.
   * The sectors are first encoded into Buffers and then send by the WebSocket.
   * For more details about the encoding process, see encoding.js
   *
   * @param {Sector[]} sectors The sectors to send.
   */


  _proto.send = function send() {
    this.ws.send(encode.apply(void 0, arguments));
  };
  /**
   * Terminate the socket.
   * Note that an 'close' event will be emitted after terminate().
   * Behavior of calling other methods on the SectorSocket instance after terminate is
   * undefined and should be avoided.
   */


  _proto.terminate = function terminate() {
    this.ws.terminate();
  };

  return SectorSocket;
}(EventEmitter);

module.exports = SectorSocket;
//# sourceMappingURL=SectorSocket.js.map