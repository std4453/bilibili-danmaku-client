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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9lbmNvZGluZy5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiQnVmZmVyIiwiaXNFcXVhbCIsIkhlYXJ0YmVhdFNlY3RvciIsIkhlYXJ0YmVhdEFja1NlY3RvciIsIkRhdGFTZWN0b3IiLCJJbml0U2VjdG9yIiwiSW5pdEFja1NlY3RvciIsInNlY3RvcjJtZXRhIiwiTWFwIiwic2V0IiwiY29udHJvbCIsInR5cGUiLCJlbmNvZGVPbmUiLCJzZWN0b3IiLCJjb250ZW50IiwiZW5jb2RlIiwibWV0YWRhdGEiLCJnZXQiLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsImNvbnN0cnVjdG9yIiwiaGVhZGVyIiwiYWxsb2MiLCJ3cml0ZUludDMyQkUiLCJsZW5ndGgiLCJjb25jYXQiLCJkZWNvZGVPbmUiLCJidWYiLCJvZmZzZXQiLCJsZW4iLCJyZWFkSW50MzJCRSIsImVudHJ5IiwiQXJyYXkiLCJmcm9tIiwiZW50cmllcyIsImZpbmQiLCJ2YWx1ZSIsIkVycm9yIiwiSlNPTiIsInN0cmluZ2lmeSIsImRlY29kZSIsInNsaWNlIiwibmV3T2Zmc2V0Iiwic2VjdG9ycyIsIm1hcCIsInB1c2giLCJ0b1N0cmluZyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFzQ21CQSxRQUFRLFFBQVIsQztJQUFYQyxNLFlBQUFBLE07O2dCQUNZRCxRQUFRLFFBQVIsQztJQUFaRSxPLGFBQUFBLE87O2dCQUUrRUYsUUFBUSxXQUFSLEM7SUFBL0VHLGUsYUFBQUEsZTtJQUFpQkMsa0IsYUFBQUEsa0I7SUFBb0JDLFUsYUFBQUEsVTtJQUFZQyxVLGFBQUFBLFU7SUFBWUMsYSxhQUFBQSxhO0FBRXJFOzs7OztBQUdBLElBQU1DLGNBQWMsSUFBSUMsR0FBSixFQUFwQjtBQUNBRCxZQUFZRSxHQUFaLENBQWdCUCxlQUFoQixFQUFpQztBQUFFUSxXQUFTLElBQVg7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VUFBVSxFQUFoQjtBQUVBLE1BQUlmLFNBQVMsQ0FBYjs7QUFDQSxTQUFPQSxTQUFTRCxJQUFJSCxNQUFwQixFQUE0QjtBQUFBLHFCQUNNRSxVQUFVQyxHQUFWLEVBQWVDLE1BQWYsQ0FETjtBQUFBLFFBQ2hCZixNQURnQixjQUNoQkEsTUFEZ0I7QUFBQSxRQUNSNkIsU0FEUSxjQUNSQSxTQURROztBQUV4QkMsWUFBUUUsSUFBUixDQUFhaEMsTUFBYjtBQUNBZSxhQUFTYyxTQUFUO0FBQ0g7O0FBRUQsTUFBSWQsV0FBV0QsSUFBSUgsTUFBbkIsRUFBMkI7QUFDdkIsVUFBTSxJQUFJYSxLQUFKLDBCQUFpQ1YsSUFBSUgsTUFBckMsY0FBb0RJLE1BQXBELGNBQW1FRCxJQUFJbUIsUUFBSixDQUFhLEtBQWIsQ0FBbkUsT0FBTjtBQUNIOztBQUVELFNBQU9ILE9BQVA7QUFDSCxDQWZEOztBQWlCQUksT0FBT0MsT0FBUCxHQUFpQjtBQUFFakMsZ0JBQUY7QUFBVXlCO0FBQVYsQ0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogVGhlIGVuY29kaW5nIG1vZHVsZS5cclxuICogVGhpcyBtb2R1bGUgaW1wbGVtZW50cyB0aGUgcHJvdG9jb2wgdXNlZCBieSBCaWxpYmlsaSBMaXZlIERhbm1ha3UgQ2xpZW50ICYgU2VydmVyXHJcbiAqIGluIHRoZSBXZWJTb2NrZXQgYmluYXJ5IGZyYW1lcy4gSW4gcGFydGljdWxhciwgdGhlIGVuY29kaW5nIGZyb20gc3RyaW5nIHRvIGJpbmFyeVxyXG4gKiBkYXRhIGlzIGltcGxlbWVudGVkIGhlcmUuXHJcbiAqXHJcbiAqIERFVEFJTFNcclxuICogQSBiaW5hcnkgZnJhbWUgaW4gdGhlIFdlYlNvY2tldCBiZXR3ZWVuIHRoZSBjbGllbnQgYW5kIHRoZSBzZXJ2ZXIgY29uc3RydWN0cyBvZlxyXG4gKiAxIG9yIG1vcmUgc2VjdG9ycy4gRXZlcnkgU0VDVE9SIGhhcyBhIDE2LWJ5dGUgSEVBREVSIHBhcnQgYW5kIGEgQ09OVEVOVCBwYXJ0IG9mXHJcbiAqIGFyYml0cmFyeSBsZW5ndGguXHJcbiAqIExldCB0aGUgbGVuZ3RoIG9mIHRoZSBDT05URU5UIHBhcnQgYmUgTEVOIChpbiBieXRlcyksIHRoZW4gdGhlIEhFQURFUiBwYXJ0IGlzXHJcbiAqIGVuY29kZWQgYXMgZm9sbG93czogKE5vdGUgdGhhdCBhbGwgZGVmaW5pdGlvbnMgYXJlIGJhc2VkIG9uIGd1ZXNzd29yaywgbm90IGFjdHVhbFxyXG4gKiBzdGFuZGFyZHMsIGFuZCBtaWdodCBjaGFuZ2UgaW4gdGhlIGZ1dHVyZSlcclxuICogQllURVMgMCAgICAgICAgICAgICAgICAgICAxXHJcbiAqICAgICAgIDAgMSAyIDMgNCA1IDYgNyA4IDkgMCAxIDIgMyA0IDVcclxuICogICAgICArLS0tLS0tLSstKy0rLSstKy0tLS0tKy0rLS0tLS0rLStcclxuICogICAgICB8ICBMRU4gIHwwfDF8MHxDfCAgMCAgfFR8ICAwICB8Q3xcclxuICogICAgICB8ICArMTYgIHwwfDB8MHxGfCAgMCAgfFl8ICAwICB8RnxcclxuICogICAgICArLS0tLS0tLSstKy0rLSstKy0tLS0tKy0rLS0tLS0rLStcclxuICogQ0YgKENvbnRyb2wgRmxhZyk6IDEgaWYgdGhpcyBTRUNUT1IgaXMgYSBjb250cm9sIHNlY3RvciAoaGVhcnRiZWF0ICYgYWNrLFxyXG4gKiBpbml0aWFsaWx6YXRpb24gJiBhY2spLCAwIGlmIG5vdC5cclxuICogVFkgKFR5cGUpOiBUaGUgdHlwZSBvZiB0aGlzIFNFQ1RPUiwga25vd24gdmFsdWVzIGFyZTpcclxuICogICAgMDI6IEhlYXJ0YmVhdCBzZWN0b3IuXHJcbiAqICAgIDAzOiBIZWFydGJlYXQgQUNLIHNlY3Rvci5cclxuICogICAgMDU6IEpTT04gZGF0YSBzZWN0b3IuXHJcbiAqICAgIDA3OiBJbml0aWFsaXphdGlvbiBzZWN0b3IuXHJcbiAqICAgIDA4LiBJbml0aWFsaXphdGlvbiBBQ0sgc2VjdG9yLlxyXG4gKlxyXG4gKiBTaW5jZSBvbmUgZnJhbWUgY2FuIGNvbnRhaW4gbXVsdGlwbGUgc2VjdG9ycywgZHVyaW5nIGRlY29kaW5nIHRoZSBmaXJzdCA0IGJ5dGVzXHJcbiAqIG9mIHRoZSBIRUFERVIgcGFydCBpcyB1c2VkIHRvIGRldGVybWludCB0aGUgbGVuZ3RoIG9mIGVhY2ggU0VDVE9SLCBzbyB0aGF0IHRoZSBuZXh0XHJcbiAqIFNFQ1RPUiBjYW4gYmUgZm91bmQgd2hlcmUgdGhlIHByZXZpb3VzIG9uZSBlbmRzLiBEdXJpbmcgZW5jb2RpbmcsIHNlY3RvcnMgYXJlIHNpbXBseVxyXG4gKiBjb25jYW50ZW5hdGVkLlxyXG4gKlxyXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB3aGF0IGVhY2ggc2VjdG9yIGRvZXMsIHNlZSBzZWN0b3JzLmpzLlxyXG4gKlxyXG4gKiBAbW9kdWxlIGJpbGlEYW5tYWt1Q2xpZW50L2VuY29kaW5nXHJcbiAqL1xyXG5cclxuY29uc3QgeyBCdWZmZXIgfSA9IHJlcXVpcmUoJ2J1ZmZlcicpO1xyXG5jb25zdCB7IGlzRXF1YWwgfSA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xyXG5cclxuY29uc3QgeyBIZWFydGJlYXRTZWN0b3IsIEhlYXJ0YmVhdEFja1NlY3RvciwgRGF0YVNlY3RvciwgSW5pdFNlY3RvciwgSW5pdEFja1NlY3RvciB9ID0gcmVxdWlyZSgnLi9zZWN0b3JzJyk7XHJcblxyXG4vKipcclxuICogQSBNYXAgYmV0ZWVuIGNvbnN0cnVjdG9ycyBvZiBkaWZmZXJlbnQgc2VjdG9yIHR5cGVzIGFuZCB0aGUgY29ycmVzcG9uZGluZyBtZXRhZGF0YS5cclxuICovXHJcbmNvbnN0IHNlY3RvcjJtZXRhID0gbmV3IE1hcCgpO1xyXG5zZWN0b3IybWV0YS5zZXQoSGVhcnRiZWF0U2VjdG9yLCB7IGNvbnRyb2w6IHRydWUsIHR5cGU6IDB4MDIgfSk7XHJcbnNlY3RvcjJtZXRhLnNldChIZWFydGJlYXRBY2tTZWN0b3IsIHsgY29udHJvbDogdHJ1ZSwgdHlwZTogMHgwMyB9KTtcclxuc2VjdG9yMm1ldGEuc2V0KERhdGFTZWN0b3IsIHsgY29udHJvbDogZmFsc2UsIHR5cGU6IDB4MDUgfSk7XHJcbnNlY3RvcjJtZXRhLnNldChJbml0U2VjdG9yLCB7IGNvbnRyb2w6IHRydWUsIHR5cGU6IDB4MDcgfSk7XHJcbnNlY3RvcjJtZXRhLnNldChJbml0QWNrU2VjdG9yLCB7IGNvbnRyb2w6IHRydWUsIHR5cGU6IDB4MDggfSk7XHJcblxyXG4vKipcclxuICogRW5jb2RlIG9uZSBTZWN0b3IgaW50byBCdWZmZXIuXHJcbiAqIEl0IGFzc3VtZXMgdGhhdCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yoc2VjdG9yKS5jb25zdHJ1Y3RvciBleGlzdHMgYW5kIGlzIHRoZSBjb3JyZWN0XHJcbiAqIGNvbnN0cnVjdG9yLiBPdGhlcndpc2UsIHRoZSBiZWhhdmlvdXIgaXMgdW5kZWZpbmVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1NlY3Rvcn0gc2VjdG9yIFRoZSBTZWN0b3IgdG8gZW5jb2RlLlxyXG4gKi9cclxuY29uc3QgZW5jb2RlT25lID0gKHNlY3RvcikgPT4ge1xyXG4gICAgY29uc3QgY29udGVudCA9IHNlY3Rvci5lbmNvZGUoKTtcclxuICAgIC8vIGFzc3VtZSBjb25zdHJ1Y3RvciBleGlzdHNcclxuICAgIGNvbnN0IG1ldGFkYXRhID0gc2VjdG9yMm1ldGEuZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihzZWN0b3IpLmNvbnN0cnVjdG9yKTtcclxuXHJcbiAgICBjb25zdCBoZWFkZXIgPSBCdWZmZXIuYWxsb2MoMTYpO1xyXG4gICAgaGVhZGVyLndyaXRlSW50MzJCRShjb250ZW50Lmxlbmd0aCArIDE2LCAwKTtcclxuICAgIGhlYWRlcls1XSA9IDB4MTA7XHJcbiAgICBoZWFkZXJbN10gPSBtZXRhZGF0YS5jb250cm9sID8gMHgwMSA6IDB4MDA7XHJcbiAgICBoZWFkZXJbMTFdID0gbWV0YWRhdGEudHlwZTtcclxuICAgIGhlYWRlclsxNV0gPSBtZXRhZGF0YS5jb250cm9sID8gMHgwMSA6IDB4MDA7XHJcblxyXG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoW2hlYWRlciwgY29udGVudF0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIERlY29kZSBvbmUgU2VjdG9yIGFuZCBjYWxjdWxhdGUgdGhlIG9mZnNldCBvZiB0aGUgbmV4dCBTZWN0b3IuXHJcbiAqIFRoaXMgbWV0aG9kIGFzc3VtZXMgdGhhdCB0aGUgYnVmZmVyIGlzIHN1ZmZpY2llbnQgZm9yIHRoZSBjdXJyZW50IFNlY3Rvci4gT3RoZXJ3aXNlLFxyXG4gKiB0aGUgYmVoYXZpb3IgaXMgdW5kZWZpbmVkLlxyXG4gKiBUaGUgcmV0dXJuIHZhbHVlIGlzOlxyXG4gKiB7XHJcbiAqICAgICBzZWN0b3I6IHtTZWN0b3J9IFRoZSBkZWNvZGVkIHNlY3Rvci5cclxuICogICAgIG5ld09mZnNldDoge051bWJlcn0gVGhlIG5ldyBvZmZzZXQuXHJcbiAqIH1cclxuICogSW1wbGVtZW50YXRpb24gc2hvdWxkIHVzZSBuZXdPZmZzZXQgdG8gcmVwbGFjZSB0aGUgb2Zmc2V0IHBhc3NlZCB0byBkZWNvZGVPbmUgZGlyZWN0bHkuXHJcbiAqXHJcbiAqIEBwYXJhbSB7QnVmZmVyfSBidWYgVGhlIEJ1ZmZlciB0byBkZWNvZGUuXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgVGhlIHN0YXJ0aW5nIG9mZnNldCB0byBkZWNvZGUuXHJcbiAqL1xyXG5jb25zdCBkZWNvZGVPbmUgPSAoYnVmLCBvZmZzZXQpID0+IHtcclxuICAgIC8vIGV4dHJhY3QgbWV0YWRhdGEgZnJvbSBoZWFkZXJcclxuICAgIGNvbnN0IGxlbiA9IGJ1Zi5yZWFkSW50MzJCRShvZmZzZXQpIC0gMTY7XHJcbiAgICBjb25zdCBtZXRhZGF0YSA9IHtcclxuICAgICAgICBjb250cm9sOiBidWZbb2Zmc2V0ICsgN10gPT09IDB4MDEsXHJcbiAgICAgICAgdHlwZTogYnVmW29mZnNldCArIDExXSxcclxuICAgIH07XHJcblxyXG4gICAgLy8gZmluZCB0eXBlXHJcbiAgICBjb25zdCBlbnRyeSA9IEFycmF5LmZyb20oc2VjdG9yMm1ldGEuZW50cmllcygpKS5maW5kKChbLCB2YWx1ZV0pID0+IGlzRXF1YWwodmFsdWUsIG1ldGFkYXRhKSk7XHJcbiAgICBpZiAodHlwZW9mIGVudHJ5ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIGhlYWRlcjogJHtKU09OLnN0cmluZ2lmeShtZXRhZGF0YSl9YCk7XHJcbiAgICB9XHJcbiAgICBjb25zdCB0eXBlID0gZW50cnlbMF07XHJcblxyXG4gICAgLy8gY29uc3RydWN0IHNlY3RvciBvYmplY3RcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2VjdG9yOiB0eXBlLmRlY29kZSh0eXBlLCBidWYuc2xpY2Uob2Zmc2V0ICsgMTYsIG9mZnNldCArIGxlbiArIDE2KSksXHJcbiAgICAgICAgbmV3T2Zmc2V0OiBvZmZzZXQgKyBsZW4gKyAxNixcclxuICAgIH07XHJcbn07XHJcblxyXG4vKipcclxuICogRW5jb2RlIHRoZSBnaXZlbiBzZWN0b3JzIGludG8gYSBCdWZmZXIuXHJcbiAqIFRoZSBzZWN0b3JzIHdpbGwgYmUgZW5jb2RlZCBpbiBvcmRlci5cclxuICogVGhlIHJldHVybmVkIEJ1ZmZlciBzaG91bGQgYmUgcGFzc2VkIGRpcmVjdGx5IHRvIFdlYlNvY2tldC5zZW5kKCkuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U2VjdG9yW119IHNlY3RvcnMgVGhlIHNlY3RvcnMgdG8gZW5jb2RlLlxyXG4gKiBAcmV0dXJucyB7QnVmZmVyfSBUaGUgZW5jb2RlZCBCdWZmZXIuXHJcbiAqL1xyXG5jb25zdCBlbmNvZGUgPSAoLi4uc2VjdG9ycykgPT4gQnVmZmVyLmNvbmNhdChzZWN0b3JzLm1hcChlbmNvZGVPbmUpKTtcclxuXHJcbi8qKlxyXG4gKiBEZWNvZGUgdGhlIGdpdmVuIEJ1ZmZlciBhbmQgcmV0dXJuIHRoZSBzZWN0b3JzLlxyXG4gKiBUaGlzIG1ldGhvZCBhc3N1bWVzIHRoYXQgdGhlIGlucHV0IEJ1ZmZlciBpcyB2YWxpZC4gT24gaW52YWxpZCBpbnB1dCwgYW4gRXJyb3JcclxuICogbWlnaHQgYmUgdGhyb3duLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0J1ZmZlcn0gYnVmIFRoZSBCdWZmZXIgdG8gZGVjb2RlLlxyXG4gKiBAcmV0dXJucyB7U2VjdG9yW119IFRoZSBkZWNvZGVkIHNlY3RvcnMuXHJcbiAqL1xyXG5jb25zdCBkZWNvZGUgPSAoYnVmKSA9PiB7XHJcbiAgICBjb25zdCBzZWN0b3JzID0gW107XHJcblxyXG4gICAgbGV0IG9mZnNldCA9IDA7XHJcbiAgICB3aGlsZSAob2Zmc2V0IDwgYnVmLmxlbmd0aCkge1xyXG4gICAgICAgIGNvbnN0IHsgc2VjdG9yLCBuZXdPZmZzZXQgfSA9IGRlY29kZU9uZShidWYsIG9mZnNldCk7XHJcbiAgICAgICAgc2VjdG9ycy5wdXNoKHNlY3Rvcik7XHJcbiAgICAgICAgb2Zmc2V0ID0gbmV3T2Zmc2V0O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvZmZzZXQgIT09IGJ1Zi5sZW5ndGgpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgQnVmZmVyOiBsZW49JHtidWYubGVuZ3RofSwgb2ZmPSR7b2Zmc2V0fSwgYnVmPSR7YnVmLnRvU3RyaW5nKCdoZXgnKX0uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNlY3RvcnM7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHsgZW5jb2RlLCBkZWNvZGUgfTtcclxuIl19