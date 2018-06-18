"use strict";

require("core-js/modules/es6.array.find");

require("core-js/modules/es6.regexp.to-string");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/**
 * This file implements the Section Layer of the Transport Protocol.
 * See Wiki for Protocol definition. Please note that this implementation
 * does not 100% conform to the defition in the Wiki page.
 * Here, SectionConnection implements the actual Section Layer, which
 * transports instances of Section. Different kinds of Section are not
 * implemented by inheriting Section, instead, applications should use or
 * inherit SectionCoder and its subclasses.
 * See index.js for examples.
 */
var _require = require('buffer'),
    Buffer = _require.Buffer;

var log = require('debug')('bilibili-danmaku-client/SectionConnection');

var _require2 = require('lodash'),
    isEqual = _require2.isEqual;

var _require3 = require('../util/connection'),
    CascadeConnection = _require3.CascadeConnection;

var WebSocketConnection = require('./WebSocketConnection');

var protoVer = 0x10;
var encoding = 'utf8';
/**
 * Section is sent through the Section Layer.
 * Section is a simple object. Its 'coder' property specifies the type of
 * this Section, while its 'data' property is the data is contains.
 * Sections can contain any kind of data, however data that cannot be
 * transformed by its coder will be useless and problematic. Therefore,
 * whoever specifies the coder should be responsible specifying the data.
 * Section should not be subclassed. A typical usage is:
 * const coder = new JsonCoder({ controlFlag: true, opCode: 10, binaryFlag: false });
 * const section = new Section(coder, { foo: 1 });
 */

var Section =
/**
 * Constructs a new Section.
 * @param {SectionCoder} coder The coder of this Section.
 * @param {any} data The data of this Section.
 */
function Section(coder, data) {
  this.coder = coder;
  this.data = data;
};
/**
 * SectionCoder is used to encode and decode Sections to and from Buffers.
 * Meanwhile, SectionCoder also contains a 'header' property which specifies
 * the header that should be used for all Sections with this coder.
 * SectionCoder should be subclassed to support encoding and decoding of
 * different types of data, however only new instances should be used to support
 * different headers.
 * Meanwhile, SectionCoder instances should be reused across Sections. Since
 * section.coder === this is used in hasConstructed(), only one SectionCoder with
 * the same header should be used in the same application.
 */


var SectionCoder =
/*#__PURE__*/
function () {
  /**
   * Constructs a new SectionCoder with the given header.
   * Header MUST contain the following properties:
   * controlFlag: boolean,
   * opCode: Number,
   * binaryFlag: boolean.
   * Detailed definitions can be found in Wiki page 'Transport Protocol'.
   * @param {Object} header The header object of this SectionCoder.
   */
  function SectionCoder(header) {
    this.header = header;
  }
  /**
   * Encode the data of the Section into Buffer.
   * By default, the data is kept as-is. Therefore non-Buffer data might lead to
   * an error.
   * @param {any} data The data to encode.
   * @returns {Buffer} The encoded buffer.
   */


  var _proto = SectionCoder.prototype;

  _proto.encode = function encode(data) {
    return data;
  };
  /**
   * Decode the Buffer back to the Section data.
   * By default, the Buffer is kept as-is.
   * Typically construct() is used to construct a new Section with decoded data
   * and this coder.
   * @param {Buffer} buf The buffer to decode.
   * @returns {any} The decoded data.
   */


  _proto.decode = function decode(buf) {
    return buf;
  };
  /**
   * Return whether the Section is constructed by this SectionCoder.
   * section is constructed by an coder by section = coder.construct() or
   * by section = new Section(coder, data).
   * @param {Section} section The section to check.
   * @return {boolean} Whether the Section is constructed by this SectionCoder.
   */


  _proto.hasConstructed = function hasConstructed(section) {
    return section.coder === this;
  };
  /**
   * Construct a Section with this SectionCoder and decoded data.
   * @param {Buffer} data The data to decode.
   * @returns {Section} The constructed Section.
   */


  _proto.construct = function construct(data) {
    return new Section(this, this.decode(data));
  };

  return SectionCoder;
}();
/**
 * Implementation of SectionCoder that encodes and decodes strings.
 */


var StringCoder =
/*#__PURE__*/
function (_SectionCoder) {
  _inheritsLoose(StringCoder, _SectionCoder);

  function StringCoder() {
    return _SectionCoder.apply(this, arguments) || this;
  }

  var _proto2 = StringCoder.prototype;

  _proto2.encode = function encode(str) {
    return Buffer.from(str, encoding);
  };

  _proto2.decode = function decode(buf) {
    return buf.toString(encoding);
  };

  return StringCoder;
}(SectionCoder);
/**
 * Implementation of SectionCoder that encodes and decodes JSONs.
 */


var JsonCoder =
/*#__PURE__*/
function (_StringCoder) {
  _inheritsLoose(JsonCoder, _StringCoder);

  function JsonCoder() {
    return _StringCoder.apply(this, arguments) || this;
  }

  var _proto3 = JsonCoder.prototype;

  _proto3.encode = function encode(json) {
    return _StringCoder.prototype.encode.call(this, JSON.stringify(json));
  };

  _proto3.decode = function decode(buf) {
    return JSON.parse(_StringCoder.prototype.decode.call(this, buf));
  };

  return JsonCoder;
}(StringCoder);
/**
 * SectionConnection implements the Section Layer of the Transport Protocol.
 * It uses WebSocketConnection as implementation of the Connection Layer and uses
 * CascadeConnection to wrap over it.
 * As specified in the Transport Protocol, SectionConnection is stateless, and
 * inherits events from and delegates method to the Connection Layer.
 * As a flaw in the Transport Protocol, Sections can contain arbitrary types
 * of data, while the convertion from Buffer to the data is done in the Data Layer.
 * However, Sections have to be constructed in the Section layer, so in the
 * implementation, the debundling process of Section Layer and the convertion
 * process of the Data Layer are combinded together to form the transform() and
 * detransform() methods of CascadeConnection.
 */


var SectionConnection =
/*#__PURE__*/
function (_CascadeConnection) {
  _inheritsLoose(SectionConnection, _CascadeConnection);

  /**
   * Construct a new SectionConnection.
   * @param {SectionCoder[]} coders The list of coders to use.
   * @param {String} url The url to connect to.
   * @param {String | String[] | undefined} protocols The WebSocket protocols to use.
   * @param {Object | undefined} options The options used to configure WebSocketConnection.
   */
  function SectionConnection(coders, url, _temp) {
    var _this;

    var _ref = _temp === void 0 ? {} : _temp,
        protocols = _ref.protocols,
        options = _ref.options;

    _this = _CascadeConnection.call(this, new WebSocketConnection(url, protocols, options)) || this;
    _this.coders = coders;
    return _this;
  }
  /**
   * Transform given sections to Buffer. See super method documentation.
   * This method implements the bundling process.
   * Note that the SectionConnection actually transports arrays of Section, so
   * connection.send(new Section(...)) will result in an error.
   * @param {Section[]} sections The sections to transform to Buffer.
   * @returns {Buffer} The transformed Buffer.
   */


  var _proto4 = SectionConnection.prototype;

  _proto4.transform = function transform(sections) {
    return Buffer.concat(sections.map(this.encodeSection.bind(this)));
  };
  /**
   * Detransform given Buffer back to a list of Sections. See super method documentation.
   * This method implements the debundling process.
   * Note that the SectionConnection actuallt transports arrays of Section so
   * the 'message' event will be emitted with a Section[] as argument.
   * @param {BufferEncoding} buf The Buffer to detransform.
   * @returns {Section[]} The detransformed Sections.
   */


  _proto4.detransform = function detransform(buf) {
    var sections = [];

    for (var off = 0; off < buf.length; off = this.decodeSection(sections, buf, off)) {
      ;
    }

    return sections;
  };

  _proto4.encodeSection = function encodeSection(section) {
    try {
      var coder = section.coder,
          data = section.data;
      var content = coder.encode(data);
      var header = Buffer.alloc(16);
      header.writeInt32BE(content.length + 16, 0);
      header.writeInt16BE(protoVer, 4);
      header[7] = coder.header.controlFlag ? 0x01 : 0x00;
      header.writeInt32BE(coder.header.opCode, 8);
      header[15] = coder.header.binaryFlag ? 0x01 : 0x00;
      return Buffer.concat([header, content]);
    } catch (e) {
      log("Unable to encode section: section=" + section + ", error=" + e + ".");
      return Buffer.alloc(0);
    }
  };

  _proto4.decodeHeader = function decodeHeader(buf, offset) {
    if (buf.length < offset + 16) throw new Error("Buffer too short: offset=" + offset + ", length=" + buf.length + ".");
    var length = buf.readInt32BE(offset); // length = CONTENT length + 16

    if (length < 16) throw new Error("Invalid section length: " + length + ".");
    if (length + offset > buf.length) throw new Error("Section too long: end=" + (length + offset) + ", length=" + buf.length + ".");
    var sectionProtoVer = buf.readInt16BE(offset + 4);
    if (sectionProtoVer !== protoVer) throw new Error("Invalid section header: protoVer=" + sectionProtoVer + ", expected=" + protoVer + ".");
    return {
      length: length,
      header: {
        controlFlag: buf[offset + 7] === 0x01,
        opCode: buf.readInt32BE(offset + 8),
        binaryFlag: buf[offset + 15] === 0x01
      }
    };
  };

  _proto4.decodeSection = function decodeSection(sections, buf, offset) {
    var header;
    var length;

    try {
      var _this$decodeHeader = this.decodeHeader(buf, offset);

      header = _this$decodeHeader.header;
      length = _this$decodeHeader.length;
    } catch (e) {
      log('Unable to decoder header: %s', e);
      return buf.length; // stop debundling process
    }

    var coder = this.coders.find(function (c) {
      return isEqual(c.header, header);
    });

    if (typeof coder === 'undefined') {
      log('No matching coder found: header=%s.', header);
      return offset + length; // skip this section
    }

    var content = buf.slice(offset + 16, offset + length);

    try {
      sections.push(coder.construct(content));
    } catch (e) {
      log('Unable to decode section: content=%s, coder=%s.', content, coder);
    }

    return offset + length; // proceed to next section
  };

  return SectionConnection;
}(CascadeConnection);

module.exports = {
  Section: Section,
  SectionCoder: SectionCoder,
  StringCoder: StringCoder,
  JsonCoder: JsonCoder,
  SectionConnection: SectionConnection
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90cmFuc3BvcnQvU2VjdGlvbkNvbm5lY3Rpb24uanMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkJ1ZmZlciIsImxvZyIsImlzRXF1YWwiLCJDYXNjYWRlQ29ubmVjdGlvbiIsIldlYlNvY2tldENvbm5lY3Rpb24iLCJwcm90b1ZlciIsImVuY29kaW5nIiwiU2VjdGlvbiIsImNvZGVyIiwiZGF0YSIsIlNlY3Rpb25Db2RlciIsImhlYWRlciIsImVuY29kZSIsImRlY29kZSIsImJ1ZiIsImhhc0NvbnN0cnVjdGVkIiwic2VjdGlvbiIsImNvbnN0cnVjdCIsIlN0cmluZ0NvZGVyIiwic3RyIiwiZnJvbSIsInRvU3RyaW5nIiwiSnNvbkNvZGVyIiwianNvbiIsIkpTT04iLCJzdHJpbmdpZnkiLCJwYXJzZSIsIlNlY3Rpb25Db25uZWN0aW9uIiwiY29kZXJzIiwidXJsIiwicHJvdG9jb2xzIiwib3B0aW9ucyIsInRyYW5zZm9ybSIsInNlY3Rpb25zIiwiY29uY2F0IiwibWFwIiwiZW5jb2RlU2VjdGlvbiIsImJpbmQiLCJkZXRyYW5zZm9ybSIsIm9mZiIsImxlbmd0aCIsImRlY29kZVNlY3Rpb24iLCJjb250ZW50IiwiYWxsb2MiLCJ3cml0ZUludDMyQkUiLCJ3cml0ZUludDE2QkUiLCJjb250cm9sRmxhZyIsIm9wQ29kZSIsImJpbmFyeUZsYWciLCJlIiwiZGVjb2RlSGVhZGVyIiwib2Zmc2V0IiwiRXJyb3IiLCJyZWFkSW50MzJCRSIsInNlY3Rpb25Qcm90b1ZlciIsInJlYWRJbnQxNkJFIiwiZmluZCIsImMiLCJzbGljZSIsInB1c2giLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7Ozs7Ozs7O2VBV21CQSxRQUFRLFFBQVIsQztJQUFYQyxNLFlBQUFBLE07O0FBQ1IsSUFBTUMsTUFBTUYsUUFBUSxPQUFSLEVBQWlCLDJDQUFqQixDQUFaOztnQkFDb0JBLFFBQVEsUUFBUixDO0lBQVpHLE8sYUFBQUEsTzs7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aEIsQ0FGOEIsQ0FFTjtBQUMzQjs7QUFFRCxRQUFNRSxVQUFVNUIsSUFBSTRDLEtBQUosQ0FBVVAsU0FBUyxFQUFuQixFQUF1QkEsU0FBU1gsTUFBaEMsQ0FBaEI7O0FBQ0EsUUFBSTtBQUNBUCxlQUFTMEIsSUFBVCxDQUFjbkQsTUFBTVMsU0FBTixDQUFnQnlCLE9BQWhCLENBQWQ7QUFDSCxLQUZELENBRUUsT0FBT08sQ0FBUCxFQUFVO0FBQ1JoRCxVQUFJLGlEQUFKLEVBQXVEeUMsT0FBdkQsRUFBZ0VsQyxLQUFoRTtBQUNIOztBQUNELFdBQU8yQyxTQUFTWCxNQUFoQixDQXRCaUMsQ0FzQlQ7QUFDM0IsRzs7O0VBaEcyQnJDLGlCOztBQW1HaEN5RCxPQUFPQyxPQUFQLEdBQWlCO0FBQ2J0RCxrQkFEYTtBQUViRyw0QkFGYTtBQUdiUSwwQkFIYTtBQUliSSxzQkFKYTtBQUtiSztBQUxhLENBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIFRoaXMgZmlsZSBpbXBsZW1lbnRzIHRoZSBTZWN0aW9uIExheWVyIG9mIHRoZSBUcmFuc3BvcnQgUHJvdG9jb2wuXHJcbiAqIFNlZSBXaWtpIGZvciBQcm90b2NvbCBkZWZpbml0aW9uLiBQbGVhc2Ugbm90ZSB0aGF0IHRoaXMgaW1wbGVtZW50YXRpb25cclxuICogZG9lcyBub3QgMTAwJSBjb25mb3JtIHRvIHRoZSBkZWZpdGlvbiBpbiB0aGUgV2lraSBwYWdlLlxyXG4gKiBIZXJlLCBTZWN0aW9uQ29ubmVjdGlvbiBpbXBsZW1lbnRzIHRoZSBhY3R1YWwgU2VjdGlvbiBMYXllciwgd2hpY2hcclxuICogdHJhbnNwb3J0cyBpbnN0YW5jZXMgb2YgU2VjdGlvbi4gRGlmZmVyZW50IGtpbmRzIG9mIFNlY3Rpb24gYXJlIG5vdFxyXG4gKiBpbXBsZW1lbnRlZCBieSBpbmhlcml0aW5nIFNlY3Rpb24sIGluc3RlYWQsIGFwcGxpY2F0aW9ucyBzaG91bGQgdXNlIG9yXHJcbiAqIGluaGVyaXQgU2VjdGlvbkNvZGVyIGFuZCBpdHMgc3ViY2xhc3Nlcy5cclxuICogU2VlIGluZGV4LmpzIGZvciBleGFtcGxlcy5cclxuICovXHJcblxyXG5jb25zdCB7IEJ1ZmZlciB9ID0gcmVxdWlyZSgnYnVmZmVyJyk7XHJcbmNvbnN0IGxvZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2JpbGliaWxpLWRhbm1ha3UtY2xpZW50L1NlY3Rpb25Db25uZWN0aW9uJyk7XHJcbmNvbnN0IHsgaXNFcXVhbCB9ID0gcmVxdWlyZSgnbG9kYXNoJyk7XHJcblxyXG5jb25zdCB7IENhc2NhZGVDb25uZWN0aW9uIH0gPSByZXF1aXJlKCcuLi91dGlsL2Nvbm5lY3Rpb24nKTtcclxuY29uc3QgV2ViU29ja2V0Q29ubmVjdGlvbiA9IHJlcXVpcmUoJy4vV2ViU29ja2V0Q29ubmVjdGlvbicpO1xyXG5cclxuY29uc3QgcHJvdG9WZXIgPSAweDEwO1xyXG5jb25zdCBlbmNvZGluZyA9ICd1dGY4JztcclxuXHJcbi8qKlxyXG4gKiBTZWN0aW9uIGlzIHNlbnQgdGhyb3VnaCB0aGUgU2VjdGlvbiBMYXllci5cclxuICogU2VjdGlvbiBpcyBhIHNpbXBsZSBvYmplY3QuIEl0cyAnY29kZXInIHByb3BlcnR5IHNwZWNpZmllcyB0aGUgdHlwZSBvZlxyXG4gKiB0aGlzIFNlY3Rpb24sIHdoaWxlIGl0cyAnZGF0YScgcHJvcGVydHkgaXMgdGhlIGRhdGEgaXMgY29udGFpbnMuXHJcbiAqIFNlY3Rpb25zIGNhbiBjb250YWluIGFueSBraW5kIG9mIGRhdGEsIGhvd2V2ZXIgZGF0YSB0aGF0IGNhbm5vdCBiZVxyXG4gKiB0cmFuc2Zvcm1lZCBieSBpdHMgY29kZXIgd2lsbCBiZSB1c2VsZXNzIGFuZCBwcm9ibGVtYXRpYy4gVGhlcmVmb3JlLFxyXG4gKiB3aG9ldmVyIHNwZWNpZmllcyB0aGUgY29kZXIgc2hvdWxkIGJlIHJlc3BvbnNpYmxlIHNwZWNpZnlpbmcgdGhlIGRhdGEuXHJcbiAqIFNlY3Rpb24gc2hvdWxkIG5vdCBiZSBzdWJjbGFzc2VkLiBBIHR5cGljYWwgdXNhZ2UgaXM6XHJcbiAqIGNvbnN0IGNvZGVyID0gbmV3IEpzb25Db2Rlcih7IGNvbnRyb2xGbGFnOiB0cnVlLCBvcENvZGU6IDEwLCBiaW5hcnlGbGFnOiBmYWxzZSB9KTtcclxuICogY29uc3Qgc2VjdGlvbiA9IG5ldyBTZWN0aW9uKGNvZGVyLCB7IGZvbzogMSB9KTtcclxuICovXHJcbmNsYXNzIFNlY3Rpb24ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IFNlY3Rpb24uXHJcbiAgICAgKiBAcGFyYW0ge1NlY3Rpb25Db2Rlcn0gY29kZXIgVGhlIGNvZGVyIG9mIHRoaXMgU2VjdGlvbi5cclxuICAgICAqIEBwYXJhbSB7YW55fSBkYXRhIFRoZSBkYXRhIG9mIHRoaXMgU2VjdGlvbi5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoY29kZXIsIGRhdGEpIHtcclxuICAgICAgICB0aGlzLmNvZGVyID0gY29kZXI7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFNlY3Rpb25Db2RlciBpcyB1c2VkIHRvIGVuY29kZSBhbmQgZGVjb2RlIFNlY3Rpb25zIHRvIGFuZCBmcm9tIEJ1ZmZlcnMuXHJcbiAqIE1lYW53aGlsZSwgU2VjdGlvbkNvZGVyIGFsc28gY29udGFpbnMgYSAnaGVhZGVyJyBwcm9wZXJ0eSB3aGljaCBzcGVjaWZpZXNcclxuICogdGhlIGhlYWRlciB0aGF0IHNob3VsZCBiZSB1c2VkIGZvciBhbGwgU2VjdGlvbnMgd2l0aCB0aGlzIGNvZGVyLlxyXG4gKiBTZWN0aW9uQ29kZXIgc2hvdWxkIGJlIHN1YmNsYXNzZWQgdG8gc3VwcG9ydCBlbmNvZGluZyBhbmQgZGVjb2Rpbmcgb2ZcclxuICogZGlmZmVyZW50IHR5cGVzIG9mIGRhdGEsIGhvd2V2ZXIgb25seSBuZXcgaW5zdGFuY2VzIHNob3VsZCBiZSB1c2VkIHRvIHN1cHBvcnRcclxuICogZGlmZmVyZW50IGhlYWRlcnMuXHJcbiAqIE1lYW53aGlsZSwgU2VjdGlvbkNvZGVyIGluc3RhbmNlcyBzaG91bGQgYmUgcmV1c2VkIGFjcm9zcyBTZWN0aW9ucy4gU2luY2VcclxuICogc2VjdGlvbi5jb2RlciA9PT0gdGhpcyBpcyB1c2VkIGluIGhhc0NvbnN0cnVjdGVkKCksIG9ubHkgb25lIFNlY3Rpb25Db2RlciB3aXRoXHJcbiAqIHRoZSBzYW1lIGhlYWRlciBzaG91bGQgYmUgdXNlZCBpbiB0aGUgc2FtZSBhcHBsaWNhdGlvbi5cclxuICovXHJcbmNsYXNzIFNlY3Rpb25Db2RlciB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdHMgYSBuZXcgU2VjdGlvbkNvZGVyIHdpdGggdGhlIGdpdmVuIGhlYWRlci5cclxuICAgICAqIEhlYWRlciBNVVNUIGNvbnRhaW4gdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxyXG4gICAgICogY29udHJvbEZsYWc6IGJvb2xlYW4sXHJcbiAgICAgKiBvcENvZGU6IE51bWJlcixcclxuICAgICAqIGJpbmFyeUZsYWc6IGJvb2xlYW4uXHJcbiAgICAgKiBEZXRhaWxlZCBkZWZpbml0aW9ucyBjYW4gYmUgZm91bmQgaW4gV2lraSBwYWdlICdUcmFuc3BvcnQgUHJvdG9jb2wnLlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGhlYWRlciBUaGUgaGVhZGVyIG9iamVjdCBvZiB0aGlzIFNlY3Rpb25Db2Rlci5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoaGVhZGVyKSB7IHRoaXMuaGVhZGVyID0gaGVhZGVyOyB9XHJcbiAgICAvKipcclxuICAgICAqIEVuY29kZSB0aGUgZGF0YSBvZiB0aGUgU2VjdGlvbiBpbnRvIEJ1ZmZlci5cclxuICAgICAqIEJ5IGRlZmF1bHQsIHRoZSBkYXRhIGlzIGtlcHQgYXMtaXMuIFRoZXJlZm9yZSBub24tQnVmZmVyIGRhdGEgbWlnaHQgbGVhZCB0b1xyXG4gICAgICogYW4gZXJyb3IuXHJcbiAgICAgKiBAcGFyYW0ge2FueX0gZGF0YSBUaGUgZGF0YSB0byBlbmNvZGUuXHJcbiAgICAgKiBAcmV0dXJucyB7QnVmZmVyfSBUaGUgZW5jb2RlZCBidWZmZXIuXHJcbiAgICAgKi9cclxuICAgIGVuY29kZShkYXRhKSB7IHJldHVybiBkYXRhOyB9XHJcbiAgICAvKipcclxuICAgICAqIERlY29kZSB0aGUgQnVmZmVyIGJhY2sgdG8gdGhlIFNlY3Rpb24gZGF0YS5cclxuICAgICAqIEJ5IGRlZmF1bHQsIHRoZSBCdWZmZXIgaXMga2VwdCBhcy1pcy5cclxuICAgICAqIFR5cGljYWxseSBjb25zdHJ1Y3QoKSBpcyB1c2VkIHRvIGNvbnN0cnVjdCBhIG5ldyBTZWN0aW9uIHdpdGggZGVjb2RlZCBkYXRhXHJcbiAgICAgKiBhbmQgdGhpcyBjb2Rlci5cclxuICAgICAqIEBwYXJhbSB7QnVmZmVyfSBidWYgVGhlIGJ1ZmZlciB0byBkZWNvZGUuXHJcbiAgICAgKiBAcmV0dXJucyB7YW55fSBUaGUgZGVjb2RlZCBkYXRhLlxyXG4gICAgICovXHJcbiAgICBkZWNvZGUoYnVmKSB7IHJldHVybiBidWY7IH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIFNlY3Rpb24gaXMgY29uc3RydWN0ZWQgYnkgdGhpcyBTZWN0aW9uQ29kZXIuXHJcbiAgICAgKiBzZWN0aW9uIGlzIGNvbnN0cnVjdGVkIGJ5IGFuIGNvZGVyIGJ5IHNlY3Rpb24gPSBjb2Rlci5jb25zdHJ1Y3QoKSBvclxyXG4gICAgICogYnkgc2VjdGlvbiA9IG5ldyBTZWN0aW9uKGNvZGVyLCBkYXRhKS5cclxuICAgICAqIEBwYXJhbSB7U2VjdGlvbn0gc2VjdGlvbiBUaGUgc2VjdGlvbiB0byBjaGVjay5cclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdGhlIFNlY3Rpb24gaXMgY29uc3RydWN0ZWQgYnkgdGhpcyBTZWN0aW9uQ29kZXIuXHJcbiAgICAgKi9cclxuICAgIGhhc0NvbnN0cnVjdGVkKHNlY3Rpb24pIHsgcmV0dXJuIHNlY3Rpb24uY29kZXIgPT09IHRoaXM7IH1cclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgU2VjdGlvbiB3aXRoIHRoaXMgU2VjdGlvbkNvZGVyIGFuZCBkZWNvZGVkIGRhdGEuXHJcbiAgICAgKiBAcGFyYW0ge0J1ZmZlcn0gZGF0YSBUaGUgZGF0YSB0byBkZWNvZGUuXHJcbiAgICAgKiBAcmV0dXJucyB7U2VjdGlvbn0gVGhlIGNvbnN0cnVjdGVkIFNlY3Rpb24uXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdChkYXRhKSB7IHJldHVybiBuZXcgU2VjdGlvbih0aGlzLCB0aGlzLmRlY29kZShkYXRhKSk7IH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEltcGxlbWVudGF0aW9uIG9mIFNlY3Rpb25Db2RlciB0aGF0IGVuY29kZXMgYW5kIGRlY29kZXMgc3RyaW5ncy5cclxuICovXHJcbmNsYXNzIFN0cmluZ0NvZGVyIGV4dGVuZHMgU2VjdGlvbkNvZGVyIHtcclxuICAgIGVuY29kZShzdHIpIHsgcmV0dXJuIEJ1ZmZlci5mcm9tKHN0ciwgZW5jb2RpbmcpOyB9XHJcbiAgICBkZWNvZGUoYnVmKSB7IHJldHVybiBidWYudG9TdHJpbmcoZW5jb2RpbmcpOyB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiBTZWN0aW9uQ29kZXIgdGhhdCBlbmNvZGVzIGFuZCBkZWNvZGVzIEpTT05zLlxyXG4gKi9cclxuY2xhc3MgSnNvbkNvZGVyIGV4dGVuZHMgU3RyaW5nQ29kZXIge1xyXG4gICAgZW5jb2RlKGpzb24pIHsgcmV0dXJuIHN1cGVyLmVuY29kZShKU09OLnN0cmluZ2lmeShqc29uKSk7IH1cclxuICAgIGRlY29kZShidWYpIHsgcmV0dXJuIEpTT04ucGFyc2Uoc3VwZXIuZGVjb2RlKGJ1ZikpOyB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZWN0aW9uQ29ubmVjdGlvbiBpbXBsZW1lbnRzIHRoZSBTZWN0aW9uIExheWVyIG9mIHRoZSBUcmFuc3BvcnQgUHJvdG9jb2wuXHJcbiAqIEl0IHVzZXMgV2ViU29ja2V0Q29ubmVjdGlvbiBhcyBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgQ29ubmVjdGlvbiBMYXllciBhbmQgdXNlc1xyXG4gKiBDYXNjYWRlQ29ubmVjdGlvbiB0byB3cmFwIG92ZXIgaXQuXHJcbiAqIEFzIHNwZWNpZmllZCBpbiB0aGUgVHJhbnNwb3J0IFByb3RvY29sLCBTZWN0aW9uQ29ubmVjdGlvbiBpcyBzdGF0ZWxlc3MsIGFuZFxyXG4gKiBpbmhlcml0cyBldmVudHMgZnJvbSBhbmQgZGVsZWdhdGVzIG1ldGhvZCB0byB0aGUgQ29ubmVjdGlvbiBMYXllci5cclxuICogQXMgYSBmbGF3IGluIHRoZSBUcmFuc3BvcnQgUHJvdG9jb2wsIFNlY3Rpb25zIGNhbiBjb250YWluIGFyYml0cmFyeSB0eXBlc1xyXG4gKiBvZiBkYXRhLCB3aGlsZSB0aGUgY29udmVydGlvbiBmcm9tIEJ1ZmZlciB0byB0aGUgZGF0YSBpcyBkb25lIGluIHRoZSBEYXRhIExheWVyLlxyXG4gKiBIb3dldmVyLCBTZWN0aW9ucyBoYXZlIHRvIGJlIGNvbnN0cnVjdGVkIGluIHRoZSBTZWN0aW9uIGxheWVyLCBzbyBpbiB0aGVcclxuICogaW1wbGVtZW50YXRpb24sIHRoZSBkZWJ1bmRsaW5nIHByb2Nlc3Mgb2YgU2VjdGlvbiBMYXllciBhbmQgdGhlIGNvbnZlcnRpb25cclxuICogcHJvY2VzcyBvZiB0aGUgRGF0YSBMYXllciBhcmUgY29tYmluZGVkIHRvZ2V0aGVyIHRvIGZvcm0gdGhlIHRyYW5zZm9ybSgpIGFuZFxyXG4gKiBkZXRyYW5zZm9ybSgpIG1ldGhvZHMgb2YgQ2FzY2FkZUNvbm5lY3Rpb24uXHJcbiAqL1xyXG5jbGFzcyBTZWN0aW9uQ29ubmVjdGlvbiBleHRlbmRzIENhc2NhZGVDb25uZWN0aW9uIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgbmV3IFNlY3Rpb25Db25uZWN0aW9uLlxyXG4gICAgICogQHBhcmFtIHtTZWN0aW9uQ29kZXJbXX0gY29kZXJzIFRoZSBsaXN0IG9mIGNvZGVycyB0byB1c2UuXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSB1cmwgdG8gY29ubmVjdCB0by5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nIHwgU3RyaW5nW10gfCB1bmRlZmluZWR9IHByb3RvY29scyBUaGUgV2ViU29ja2V0IHByb3RvY29scyB0byB1c2UuXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdCB8IHVuZGVmaW5lZH0gb3B0aW9ucyBUaGUgb3B0aW9ucyB1c2VkIHRvIGNvbmZpZ3VyZSBXZWJTb2NrZXRDb25uZWN0aW9uLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcihjb2RlcnMsIHVybCwgeyBwcm90b2NvbHMsIG9wdGlvbnMgfSA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIobmV3IFdlYlNvY2tldENvbm5lY3Rpb24odXJsLCBwcm90b2NvbHMsIG9wdGlvbnMpKTtcclxuICAgICAgICB0aGlzLmNvZGVycyA9IGNvZGVycztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyYW5zZm9ybSBnaXZlbiBzZWN0aW9ucyB0byBCdWZmZXIuIFNlZSBzdXBlciBtZXRob2QgZG9jdW1lbnRhdGlvbi5cclxuICAgICAqIFRoaXMgbWV0aG9kIGltcGxlbWVudHMgdGhlIGJ1bmRsaW5nIHByb2Nlc3MuXHJcbiAgICAgKiBOb3RlIHRoYXQgdGhlIFNlY3Rpb25Db25uZWN0aW9uIGFjdHVhbGx5IHRyYW5zcG9ydHMgYXJyYXlzIG9mIFNlY3Rpb24sIHNvXHJcbiAgICAgKiBjb25uZWN0aW9uLnNlbmQobmV3IFNlY3Rpb24oLi4uKSkgd2lsbCByZXN1bHQgaW4gYW4gZXJyb3IuXHJcbiAgICAgKiBAcGFyYW0ge1NlY3Rpb25bXX0gc2VjdGlvbnMgVGhlIHNlY3Rpb25zIHRvIHRyYW5zZm9ybSB0byBCdWZmZXIuXHJcbiAgICAgKiBAcmV0dXJucyB7QnVmZmVyfSBUaGUgdHJhbnNmb3JtZWQgQnVmZmVyLlxyXG4gICAgICovXHJcbiAgICB0cmFuc2Zvcm0oc2VjdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChzZWN0aW9ucy5tYXAodGhpcy5lbmNvZGVTZWN0aW9uLmJpbmQodGhpcykpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERldHJhbnNmb3JtIGdpdmVuIEJ1ZmZlciBiYWNrIHRvIGEgbGlzdCBvZiBTZWN0aW9ucy4gU2VlIHN1cGVyIG1ldGhvZCBkb2N1bWVudGF0aW9uLlxyXG4gICAgICogVGhpcyBtZXRob2QgaW1wbGVtZW50cyB0aGUgZGVidW5kbGluZyBwcm9jZXNzLlxyXG4gICAgICogTm90ZSB0aGF0IHRoZSBTZWN0aW9uQ29ubmVjdGlvbiBhY3R1YWxsdCB0cmFuc3BvcnRzIGFycmF5cyBvZiBTZWN0aW9uIHNvXHJcbiAgICAgKiB0aGUgJ21lc3NhZ2UnIGV2ZW50IHdpbGwgYmUgZW1pdHRlZCB3aXRoIGEgU2VjdGlvbltdIGFzIGFyZ3VtZW50LlxyXG4gICAgICogQHBhcmFtIHtCdWZmZXJFbmNvZGluZ30gYnVmIFRoZSBCdWZmZXIgdG8gZGV0cmFuc2Zvcm0uXHJcbiAgICAgKiBAcmV0dXJucyB7U2VjdGlvbltdfSBUaGUgZGV0cmFuc2Zvcm1lZCBTZWN0aW9ucy5cclxuICAgICAqL1xyXG4gICAgZGV0cmFuc2Zvcm0oYnVmKSB7XHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbnMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBvZmYgPSAwOyBvZmYgPCBidWYubGVuZ3RoOyBvZmYgPSB0aGlzLmRlY29kZVNlY3Rpb24oc2VjdGlvbnMsIGJ1Ziwgb2ZmKSk7XHJcbiAgICAgICAgcmV0dXJuIHNlY3Rpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIGVuY29kZVNlY3Rpb24oc2VjdGlvbikge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgY29kZXIsIGRhdGEgfSA9IHNlY3Rpb247XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBjb2Rlci5lbmNvZGUoZGF0YSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IEJ1ZmZlci5hbGxvYygxNik7XHJcbiAgICAgICAgICAgIGhlYWRlci53cml0ZUludDMyQkUoY29udGVudC5sZW5ndGggKyAxNiwgMCk7XHJcbiAgICAgICAgICAgIGhlYWRlci53cml0ZUludDE2QkUocHJvdG9WZXIsIDQpO1xyXG4gICAgICAgICAgICBoZWFkZXJbN10gPSBjb2Rlci5oZWFkZXIuY29udHJvbEZsYWcgPyAweDAxIDogMHgwMDtcclxuICAgICAgICAgICAgaGVhZGVyLndyaXRlSW50MzJCRShjb2Rlci5oZWFkZXIub3BDb2RlLCA4KTtcclxuICAgICAgICAgICAgaGVhZGVyWzE1XSA9IGNvZGVyLmhlYWRlci5iaW5hcnlGbGFnID8gMHgwMSA6IDB4MDA7XHJcbiAgICAgICAgICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFtoZWFkZXIsIGNvbnRlbnRdKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGxvZyhgVW5hYmxlIHRvIGVuY29kZSBzZWN0aW9uOiBzZWN0aW9uPSR7c2VjdGlvbn0sIGVycm9yPSR7ZX0uYCk7XHJcbiAgICAgICAgICAgIHJldHVybiBCdWZmZXIuYWxsb2MoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRlY29kZUhlYWRlcihidWYsIG9mZnNldCkge1xyXG4gICAgICAgIGlmIChidWYubGVuZ3RoIDwgb2Zmc2V0ICsgMTYpIHRocm93IG5ldyBFcnJvcihgQnVmZmVyIHRvbyBzaG9ydDogb2Zmc2V0PSR7b2Zmc2V0fSwgbGVuZ3RoPSR7YnVmLmxlbmd0aH0uYCk7XHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gYnVmLnJlYWRJbnQzMkJFKG9mZnNldCk7IC8vIGxlbmd0aCA9IENPTlRFTlQgbGVuZ3RoICsgMTZcclxuICAgICAgICBpZiAobGVuZ3RoIDwgMTYpIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBzZWN0aW9uIGxlbmd0aDogJHtsZW5ndGh9LmApO1xyXG4gICAgICAgIGlmIChsZW5ndGggKyBvZmZzZXQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoYFNlY3Rpb24gdG9vIGxvbmc6IGVuZD0ke2xlbmd0aCArIG9mZnNldH0sIGxlbmd0aD0ke2J1Zi5sZW5ndGh9LmApO1xyXG4gICAgICAgIGNvbnN0IHNlY3Rpb25Qcm90b1ZlciA9IGJ1Zi5yZWFkSW50MTZCRShvZmZzZXQgKyA0KTtcclxuICAgICAgICBpZiAoc2VjdGlvblByb3RvVmVyICE9PSBwcm90b1ZlcikgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHNlY3Rpb24gaGVhZGVyOiBwcm90b1Zlcj0ke3NlY3Rpb25Qcm90b1Zlcn0sIGV4cGVjdGVkPSR7cHJvdG9WZXJ9LmApO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGxlbmd0aCxcclxuICAgICAgICAgICAgaGVhZGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjb250cm9sRmxhZzogYnVmW29mZnNldCArIDddID09PSAweDAxLFxyXG4gICAgICAgICAgICAgICAgb3BDb2RlOiBidWYucmVhZEludDMyQkUob2Zmc2V0ICsgOCksXHJcbiAgICAgICAgICAgICAgICBiaW5hcnlGbGFnOiBidWZbb2Zmc2V0ICsgMTVdID09PSAweDAxLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZGVjb2RlU2VjdGlvbihzZWN0aW9ucywgYnVmLCBvZmZzZXQpIHtcclxuICAgICAgICBsZXQgaGVhZGVyO1xyXG4gICAgICAgIGxldCBsZW5ndGg7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgKHsgaGVhZGVyLCBsZW5ndGggfSA9IHRoaXMuZGVjb2RlSGVhZGVyKGJ1Ziwgb2Zmc2V0KSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBsb2coJ1VuYWJsZSB0byBkZWNvZGVyIGhlYWRlcjogJXMnLCBlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGJ1Zi5sZW5ndGg7IC8vIHN0b3AgZGVidW5kbGluZyBwcm9jZXNzXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjb2RlciA9IHRoaXMuY29kZXJzLmZpbmQoYyA9PiBpc0VxdWFsKGMuaGVhZGVyLCBoZWFkZXIpKTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvZGVyID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBsb2coJ05vIG1hdGNoaW5nIGNvZGVyIGZvdW5kOiBoZWFkZXI9JXMuJywgaGVhZGVyKTtcclxuICAgICAgICAgICAgcmV0dXJuIG9mZnNldCArIGxlbmd0aDsgLy8gc2tpcCB0aGlzIHNlY3Rpb25cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBidWYuc2xpY2Uob2Zmc2V0ICsgMTYsIG9mZnNldCArIGxlbmd0aCk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgc2VjdGlvbnMucHVzaChjb2Rlci5jb25zdHJ1Y3QoY29udGVudCkpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgbG9nKCdVbmFibGUgdG8gZGVjb2RlIHNlY3Rpb246IGNvbnRlbnQ9JXMsIGNvZGVyPSVzLicsIGNvbnRlbnQsIGNvZGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9mZnNldCArIGxlbmd0aDsgLy8gcHJvY2VlZCB0byBuZXh0IHNlY3Rpb25cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBTZWN0aW9uLFxyXG4gICAgU2VjdGlvbkNvZGVyLFxyXG4gICAgU3RyaW5nQ29kZXIsXHJcbiAgICBKc29uQ29kZXIsXHJcbiAgICBTZWN0aW9uQ29ubmVjdGlvbixcclxufTtcclxuIl19