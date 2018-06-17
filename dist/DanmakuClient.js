"use strict";

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var EventEmitter = require('events');

var ApplicationConnection = require('./application');

var DanmakuClient =
/*#__PURE__*/
function (_EventEmitter) {
  _inheritsLoose(DanmakuClient, _EventEmitter);

  function DanmakuClient(room, options) {
    var _this;

    _this = _EventEmitter.call(this) || this;
    _this.room = room;
    _this.options = options;
    _this.state = 'idle';
    return _this;
  }

  var _proto = DanmakuClient.prototype;

  _proto.start = function start() {
    var _this2 = this;

    this.connection = new ApplicationConnection(this.room, this.options);
    this.state = 'opening';
    this.connection.on('open', function () {
      _this2.state = 'opened';

      _this2.emit('open');
    });
    this.connection.on('error', function (err) {
      return _this2.emit('error', err);
    });
    this.connection.on('close', function () {
      _this2.state = 'closed';

      _this2.emit('close');
    });
    this.connection.on('message', function (event) {
      return _this2.emit('event', event);
    });
  };

  _proto.terminate = function terminate() {
    if (this.state !== 'idle') this.connection.close();
  };

  return DanmakuClient;
}(EventEmitter);

module.exports = DanmakuClient;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9EYW5tYWt1Q2xpZW50LmpzIl0sIm5hbWVzIjpbIkV2ZW50RW1pdHRlciIsInJlcXVpcmUiLCJBcHBsaWNhdGlvbkNvbm5lY3Rpb24iLCJEYW5tYWt1Q2xpZW50Iiwicm9vbSIsIm9wdGlvbnMiLCJzdGF0ZSIsInN0YXJ0IiwiY29ubmVjdGlvbiIsIm9uIiwiZW1pdCIsImVyciIsImV2ZW50IiwidGVybWluYXRlIiwiY2xvc2UiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUEsSUFBTUEsZUFBZUMsUUFBUSxRQUFSLENBQXJCOztBQUVBLElBQU1DLHdCQUF3QkQsUUFBUSxlQUFSLENBQTlCOztJQUVNRSxhOzs7OztBQUNGLHlCQUFZQyxJQUFaLEVBQWtCQyxPQUFsQixFQUEyQjtBQUFBOztBQUN2QjtBQUVBLFVBQUtELElBQUwsR0FBWUEsSUFBWjtBQUNBLFVBQUtDLE9BQUwsR0FBZUEsT0FBZjtBQUNBLFVBQUtDLEtBQUwsR0FBYSxNQUFiO0FBTHVCO0FBTTFCOzs7O1NBRURDLEssb0JBQVE7QUFBQTs7QUFDSixTQUFLQyxVQUFMLEdBQWtCLElBQUlOLHFCQUFKLENBQTBCLEtBQUtFLElBQS9CLEVBQXFDLEtBQUtDLE9BQTFDLENBQWxCO0FBQ0EsU0FBS0MsS0FBTCxHQUFhLFNBQWI7QUFDQSxTQUFLRSxVQUFMLENBQWdCQyxFQUFoQixDQUFtQixNQUFuQixFQUEyQixZQUFNO0FBQzdCLGFBQUtILEtBQUwsR0FBYSxRQUFiOztBQUNBLGFBQUtJLElBQUwsQ0FBVSxNQUFWO0FBQ0gsS0FIRDtBQUlBLFNBQUtGLFVBQUwsQ0FBZ0JDLEVBQWhCLENBQW1CLE9BQW5CLEVBQTRCO0FBQUEsYUFBTyxPQUFLQyxJQUFMLENBQVUsT0FBVixFQUFtQkMsR0FBbkIsQ0FBUDtBQUFBLEtBQTVCO0FBQ0EsU0FBS0gsVUFBTCxDQUFnQkMsRUFBaEIsQ0FBbUIsT0FBbkIsRUFBNEIsWUFBTTtBQUM5QixhQUFLSCxLQUFMLEdBQWEsUUFBYjs7QUFDQSxhQUFLSSxJQUFMLENBQVUsT0FBVjtBQUNILEtBSEQ7QUFJQSxTQUFLRixVQUFMLENBQWdCQyxFQUFoQixDQUFtQixTQUFuQixFQUE4QjtBQUFBLGFBQVMsT0FBS0MsSUFBTCxDQUFVLE9BQVYsRUFBbUJFLEtBQW5CLENBQVQ7QUFBQSxLQUE5QjtBQUNILEc7O1NBRURDLFMsd0JBQVk7QUFDUixRQUFJLEtBQUtQLEtBQUwsS0FBZSxNQUFuQixFQUEyQixLQUFLRSxVQUFMLENBQWdCTSxLQUFoQjtBQUM5QixHOzs7RUExQnVCZCxZOztBQTZCNUJlLE9BQU9DLE9BQVAsR0FBaUJiLGFBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJyk7XHJcblxyXG5jb25zdCBBcHBsaWNhdGlvbkNvbm5lY3Rpb24gPSByZXF1aXJlKCcuL2FwcGxpY2F0aW9uJyk7XHJcblxyXG5jbGFzcyBEYW5tYWt1Q2xpZW50IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHJvb20sIG9wdGlvbnMpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLnJvb20gPSByb29tO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdpZGxlJztcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmNvbm5lY3Rpb24gPSBuZXcgQXBwbGljYXRpb25Db25uZWN0aW9uKHRoaXMucm9vbSwgdGhpcy5vcHRpb25zKTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gJ29wZW5pbmcnO1xyXG4gICAgICAgIHRoaXMuY29ubmVjdGlvbi5vbignb3BlbicsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICdvcGVuZWQnO1xyXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ29wZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmNvbm5lY3Rpb24ub24oJ2Vycm9yJywgZXJyID0+IHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpKTtcclxuICAgICAgICB0aGlzLmNvbm5lY3Rpb24ub24oJ2Nsb3NlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gJ2Nsb3NlZCc7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnY2xvc2UnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmNvbm5lY3Rpb24ub24oJ21lc3NhZ2UnLCBldmVudCA9PiB0aGlzLmVtaXQoJ2V2ZW50JywgZXZlbnQpKTtcclxuICAgIH1cclxuXHJcbiAgICB0ZXJtaW5hdGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgIT09ICdpZGxlJykgdGhpcy5jb25uZWN0aW9uLmNsb3NlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGFubWFrdUNsaWVudDtcclxuIl19