"use strict";

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.array.find");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.map");

/**
 * The encoding module.
 * This module implements the protocol used by Bilibili Live Danmaku Client & Server
 * in the WebSocket binary frames. In particular, the encoding from string to binary
 * data is implemented here.
 *
 * DETAILS
 * A binary frame in the WebSocket between the client and the server constructs of
 * 1 or more sectors. Every SECTOR has a 16-byte HEADER part and a CONTENT part of
 * arbitrary length.
 * Let the length of the CONTENT part be LEN (in bytes), then the HEADER part is
 * encoded as follows: (Note that all definitions are based on guesswork, not actual
 * standards, and might change in the future)
 * BYTES 0                   1
 *       0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5
 *      +-------+-+-+-+-+-----+-+-----+-+
 *      |  LEN  |0|1|0|C|  0  |T|  0  |C|
 *      |  +16  |0|0|0|F|  0  |Y|  0  |F|
 *      +-------+-+-+-+-+-----+-+-----+-+
 * CF (Control Flag): 1 if this SECTOR is a control sector (heartbeat & ack,
 * initialilzation & ack), 0 if not.
 * TY (Type): The type of this SECTOR, known values are:
 *    02: Heartbeat sector.
 *    03: Heartbeat ACK sector.
 *    05: JSON data sector.
 *    07: Initialization sector.
 *    08. Initialization ACK sector.
 *
 * Since one frame can contain multiple sectors, during decoding the first 4 bytes
 * of the HEADER part is used to determint the length of each SECTOR, so that the next
 * SECTOR can be found where the previous one ends. During encoding, sectors are simply
 * concantenated.
 *
 * For more information about what each sector does, see sectors.js.
 *
 * @module biliDanmakuClient/encoding
 */
var _require = require('buffer'),
    Buffer = _require.Buffer;

var _require2 = require('lodash'),
    isEqual = _require2.isEqual;

var _require3 = require('./sectors'),
    HeartbeatSector = _require3.HeartbeatSector,
    HeartbeatAckSector = _require3.HeartbeatAckSector,
    DataSector = _require3.DataSector,
    InitSector = _require3.InitSector,
    InitAckSector = _require3.InitAckSector;
/**
 * A Map beteen constructors of different sector types and the corresponding metadata.
 */


var sector2meta = new Map();
sector2meta.set(HeartbeatSector, {
  control: true,
  type: 0x02
});
sector2meta.set(HeartbeatAckSector, {
  control: true,
  type: 0x03
});
sector2meta.set(DataSector, {
  control: false,
  type: 0x05
});
sector2meta.set(InitSector, {
  control: true,
  type: 0x07
});
sector2meta.set(InitAckSector, {
  control: true,
  type: 0x08
});
/**
 * Encode one Sector into Buffer.
 * It assumes that Object.getPrototypeOf(sector).constructor exists and is the correct
 * constructor. Otherwise, the behaviour is undefined.
 *
 * @param {Sector} sector The Sector to encode.
 */

var encodeOne = function encodeOne(sector) {
  var content = sector.encode(); // assume constructor exists

  var metadata = sector2meta.get(Object.getPrototypeOf(sector).constructor);
  var header = Buffer.alloc(16);
  header.writeInt32BE(content.length + 16, 0);
  header[5] = 0x10;
  header[7] = metadata.control ? 0x01 : 0x00;
  header[11] = metadata.type;
  header[15] = metadata.control ? 0x01 : 0x00;
  return Buffer.concat([header, content]);
};
/**
 * Decode one Sector and calculate the offset of the next Sector.
 * This method assumes that the buffer is sufficient for the current Sector. Otherwise,
 * the behavior is undefined.
 * The return value is:
 * {
 *     sector: {Sector} The decoded sector.
 *     newOffset: {Number} The new offset.
 * }
 * Implementation should use newOffset to replace the offset passed to decodeOne directly.
 *
 * @param {Buffer} buf The Buffer to decode.
 * @param {Number} offset The starting offset to decode.
 */


var decodeOne = function decodeOne(buf, offset) {
  // extract metadata from header
  var len = buf.readInt32BE(offset) - 16;
  var metadata = {
    control: buf[offset + 7] === 0x01,
    type: buf[offset + 11]
  }; // find type

  var entry = Array.from(sector2meta.entries()).find(function (_ref) {
    var value = _ref[1];
    return isEqual(value, metadata);
  });

  if (typeof entry === 'undefined') {
    throw new Error("Unrecognized header: " + JSON.stringify(metadata));
  }

  var type = entry[0]; // construct sector object

  return {
    sector: type.decode(type, buf.slice(offset + 16, offset + len + 16)),
    newOffset: offset + len + 16
  };
};
/**
 * Encode the given sectors into a Buffer.
 * The sectors will be encoded in order.
 * The returned Buffer should be passed directly to WebSocket.send().
 *
 * @param {Sector[]} sectors The sectors to encode.
 * @returns {Buffer} The encoded Buffer.
 */


var encode = function encode() {
  for (var _len = arguments.length, sectors = new Array(_len), _key = 0; _key < _len; _key++) {
    sectors[_key] = arguments[_key];
  }

  return Buffer.concat(sectors.map(encodeOne));
};
/**
 * Decode the given Buffer and return the sectors.
 * This method assumes that the input Buffer is valid. On invalid input, an Error
 * might be thrown.
 *
 * @param {Buffer} buf The Buffer to decode.
 * @returns {Sector[]} The decoded sectors.
 */


var decode = function decode(buf) {
  var sectors = [];
  var offset = 0;

  while (offset < buf.length) {
    var _decodeOne = decodeOne(buf, offset),
        sector = _decodeOne.sector,
        newOffset = _decodeOne.newOffset;

    sectors.push(sector);
    offset = newOffset;
  }

  if (offset !== buf.length) {
    throw new Error("Invalid Buffer: len=" + buf.length + ", off=" + offset + ", buf=" + buf.toString('hex') + ".");
  }

  return sectors;
};

module.exports = {
  encode: encode,
  decode: decode
};
//# sourceMappingURL=encoding.js.map