"use strict";

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.object.assign");

/**
 * The middlewares module.
 * This module contain the class definition of Middleware and implementations of most
 * middlewares used by DanmakuClient. Up till now, only the middleware that manages
 * the lifecycle of DanmakuClient isn't included in middlewares.js, which has good
 * reasons to do so. For more information, see documentation of manageLifecycle in
 * DanmakuClient.js.
 *
 * When writing new Middlewares, it is recommended that implementations only take
 * advantage of the following knowledge to avoid breaking functionalities
 * accidentally:
 * 1. DanmakuClient extends EventEmitter, and 'terminating' is a reserved event name.
 * 2. config() of middleware takes a SectorSocket, a merged conf object, and a
 *    DanmakuClient instance as arguments.
 * 3. Raw conf objects are merged with the default conf object using lodash.defaultsDeep().
 *
 * @module biliDanmakuClient/middlewares
 */
var _require = require('lodash'),
    defaultsDeep = _require.defaultsDeep,
    fromPairs = _require.fromPairs;

var log = require('debug')('bilibili-danmaku-client/middlewares');

var _require2 = require('./sectors'),
    InitSector = _require2.InitSector,
    InitAckSector = _require2.InitAckSector,
    HeartbeatSector = _require2.HeartbeatSector,
    DataSector = _require2.DataSector;

var _require3 = require('./transformers'),
    all = _require3.all;
/**
 * Middleware are used to config the SectorSocket and the DanmakuClient instance.
 * Middleware instances can be reused arbitrary times, across different SectorSocket
 * and DanmakuClient instances.
 */


var Middleware =
/*#__PURE__*/
function () {
  /**
   * Constructs the Middleware instance.
   * Different middlewares do not create new classes. Instead, middlewares are merely
   * a config function and a default conf object, and using the constructor of
   * Middleware to create instances. The Middleware class is to enable the
   * middleware.config() pattern and add conf merging ability.
   *
   * @param {Function} config The config function.
   * @param {*} defaultConf The default conf object, optional.
   * @see #config
   */
  function Middleware(config, defaultConf) {
    if (defaultConf === void 0) {
      defaultConf = {};
    }

    this.configFn = config;
    this.defaultConf = defaultConf;
  }
  /**
   * Config the Middleware with the given parameters.
   * The conf parameter is the raw input without default values, since config()
   * merges it with this.defaultConf and builds the actual conf object and call
   * this.configFn() to run the configuration.
   *
   * There are some attributes that are merged automatically and do not need
   * to be merged by middlewares:
   *     url: The url that the SectorSocket is connecting to.
   *     room: The room that the SectorSocket is watching.
   *     uid: The contextual user id. 0 if not specified.
   *     options: The options object passed into constructor of Websocket, to support
   *              customization of the connection.
   *
   * @param {SectorSocket} ws The SectorSocket instance.
   * @param {*} conf The raw config object.
   * @param {DanmakuClient} client The DanmakuClient instance.
   */


  var _proto = Middleware.prototype;

  _proto.config = function config(ws, conf, client) {
    var merged = defaultsDeep(conf, this.defaultConf);
    this.configFn(ws, merged, client);
  };

  return Middleware;
}();

var sendInitial = new Middleware(function (ws, conf) {
  return ws.on('open', function () {
    ws.send(new InitSector(Object.assign({}, conf.initial, {
      uid: conf.uid,
      roomid: conf.room
    })));
  });
}, {
  initial: {
    protover: 1,
    platform: 'web',
    clientver: '1.4.3'
  }
});
var invokeTransformer = new Middleware(function (ws, conf, client) {
  ws.on('sector', function (sector) {
    if (!(sector instanceof DataSector)) return;
    var msg = sector.data;
    if (!('cmd' in msg)) return;

    if (msg.cmd in conf.transformers) {
      var transformer = conf.transformers[msg.cmd];
      client.emit(transformer.name, transformer.transform(msg));
    } else {
      log('Untransformed data sector:');
      log(msg);
    }
  });
}, {
  transformers: fromPairs(all.map(function (t) {
    return [t.name, t];
  })),
  logUntransformed: true
});
var sendHeartbeat = new Middleware(function (ws, conf) {
  if (!conf.heartbeat.enabled) return;
  var handle = setInterval(function () {
    return ws.send(new HeartbeatSector());
  }, conf.heartbeat.interval);

  var clear = function clear() {
    return clearInterval(handle);
  };

  ws.on('close', clear);
  ws.on('error', clear);
}, {
  heartbeat: {
    enabled: true,
    interval: 30000 // 30s

  }
});
var logLifecycle = new Middleware(function (ws, conf) {
  if (!conf.logging) return;
  log("Connecting to " + conf.url + "...");
  ws.on('open', function () {
    return log('Connection opened, sending initial sector...');
  });
  ws.on('sector', function (sector) {
    if (sector instanceof InitAckSector) {
      log("Init ACK Sector received: room=" + conf.room + ", uid=" + conf.uid + ".");
    }
  });
  ws.on('close', function (code, reason) {
    return log("Connection closed: code=" + code + ", reason=" + reason + ".");
  });
  ws.on('error', function (error) {
    return log("Server error: " + error);
  });
}, {
  logging: true
});
var middlewares = {
  sendInitial: sendInitial,
  invokeTransformer: invokeTransformer,
  sendHeartbeat: sendHeartbeat,
  logLifecycle: logLifecycle
};
module.exports = Object.assign({
  Middleware: Middleware
}, middlewares, {
  all: Object.keys(middlewares).map(function (key) {
    return middlewares[key];
  })
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9taWRkbGV3YXJlcy5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiZGVmYXVsdHNEZWVwIiwiZnJvbVBhaXJzIiwibG9nIiwiSW5pdFNlY3RvciIsIkluaXRBY2tTZWN0b3IiLCJIZWFydGJlYXRTZWN0b3IiLCJEYXRhU2VjdG9yIiwiYWxsIiwiTWlkZGxld2FyZSIsImNvbmZpZyIsImRlZmF1bHRDb25mIiwiY29uZmlnRm4iLCJ3cyIsImNvbmYiLCJjbGllbnQiLCJtZXJnZWQiLCJzZW5kSW5pdGlhbCIsIm9uIiwic2VuZCIsImluaXRpYWwiLCJ1aWQiLCJyb29taWQiLCJyb29tIiwicHJvdG92ZXIiLCJwbGF0Zm9ybSIsImNsaWVudHZlciIsImludm9rZVRyYW5zZm9ybWVyIiwic2VjdG9yIiwibXNnIiwiZGF0YSIsImNtZCIsInRyYW5zZm9ybWVycyIsInRyYW5zZm9ybWVyIiwiZW1pdCIsIm5hbWUiLCJ0cmFuc2Zvcm0iLCJtYXAiLCJ0IiwibG9nVW50cmFuc2Zvcm1lZCIsInNlbmRIZWFydGJlYXQiLCJoZWFydGJlYXQiLCJlbmFibGVkIiwiaGFuZGxlIiwic2V0SW50ZXJ2YWwiLCJpbnRlcnZhbCIsImNsZWFyIiwiY2xlYXJJbnRlcnZhbCIsImxvZ0xpZmVjeWNsZSIsImxvZ2dpbmciLCJ1cmwiLCJjb2RlIiwicmVhc29uIiwiZXJyb3IiLCJtaWRkbGV3YXJlcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJPYmplY3QiLCJrZXlzIiwia2V5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztlQW1Cb0NBLFFBQVEsUUFBUixDO0lBQTVCQyxZLFlBQUFBLFk7SUFBY0MsUyxZQUFBQSxTOztBQUN0QixJQUFNQyxNQUFNSCxRQUFRLE9BQVIsRUFBaUIscUNBQWpCLENBQVo7O2dCQUVtRUEsUUFBUSxXQUFSLEM7SUFBM0RJLFUsYUFBQUEsVTtJQUFZQyxhLGFBQUFBLGE7SUFBZUMsZSxhQUFBQSxlO0lBQWlCQyxVLGFBQUFBLFU7O2dCQUNwQ1AsUUFBUSxnQkFBUixDO0lBQVJRLEcsYUFBQUEsRztBQUVSOzs7Ozs7O0lBS01DLFU7OztBQUNGOzs7Ozs7Ozs7OztBQVdBLHNCQUFZQyxNQUFaLEVBQW9CQyxXQUFwQixFQUFzQztBQUFBLFFBQWxCQSxXQUFrQjtBQUFsQkEsaUJBQWtCLEdBQUosRUFBSTtBQUFBOztBQUNsQyxTQUFLQyxRQUFMLEdBQWdCRixNQUFoQjtBQUNBLFNBQUtDLFdBQUwsR0FBbUJBLFdBQW5CO0FBQ0g7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQWtCQUQsTSxtQkFBT0csRSxFQUFJQyxJLEVBQU1DLE0sRUFBUTtBQUNyQixRQUFNQyxTQUFTZixhQUFhYSxJQUFiLEVBQW1CLEtBQUtILFdBQXhCLENBQWY7QUFDQSxTQUFLQyxRQUFMLENBQWNDLEVBQWQsRUFBa0JHLE1BQWxCLEVBQTBCRCxNQUExQjtBQUNILEc7Ozs7O0FBR0wsSUFBTUUsY0FBYyxJQUFJUixVQUFKLENBQ2hCLFVBQUNJLEVBQUQsRUFBS0MsSUFBTDtBQUFBLFNBQWNELEdBQUdLLEVBQUgsQ0FBTSxNQUFOLEVBQWMsWUFBTTtBQUM5QkwsT0FBR00sSUFBSCxDQUFRLElBQUlmLFVBQUosbUJBQ0RVLEtBQUtNLE9BREo7QUFFSkMsV0FBS1AsS0FBS08sR0FGTjtBQUdKQyxjQUFRUixLQUFLUztBQUhULE9BQVI7QUFLSCxHQU5hLENBQWQ7QUFBQSxDQURnQixFQU9aO0FBQ0FILFdBQVM7QUFDTEksY0FBVSxDQURMO0FBRUxDLGNBQVUsS0FGTDtBQUdMQyxlQUFXO0FBSE47QUFEVCxDQVBZLENBQXBCO0FBZ0JBLElBQU1DLG9CQUFvQixJQUFJbEIsVUFBSixDQUN0QixVQUFDSSxFQUFELEVBQUtDLElBQUwsRUFBV0MsTUFBWCxFQUFzQjtBQUNsQkYsS0FBR0ssRUFBSCxDQUFNLFFBQU4sRUFBZ0IsVUFBQ1UsTUFBRCxFQUFZO0FBQ3hCLFFBQUksRUFBRUEsa0JBQWtCckIsVUFBcEIsQ0FBSixFQUFxQztBQUNyQyxRQUFNc0IsTUFBTUQsT0FBT0UsSUFBbkI7QUFDQSxRQUFJLEVBQUUsU0FBU0QsR0FBWCxDQUFKLEVBQXFCOztBQUNyQixRQUFJQSxJQUFJRSxHQUFKLElBQVdqQixLQUFLa0IsWUFBcEIsRUFBa0M7QUFDOUIsVUFBTUMsY0FBY25CLEtBQUtrQixZQUFMLENBQWtCSCxJQUFJRSxHQUF0QixDQUFwQjtBQUNBaEIsYUFBT21CLElBQVAsQ0FBWUQsWUFBWUUsSUFBeEIsRUFBOEJGLFlBQVlHLFNBQVosQ0FBc0JQLEdBQXRCLENBQTlCO0FBQ0gsS0FIRCxNQUdPO0FBQ0gxQixVQUFJLDRCQUFKO0FBQ0FBLFVBQUkwQixHQUFKO0FBQ0g7QUFDSixHQVhEO0FBWUgsQ0FkcUIsRUFjbkI7QUFDQ0csZ0JBQWM5QixVQUFVTSxJQUFJNkIsR0FBSixDQUFRO0FBQUEsV0FBSyxDQUFDQyxFQUFFSCxJQUFILEVBQVNHLENBQVQsQ0FBTDtBQUFBLEdBQVIsQ0FBVixDQURmO0FBRUNDLG9CQUFrQjtBQUZuQixDQWRtQixDQUExQjtBQW9CQSxJQUFNQyxnQkFBZ0IsSUFBSS9CLFVBQUosQ0FDbEIsVUFBQ0ksRUFBRCxFQUFLQyxJQUFMLEVBQWM7QUFDVixNQUFJLENBQUNBLEtBQUsyQixTQUFMLENBQWVDLE9BQXBCLEVBQTZCO0FBQzdCLE1BQU1DLFNBQVNDLFlBQVk7QUFBQSxXQUFNL0IsR0FBR00sSUFBSCxDQUFRLElBQUliLGVBQUosRUFBUixDQUFOO0FBQUEsR0FBWixFQUFrRFEsS0FBSzJCLFNBQUwsQ0FBZUksUUFBakUsQ0FBZjs7QUFDQSxNQUFNQyxRQUFRLFNBQVJBLEtBQVE7QUFBQSxXQUFNQyxjQUFjSixNQUFkLENBQU47QUFBQSxHQUFkOztBQUNBOUIsS0FBR0ssRUFBSCxDQUFNLE9BQU4sRUFBZTRCLEtBQWY7QUFDQWpDLEtBQUdLLEVBQUgsQ0FBTSxPQUFOLEVBQWU0QixLQUFmO0FBQ0gsQ0FQaUIsRUFPZjtBQUNDTCxhQUFXO0FBQ1BDLGFBQVMsSUFERjtBQUVQRyxjQUFVLEtBRkgsQ0FFVTs7QUFGVjtBQURaLENBUGUsQ0FBdEI7QUFlQSxJQUFNRyxlQUFlLElBQUl2QyxVQUFKLENBQ2pCLFVBQUNJLEVBQUQsRUFBS0MsSUFBTCxFQUFjO0FBQ1YsTUFBSSxDQUFDQSxLQUFLbUMsT0FBVixFQUFtQjtBQUNuQjlDLHlCQUFxQlcsS0FBS29DLEdBQTFCO0FBQ0FyQyxLQUFHSyxFQUFILENBQU0sTUFBTixFQUFjO0FBQUEsV0FBTWYsSUFBSSw4Q0FBSixDQUFOO0FBQUEsR0FBZDtBQUNBVSxLQUFHSyxFQUFILENBQU0sUUFBTixFQUFnQixVQUFDVSxNQUFELEVBQVk7QUFDeEIsUUFBSUEsa0JBQWtCdkIsYUFBdEIsRUFBcUM7QUFDakNGLDhDQUFzQ1csS0FBS1MsSUFBM0MsY0FBd0RULEtBQUtPLEdBQTdEO0FBQ0g7QUFDSixHQUpEO0FBS0FSLEtBQUdLLEVBQUgsQ0FBTSxPQUFOLEVBQWUsVUFBQ2lDLElBQUQsRUFBT0MsTUFBUDtBQUFBLFdBQWtCakQsaUNBQStCZ0QsSUFBL0IsaUJBQStDQyxNQUEvQyxPQUFsQjtBQUFBLEdBQWY7QUFDQXZDLEtBQUdLLEVBQUgsQ0FBTSxPQUFOLEVBQWU7QUFBQSxXQUFTZix1QkFBcUJrRCxLQUFyQixDQUFUO0FBQUEsR0FBZjtBQUNILENBWmdCLEVBWWQ7QUFDQ0osV0FBUztBQURWLENBWmMsQ0FBckI7QUFpQkEsSUFBTUssY0FBYztBQUNoQnJDLDBCQURnQjtBQUVoQlUsc0NBRmdCO0FBR2hCYSw4QkFIZ0I7QUFJaEJRO0FBSmdCLENBQXBCO0FBT0FPLE9BQU9DLE9BQVA7QUFDSS9DO0FBREosR0FFTzZDLFdBRlA7QUFHSTlDLE9BQUtpRCxPQUFPQyxJQUFQLENBQVlKLFdBQVosRUFBeUJqQixHQUF6QixDQUE2QjtBQUFBLFdBQU9pQixZQUFZSyxHQUFaLENBQVA7QUFBQSxHQUE3QjtBQUhUIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIFRoZSBtaWRkbGV3YXJlcyBtb2R1bGUuXHJcbiAqIFRoaXMgbW9kdWxlIGNvbnRhaW4gdGhlIGNsYXNzIGRlZmluaXRpb24gb2YgTWlkZGxld2FyZSBhbmQgaW1wbGVtZW50YXRpb25zIG9mIG1vc3RcclxuICogbWlkZGxld2FyZXMgdXNlZCBieSBEYW5tYWt1Q2xpZW50LiBVcCB0aWxsIG5vdywgb25seSB0aGUgbWlkZGxld2FyZSB0aGF0IG1hbmFnZXNcclxuICogdGhlIGxpZmVjeWNsZSBvZiBEYW5tYWt1Q2xpZW50IGlzbid0IGluY2x1ZGVkIGluIG1pZGRsZXdhcmVzLmpzLCB3aGljaCBoYXMgZ29vZFxyXG4gKiByZWFzb25zIHRvIGRvIHNvLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiwgc2VlIGRvY3VtZW50YXRpb24gb2YgbWFuYWdlTGlmZWN5Y2xlIGluXHJcbiAqIERhbm1ha3VDbGllbnQuanMuXHJcbiAqXHJcbiAqIFdoZW4gd3JpdGluZyBuZXcgTWlkZGxld2FyZXMsIGl0IGlzIHJlY29tbWVuZGVkIHRoYXQgaW1wbGVtZW50YXRpb25zIG9ubHkgdGFrZVxyXG4gKiBhZHZhbnRhZ2Ugb2YgdGhlIGZvbGxvd2luZyBrbm93bGVkZ2UgdG8gYXZvaWQgYnJlYWtpbmcgZnVuY3Rpb25hbGl0aWVzXHJcbiAqIGFjY2lkZW50YWxseTpcclxuICogMS4gRGFubWFrdUNsaWVudCBleHRlbmRzIEV2ZW50RW1pdHRlciwgYW5kICd0ZXJtaW5hdGluZycgaXMgYSByZXNlcnZlZCBldmVudCBuYW1lLlxyXG4gKiAyLiBjb25maWcoKSBvZiBtaWRkbGV3YXJlIHRha2VzIGEgU2VjdG9yU29ja2V0LCBhIG1lcmdlZCBjb25mIG9iamVjdCwgYW5kIGFcclxuICogICAgRGFubWFrdUNsaWVudCBpbnN0YW5jZSBhcyBhcmd1bWVudHMuXHJcbiAqIDMuIFJhdyBjb25mIG9iamVjdHMgYXJlIG1lcmdlZCB3aXRoIHRoZSBkZWZhdWx0IGNvbmYgb2JqZWN0IHVzaW5nIGxvZGFzaC5kZWZhdWx0c0RlZXAoKS5cclxuICpcclxuICogQG1vZHVsZSBiaWxpRGFubWFrdUNsaWVudC9taWRkbGV3YXJlc1xyXG4gKi9cclxuXHJcbmNvbnN0IHsgZGVmYXVsdHNEZWVwLCBmcm9tUGFpcnMgfSA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xyXG5jb25zdCBsb2cgPSByZXF1aXJlKCdkZWJ1ZycpKCdiaWxpYmlsaS1kYW5tYWt1LWNsaWVudC9taWRkbGV3YXJlcycpO1xyXG5cclxuY29uc3QgeyBJbml0U2VjdG9yLCBJbml0QWNrU2VjdG9yLCBIZWFydGJlYXRTZWN0b3IsIERhdGFTZWN0b3IgfSA9IHJlcXVpcmUoJy4vc2VjdG9ycycpO1xyXG5jb25zdCB7IGFsbCB9ID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1lcnMnKTtcclxuXHJcbi8qKlxyXG4gKiBNaWRkbGV3YXJlIGFyZSB1c2VkIHRvIGNvbmZpZyB0aGUgU2VjdG9yU29ja2V0IGFuZCB0aGUgRGFubWFrdUNsaWVudCBpbnN0YW5jZS5cclxuICogTWlkZGxld2FyZSBpbnN0YW5jZXMgY2FuIGJlIHJldXNlZCBhcmJpdHJhcnkgdGltZXMsIGFjcm9zcyBkaWZmZXJlbnQgU2VjdG9yU29ja2V0XHJcbiAqIGFuZCBEYW5tYWt1Q2xpZW50IGluc3RhbmNlcy5cclxuICovXHJcbmNsYXNzIE1pZGRsZXdhcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RzIHRoZSBNaWRkbGV3YXJlIGluc3RhbmNlLlxyXG4gICAgICogRGlmZmVyZW50IG1pZGRsZXdhcmVzIGRvIG5vdCBjcmVhdGUgbmV3IGNsYXNzZXMuIEluc3RlYWQsIG1pZGRsZXdhcmVzIGFyZSBtZXJlbHlcclxuICAgICAqIGEgY29uZmlnIGZ1bmN0aW9uIGFuZCBhIGRlZmF1bHQgY29uZiBvYmplY3QsIGFuZCB1c2luZyB0aGUgY29uc3RydWN0b3Igb2ZcclxuICAgICAqIE1pZGRsZXdhcmUgdG8gY3JlYXRlIGluc3RhbmNlcy4gVGhlIE1pZGRsZXdhcmUgY2xhc3MgaXMgdG8gZW5hYmxlIHRoZVxyXG4gICAgICogbWlkZGxld2FyZS5jb25maWcoKSBwYXR0ZXJuIGFuZCBhZGQgY29uZiBtZXJnaW5nIGFiaWxpdHkuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY29uZmlnIFRoZSBjb25maWcgZnVuY3Rpb24uXHJcbiAgICAgKiBAcGFyYW0geyp9IGRlZmF1bHRDb25mIFRoZSBkZWZhdWx0IGNvbmYgb2JqZWN0LCBvcHRpb25hbC5cclxuICAgICAqIEBzZWUgI2NvbmZpZ1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIGRlZmF1bHRDb25mID0ge30pIHtcclxuICAgICAgICB0aGlzLmNvbmZpZ0ZuID0gY29uZmlnO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdENvbmYgPSBkZWZhdWx0Q29uZjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbmZpZyB0aGUgTWlkZGxld2FyZSB3aXRoIHRoZSBnaXZlbiBwYXJhbWV0ZXJzLlxyXG4gICAgICogVGhlIGNvbmYgcGFyYW1ldGVyIGlzIHRoZSByYXcgaW5wdXQgd2l0aG91dCBkZWZhdWx0IHZhbHVlcywgc2luY2UgY29uZmlnKClcclxuICAgICAqIG1lcmdlcyBpdCB3aXRoIHRoaXMuZGVmYXVsdENvbmYgYW5kIGJ1aWxkcyB0aGUgYWN0dWFsIGNvbmYgb2JqZWN0IGFuZCBjYWxsXHJcbiAgICAgKiB0aGlzLmNvbmZpZ0ZuKCkgdG8gcnVuIHRoZSBjb25maWd1cmF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIFRoZXJlIGFyZSBzb21lIGF0dHJpYnV0ZXMgdGhhdCBhcmUgbWVyZ2VkIGF1dG9tYXRpY2FsbHkgYW5kIGRvIG5vdCBuZWVkXHJcbiAgICAgKiB0byBiZSBtZXJnZWQgYnkgbWlkZGxld2FyZXM6XHJcbiAgICAgKiAgICAgdXJsOiBUaGUgdXJsIHRoYXQgdGhlIFNlY3RvclNvY2tldCBpcyBjb25uZWN0aW5nIHRvLlxyXG4gICAgICogICAgIHJvb206IFRoZSByb29tIHRoYXQgdGhlIFNlY3RvclNvY2tldCBpcyB3YXRjaGluZy5cclxuICAgICAqICAgICB1aWQ6IFRoZSBjb250ZXh0dWFsIHVzZXIgaWQuIDAgaWYgbm90IHNwZWNpZmllZC5cclxuICAgICAqICAgICBvcHRpb25zOiBUaGUgb3B0aW9ucyBvYmplY3QgcGFzc2VkIGludG8gY29uc3RydWN0b3Igb2YgV2Vic29ja2V0LCB0byBzdXBwb3J0XHJcbiAgICAgKiAgICAgICAgICAgICAgY3VzdG9taXphdGlvbiBvZiB0aGUgY29ubmVjdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1NlY3RvclNvY2tldH0gd3MgVGhlIFNlY3RvclNvY2tldCBpbnN0YW5jZS5cclxuICAgICAqIEBwYXJhbSB7Kn0gY29uZiBUaGUgcmF3IGNvbmZpZyBvYmplY3QuXHJcbiAgICAgKiBAcGFyYW0ge0Rhbm1ha3VDbGllbnR9IGNsaWVudCBUaGUgRGFubWFrdUNsaWVudCBpbnN0YW5jZS5cclxuICAgICAqL1xyXG4gICAgY29uZmlnKHdzLCBjb25mLCBjbGllbnQpIHtcclxuICAgICAgICBjb25zdCBtZXJnZWQgPSBkZWZhdWx0c0RlZXAoY29uZiwgdGhpcy5kZWZhdWx0Q29uZik7XHJcbiAgICAgICAgdGhpcy5jb25maWdGbih3cywgbWVyZ2VkLCBjbGllbnQpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBzZW5kSW5pdGlhbCA9IG5ldyBNaWRkbGV3YXJlKFxyXG4gICAgKHdzLCBjb25mKSA9PiB3cy5vbignb3BlbicsICgpID0+IHtcclxuICAgICAgICB3cy5zZW5kKG5ldyBJbml0U2VjdG9yKHtcclxuICAgICAgICAgICAgLi4uY29uZi5pbml0aWFsLFxyXG4gICAgICAgICAgICB1aWQ6IGNvbmYudWlkLFxyXG4gICAgICAgICAgICByb29taWQ6IGNvbmYucm9vbSxcclxuICAgICAgICB9KSk7XHJcbiAgICB9KSwge1xyXG4gICAgICAgIGluaXRpYWw6IHtcclxuICAgICAgICAgICAgcHJvdG92ZXI6IDEsXHJcbiAgICAgICAgICAgIHBsYXRmb3JtOiAnd2ViJyxcclxuICAgICAgICAgICAgY2xpZW50dmVyOiAnMS40LjMnLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4pO1xyXG5cclxuY29uc3QgaW52b2tlVHJhbnNmb3JtZXIgPSBuZXcgTWlkZGxld2FyZShcclxuICAgICh3cywgY29uZiwgY2xpZW50KSA9PiB7XHJcbiAgICAgICAgd3Mub24oJ3NlY3RvcicsIChzZWN0b3IpID0+IHtcclxuICAgICAgICAgICAgaWYgKCEoc2VjdG9yIGluc3RhbmNlb2YgRGF0YVNlY3RvcikpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3QgbXNnID0gc2VjdG9yLmRhdGE7XHJcbiAgICAgICAgICAgIGlmICghKCdjbWQnIGluIG1zZykpIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKG1zZy5jbWQgaW4gY29uZi50cmFuc2Zvcm1lcnMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gY29uZi50cmFuc2Zvcm1lcnNbbXNnLmNtZF07XHJcbiAgICAgICAgICAgICAgICBjbGllbnQuZW1pdCh0cmFuc2Zvcm1lci5uYW1lLCB0cmFuc2Zvcm1lci50cmFuc2Zvcm0obXNnKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsb2coJ1VudHJhbnNmb3JtZWQgZGF0YSBzZWN0b3I6Jyk7XHJcbiAgICAgICAgICAgICAgICBsb2cobXNnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSwge1xyXG4gICAgICAgIHRyYW5zZm9ybWVyczogZnJvbVBhaXJzKGFsbC5tYXAodCA9PiBbdC5uYW1lLCB0XSkpLFxyXG4gICAgICAgIGxvZ1VudHJhbnNmb3JtZWQ6IHRydWUsXHJcbiAgICB9LFxyXG4pO1xyXG5cclxuY29uc3Qgc2VuZEhlYXJ0YmVhdCA9IG5ldyBNaWRkbGV3YXJlKFxyXG4gICAgKHdzLCBjb25mKSA9PiB7XHJcbiAgICAgICAgaWYgKCFjb25mLmhlYXJ0YmVhdC5lbmFibGVkKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgaGFuZGxlID0gc2V0SW50ZXJ2YWwoKCkgPT4gd3Muc2VuZChuZXcgSGVhcnRiZWF0U2VjdG9yKCkpLCBjb25mLmhlYXJ0YmVhdC5pbnRlcnZhbCk7XHJcbiAgICAgICAgY29uc3QgY2xlYXIgPSAoKSA9PiBjbGVhckludGVydmFsKGhhbmRsZSk7XHJcbiAgICAgICAgd3Mub24oJ2Nsb3NlJywgY2xlYXIpO1xyXG4gICAgICAgIHdzLm9uKCdlcnJvcicsIGNsZWFyKTtcclxuICAgIH0sIHtcclxuICAgICAgICBoZWFydGJlYXQ6IHtcclxuICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgaW50ZXJ2YWw6IDMwMDAwLCAvLyAzMHNcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuKTtcclxuXHJcbmNvbnN0IGxvZ0xpZmVjeWNsZSA9IG5ldyBNaWRkbGV3YXJlKFxyXG4gICAgKHdzLCBjb25mKSA9PiB7XHJcbiAgICAgICAgaWYgKCFjb25mLmxvZ2dpbmcpIHJldHVybjtcclxuICAgICAgICBsb2coYENvbm5lY3RpbmcgdG8gJHtjb25mLnVybH0uLi5gKTtcclxuICAgICAgICB3cy5vbignb3BlbicsICgpID0+IGxvZygnQ29ubmVjdGlvbiBvcGVuZWQsIHNlbmRpbmcgaW5pdGlhbCBzZWN0b3IuLi4nKSk7XHJcbiAgICAgICAgd3Mub24oJ3NlY3RvcicsIChzZWN0b3IpID0+IHtcclxuICAgICAgICAgICAgaWYgKHNlY3RvciBpbnN0YW5jZW9mIEluaXRBY2tTZWN0b3IpIHtcclxuICAgICAgICAgICAgICAgIGxvZyhgSW5pdCBBQ0sgU2VjdG9yIHJlY2VpdmVkOiByb29tPSR7Y29uZi5yb29tfSwgdWlkPSR7Y29uZi51aWR9LmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgd3Mub24oJ2Nsb3NlJywgKGNvZGUsIHJlYXNvbikgPT4gbG9nKGBDb25uZWN0aW9uIGNsb3NlZDogY29kZT0ke2NvZGV9LCByZWFzb249JHtyZWFzb259LmApKTtcclxuICAgICAgICB3cy5vbignZXJyb3InLCBlcnJvciA9PiBsb2coYFNlcnZlciBlcnJvcjogJHtlcnJvcn1gKSk7XHJcbiAgICB9LCB7XHJcbiAgICAgICAgbG9nZ2luZzogdHJ1ZSxcclxuICAgIH0sXHJcbik7XHJcblxyXG5jb25zdCBtaWRkbGV3YXJlcyA9IHtcclxuICAgIHNlbmRJbml0aWFsLFxyXG4gICAgaW52b2tlVHJhbnNmb3JtZXIsXHJcbiAgICBzZW5kSGVhcnRiZWF0LFxyXG4gICAgbG9nTGlmZWN5Y2xlLFxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBNaWRkbGV3YXJlLFxyXG4gICAgLi4ubWlkZGxld2FyZXMsXHJcbiAgICBhbGw6IE9iamVjdC5rZXlzKG1pZGRsZXdhcmVzKS5tYXAoa2V5ID0+IG1pZGRsZXdhcmVzW2tleV0pLFxyXG59O1xyXG4iXX0=