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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TZWN0b3JTb2NrZXQuanMiXSwibmFtZXMiOlsiV2ViU29ja2V0IiwicmVxdWlyZSIsIkV2ZW50RW1pdHRlciIsImVuY29kZSIsImRlY29kZSIsIlNlY3RvclNvY2tldCIsInVybCIsIm9wdGlvbnMiLCJ3cyIsInVuZGVmaW5lZCIsIm9uIiwib25NZXNzYWdlIiwiYmluZCIsImZvckVhY2giLCJldmVudE5hbWUiLCJhcmdzIiwiZW1pdCIsInVzZSIsIm1pZGRsZXdhcmUiLCJkYXRhIiwib25CdWZmZXIiLCJidWYiLCJzZWN0b3IiLCJCdWZmZXIiLCJBcnJheSIsImZpbHRlciIsImVsIiwic2VuZCIsInRlcm1pbmF0ZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsSUFBTUEsWUFBWUMsUUFBUSxlQUFSLENBQWxCOztBQUNBLElBQU1DLGVBQWVELFFBQVEsUUFBUixDQUFyQjs7ZUFFMkJBLFFBQVEsWUFBUixDO0lBQW5CRSxNLFlBQUFBLE07SUFBUUMsTSxZQUFBQSxNO0FBRWhCOzs7Ozs7Ozs7Ozs7O0lBV01DLFk7Ozs7O0FBQ0Y7Ozs7Ozs7Ozs7Ozs7QUFhQSx3QkFBWUMsR0FBWixFQUFpQkMsT0FBakIsRUFBK0I7QUFBQTs7QUFBQSxRQUFkQSxPQUFjO0FBQWRBLGFBQWMsR0FBSixFQUFJO0FBQUE7O0FBQzNCO0FBRUEsUUFBTUMsS0FBSyxJQUFJUixTQUFKLENBQWNNLEdBQWQsRUFBbUJHLFNBQW5CLEVBQThCRixPQUE5QixDQUFYO0FBQ0EsVUFBS0MsRUFBTCxHQUFVQSxFQUFWO0FBQ0FBLE9BQUdFLEVBQUgsQ0FBTSxTQUFOLEVBQWlCLE1BQUtDLFNBQUwsQ0FBZUMsSUFBZix1REFBakI7QUFDQSxLQUFDLE1BQUQsRUFBUyxPQUFULEVBQWtCLE9BQWxCLEVBQTJCQyxPQUEzQixDQUFtQyxVQUFDQyxTQUFELEVBQWU7QUFDOUNOLFNBQUdFLEVBQUgsQ0FBTUksU0FBTixFQUFpQjtBQUFBOztBQUFBLDBDQUFJQyxJQUFKO0FBQUlBLGNBQUo7QUFBQTs7QUFBQSxlQUFhLGlCQUFLQyxJQUFMLGdCQUFVRixTQUFWLFNBQXdCQyxJQUF4QixFQUFiO0FBQUEsT0FBakI7QUFDSCxLQUZEO0FBTjJCO0FBUzlCO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQWNBRSxHLGdCQUFJQyxVLEVBQVk7QUFDWkEsZUFBVyxJQUFYO0FBQ0gsRztBQUVEOzs7Ozs7Ozs7U0FPQVAsUyxzQkFBVVEsSSxFQUFNO0FBQUE7O0FBQ1osUUFBTUMsV0FBVyxTQUFYQSxRQUFXO0FBQUEsYUFBT2hCLE9BQU9pQixHQUFQLEVBQVlSLE9BQVosQ0FBb0I7QUFBQSxlQUFVLE9BQUtHLElBQUwsQ0FBVSxRQUFWLEVBQW9CTSxNQUFwQixDQUFWO0FBQUEsT0FBcEIsQ0FBUDtBQUFBLEtBQWpCOztBQUNBLFFBQUlILGdCQUFnQkksTUFBcEIsRUFBNEJILFNBQVNELElBQVQsRUFBNUIsS0FDSyxJQUFJQSxnQkFBZ0JLLEtBQXBCLEVBQTJCO0FBQzVCTCxXQUFLTSxNQUFMLENBQVk7QUFBQSxlQUFNQyxjQUFjSCxNQUFwQjtBQUFBLE9BQVosRUFBd0NWLE9BQXhDLENBQWdETyxRQUFoRDtBQUNIO0FBQ0osRztBQUVEOzs7Ozs7Ozs7U0FPQU8sSSxtQkFBaUI7QUFDYixTQUFLbkIsRUFBTCxDQUFRbUIsSUFBUixDQUFheEIsK0JBQWI7QUFDSCxHO0FBRUQ7Ozs7Ozs7O1NBTUF5QixTLHdCQUFZO0FBQ1IsU0FBS3BCLEVBQUwsQ0FBUW9CLFNBQVI7QUFDSCxHOzs7RUE3RXNCMUIsWTs7QUFnRjNCMkIsT0FBT0MsT0FBUCxHQUFpQnpCLFlBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgV2ViU29ja2V0ID0gcmVxdWlyZSgneC1wbGF0Zm9ybS13cycpO1xyXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKTtcclxuXHJcbmNvbnN0IHsgZW5jb2RlLCBkZWNvZGUgfSA9IHJlcXVpcmUoJy4vZW5jb2RpbmcnKTtcclxuXHJcbi8qKlxyXG4gKiBTZWN0b3JTb2NrZXQgaXMgYSB3cmFwcGVyIFdlYlNvY2tldCB0cmFuc2ZlcmluZyBvbmx5IFNlY3RvcnMsIGJ5IGNvbmZvcm1pbmcgdG8gdGhlXHJcbiAqIGludGVybmFsIHByb3RvY29scyBvZiB0aGUgQmlsaWJpbGkgTGl2ZSBXZWJzb2NrZXQgSW50ZXJmYWNlLlxyXG4gKiBTZWN0b3JzIGFyZSBkZWZpbmVkIGluIC4vc2VjdG9ycy5qcy5cclxuICpcclxuICogRVZFTlRTXHJcbiAqICdvcGVuJzogV2hlbiB0aGlzIHNvY2tldCBpcyBvcGVuZWQuXHJcbiAqICdjbG9zZSc6IFdoZW4gdGhpcyBzb2NrZXQgaXMgY2xvc2VkLiBhcmcocyk6IGNvZGUsIHJlYXNvblxyXG4gKiAnZXJyb3InOiBXaGVuIHRoZSBzZXJ2ZXIgc2VuZHMgYW4gZXJyb3IuIGFyZyhzKTogZXJyb3JcclxuICogJ3NlY3Rvcic6IFdoZW4gYSBzZWN0b3IgaXMgcmVjZWl2ZWQuIGFyZyhzKTogc2VjdG9yXHJcbiAqL1xyXG5jbGFzcyBTZWN0b3JTb2NrZXQgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgYSBuZXcgU2VjdG9yU29ja2V0IG9iamVjdCwgY29ubmVjdGluZyB0byB0aGUgZ2l2ZW4gdXJsLlxyXG4gICAgICogVGhlICdvcHRpb25zJyBwYXJhbWV0ZXIgaXMgdXNlZCB0byBlbmFibGUgY3VzdG9taXphdGlvbiBvZiB0aGUgV2ViU29ja2V0IGNvbm5lY3Rpb24sXHJcbiAgICAgKiBsaWtlIHNldHRpbmcgdGhlIHByb3h5LCBhZGRpbmcgaGVhZGVycywgZXRjLi4gRm9yIG1vcmUgZGV0YWlscywgc2VlIGRvY3VtZW50YXRpb25cclxuICAgICAqIG9mIHdzLlxyXG4gICAgICogTm90ZSB0aGF0IHRoZSBXZWJTb2NrZXQgd2lsbCBiZSBvcGVuaW5nIGFmdGVyIHRoaXMgY29uc3RydWN0b3IgcmV0dXJucywgaG93ZXZlciwgZHVlXHJcbiAgICAgKiB0byB0aGUgc2luZ2xlLXRocmVhZCBuYXR1cmUgb2YgSmF2YXNjcmlwdCwgaXQgaXMgc3RpbGwgcG9zc2libGUgdG8gYWRkIG1pZGRsZXdhcmVzXHJcbiAgICAgKiB3aXRoIHVzZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSB1cmwgdG8gY29ubmVjdCB0by5cclxuICAgICAqIEBwYXJhbSB7Kn0gb3B0aW9ucyBUaGUgb3B0aW9ucyB1c2VkIHRvIGN1c3RvbWl6ZSB0aGUgV2ViU29ja2V0IGNvbm5lY3Rpb24sIG9wdGlvbmFsLlxyXG4gICAgICogQHNlZSB1c2VcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IodXJsLCBvcHRpb25zID0ge30pIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICBjb25zdCB3cyA9IG5ldyBXZWJTb2NrZXQodXJsLCB1bmRlZmluZWQsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMud3MgPSB3cztcclxuICAgICAgICB3cy5vbignbWVzc2FnZScsIHRoaXMub25NZXNzYWdlLmJpbmQodGhpcykpO1xyXG4gICAgICAgIFsnb3BlbicsICdjbG9zZScsICdlcnJvciddLmZvckVhY2goKGV2ZW50TmFtZSkgPT4ge1xyXG4gICAgICAgICAgICB3cy5vbihldmVudE5hbWUsICguLi5hcmdzKSA9PiB0aGlzLmVtaXQoZXZlbnROYW1lLCAuLi5hcmdzKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2UgdGhlIG1pZGRsZXdhcmUgZm9yIHRoZSBjdXJyZW50IFNlY3RvclNvY2tldC5cclxuICAgICAqIFRoaXMgbWV0aG9kIHNob3VsZCBiZSBjYWxsZWQgZGlyZWN0bHkgYWZ0ZXIgdGhlIFNlY3RvclNvY2tldCgpIGNvbnN0cnVjdG9yLlxyXG4gICAgICogTWlkZGxld2FyZXMgYXJlIHVzZWQgdG8gYWRkIGZ1bmN0aW9uYWxpdHkgdG8gdGhpcyBwbGFpbiBzb2NrZXQsIHdoaWxlIGVuaGFuY2luZ1xyXG4gICAgICogbW9kdWxhcml6YXRpb24uIFRoZSBpZGVhIHdhcyB0YWtlbiBmcm9tIHRoZSBFeHByZXNzIG1pZGRsZXdhcmVzLlxyXG4gICAgICogTWlkZGxld2FyZXMgYXJlIGZ1bmN0aW9ucywgaW52b2tlZCBvbmx5IG9uY2UsIGF0IHRoZSBpbnZvY2F0aW9uIG9mIHVzZSgpLCB0YWtpbmdcclxuICAgICAqIHRoZSBjdXJyZW50IFNlY3RvclNvY2tldCBvYmplY3QgYXMgYXJndW1lbnQuXHJcbiAgICAgKiBJdCBpcyB0eXBpY2FsIHRvIGFkZCBsaXN0ZW5lcnMgaW4gbWlkZGxld2FyZXMsIHNpbmNlIFNlY3RvclNvY2tldCBleHRlbmRzXHJcbiAgICAgKiBFdmVudEVtaXR0ZXIuXHJcbiAgICAgKiBJdCBpcyBzYWZlIHRvIGFzc3VtZSB0aGF0IHRoZSBTZWN0b3JTb2NrZXQgaXMgbm90IHlldCBvcGVuZWQgbm9yIGNsb3NlZCB0aGVuIHRoZVxyXG4gICAgICogbWlkZGxld2FyZSBpcyBhcHBsaWVkLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IG1pZGRsZXdhcmUgVGhlIG1pZGRsZXdhcmUgdG8gdXNlLlxyXG4gICAgICovXHJcbiAgICB1c2UobWlkZGxld2FyZSkge1xyXG4gICAgICAgIG1pZGRsZXdhcmUodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgb24gdGhlICdtZXNzYWdlJyBldmVudCBvZiB0aGUgdW5kZXJseWluZyBXZWJTb2NrZXQsIGRlY29kaW5nIEJ1ZmZlciBvclxyXG4gICAgICogQnVmZmVyW10gZGF0YSB0byBzZWN0b3JzIGFuZCBlbWl0dGluZyAnc2VjdG9yJyBldmVudHMuXHJcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xCdWZmZXJ8QnVmZmVyW119IGRhdGEgVGhlIGRhdGEgb2YgdGhlIG1lc3NhZ2UuXHJcbiAgICAgKi9cclxuICAgIG9uTWVzc2FnZShkYXRhKSB7XHJcbiAgICAgICAgY29uc3Qgb25CdWZmZXIgPSBidWYgPT4gZGVjb2RlKGJ1ZikuZm9yRWFjaChzZWN0b3IgPT4gdGhpcy5lbWl0KCdzZWN0b3InLCBzZWN0b3IpKTtcclxuICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEJ1ZmZlcikgb25CdWZmZXIoZGF0YSk7XHJcbiAgICAgICAgZWxzZSBpZiAoZGF0YSBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgIGRhdGEuZmlsdGVyKGVsID0+IGVsIGluc3RhbmNlb2YgQnVmZmVyKS5mb3JFYWNoKG9uQnVmZmVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZW5kIHRoZSBnaXZlbiBzZWN0b3JzLCBvbmUgYnkgb25lLlxyXG4gICAgICogVGhlIHNlY3RvcnMgYXJlIGZpcnN0IGVuY29kZWQgaW50byBCdWZmZXJzIGFuZCB0aGVuIHNlbmQgYnkgdGhlIFdlYlNvY2tldC5cclxuICAgICAqIEZvciBtb3JlIGRldGFpbHMgYWJvdXQgdGhlIGVuY29kaW5nIHByb2Nlc3MsIHNlZSBlbmNvZGluZy5qc1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7U2VjdG9yW119IHNlY3RvcnMgVGhlIHNlY3RvcnMgdG8gc2VuZC5cclxuICAgICAqL1xyXG4gICAgc2VuZCguLi5zZWN0b3JzKSB7XHJcbiAgICAgICAgdGhpcy53cy5zZW5kKGVuY29kZSguLi5zZWN0b3JzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXJtaW5hdGUgdGhlIHNvY2tldC5cclxuICAgICAqIE5vdGUgdGhhdCBhbiAnY2xvc2UnIGV2ZW50IHdpbGwgYmUgZW1pdHRlZCBhZnRlciB0ZXJtaW5hdGUoKS5cclxuICAgICAqIEJlaGF2aW9yIG9mIGNhbGxpbmcgb3RoZXIgbWV0aG9kcyBvbiB0aGUgU2VjdG9yU29ja2V0IGluc3RhbmNlIGFmdGVyIHRlcm1pbmF0ZSBpc1xyXG4gICAgICogdW5kZWZpbmVkIGFuZCBzaG91bGQgYmUgYXZvaWRlZC5cclxuICAgICAqL1xyXG4gICAgdGVybWluYXRlKCkge1xyXG4gICAgICAgIHRoaXMud3MudGVybWluYXRlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VjdG9yU29ja2V0O1xyXG4iXX0=