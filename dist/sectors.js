"use strict";

require("core-js/modules/es6.regexp.to-string");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/**
 * The sectors module.
 * This module contains class definitions for all the sectors.
 *
 * There are currently 5 types of sectors:
 * 1. Heartbeat sector.
 * 2. Heartbeat ACK sector.
 * 3. JSON data sector.
 * 4. Initialization sector.
 * 5. Initialization ACK sector.
 *
 * On establishment of WebSocket connection, the client sends an initialization sector,
 * and the server responds with an initialization ACK sector. If an initialization sector
 * was not send in the first 5 seconds, the connection will be closed.
 * Then, every 30 seconds, the client sends a heartbeat sector, and the server
 * responds with a heartbeat ACK sector.
 * During the time the connection is open, the server will send JSON data sectors
 * occasionlly, containing necessary data.
 *
 * It is designed that the classes in sectors.js do not know how and when these sectors
 * are send and received, but only their logical definitions: What / what type of data they
 * contain, and how should the data be encoded into binary code, that is, only the CONTENT
 * part of the whole sector. Other work is left to encoding.js to do.
 *
 * To identify different types of sectors, only these classes should be used, and not any
 * other string-ish representation.
 *
 * @module biliDanmakuClient/sectors
 */
var _require = require('buffer'),
    Buffer = _require.Buffer;

var charset = 'utf8';
/** Base class for all sector types */

var Sector =
/*#__PURE__*/
function () {
  function Sector() {}

  var _proto = Sector.prototype;

  /**
   * Encode this Sector into a Buffer object.
   * This is an abstract method and should be overridden by implementations
   * extending Sector.
   */
  _proto.encode = function encode() {
    throw new Error('Not implemented.');
  }; // eslint-disable-line class-methods-use-this


  return Sector;
}();
/**
 * Class method, decode the Buffer object into a Sector object of the given type.
 * Normally, this should be used like:
 *    MySector.decode(MySector, buf);
 * While the Class argument is still provided to enable overriding, as seen in JSONSector.
 * This is an abstract method and should be overridden by implementations extending Sector.
 *
 * @param {Function} Class The constructor of the target Sector class.
 * @param {Buffer} buf The buffer to decode.
 */


Sector.decode = function (Class, buf) {
  throw new Error('Not implemented.');
}; // eslint-disable-line no-unused-vars

/** Base class for all JSON-based sector types */


var JSONSector =
/*#__PURE__*/
function (_Sector) {
  _inheritsLoose(JSONSector, _Sector);

  function JSONSector(data) {
    var _this;

    _this = _Sector.call(this) || this;
    _this.data = data;
    return _this;
  }

  var _proto2 = JSONSector.prototype;

  _proto2.encode = function encode() {
    return Buffer.from(JSON.stringify(this.data), charset);
  };

  return JSONSector;
}(Sector);

JSONSector.decode = function (Class, buf) {
  return new Class(JSON.parse(buf.toString(charset)));
};
/** Base class for all raw-buffer-based sector types */


var RawSector =
/*#__PURE__*/
function (_Sector2) {
  _inheritsLoose(RawSector, _Sector2);

  function RawSector(buf) {
    var _this2;

    _this2 = _Sector2.call(this) || this;
    _this2.buf = buf;
    return _this2;
  }

  var _proto3 = RawSector.prototype;

  _proto3.encode = function encode() {
    return this.buf;
  };

  return RawSector;
}(Sector);

RawSector.decode = function (Class, buf) {
  return new Class(buf);
};

var HeartbeatSector =
/*#__PURE__*/
function (_RawSector) {
  _inheritsLoose(HeartbeatSector, _RawSector);

  function HeartbeatSector() {
    return _RawSector.call(this, Buffer.from('[object Object]', charset)) || this;
  }

  return HeartbeatSector;
}(RawSector);

var HeartbeatAckSector =
/*#__PURE__*/
function (_RawSector2) {
  _inheritsLoose(HeartbeatAckSector, _RawSector2);

  function HeartbeatAckSector() {
    return _RawSector2.call(this, Buffer.from([0x00, 0x00, 0x00, 0x00])) || this;
  }

  return HeartbeatAckSector;
}(RawSector);

var DataSector =
/*#__PURE__*/
function (_JSONSector) {
  _inheritsLoose(DataSector, _JSONSector);

  function DataSector() {
    return _JSONSector.apply(this, arguments) || this;
  }

  return DataSector;
}(JSONSector); // inherit constructor


var InitSector =
/*#__PURE__*/
function (_JSONSector2) {
  _inheritsLoose(InitSector, _JSONSector2);

  function InitSector() {
    return _JSONSector2.apply(this, arguments) || this;
  }

  return InitSector;
}(JSONSector); // inherit constructor


var InitAckSector =
/*#__PURE__*/
function (_RawSector3) {
  _inheritsLoose(InitAckSector, _RawSector3);

  function InitAckSector() {
    return _RawSector3.call(this, Buffer.alloc(0)) || this;
  } // with empty CONTENT part


  return InitAckSector;
}(RawSector);

module.exports = {
  Sector: Sector,
  RawSector: RawSector,
  JSONSector: JSONSector,
  HeartbeatSector: HeartbeatSector,
  HeartbeatAckSector: HeartbeatAckSector,
  DataSector: DataSector,
  InitSector: InitSector,
  InitAckSector: InitAckSector
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZWN0b3JzLmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJCdWZmZXIiLCJjaGFyc2V0IiwiU2VjdG9yIiwiZW5jb2RlIiwiRXJyb3IiLCJkZWNvZGUiLCJDbGFzcyIsImJ1ZiIsIkpTT05TZWN0b3IiLCJkYXRhIiwiZnJvbSIsIkpTT04iLCJzdHJpbmdpZnkiLCJwYXJzZSIsInRvU3RyaW5nIiwiUmF3U2VjdG9yIiwiSGVhcnRiZWF0U2VjdG9yIiwiSGVhcnRiZWF0QWNrU2VjdG9yIiwiRGF0YVNlY3RvciIsIkluaXRTZWN0b3IiLCJJbml0QWNrU2VjdG9yIiwiYWxsb2MiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7ZUE4Qm1CQSxRQUFRLFFBQVIsQztJQUFYQyxNLFlBQUFBLE07O0FBRVIsSUFBTUMsVUFBVSxNQUFoQjtBQUVBOztJQUNNQyxNOzs7Ozs7O0FBQ0Y7Ozs7O1NBS0FDLE0scUJBQVM7QUFBRSxVQUFNLElBQUlDLEtBQUosQ0FBVSxrQkFBVixDQUFOO0FBQXNDLEcsRUFBQzs7Ozs7QUFFdEQ7Ozs7Ozs7Ozs7OztBQVVBRixPQUFPRyxNQUFQLEdBQWdCLFVBQUNDLEtBQUQsRUFBUUMsR0FBUixFQUFnQjtBQUFFLFFBQU0sSUFBSUgsS0FBSixDQUFVLGtCQUFWLENBQU47QUFBc0MsQ0FBeEUsQyxDQUEwRTs7QUFFMUU7OztJQUNNSSxVOzs7OztBQUNGLHNCQUFZQyxJQUFaLEVBQWtCO0FBQUE7O0FBQUU7QUFBUyxVQUFLQSxJQUFMLEdBQVlBLElBQVo7QUFBWDtBQUE4Qjs7OztVQUNoRE4sTSxxQkFBUztBQUFFLFdBQU9ILE9BQU9VLElBQVAsQ0FBWUMsS0FBS0MsU0FBTCxDQUFlLEtBQUtILElBQXBCLENBQVosRUFBdUNSLE9BQXZDLENBQVA7QUFBeUQsRzs7O0VBRi9DQyxNOztBQUl6Qk0sV0FBV0gsTUFBWCxHQUFvQixVQUFDQyxLQUFELEVBQVFDLEdBQVI7QUFBQSxTQUFnQixJQUFJRCxLQUFKLENBQVVLLEtBQUtFLEtBQUwsQ0FBV04sSUFBSU8sUUFBSixDQUFhYixPQUFiLENBQVgsQ0FBVixDQUFoQjtBQUFBLENBQXBCO0FBRUE7OztJQUNNYyxTOzs7OztBQUNGLHFCQUFZUixHQUFaLEVBQWlCO0FBQUE7O0FBQUU7QUFBUyxXQUFLQSxHQUFMLEdBQVdBLEdBQVg7QUFBWDtBQUE0Qjs7OztVQUM3Q0osTSxxQkFBUztBQUFFLFdBQU8sS0FBS0ksR0FBWjtBQUFrQixHOzs7RUFGVEwsTTs7QUFJeEJhLFVBQVVWLE1BQVYsR0FBbUIsVUFBQ0MsS0FBRCxFQUFRQyxHQUFSO0FBQUEsU0FBZ0IsSUFBSUQsS0FBSixDQUFVQyxHQUFWLENBQWhCO0FBQUEsQ0FBbkI7O0lBRU1TLGU7Ozs7O0FBQ0YsNkJBQWM7QUFBQSxXQUFFLHNCQUFNaEIsT0FBT1UsSUFBUCxDQUFZLGlCQUFaLEVBQStCVCxPQUEvQixDQUFOLENBQUY7QUFBbUQ7OztFQUR2Q2MsUzs7SUFJeEJFLGtCOzs7OztBQUNGLGdDQUFjO0FBQUEsV0FBRSx1QkFBTWpCLE9BQU9VLElBQVAsQ0FBWSxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsSUFBYixFQUFtQixJQUFuQixDQUFaLENBQU4sQ0FBRjtBQUFpRDs7O0VBRGxDSyxTOztJQUkzQkcsVTs7Ozs7Ozs7OztFQUFtQlYsVSxHQUFjOzs7SUFFakNXLFU7Ozs7Ozs7Ozs7RUFBbUJYLFUsR0FBYzs7O0lBRWpDWSxhOzs7OztBQUNGLDJCQUFjO0FBQUEsV0FBRSx1QkFBTXBCLE9BQU9xQixLQUFQLENBQWEsQ0FBYixDQUFOLENBQUY7QUFBMkIsRyxDQUFDOzs7O0VBRGxCTixTOztBQUk1Qk8sT0FBT0MsT0FBUCxHQUFpQjtBQUNickIsZ0JBRGE7QUFFYmEsc0JBRmE7QUFHYlAsd0JBSGE7QUFJYlEsa0NBSmE7QUFLYkMsd0NBTGE7QUFNYkMsd0JBTmE7QUFPYkMsd0JBUGE7QUFRYkM7QUFSYSxDQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUaGUgc2VjdG9ycyBtb2R1bGUuXHJcbiAqIFRoaXMgbW9kdWxlIGNvbnRhaW5zIGNsYXNzIGRlZmluaXRpb25zIGZvciBhbGwgdGhlIHNlY3RvcnMuXHJcbiAqXHJcbiAqIFRoZXJlIGFyZSBjdXJyZW50bHkgNSB0eXBlcyBvZiBzZWN0b3JzOlxyXG4gKiAxLiBIZWFydGJlYXQgc2VjdG9yLlxyXG4gKiAyLiBIZWFydGJlYXQgQUNLIHNlY3Rvci5cclxuICogMy4gSlNPTiBkYXRhIHNlY3Rvci5cclxuICogNC4gSW5pdGlhbGl6YXRpb24gc2VjdG9yLlxyXG4gKiA1LiBJbml0aWFsaXphdGlvbiBBQ0sgc2VjdG9yLlxyXG4gKlxyXG4gKiBPbiBlc3RhYmxpc2htZW50IG9mIFdlYlNvY2tldCBjb25uZWN0aW9uLCB0aGUgY2xpZW50IHNlbmRzIGFuIGluaXRpYWxpemF0aW9uIHNlY3RvcixcclxuICogYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZHMgd2l0aCBhbiBpbml0aWFsaXphdGlvbiBBQ0sgc2VjdG9yLiBJZiBhbiBpbml0aWFsaXphdGlvbiBzZWN0b3JcclxuICogd2FzIG5vdCBzZW5kIGluIHRoZSBmaXJzdCA1IHNlY29uZHMsIHRoZSBjb25uZWN0aW9uIHdpbGwgYmUgY2xvc2VkLlxyXG4gKiBUaGVuLCBldmVyeSAzMCBzZWNvbmRzLCB0aGUgY2xpZW50IHNlbmRzIGEgaGVhcnRiZWF0IHNlY3RvciwgYW5kIHRoZSBzZXJ2ZXJcclxuICogcmVzcG9uZHMgd2l0aCBhIGhlYXJ0YmVhdCBBQ0sgc2VjdG9yLlxyXG4gKiBEdXJpbmcgdGhlIHRpbWUgdGhlIGNvbm5lY3Rpb24gaXMgb3BlbiwgdGhlIHNlcnZlciB3aWxsIHNlbmQgSlNPTiBkYXRhIHNlY3RvcnNcclxuICogb2NjYXNpb25sbHksIGNvbnRhaW5pbmcgbmVjZXNzYXJ5IGRhdGEuXHJcbiAqXHJcbiAqIEl0IGlzIGRlc2lnbmVkIHRoYXQgdGhlIGNsYXNzZXMgaW4gc2VjdG9ycy5qcyBkbyBub3Qga25vdyBob3cgYW5kIHdoZW4gdGhlc2Ugc2VjdG9yc1xyXG4gKiBhcmUgc2VuZCBhbmQgcmVjZWl2ZWQsIGJ1dCBvbmx5IHRoZWlyIGxvZ2ljYWwgZGVmaW5pdGlvbnM6IFdoYXQgLyB3aGF0IHR5cGUgb2YgZGF0YSB0aGV5XHJcbiAqIGNvbnRhaW4sIGFuZCBob3cgc2hvdWxkIHRoZSBkYXRhIGJlIGVuY29kZWQgaW50byBiaW5hcnkgY29kZSwgdGhhdCBpcywgb25seSB0aGUgQ09OVEVOVFxyXG4gKiBwYXJ0IG9mIHRoZSB3aG9sZSBzZWN0b3IuIE90aGVyIHdvcmsgaXMgbGVmdCB0byBlbmNvZGluZy5qcyB0byBkby5cclxuICpcclxuICogVG8gaWRlbnRpZnkgZGlmZmVyZW50IHR5cGVzIG9mIHNlY3RvcnMsIG9ubHkgdGhlc2UgY2xhc3NlcyBzaG91bGQgYmUgdXNlZCwgYW5kIG5vdCBhbnlcclxuICogb3RoZXIgc3RyaW5nLWlzaCByZXByZXNlbnRhdGlvbi5cclxuICpcclxuICogQG1vZHVsZSBiaWxpRGFubWFrdUNsaWVudC9zZWN0b3JzXHJcbiAqL1xyXG5cclxuY29uc3QgeyBCdWZmZXIgfSA9IHJlcXVpcmUoJ2J1ZmZlcicpO1xyXG5cclxuY29uc3QgY2hhcnNldCA9ICd1dGY4JztcclxuXHJcbi8qKiBCYXNlIGNsYXNzIGZvciBhbGwgc2VjdG9yIHR5cGVzICovXHJcbmNsYXNzIFNlY3RvciB7XHJcbiAgICAvKipcclxuICAgICAqIEVuY29kZSB0aGlzIFNlY3RvciBpbnRvIGEgQnVmZmVyIG9iamVjdC5cclxuICAgICAqIFRoaXMgaXMgYW4gYWJzdHJhY3QgbWV0aG9kIGFuZCBzaG91bGQgYmUgb3ZlcnJpZGRlbiBieSBpbXBsZW1lbnRhdGlvbnNcclxuICAgICAqIGV4dGVuZGluZyBTZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIGVuY29kZSgpIHsgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQuJyk7IH0gLy8gZXNsaW50LWRpc2FibGUtbGluZSBjbGFzcy1tZXRob2RzLXVzZS10aGlzXHJcbn1cclxuLyoqXHJcbiAqIENsYXNzIG1ldGhvZCwgZGVjb2RlIHRoZSBCdWZmZXIgb2JqZWN0IGludG8gYSBTZWN0b3Igb2JqZWN0IG9mIHRoZSBnaXZlbiB0eXBlLlxyXG4gKiBOb3JtYWxseSwgdGhpcyBzaG91bGQgYmUgdXNlZCBsaWtlOlxyXG4gKiAgICBNeVNlY3Rvci5kZWNvZGUoTXlTZWN0b3IsIGJ1Zik7XHJcbiAqIFdoaWxlIHRoZSBDbGFzcyBhcmd1bWVudCBpcyBzdGlsbCBwcm92aWRlZCB0byBlbmFibGUgb3ZlcnJpZGluZywgYXMgc2VlbiBpbiBKU09OU2VjdG9yLlxyXG4gKiBUaGlzIGlzIGFuIGFic3RyYWN0IG1ldGhvZCBhbmQgc2hvdWxkIGJlIG92ZXJyaWRkZW4gYnkgaW1wbGVtZW50YXRpb25zIGV4dGVuZGluZyBTZWN0b3IuXHJcbiAqXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IENsYXNzIFRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgdGFyZ2V0IFNlY3RvciBjbGFzcy5cclxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZiBUaGUgYnVmZmVyIHRvIGRlY29kZS5cclxuICovXHJcblNlY3Rvci5kZWNvZGUgPSAoQ2xhc3MsIGJ1ZikgPT4geyB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZC4nKTsgfTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG5cclxuLyoqIEJhc2UgY2xhc3MgZm9yIGFsbCBKU09OLWJhc2VkIHNlY3RvciB0eXBlcyAqL1xyXG5jbGFzcyBKU09OU2VjdG9yIGV4dGVuZHMgU2VjdG9yIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHsgc3VwZXIoKTsgdGhpcy5kYXRhID0gZGF0YTsgfVxyXG4gICAgZW5jb2RlKCkgeyByZXR1cm4gQnVmZmVyLmZyb20oSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhKSwgY2hhcnNldCk7IH1cclxufVxyXG5KU09OU2VjdG9yLmRlY29kZSA9IChDbGFzcywgYnVmKSA9PiBuZXcgQ2xhc3MoSlNPTi5wYXJzZShidWYudG9TdHJpbmcoY2hhcnNldCkpKTtcclxuXHJcbi8qKiBCYXNlIGNsYXNzIGZvciBhbGwgcmF3LWJ1ZmZlci1iYXNlZCBzZWN0b3IgdHlwZXMgKi9cclxuY2xhc3MgUmF3U2VjdG9yIGV4dGVuZHMgU2VjdG9yIHtcclxuICAgIGNvbnN0cnVjdG9yKGJ1ZikgeyBzdXBlcigpOyB0aGlzLmJ1ZiA9IGJ1ZjsgfVxyXG4gICAgZW5jb2RlKCkgeyByZXR1cm4gdGhpcy5idWY7IH1cclxufVxyXG5SYXdTZWN0b3IuZGVjb2RlID0gKENsYXNzLCBidWYpID0+IG5ldyBDbGFzcyhidWYpO1xyXG5cclxuY2xhc3MgSGVhcnRiZWF0U2VjdG9yIGV4dGVuZHMgUmF3U2VjdG9yIHtcclxuICAgIGNvbnN0cnVjdG9yKCkgeyBzdXBlcihCdWZmZXIuZnJvbSgnW29iamVjdCBPYmplY3RdJywgY2hhcnNldCkpOyB9XHJcbn1cclxuXHJcbmNsYXNzIEhlYXJ0YmVhdEFja1NlY3RvciBleHRlbmRzIFJhd1NlY3RvciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoQnVmZmVyLmZyb20oWzB4MDAsIDB4MDAsIDB4MDAsIDB4MDBdKSk7IH1cclxufVxyXG5cclxuY2xhc3MgRGF0YVNlY3RvciBleHRlbmRzIEpTT05TZWN0b3Ige30gLy8gaW5oZXJpdCBjb25zdHJ1Y3RvclxyXG5cclxuY2xhc3MgSW5pdFNlY3RvciBleHRlbmRzIEpTT05TZWN0b3Ige30gLy8gaW5oZXJpdCBjb25zdHJ1Y3RvclxyXG5cclxuY2xhc3MgSW5pdEFja1NlY3RvciBleHRlbmRzIFJhd1NlY3RvciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoQnVmZmVyLmFsbG9jKDApKTsgfSAvLyB3aXRoIGVtcHR5IENPTlRFTlQgcGFydFxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIFNlY3RvcixcclxuICAgIFJhd1NlY3RvcixcclxuICAgIEpTT05TZWN0b3IsXHJcbiAgICBIZWFydGJlYXRTZWN0b3IsXHJcbiAgICBIZWFydGJlYXRBY2tTZWN0b3IsXHJcbiAgICBEYXRhU2VjdG9yLFxyXG4gICAgSW5pdFNlY3RvcixcclxuICAgIEluaXRBY2tTZWN0b3IsXHJcbn07XHJcbiJdfQ==