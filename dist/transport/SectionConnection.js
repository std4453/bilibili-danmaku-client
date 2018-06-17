"use strict";

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.regexp.to-string");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var _require = require('buffer'),
    Buffer = _require.Buffer;

var log = require('debug')('bilibili-danmaku-client/SectionConnection');

var _require2 = require('lodash'),
    isEqual = _require2.isEqual;

var _require3 = require('../connection'),
    CascadeConnection = _require3.CascadeConnection;

var WebSocketConnection = require('./WebSocketConnection');

var protoVer = 0x10;
var encoding = 'utf8';

var Section = function Section(coder, data) {
  this.coder = coder;
  this.data = data;
};

var SectionCoder =
/*#__PURE__*/
function () {
  function SectionCoder(header) {
    this.header = header;
  }

  var _proto = SectionCoder.prototype;

  _proto.encode = function encode(data) {
    return data;
  };

  _proto.decode = function decode(buf) {
    return buf;
  };

  _proto.hasConstructed = function hasConstructed(section) {
    return section.coder === this;
  };

  _proto.construct = function construct(data) {
    return new Section(this, this.decode(data));
  };

  return SectionCoder;
}();

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

var SectionConnection =
/*#__PURE__*/
function (_CascadeConnection) {
  _inheritsLoose(SectionConnection, _CascadeConnection);

  function SectionConnection(coders, url, _temp) {
    var _this;

    var _ref = _temp === void 0 ? {} : _temp,
        protocols = _ref.protocols,
        options = _ref.options;

    _this = _CascadeConnection.call(this, new WebSocketConnection(url, protocols, options)) || this;
    _this.coders = coders;
    return _this;
  }

  var _proto4 = SectionConnection.prototype;

  _proto4.transform = function transform(sections) {
    return Buffer.concat(sections.map(this.encodeSection.bind(this)));
  };

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

  _proto4.decodeSection = function decodeSection(sections, buf, offset) {
    if (buf.length < offset + 16) {
      log("Unable to read section header: offset=" + offset + ", length=" + buf.length + ".");
      return buf.length; // finish detransformation
    }

    var sectionLen = buf.readInt32BE(offset); // sectionLen = CONTENT length + 16

    if (sectionLen < 16) {
      log("Invalid section length: " + sectionLen + ".");
      return buf.length; // critical error, stop detransformation
    }

    if (sectionLen + offset > buf.length) {
      log("Section too long: end=" + (sectionLen + offset) + ", length=" + buf.length + ".");
      return buf.length; // critical error, stop detransformation
    }

    var sectionProtoVer = buf.readInt16BE(offset + 4);

    if (sectionProtoVer !== protoVer) {
      log("Invalid section header: protoVer=" + sectionProtoVer + ", expected=" + protoVer + ".");
      return offset + sectionLen; // skip this section
    }

    var sectionHeader = {
      controlFlag: buf[offset + 7] === 0x01,
      opCode: buf.readInt32BE(offset + 8),
      binaryFlag: buf[offset + 15] === 0x01
    };

    for (var _iterator = this.coders, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref2 = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref2 = _i.value;
      }

      var coder = _ref2;

      if (isEqual(coder.header, sectionHeader)) {
        var contentBuf = buf.slice(offset + 16, offset + sectionLen);

        try {
          sections.push(coder.construct(contentBuf));
        } catch (e) {
          log("Unable to decode section: content=" + contentBuf + ", coder=" + coder + ".");
        }

        return offset + sectionLen; // proceed to next section & break loop
      }
    }

    log("No matching section found: header=" + sectionHeader + ".");
    return offset + sectionLen; // skip this section
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90cmFuc3BvcnQvU2VjdGlvbkNvbm5lY3Rpb24uanMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkJ1ZmZlciIsImxvZyIsImlzRXF1YWwiLCJDYXNjYWRlQ29ubmVjdGlvbiIsIldlYlNvY2tldENvbm5lY3Rpb24iLCJwcm90b1ZlciIsImVuY29kaW5nIiwiU2VjdGlvbiIsImNvZGVyIiwiZGF0YSIsIlNlY3Rpb25Db2RlciIsImhlYWRlciIsImVuY29kZSIsImRlY29kZSIsImJ1ZiIsImhhc0NvbnN0cnVjdGVkIiwic2VjdGlvbiIsImNvbnN0cnVjdCIsIlN0cmluZ0NvZGVyIiwic3RyIiwiZnJvbSIsInRvU3RyaW5nIiwiSnNvbkNvZGVyIiwianNvbiIsIkpTT04iLCJzdHJpbmdpZnkiLCJwYXJzZSIsIlNlY3Rpb25Db25uZWN0aW9uIiwiY29kZXJzIiwidXJsIiwicHJvdG9jb2xzIiwib3B0aW9ucyIsInRyYW5zZm9ybSIsInNlY3Rpb25zIiwiY29uY2F0IiwibWFwIiwiZW5jb2RlU2VjdGlvbiIsImJpbmQiLCJkZXRyYW5zZm9ybSIsIm9mZiIsImxlbmd0aCIsImRlY29kZVNlY3Rpb24iLCJjb250ZW50IiwiYWxsb2MiLCJ3cml0ZUludDMyQkUiLCJ3cml0ZUludDE2QkUiLCJjb250cm9sRmxhZyIsIm9wQ29kZSIsImJpbmFyeUZsYWciLCJlIiwib2Zmc2V0Iiwic2VjdGlvbkxlbiIsInJlYWRJbnQzMkJFIiwic2VjdGlvblByb3RvVmVyIiwicmVhZEludDE2QkUiLCJzZWN0aW9uSGVhZGVyIiwiY29udGVudEJ1ZiIsInNsaWNlIiwicHVzaCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztlQUFtQkEsUUFBUSxRQUFSLEM7SUFBWEMsTSxZQUFBQSxNOztBQUNSLElBQU1DLE1BQU1GLFFBQVEsT0FBUixFQUFpQiwyQ0FBakIsQ0FBWjs7Z0JBQ29CQSxRQUFRLFFBQVIsQztJQUFaRyxPLGFBQUFBLE87O2dC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TGEsQ0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7IEJ1ZmZlciB9ID0gcmVxdWlyZSgnYnVmZmVyJyk7XHJcbmNvbnN0IGxvZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2JpbGliaWxpLWRhbm1ha3UtY2xpZW50L1NlY3Rpb25Db25uZWN0aW9uJyk7XHJcbmNvbnN0IHsgaXNFcXVhbCB9ID0gcmVxdWlyZSgnbG9kYXNoJyk7XHJcblxyXG5jb25zdCB7IENhc2NhZGVDb25uZWN0aW9uIH0gPSByZXF1aXJlKCcuLi9jb25uZWN0aW9uJyk7XHJcbmNvbnN0IFdlYlNvY2tldENvbm5lY3Rpb24gPSByZXF1aXJlKCcuL1dlYlNvY2tldENvbm5lY3Rpb24nKTtcclxuXHJcbmNvbnN0IHByb3RvVmVyID0gMHgxMDtcclxuY29uc3QgZW5jb2RpbmcgPSAndXRmOCc7XHJcblxyXG5jbGFzcyBTZWN0aW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKGNvZGVyLCBkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5jb2RlciA9IGNvZGVyO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNlY3Rpb25Db2RlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihoZWFkZXIpIHsgdGhpcy5oZWFkZXIgPSBoZWFkZXI7IH1cclxuICAgIGVuY29kZShkYXRhKSB7IHJldHVybiBkYXRhOyB9XHJcbiAgICBkZWNvZGUoYnVmKSB7IHJldHVybiBidWY7IH1cclxuICAgIGhhc0NvbnN0cnVjdGVkKHNlY3Rpb24pIHsgcmV0dXJuIHNlY3Rpb24uY29kZXIgPT09IHRoaXM7IH1cclxuICAgIGNvbnN0cnVjdChkYXRhKSB7IHJldHVybiBuZXcgU2VjdGlvbih0aGlzLCB0aGlzLmRlY29kZShkYXRhKSk7IH1cclxufVxyXG5cclxuY2xhc3MgU3RyaW5nQ29kZXIgZXh0ZW5kcyBTZWN0aW9uQ29kZXIge1xyXG4gICAgZW5jb2RlKHN0cikgeyByZXR1cm4gQnVmZmVyLmZyb20oc3RyLCBlbmNvZGluZyk7IH1cclxuICAgIGRlY29kZShidWYpIHsgcmV0dXJuIGJ1Zi50b1N0cmluZyhlbmNvZGluZyk7IH1cclxufVxyXG5cclxuY2xhc3MgSnNvbkNvZGVyIGV4dGVuZHMgU3RyaW5nQ29kZXIge1xyXG4gICAgZW5jb2RlKGpzb24pIHsgcmV0dXJuIHN1cGVyLmVuY29kZShKU09OLnN0cmluZ2lmeShqc29uKSk7IH1cclxuICAgIGRlY29kZShidWYpIHsgcmV0dXJuIEpTT04ucGFyc2Uoc3VwZXIuZGVjb2RlKGJ1ZikpOyB9XHJcbn1cclxuXHJcbmNsYXNzIFNlY3Rpb25Db25uZWN0aW9uIGV4dGVuZHMgQ2FzY2FkZUNvbm5lY3Rpb24ge1xyXG4gICAgY29uc3RydWN0b3IoY29kZXJzLCB1cmwsIHsgcHJvdG9jb2xzLCBvcHRpb25zIH0gPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKG5ldyBXZWJTb2NrZXRDb25uZWN0aW9uKHVybCwgcHJvdG9jb2xzLCBvcHRpb25zKSk7XHJcbiAgICAgICAgdGhpcy5jb2RlcnMgPSBjb2RlcnM7XHJcbiAgICB9XHJcblxyXG4gICAgdHJhbnNmb3JtKHNlY3Rpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoc2VjdGlvbnMubWFwKHRoaXMuZW5jb2RlU2VjdGlvbi5iaW5kKHRoaXMpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgZGV0cmFuc2Zvcm0oYnVmKSB7XHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbnMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBvZmYgPSAwOyBvZmYgPCBidWYubGVuZ3RoOyBvZmYgPSB0aGlzLmRlY29kZVNlY3Rpb24oc2VjdGlvbnMsIGJ1Ziwgb2ZmKSk7XHJcbiAgICAgICAgcmV0dXJuIHNlY3Rpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIGVuY29kZVNlY3Rpb24oc2VjdGlvbikge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgY29kZXIsIGRhdGEgfSA9IHNlY3Rpb247XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBjb2Rlci5lbmNvZGUoZGF0YSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IEJ1ZmZlci5hbGxvYygxNik7XHJcbiAgICAgICAgICAgIGhlYWRlci53cml0ZUludDMyQkUoY29udGVudC5sZW5ndGggKyAxNiwgMCk7XHJcbiAgICAgICAgICAgIGhlYWRlci53cml0ZUludDE2QkUocHJvdG9WZXIsIDQpO1xyXG4gICAgICAgICAgICBoZWFkZXJbN10gPSBjb2Rlci5oZWFkZXIuY29udHJvbEZsYWcgPyAweDAxIDogMHgwMDtcclxuICAgICAgICAgICAgaGVhZGVyLndyaXRlSW50MzJCRShjb2Rlci5oZWFkZXIub3BDb2RlLCA4KTtcclxuICAgICAgICAgICAgaGVhZGVyWzE1XSA9IGNvZGVyLmhlYWRlci5iaW5hcnlGbGFnID8gMHgwMSA6IDB4MDA7XHJcbiAgICAgICAgICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFtoZWFkZXIsIGNvbnRlbnRdKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGxvZyhgVW5hYmxlIHRvIGVuY29kZSBzZWN0aW9uOiBzZWN0aW9uPSR7c2VjdGlvbn0sIGVycm9yPSR7ZX0uYCk7XHJcbiAgICAgICAgICAgIHJldHVybiBCdWZmZXIuYWxsb2MoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRlY29kZVNlY3Rpb24oc2VjdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XHJcbiAgICAgICAgaWYgKGJ1Zi5sZW5ndGggPCBvZmZzZXQgKyAxNikge1xyXG4gICAgICAgICAgICBsb2coYFVuYWJsZSB0byByZWFkIHNlY3Rpb24gaGVhZGVyOiBvZmZzZXQ9JHtvZmZzZXR9LCBsZW5ndGg9JHtidWYubGVuZ3RofS5gKTtcclxuICAgICAgICAgICAgcmV0dXJuIGJ1Zi5sZW5ndGg7IC8vIGZpbmlzaCBkZXRyYW5zZm9ybWF0aW9uXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHNlY3Rpb25MZW4gPSBidWYucmVhZEludDMyQkUob2Zmc2V0KTsgLy8gc2VjdGlvbkxlbiA9IENPTlRFTlQgbGVuZ3RoICsgMTZcclxuICAgICAgICBpZiAoc2VjdGlvbkxlbiA8IDE2KSB7XHJcbiAgICAgICAgICAgIGxvZyhgSW52YWxpZCBzZWN0aW9uIGxlbmd0aDogJHtzZWN0aW9uTGVufS5gKTtcclxuICAgICAgICAgICAgcmV0dXJuIGJ1Zi5sZW5ndGg7IC8vIGNyaXRpY2FsIGVycm9yLCBzdG9wIGRldHJhbnNmb3JtYXRpb25cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHNlY3Rpb25MZW4gKyBvZmZzZXQgPiBidWYubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxvZyhgU2VjdGlvbiB0b28gbG9uZzogZW5kPSR7c2VjdGlvbkxlbiArIG9mZnNldH0sIGxlbmd0aD0ke2J1Zi5sZW5ndGh9LmApO1xyXG4gICAgICAgICAgICByZXR1cm4gYnVmLmxlbmd0aDsgLy8gY3JpdGljYWwgZXJyb3IsIHN0b3AgZGV0cmFuc2Zvcm1hdGlvblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBzZWN0aW9uUHJvdG9WZXIgPSBidWYucmVhZEludDE2QkUob2Zmc2V0ICsgNCk7XHJcbiAgICAgICAgaWYgKHNlY3Rpb25Qcm90b1ZlciAhPT0gcHJvdG9WZXIpIHtcclxuICAgICAgICAgICAgbG9nKGBJbnZhbGlkIHNlY3Rpb24gaGVhZGVyOiBwcm90b1Zlcj0ke3NlY3Rpb25Qcm90b1Zlcn0sIGV4cGVjdGVkPSR7cHJvdG9WZXJ9LmApO1xyXG4gICAgICAgICAgICByZXR1cm4gb2Zmc2V0ICsgc2VjdGlvbkxlbjsgLy8gc2tpcCB0aGlzIHNlY3Rpb25cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbkhlYWRlciA9IHtcclxuICAgICAgICAgICAgY29udHJvbEZsYWc6IGJ1ZltvZmZzZXQgKyA3XSA9PT0gMHgwMSxcclxuICAgICAgICAgICAgb3BDb2RlOiBidWYucmVhZEludDMyQkUob2Zmc2V0ICsgOCksXHJcbiAgICAgICAgICAgIGJpbmFyeUZsYWc6IGJ1ZltvZmZzZXQgKyAxNV0gPT09IDB4MDEsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBmb3IgKGNvbnN0IGNvZGVyIG9mIHRoaXMuY29kZXJzKSB7XHJcbiAgICAgICAgICAgIGlmIChpc0VxdWFsKGNvZGVyLmhlYWRlciwgc2VjdGlvbkhlYWRlcikpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRCdWYgPSBidWYuc2xpY2Uob2Zmc2V0ICsgMTYsIG9mZnNldCArIHNlY3Rpb25MZW4pO1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWN0aW9ucy5wdXNoKGNvZGVyLmNvbnN0cnVjdChjb250ZW50QnVmKSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nKGBVbmFibGUgdG8gZGVjb2RlIHNlY3Rpb246IGNvbnRlbnQ9JHtjb250ZW50QnVmfSwgY29kZXI9JHtjb2Rlcn0uYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0ICsgc2VjdGlvbkxlbjsgLy8gcHJvY2VlZCB0byBuZXh0IHNlY3Rpb24gJiBicmVhayBsb29wXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbG9nKGBObyBtYXRjaGluZyBzZWN0aW9uIGZvdW5kOiBoZWFkZXI9JHtzZWN0aW9uSGVhZGVyfS5gKTtcclxuICAgICAgICByZXR1cm4gb2Zmc2V0ICsgc2VjdGlvbkxlbjsgLy8gc2tpcCB0aGlzIHNlY3Rpb25cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBTZWN0aW9uLFxyXG4gICAgU2VjdGlvbkNvZGVyLFxyXG4gICAgU3RyaW5nQ29kZXIsXHJcbiAgICBKc29uQ29kZXIsXHJcbiAgICBTZWN0aW9uQ29ubmVjdGlvbixcclxufTtcclxuIl19