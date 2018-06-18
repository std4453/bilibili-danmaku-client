"use strict";

require("core-js/modules/web.dom.iterable");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

var log = require('debug')('bilibili-danmaku-client/DataConnection');

var _require = require('../connection'),
    CascadeConnection = _require.CascadeConnection;

var _require2 = require('./SectionConnection'),
    SectionConnection = _require2.SectionConnection,
    Section = _require2.Section,
    SectionCoder = _require2.SectionCoder,
    StringCoder = _require2.StringCoder,
    JsonCoder = _require2.JsonCoder;

var handshakeCoder = new JsonCoder({
  controlFlag: true,
  opCode: 7,
  binaryFlag: true
});
var handshakeAckCoder = new SectionCoder({
  controlFlag: true,
  opCode: 8,
  binaryFlag: true
});
var dataCoder = new JsonCoder({
  controlFlag: false,
  opCode: 5,
  binaryFlag: false
});
var heartbeatCoder = new StringCoder({
  controlFlag: true,
  opCode: 2,
  binaryFlag: true
});
var heartbeatAckCoder = new SectionCoder({
  controlFlag: true,
  opCode: 3,
  binaryFlag: true
});
var coders = [handshakeCoder, handshakeAckCoder, dataCoder, heartbeatCoder, heartbeatAckCoder];

var DataConnection =
/*#__PURE__*/
function (_CascadeConnection) {
  _inheritsLoose(DataConnection, _CascadeConnection);

  function DataConnection(url, handshakeJson, options) {
    var _this;

    if (options === void 0) {
      options = {};
    }

    var _options = options,
        section = _options.section,
        _options$timeout = _options.timeout,
        timeout = _options$timeout === void 0 ? 5000 : _options$timeout,
        _options$heartbeat = _options.heartbeat,
        heartbeat = _options$heartbeat === void 0 ? 30000 : _options$heartbeat;
    _this = _CascadeConnection.call(this, new SectionConnection(coders, url, section), {
      open: false,
      message: false
    }) || this;

    _this.parent.on('message', function (sections) {
      return sections.forEach(_this.processSection.bind(_assertThisInitialized(_assertThisInitialized(_this))));
    });

    _this.setupLifecycle(handshakeJson, timeout);

    _this.setupHeartbeat(heartbeat);

    return _this;
  }

  var _proto = DataConnection.prototype;

  _proto.setupLifecycle = function setupLifecycle(handshakeJson, timeout) {
    var _this2 = this;

    this.parent.on('open', function () {
      log('Sending handshake...');

      _this2.parent.send([new Section(handshakeCoder, handshakeJson)]);
    });
    setTimeout(function () {
      if (_this2.state === 'opening') {
        log('Handshake timed out, closing connection...');

        _this2.onClose();
      }
    }, timeout);
  };

  _proto.setupHeartbeat = function setupHeartbeat(interval) {
    var _this3 = this;

    var heartbeat;

    var sendHeartbeat = function sendHeartbeat() {
      log('Sending heartbeat...');

      _this3.parent.send([new Section(heartbeatCoder, '[object Object]')]);
    };

    this.on('open', function () {
      return setTimeout(function () {
        sendHeartbeat();
        heartbeat = setInterval(sendHeartbeat, interval);
      }, 1000);
    });
    this.on('close', function () {
      return clearInterval(heartbeat);
    });
  };

  _proto.processSection = function processSection(section) {
    switch (this.state) {
      case 'opening':
        if (handshakeAckCoder.hasConstructed(section)) {
          log('Handshake ACK received, handshake successful.');
          this.onOpen();
        }

        break;
      // ignore other sections

      case 'opened':
        if (dataCoder.hasConstructed(section)) this.onMessage(section.data);
        if (heartbeatAckCoder.hasConstructed(section)) log('Heartbeat ACK received.');
        break;
      // ignore other sections

      default:
    }
  };

  _proto.transform = function transform(json) {
    return [new Section(dataCoder, json)];
  }; // SectionConnection sends Section[]


  return DataConnection;
}(CascadeConnection);

module.exports = DataConnection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90cmFuc3BvcnQvRGF0YUNvbm5lY3Rpb24uanMiXSwibmFtZXMiOlsibG9nIiwicmVxdWlyZSIsIkNhc2NhZGVDb25uZWN0aW9uIiwiU2VjdGlvbkNvbm5lY3Rpb24iLCJTZWN0aW9uIiwiU2VjdGlvbkNvZGVyIiwiU3RyaW5nQ29kZXIiLCJKc29uQ29kZXIiLCJoYW5kc2hha2VDb2RlciIsImNvbnRyb2xGbGFnIiwib3BDb2RlIiwiYmluYXJ5RmxhZyIsImhhbmRzaGFrZUFja0NvZGVyIiwiZGF0YUNvZGVyIiwiaGVhcnRiZWF0Q29kZXIiLCJoZWFydGJlYXRBY2tDb2RlciIsImNvZGVycyIsIkRhdGFDb25uZWN0aW9uIiwidXJsIiwiaGFuZHNoYWtlSnNvbiIsIm9wdGlvbnMiLCJzZWN0aW9uIiwidGltZW91dCIsImhlYXJ0YmVhdCIsIm9wZW4iLCJtZXNzYWdlIiwicGFyZW50Iiwib24iLCJzZWN0aW9ucyIsImZvckVhY2giLCJwcm9jZXNzU2VjdGlvbiIsImJpbmQiLCJzZXR1cExpZmVjeWNsZSIsInNldHVwSGVhcnRiZWF0Iiwic2VuZCIsInNldFRpbWVvdXQiLCJzdGF0ZSIsIm9uQ2xvc2UiLCJpbnRlcnZhbCIsInNlbmRIZWFydGJlYXQiLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJoYXNDb25zdHJ1Y3RlZCIsIm9uT3BlbiIsIm9uTWVzc2FnZSIsImRhdGEiLCJ0cmFuc2Zvcm0iLCJqc29uIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxJQUFNQSxNQUFNQyxRQUFRLE9BQVIsRUFBaUIsd0NBQWpCLENBQVo7O2VBRThCQSxRQUFRLGVBQVIsQztJQUF0QkMsaUIsWUFBQUEsaUI7O2dCQUNxRUQsUUFBUSxxQkFBUixDO0lBQXJFRSxpQixhQUFBQSxpQjtJQUFtQkMsTyxhQUFBQSxPO0lBQVNDLFksYUFBQUEsWTtJQUFjQyxXLGFBQUFBLFc7SUFBYUMsUyxhQUFBQSxTOztBQUUvRCxJ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O0FBQUEsS0FBaEI7QUFJQSxTQUFLWCxFQUFMLENBQVEsT0FBUixFQUFpQjtBQUFBLGFBQU1jLGNBQWNsQixTQUFkLENBQU47QUFBQSxLQUFqQjtBQUNILEc7O1NBRURPLGMsMkJBQWVULE8sRUFBUztBQUNwQixZQUFRLEtBQUtlLEtBQWI7QUFDQSxXQUFLLFNBQUw7QUFDSSxZQUFJeEIsa0JBQWtCOEIsY0FBbEIsQ0FBaUNyQixPQUFqQyxDQUFKLEVBQStDO0FBQzNDckIsY0FBSSwrQ0FBSjtBQUNBLGVBQUsyQyxNQUFMO0FBQ0g7O0FBQ0Q7QUFBTzs7QUFDWCxXQUFLLFFBQUw7QUFDSSxZQUFJOUIsVUFBVTZCLGNBQVYsQ0FBeUJyQixPQUF6QixDQUFKLEVBQXVDLEtBQUt1QixTQUFMLENBQWV2QixRQUFRd0IsSUFBdkI7QUFDdkMsWUFBSTlCLGtCQUFrQjJCLGNBQWxCLENBQWlDckIsT0FBakMsQ0FBSixFQUErQ3JCLElBQUkseUJBQUo7QUFDL0M7QUFBTzs7QUFDWDtBQVhBO0FBYUgsRzs7U0FFRDhDLFMsc0JBQVVDLEksRUFBTTtBQUFFLFdBQU8sQ0FBQyxJQUFJM0MsT0FBSixDQUFZUyxTQUFaLEVBQXVCa0MsSUFBdkIsQ0FBRCxDQUFQO0FBQXdDLEcsRUFBQzs7OztFQXBEbEM3QyxpQjs7QUF1RDdCOEMsT0FBT0MsT0FBUCxHQUFpQmhDLGNBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgbG9nID0gcmVxdWlyZSgnZGVidWcnKSgnYmlsaWJpbGktZGFubWFrdS1jbGllbnQvRGF0YUNvbm5lY3Rpb24nKTtcclxuXHJcbmNvbnN0IHsgQ2FzY2FkZUNvbm5lY3Rpb24gfSA9IHJlcXVpcmUoJy4uL2Nvbm5lY3Rpb24nKTtcclxuY29uc3QgeyBTZWN0aW9uQ29ubmVjdGlvbiwgU2VjdGlvbiwgU2VjdGlvbkNvZGVyLCBTdHJpbmdDb2RlciwgSnNvbkNvZGVyIH0gPSByZXF1aXJlKCcuL1NlY3Rpb25Db25uZWN0aW9uJyk7XHJcblxyXG5jb25zdCBoYW5kc2hha2VDb2RlciA9IG5ldyBKc29uQ29kZXIoeyBjb250cm9sRmxhZzogdHJ1ZSwgb3BDb2RlOiA3LCBiaW5hcnlGbGFnOiB0cnVlIH0pO1xyXG5jb25zdCBoYW5kc2hha2VBY2tDb2RlciA9IG5ldyBTZWN0aW9uQ29kZXIoeyBjb250cm9sRmxhZzogdHJ1ZSwgb3BDb2RlOiA4LCBiaW5hcnlGbGFnOiB0cnVlIH0pO1xyXG5jb25zdCBkYXRhQ29kZXIgPSBuZXcgSnNvbkNvZGVyKHsgY29udHJvbEZsYWc6IGZhbHNlLCBvcENvZGU6IDUsIGJpbmFyeUZsYWc6IGZhbHNlIH0pO1xyXG5jb25zdCBoZWFydGJlYXRDb2RlciA9IG5ldyBTdHJpbmdDb2Rlcih7IGNvbnRyb2xGbGFnOiB0cnVlLCBvcENvZGU6IDIsIGJpbmFyeUZsYWc6IHRydWUgfSk7XHJcbmNvbnN0IGhlYXJ0YmVhdEFja0NvZGVyID0gbmV3IFNlY3Rpb25Db2Rlcih7IGNvbnRyb2xGbGFnOiB0cnVlLCBvcENvZGU6IDMsIGJpbmFyeUZsYWc6IHRydWUgfSk7XHJcbmNvbnN0IGNvZGVycyA9IFtoYW5kc2hha2VDb2RlciwgaGFuZHNoYWtlQWNrQ29kZXIsIGRhdGFDb2RlciwgaGVhcnRiZWF0Q29kZXIsIGhlYXJ0YmVhdEFja0NvZGVyXTtcclxuXHJcbmNsYXNzIERhdGFDb25uZWN0aW9uIGV4dGVuZHMgQ2FzY2FkZUNvbm5lY3Rpb24ge1xyXG4gICAgY29uc3RydWN0b3IodXJsLCBoYW5kc2hha2VKc29uLCBvcHRpb25zID0ge30pIHtcclxuICAgICAgICBjb25zdCB7IHNlY3Rpb24sIHRpbWVvdXQgPSA1MDAwLCBoZWFydGJlYXQgPSAzMDAwMCB9ID0gb3B0aW9ucztcclxuICAgICAgICBzdXBlcihuZXcgU2VjdGlvbkNvbm5lY3Rpb24oY29kZXJzLCB1cmwsIHNlY3Rpb24pLCB7IG9wZW46IGZhbHNlLCBtZXNzYWdlOiBmYWxzZSB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJlbnQub24oJ21lc3NhZ2UnLCBzZWN0aW9ucyA9PiBzZWN0aW9ucy5mb3JFYWNoKHRoaXMucHJvY2Vzc1NlY3Rpb24uYmluZCh0aGlzKSkpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBMaWZlY3ljbGUoaGFuZHNoYWtlSnNvbiwgdGltZW91dCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cEhlYXJ0YmVhdChoZWFydGJlYXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldHVwTGlmZWN5Y2xlKGhhbmRzaGFrZUpzb24sIHRpbWVvdXQpIHtcclxuICAgICAgICB0aGlzLnBhcmVudC5vbignb3BlbicsICgpID0+IHtcclxuICAgICAgICAgICAgbG9nKCdTZW5kaW5nIGhhbmRzaGFrZS4uLicpO1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kKFtuZXcgU2VjdGlvbihoYW5kc2hha2VDb2RlciwgaGFuZHNoYWtlSnNvbildKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUgPT09ICdvcGVuaW5nJykge1xyXG4gICAgICAgICAgICAgICAgbG9nKCdIYW5kc2hha2UgdGltZWQgb3V0LCBjbG9zaW5nIGNvbm5lY3Rpb24uLi4nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMub25DbG9zZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdGltZW91dCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0dXBIZWFydGJlYXQoaW50ZXJ2YWwpIHtcclxuICAgICAgICBsZXQgaGVhcnRiZWF0O1xyXG4gICAgICAgIGNvbnN0IHNlbmRIZWFydGJlYXQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxvZygnU2VuZGluZyBoZWFydGJlYXQuLi4nKTtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZChbbmV3IFNlY3Rpb24oaGVhcnRiZWF0Q29kZXIsICdbb2JqZWN0IE9iamVjdF0nKV0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5vbignb3BlbicsICgpID0+IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBzZW5kSGVhcnRiZWF0KCk7XHJcbiAgICAgICAgICAgIGhlYXJ0YmVhdCA9IHNldEludGVydmFsKHNlbmRIZWFydGJlYXQsIGludGVydmFsKTtcclxuICAgICAgICB9LCAxMDAwKSk7XHJcbiAgICAgICAgdGhpcy5vbignY2xvc2UnLCAoKSA9PiBjbGVhckludGVydmFsKGhlYXJ0YmVhdCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb2Nlc3NTZWN0aW9uKHNlY3Rpb24pIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcclxuICAgICAgICBjYXNlICdvcGVuaW5nJzpcclxuICAgICAgICAgICAgaWYgKGhhbmRzaGFrZUFja0NvZGVyLmhhc0NvbnN0cnVjdGVkKHNlY3Rpb24pKSB7XHJcbiAgICAgICAgICAgICAgICBsb2coJ0hhbmRzaGFrZSBBQ0sgcmVjZWl2ZWQsIGhhbmRzaGFrZSBzdWNjZXNzZnVsLicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbk9wZW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhazsgLy8gaWdub3JlIG90aGVyIHNlY3Rpb25zXHJcbiAgICAgICAgY2FzZSAnb3BlbmVkJzpcclxuICAgICAgICAgICAgaWYgKGRhdGFDb2Rlci5oYXNDb25zdHJ1Y3RlZChzZWN0aW9uKSkgdGhpcy5vbk1lc3NhZ2Uoc2VjdGlvbi5kYXRhKTtcclxuICAgICAgICAgICAgaWYgKGhlYXJ0YmVhdEFja0NvZGVyLmhhc0NvbnN0cnVjdGVkKHNlY3Rpb24pKSBsb2coJ0hlYXJ0YmVhdCBBQ0sgcmVjZWl2ZWQuJyk7XHJcbiAgICAgICAgICAgIGJyZWFrOyAvLyBpZ25vcmUgb3RoZXIgc2VjdGlvbnNcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0cmFuc2Zvcm0oanNvbikgeyByZXR1cm4gW25ldyBTZWN0aW9uKGRhdGFDb2RlciwganNvbildOyB9IC8vIFNlY3Rpb25Db25uZWN0aW9uIHNlbmRzIFNlY3Rpb25bXVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFDb25uZWN0aW9uO1xyXG4iXX0=