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
//# sourceMappingURL=sectors.js.map