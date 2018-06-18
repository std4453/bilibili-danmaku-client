"use strict";

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var _require = require('lodash'),
    defaultsDeep = _require.defaultsDeep;

var log = require('debug')('bilibili-danmaku-client/ApplicationConnection');

var _require2 = require('../connection'),
    CascadeConnection = _require2.CascadeConnection;

var DataConnection = require('../transport');

var _require3 = require('./definitions'),
    registry = _require3.registry;

var url = 'wss://broadcastlv.chat.bilibili.com:2245/sub';

var getHandshake = function getHandshake(room) {
  return {
    protoVer: 1,
    platform: 'web',
    clientVer: '1.4.3',
    uid: 0,
    roomid: room
  };
};

var defaultOptions = {
  section: {
    options: {
      rejectUnauthorized: false
    }
  }
};

var ApplicationConnection =
/*#__PURE__*/
function (_CascadeConnection) {
  _inheritsLoose(ApplicationConnection, _CascadeConnection);

  function ApplicationConnection(room, options) {
    var _this;

    if (options === void 0) {
      options = {};
    }

    _this = _CascadeConnection.call(this, new DataConnection(url, getHandshake(room), defaultsDeep(options, defaultOptions))) || this;

    _this.on('open', function () {
      return log("Connection opened: room=" + room + ".");
    });

    _this.on('close', function () {
      return log('Connection closed.');
    });

    return _this;
  } // eslint-disable-next-line no-unused-vars


  var _proto = ApplicationConnection.prototype;

  _proto.transform = function transform(event) {
    throw new Error('Event -> JSON not supported!');
  };

  _proto.detransform = function detransform(json) {
    if (!('cmd' in json)) {
      log('Event invalid without \'cmd\' property:');
      log(json);
      return undefined;
    }

    if (json.cmd in registry) {
      try {
        var event = registry[json.cmd].transform(json);
        return event;
      } catch (e) {
        log("Unable to transform event: " + e);
        log(json);
        return undefined;
      }
    } else {
      log('Untransformed event:');
      log(json);
      return undefined;
    }
  };

  return ApplicationConnection;
}(CascadeConnection);

module.exports = ApplicationConnection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcHBsaWNhdGlvbi9BcHBsaWNhdGlvbkNvbm5lY3Rpb24uanMiXSwibmFtZXMiOlsicmVxdWlyZSIsImRlZmF1bHRzRGVlcCIsImxvZyIsIkNhc2NhZGVDb25uZWN0aW9uIiwiRGF0YUNvbm5lY3Rpb24iLCJyZWdpc3RyeSIsInVybCIsImdldEhhbmRzaGFrZSIsInByb3RvVmVyIiwicGxhdGZvcm0iLCJjbGllbnRWZXIiLCJ1aWQiLCJyb29taWQiLCJyb29tIiwiZGVmYXVsdE9wdGlvbnMiLCJzZWN0aW9uIiwib3B0aW9ucyIsInJlamVjdFVuYXV0aG9yaXplZCIsIkFwcGxpY2F0aW9uQ29ubmVjdGlvbiIsIm9uIiwidHJhbnNmb3JtIiwiZXZlbnQiLCJFcnJvciIsImRldHJhbnNmb3JtIiwianNvbiIsInVuZGVmaW5lZCIsImNtZCIsImUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7O2VBQXlCQSxRQUFRLFFBQVIsQztJQUFqQkMsWSxZQUFBQSxZOztBQUNSLElBQU1DLE1BQU1GLFFBQVEsT0FBUixFQUFpQiwrQ0FBakIsQ0FBWjs7Z0JBRThCQSxRQUFRLGVBQVIsQztJQUF0QkcsaUIsYUFBQUEsaUI7O0FBQ1IsSUFBTUMsaUJBQWlCSixRQUFRLGNBQVIsQ0FBdkI7O2dCQUNxQkEsUUFBUSxlQUFSLEM7SUFBYkssUSxhQUFBQSxROztBQUVSLElBQU1DLE1BQU0sOENBQVo7O0FBQ0EsSUFBTUMsZUFBZSxTQUFmQSxZQUFlO0FBQUEsU0FBUztBQUMxQkMsY0FBVSxDQURnQjtBQUUxQkMsY0FBVSxLQUZnQjtBQUcxQkMsZUFBVyxPQUhlO0FBSTFCQyxTQUFLLENBSnFCO0FBSzFCQyxZQUFRQztBQUxrQixHQUFUO0FBQUEsQ0FBckI7O0FBT0EsSUFBTUMsaUJBQWlCO0FBQUVDLFdBQVM7QUFBRUMsYUFBUztBQUFFQywwQkFBb0I7QUFBdEI7QUFBWDtBQUFYLENBQXZCOztJQUVNQyxxQjs7Ozs7QUFDRixpQ0FBWUwsSUFBWixFQUFrQkcsT0FBbEIsRUFBZ0M7QUFBQTs7QUFBQSxRQUFkQSxPQUFjO0FBQWRBLGFBQWMsR0FBSixFQUFJO0FBQUE7O0FBQzVCLDBDQUFNLElBQUlaLGNBQUosQ0FBbUJFLEdBQW5CLEVBQXdCQyxhQUFhTSxJQUFiLENBQXhCLEVBQTRDWixhQUFhZSxPQUFiLEVBQXNCRixjQUF0QixDQUE1QyxDQUFOOztBQUNBLFVBQUtLLEVBQUwsQ0FBUSxNQUFSLEVBQWdCO0FBQUEsYUFBTWpCLGlDQUErQlcsSUFBL0IsT0FBTjtBQUFBLEtBQWhCOztBQUNBLFVBQUtNLEVBQUwsQ0FBUSxPQUFSLEVBQWlCO0FBQUEsYUFBTWpCLElBQUksb0JBQUosQ0FBTjtBQUFBLEtBQWpCOztBQUg0QjtBQUkvQixHLENBRUQ7Ozs7O1NBQ0FrQixTLHNCQUFVQyxLLEVBQU87QUFBRSxVQUFNLElBQUlDLEtBQUosQ0FBVSw4QkFBVixDQUFOO0FBQWtELEc7O1NBQ3JFQyxXLHdCQUFZQyxJLEVBQU07QUFDZCxRQUFJLEVBQUUsU0FBU0EsSUFBWCxDQUFKLEVBQXNCO0FBQ2xCdEIsVUFBSSx5Q0FBSjtBQUNBQSxVQUFJc0IsSUFBSjtBQUNBLGFBQU9DLFNBQVA7QUFDSDs7QUFDRCxRQUFJRCxLQUFLRSxHQUFMLElBQVlyQixRQUFoQixFQUEwQjtBQUN0QixVQUFJO0FBQ0EsWUFBTWdCLFFBQVFoQixTQUFTbUIsS0FBS0UsR0FBZCxFQUFtQk4sU0FBbkIsQ0FBNkJJLElBQTdCLENBQWQ7QUFDQSxlQUFPSCxLQUFQO0FBQ0gsT0FIRCxDQUdFLE9BQU9NLENBQVAsRUFBVTtBQUNSekIsNENBQWtDeUIsQ0FBbEM7QUFDQXpCLFlBQUlzQixJQUFKO0FBQ0EsZUFBT0MsU0FBUDtBQUNIO0FBQ0osS0FURCxNQVNPO0FBQ0h2QixVQUFJLHNCQUFKO0FBQ0FBLFVBQUlzQixJQUFKO0FBQ0EsYUFBT0MsU0FBUDtBQUNIO0FBQ0osRzs7O0VBN0IrQnRCLGlCOztBQWdDcEN5QixPQUFPQyxPQUFQLEdBQWlCWCxxQkFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7IGRlZmF1bHRzRGVlcCB9ID0gcmVxdWlyZSgnbG9kYXNoJyk7XHJcbmNvbnN0IGxvZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2JpbGliaWxpLWRhbm1ha3UtY2xpZW50L0FwcGxpY2F0aW9uQ29ubmVjdGlvbicpO1xyXG5cclxuY29uc3QgeyBDYXNjYWRlQ29ubmVjdGlvbiB9ID0gcmVxdWlyZSgnLi4vY29ubmVjdGlvbicpO1xyXG5jb25zdCBEYXRhQ29ubmVjdGlvbiA9IHJlcXVpcmUoJy4uL3RyYW5zcG9ydCcpO1xyXG5jb25zdCB7IHJlZ2lzdHJ5IH0gPSByZXF1aXJlKCcuL2RlZmluaXRpb25zJyk7XHJcblxyXG5jb25zdCB1cmwgPSAnd3NzOi8vYnJvYWRjYXN0bHYuY2hhdC5iaWxpYmlsaS5jb206MjI0NS9zdWInO1xyXG5jb25zdCBnZXRIYW5kc2hha2UgPSByb29tID0+ICh7XHJcbiAgICBwcm90b1ZlcjogMSxcclxuICAgIHBsYXRmb3JtOiAnd2ViJyxcclxuICAgIGNsaWVudFZlcjogJzEuNC4zJyxcclxuICAgIHVpZDogMCxcclxuICAgIHJvb21pZDogcm9vbSxcclxufSk7XHJcbmNvbnN0IGRlZmF1bHRPcHRpb25zID0geyBzZWN0aW9uOiB7IG9wdGlvbnM6IHsgcmVqZWN0VW5hdXRob3JpemVkOiBmYWxzZSB9IH0gfTtcclxuXHJcbmNsYXNzIEFwcGxpY2F0aW9uQ29ubmVjdGlvbiBleHRlbmRzIENhc2NhZGVDb25uZWN0aW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKHJvb20sIG9wdGlvbnMgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKG5ldyBEYXRhQ29ubmVjdGlvbih1cmwsIGdldEhhbmRzaGFrZShyb29tKSwgZGVmYXVsdHNEZWVwKG9wdGlvbnMsIGRlZmF1bHRPcHRpb25zKSkpO1xyXG4gICAgICAgIHRoaXMub24oJ29wZW4nLCAoKSA9PiBsb2coYENvbm5lY3Rpb24gb3BlbmVkOiByb29tPSR7cm9vbX0uYCkpO1xyXG4gICAgICAgIHRoaXMub24oJ2Nsb3NlJywgKCkgPT4gbG9nKCdDb25uZWN0aW9uIGNsb3NlZC4nKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXHJcbiAgICB0cmFuc2Zvcm0oZXZlbnQpIHsgdGhyb3cgbmV3IEVycm9yKCdFdmVudCAtPiBKU09OIG5vdCBzdXBwb3J0ZWQhJyk7IH1cclxuICAgIGRldHJhbnNmb3JtKGpzb24pIHtcclxuICAgICAgICBpZiAoISgnY21kJyBpbiBqc29uKSkge1xyXG4gICAgICAgICAgICBsb2coJ0V2ZW50IGludmFsaWQgd2l0aG91dCBcXCdjbWRcXCcgcHJvcGVydHk6Jyk7XHJcbiAgICAgICAgICAgIGxvZyhqc29uKTtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGpzb24uY21kIGluIHJlZ2lzdHJ5KSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IHJlZ2lzdHJ5W2pzb24uY21kXS50cmFuc2Zvcm0oanNvbik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXZlbnQ7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGxvZyhgVW5hYmxlIHRvIHRyYW5zZm9ybSBldmVudDogJHtlfWApO1xyXG4gICAgICAgICAgICAgICAgbG9nKGpzb24pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxvZygnVW50cmFuc2Zvcm1lZCBldmVudDonKTtcclxuICAgICAgICAgICAgbG9nKGpzb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvbkNvbm5lY3Rpb247XHJcbiJdfQ==