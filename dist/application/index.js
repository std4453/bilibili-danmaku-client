"use strict";

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/**
 * This file contains the class definition of ApplicationConnection, which implements
 * the Application Protocol.
 * For more information, see Wiki page 'Application Protocol'.
 */
var _require = require('lodash'),
    defaultsDeep = _require.defaultsDeep;

var log = require('debug')('bilibili-danmaku-client/ApplicationConnection');

var _require2 = require('../util/connection'),
    CascadeConnection = _require2.CascadeConnection;

var DataConnection = require('../transport');

var _require3 = require('./definitions'),
    registry = _require3.registry;

var url = 'wss://broadcastlv.chat.bilibili.com:2245/sub';
/**
 * Return the handshake JSON with the room id.
 * @param {Number} room The room number.
 */

var getHandshake = function getHandshake(room) {
  return {
    protoVer: 1,
    platform: 'web',
    clientVer: '1.4.3',
    uid: 0,
    roomid: room
  };
};
/**
 * Default options. _.defaultsDeep() is used to merge it with given options.
 * rejectUnauthorized is set to true and passed to WebSocket to avoid
 * authentication errors.
 */


var defaultOptions = {
  section: {
    options: {
      rejectUnauthorized: false
    }
  }
};
/**
 * ApplicationConnection implements the Application Protocol.
 * However, this implementation does not 100% conform to the original defitnion.
 * The main difference is:
 * ApplicationConnection uses event 'message' instead of 'event' to notify the
 * arraival of an ApplicationEvent.
 * This is because ApplicationConnection extends BaseConnection. Meanwhile,
 * the 'event' event is defined in DanmakuClient, which is a thin wrap over
 * ApplicationConnection.
 * And since ApplicationConnection only supports the Client side, the Event-to-JSON
 * convertion is not supported.
 */

var ApplicationConnection =
/*#__PURE__*/
function (_CascadeConnection) {
  _inheritsLoose(ApplicationConnection, _CascadeConnection);

  /**
   * Construct a new ApplicationConnection with the given Room id and options.
   * Note that the Room id must be the original Room id, that is, the short Room id
   * is not accepted.
   * For example, one of the official Live Rooms, https://live.bilibili.com/1,
   * uses the original Room id 5440. In this case, trying to connect to Room 1 would
   * not work properly, the correct way is to connect to Room 5440.
   * @param {Number} room The id of the Room to connect to.
   * @param {Object} [options] The options to pass to DataConnection. Merged with defaultOptions.
   */
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
  }

  var _proto = ApplicationConnection.prototype;

  _proto.transform = function transform() {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcHBsaWNhdGlvbi9pbmRleC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiZGVmYXVsdHNEZWVwIiwibG9nIiwiQ2FzY2FkZUNvbm5lY3Rpb24iLCJEYXRhQ29ubmVjdGlvbiIsInJlZ2lzdHJ5IiwidXJsIiwiZ2V0SGFuZHNoYWtlIiwicHJvdG9WZXIiLCJwbGF0Zm9ybSIsImNsaWVudFZlciIsInVpZCIsInJvb21pZCIsInJvb20iLCJkZWZhdWx0T3B0aW9ucyIsInNlY3Rpb24iLCJvcHRpb25zIiwicmVqZWN0VW5hdXRob3JpemVkIiwiQXBwbGljYXRpb25Db25uZWN0aW9uIiwib24iLCJ0cmFuc2Zvcm0iLCJFcnJvciIsImRldHJhbnNmb3JtIiwianNvbiIsInVuZGVmaW5lZCIsImNtZCIsImV2ZW50IiwiZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7Ozs7ZUFNeUJBLFFBQVEsUUFBUixDO0lBQWpCQyxZLFlBQUFBLFk7O0FBQ1IsSUFBTUMsTUFBTUYsUUFBUSxPQUFSLEVBQWlCLCtDQUFqQixDQUFaOztnQkFFOEJBLFFBQVEsb0JBQVIsQztJQUF0QkcsaUIsYUFBQUEsaUI7O0FBQ1IsSUFBTUMsaUJBQWlCSixRQUFRLGNBQVIsQ0FBdkI7O2dCQUNxQkEsUUFBUSxlQUFSLEM7SUFBYkssUSxhQUFBQSxROztBQUVSLElBQU1DLE1BQU0sOENBQVo7QUFDQTs7Ozs7QUFJQSxJQUFNQyxlQUFlLFNBQWZBLFlBQWU7QUFBQSxTQUFTO0FBQzFCQyxjQUFVLENBRGdCO0FBRTFCQyxjQUFVLEtBRmdCO0FBRzFCQyxlQUFXLE9BSGU7QUFJMUJDLFNBQUssQ0FKcUI7QUFLMUJDLFlBQVFDO0FBTGtCLEdBQVQ7QUFBQSxDQUFyQjtBQU9BOzs7Ozs7O0FBS0EsSUFBTUMsaUJBQWlCO0FBQUVDLFdBQVM7QUFBRUMsYUFBUztBQUFFQywwQkFBb0I7QUFBdEI7QUFBWDtBQUFYLENBQXZCO0FBRUE7Ozs7Ozs7Ozs7Ozs7SUFZTUMscUI7Ozs7O0FBQ0Y7Ozs7Ozs7Ozs7QUFVQSxpQ0FBWUwsSUFBWixFQUFrQkcsT0FBbEIsRUFBZ0M7QUFBQTs7QUFBQSxRQUFkQSxPQUFjO0FBQWRBLGFBQWMsR0FBSixFQUFJO0FBQUE7O0FBQzVCLDBDQUFNLElBQUlaLGNBQUosQ0FBbUJFLEdBQW5CLEVBQXdCQyxhQUFhTSxJQUFiLENBQXhCLEVBQTRDWixhQUFhZSxPQUFiLEVBQXNCRixjQUF0QixDQUE1QyxDQUFOOztBQUNBLFVBQUtLLEVBQUwsQ0FBUSxNQUFSLEVBQWdCO0FBQUEsYUFBTWpCLGlDQUErQlcsSUFBL0IsT0FBTjtBQUFBLEtBQWhCOztBQUNBLFVBQUtNLEVBQUwsQ0FBUSxPQUFSLEVBQWlCO0FBQUEsYUFBTWpCLElBQUksb0JBQUosQ0FBTjtBQUFBLEtBQWpCOztBQUg0QjtBQUkvQjs7OztTQUVEa0IsUyx3QkFBWTtBQUFFLFVBQU0sSUFBSUMsS0FBSixDQUFVLDhCQUFWLENBQU47QUFBa0QsRzs7U0FDaEVDLFcsd0JBQVlDLEksRUFBTTtBQUNkLFFBQUksRUFBRSxTQUFTQSxJQUFYLENBQUosRUFBc0I7QUFDbEJyQixVQUFJLHlDQUFKO0FBQ0FBLFVBQUlxQixJQUFKO0FBQ0EsYUFBT0MsU0FBUDtBQUNIOztBQUNELFFBQUlELEtBQUtFLEdBQUwsSUFBWXBCLFFBQWhCLEVBQTBCO0FBQ3RCLFVBQUk7QUFDQSxZQUFNcUIsUUFBUXJCLFNBQVNrQixLQUFLRSxHQUFkLEVBQW1CTCxTQUFuQixDQUE2QkcsSUFBN0IsQ0FBZDtBQUNBLGVBQU9HLEtBQVA7QUFDSCxPQUhELENBR0UsT0FBT0MsQ0FBUCxFQUFVO0FBQ1J6Qiw0Q0FBa0N5QixDQUFsQztBQUNBekIsWUFBSXFCLElBQUo7QUFDQSxlQUFPQyxTQUFQO0FBQ0g7QUFDSixLQVRELE1BU087QUFDSHRCLFVBQUksc0JBQUo7QUFDQUEsVUFBSXFCLElBQUo7QUFDQSxhQUFPQyxTQUFQO0FBQ0g7QUFDSixHOzs7RUF0QytCckIsaUI7O0FBeUNwQ3lCLE9BQU9DLE9BQVAsR0FBaUJYLHFCQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUaGlzIGZpbGUgY29udGFpbnMgdGhlIGNsYXNzIGRlZmluaXRpb24gb2YgQXBwbGljYXRpb25Db25uZWN0aW9uLCB3aGljaCBpbXBsZW1lbnRzXHJcbiAqIHRoZSBBcHBsaWNhdGlvbiBQcm90b2NvbC5cclxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24sIHNlZSBXaWtpIHBhZ2UgJ0FwcGxpY2F0aW9uIFByb3RvY29sJy5cclxuICovXHJcblxyXG5jb25zdCB7IGRlZmF1bHRzRGVlcCB9ID0gcmVxdWlyZSgnbG9kYXNoJyk7XHJcbmNvbnN0IGxvZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2JpbGliaWxpLWRhbm1ha3UtY2xpZW50L0FwcGxpY2F0aW9uQ29ubmVjdGlvbicpO1xyXG5cclxuY29uc3QgeyBDYXNjYWRlQ29ubmVjdGlvbiB9ID0gcmVxdWlyZSgnLi4vdXRpbC9jb25uZWN0aW9uJyk7XHJcbmNvbnN0IERhdGFDb25uZWN0aW9uID0gcmVxdWlyZSgnLi4vdHJhbnNwb3J0Jyk7XHJcbmNvbnN0IHsgcmVnaXN0cnkgfSA9IHJlcXVpcmUoJy4vZGVmaW5pdGlvbnMnKTtcclxuXHJcbmNvbnN0IHVybCA9ICd3c3M6Ly9icm9hZGNhc3Rsdi5jaGF0LmJpbGliaWxpLmNvbToyMjQ1L3N1Yic7XHJcbi8qKlxyXG4gKiBSZXR1cm4gdGhlIGhhbmRzaGFrZSBKU09OIHdpdGggdGhlIHJvb20gaWQuXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByb29tIFRoZSByb29tIG51bWJlci5cclxuICovXHJcbmNvbnN0IGdldEhhbmRzaGFrZSA9IHJvb20gPT4gKHtcclxuICAgIHByb3RvVmVyOiAxLFxyXG4gICAgcGxhdGZvcm06ICd3ZWInLFxyXG4gICAgY2xpZW50VmVyOiAnMS40LjMnLFxyXG4gICAgdWlkOiAwLFxyXG4gICAgcm9vbWlkOiByb29tLFxyXG59KTtcclxuLyoqXHJcbiAqIERlZmF1bHQgb3B0aW9ucy4gXy5kZWZhdWx0c0RlZXAoKSBpcyB1c2VkIHRvIG1lcmdlIGl0IHdpdGggZ2l2ZW4gb3B0aW9ucy5cclxuICogcmVqZWN0VW5hdXRob3JpemVkIGlzIHNldCB0byB0cnVlIGFuZCBwYXNzZWQgdG8gV2ViU29ja2V0IHRvIGF2b2lkXHJcbiAqIGF1dGhlbnRpY2F0aW9uIGVycm9ycy5cclxuICovXHJcbmNvbnN0IGRlZmF1bHRPcHRpb25zID0geyBzZWN0aW9uOiB7IG9wdGlvbnM6IHsgcmVqZWN0VW5hdXRob3JpemVkOiBmYWxzZSB9IH0gfTtcclxuXHJcbi8qKlxyXG4gKiBBcHBsaWNhdGlvbkNvbm5lY3Rpb24gaW1wbGVtZW50cyB0aGUgQXBwbGljYXRpb24gUHJvdG9jb2wuXHJcbiAqIEhvd2V2ZXIsIHRoaXMgaW1wbGVtZW50YXRpb24gZG9lcyBub3QgMTAwJSBjb25mb3JtIHRvIHRoZSBvcmlnaW5hbCBkZWZpdG5pb24uXHJcbiAqIFRoZSBtYWluIGRpZmZlcmVuY2UgaXM6XHJcbiAqIEFwcGxpY2F0aW9uQ29ubmVjdGlvbiB1c2VzIGV2ZW50ICdtZXNzYWdlJyBpbnN0ZWFkIG9mICdldmVudCcgdG8gbm90aWZ5IHRoZVxyXG4gKiBhcnJhaXZhbCBvZiBhbiBBcHBsaWNhdGlvbkV2ZW50LlxyXG4gKiBUaGlzIGlzIGJlY2F1c2UgQXBwbGljYXRpb25Db25uZWN0aW9uIGV4dGVuZHMgQmFzZUNvbm5lY3Rpb24uIE1lYW53aGlsZSxcclxuICogdGhlICdldmVudCcgZXZlbnQgaXMgZGVmaW5lZCBpbiBEYW5tYWt1Q2xpZW50LCB3aGljaCBpcyBhIHRoaW4gd3JhcCBvdmVyXHJcbiAqIEFwcGxpY2F0aW9uQ29ubmVjdGlvbi5cclxuICogQW5kIHNpbmNlIEFwcGxpY2F0aW9uQ29ubmVjdGlvbiBvbmx5IHN1cHBvcnRzIHRoZSBDbGllbnQgc2lkZSwgdGhlIEV2ZW50LXRvLUpTT05cclxuICogY29udmVydGlvbiBpcyBub3Qgc3VwcG9ydGVkLlxyXG4gKi9cclxuY2xhc3MgQXBwbGljYXRpb25Db25uZWN0aW9uIGV4dGVuZHMgQ2FzY2FkZUNvbm5lY3Rpb24ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgYSBuZXcgQXBwbGljYXRpb25Db25uZWN0aW9uIHdpdGggdGhlIGdpdmVuIFJvb20gaWQgYW5kIG9wdGlvbnMuXHJcbiAgICAgKiBOb3RlIHRoYXQgdGhlIFJvb20gaWQgbXVzdCBiZSB0aGUgb3JpZ2luYWwgUm9vbSBpZCwgdGhhdCBpcywgdGhlIHNob3J0IFJvb20gaWRcclxuICAgICAqIGlzIG5vdCBhY2NlcHRlZC5cclxuICAgICAqIEZvciBleGFtcGxlLCBvbmUgb2YgdGhlIG9mZmljaWFsIExpdmUgUm9vbXMsIGh0dHBzOi8vbGl2ZS5iaWxpYmlsaS5jb20vMSxcclxuICAgICAqIHVzZXMgdGhlIG9yaWdpbmFsIFJvb20gaWQgNTQ0MC4gSW4gdGhpcyBjYXNlLCB0cnlpbmcgdG8gY29ubmVjdCB0byBSb29tIDEgd291bGRcclxuICAgICAqIG5vdCB3b3JrIHByb3Blcmx5LCB0aGUgY29ycmVjdCB3YXkgaXMgdG8gY29ubmVjdCB0byBSb29tIDU0NDAuXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcm9vbSBUaGUgaWQgb2YgdGhlIFJvb20gdG8gY29ubmVjdCB0by5cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gVGhlIG9wdGlvbnMgdG8gcGFzcyB0byBEYXRhQ29ubmVjdGlvbi4gTWVyZ2VkIHdpdGggZGVmYXVsdE9wdGlvbnMuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHJvb20sIG9wdGlvbnMgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKG5ldyBEYXRhQ29ubmVjdGlvbih1cmwsIGdldEhhbmRzaGFrZShyb29tKSwgZGVmYXVsdHNEZWVwKG9wdGlvbnMsIGRlZmF1bHRPcHRpb25zKSkpO1xyXG4gICAgICAgIHRoaXMub24oJ29wZW4nLCAoKSA9PiBsb2coYENvbm5lY3Rpb24gb3BlbmVkOiByb29tPSR7cm9vbX0uYCkpO1xyXG4gICAgICAgIHRoaXMub24oJ2Nsb3NlJywgKCkgPT4gbG9nKCdDb25uZWN0aW9uIGNsb3NlZC4nKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdHJhbnNmb3JtKCkgeyB0aHJvdyBuZXcgRXJyb3IoJ0V2ZW50IC0+IEpTT04gbm90IHN1cHBvcnRlZCEnKTsgfVxyXG4gICAgZGV0cmFuc2Zvcm0oanNvbikge1xyXG4gICAgICAgIGlmICghKCdjbWQnIGluIGpzb24pKSB7XHJcbiAgICAgICAgICAgIGxvZygnRXZlbnQgaW52YWxpZCB3aXRob3V0IFxcJ2NtZFxcJyBwcm9wZXJ0eTonKTtcclxuICAgICAgICAgICAgbG9nKGpzb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoanNvbi5jbWQgaW4gcmVnaXN0cnkpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gcmVnaXN0cnlbanNvbi5jbWRdLnRyYW5zZm9ybShqc29uKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBldmVudDtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgbG9nKGBVbmFibGUgdG8gdHJhbnNmb3JtIGV2ZW50OiAke2V9YCk7XHJcbiAgICAgICAgICAgICAgICBsb2coanNvbik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbG9nKCdVbnRyYW5zZm9ybWVkIGV2ZW50OicpO1xyXG4gICAgICAgICAgICBsb2coanNvbik7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGxpY2F0aW9uQ29ubmVjdGlvbjtcclxuIl19