"use strict";

require("core-js/modules/web.dom.iterable");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var EventEmitter = require('events');

var _require = require('lodash'),
    defaultsDeep = _require.defaultsDeep;

var SectorSocket = require('./SectorSocket');

var _require2 = require('./middlewares'),
    Middleware = _require2.Middleware,
    all = _require2.all; // TODO: Add documentation


var manageLifecycle = new Middleware(function (ws, _, client) {
  client.setState('connecting');
  ws.on('open', function () {
    return client.setState('opened');
  });
  ['close', 'error'].forEach(function (name) {
    return ws.on(name, function () {
      return client.setState('terminated');
    });
  });
  client.once('terminate', function () {
    return ws.terminate();
  });
});
var defaultConf = {
  url: 'wss://broadcastlv.chat.bilibili.com:2245/sub',
  room: 1,
  uid: 0,
  // without a user
  middlewares: all,
  // use all middlwares
  options: {
    rejectUnauthorized: false
  } // avoid unauthorized error

};

var DanmakuClient =
/*#__PURE__*/
function (_EventEmitter) {
  _inheritsLoose(DanmakuClient, _EventEmitter);

  /**
   * Constructs the DanmakuClient instance.
   * After initialization, the state of this DanmakuClient is set to 'idle',
   * applications should call start() to actually start the client.
   *
   * @param {*} conf The conf object.
   */
  function DanmakuClient(conf) {
    var _this;

    _this = _EventEmitter.call(this) || this;
    _this.conf = defaultsDeep(conf, defaultConf);
    _this.state = 'idle';
    return _this;
  }
  /**
   * Build connection to the Danmaku server, configurating all the middlewares.
   * The socket is not saved in the DanmakuClient interface, applications should use
   * middlewares to add functionality.
   * This is an internal method.
   * For details of how this methods works, see documentation of manageLifecycle.
   */


  var _proto = DanmakuClient.prototype;

  _proto.connect = function connect() {
    var _this2 = this;

    var socket = new SectorSocket(this.conf.url, this.conf.options);
    this.conf.middlewares.concat([manageLifecycle]).forEach(function (middleware) {
      return middleware.config(socket, _this2.conf, _this2);
    });
  };
  /**
   * Start this DanmakuClient.
   * The DanmakuClient instance can be started only when its state is 'idle'.
   * For details of how this methods works, see documentation of manageLifecycle.
   */


  _proto.start = function start() {
    if (this.state === 'idle') this.connect();
  };
  /**
   * Terminate this DanmakuClient.
   * On terminate(), the client isn't terminated immediately. In fact, it first
   * switches to 'terminating' state, and will eventually switch to 'terminated'
   * state after some time.
   * If the current state is 'terminating', 'terminated' or 'idle', nothing happens.
   * For details of how this methods works, see documentation of manageLifecycle.
   */


  _proto.terminate = function terminate() {
    if (['terminating', 'terminated', 'idle'].indexOf(this.state) !== -1) return;
    this.setState('terminating');
    this.emit('terminate');
  };
  /**
   * Set the current state of this DanmakuClient.
   * States MUST be switched using this method, except in the constructor. setState()
   * sets the state and emits an event with the name being the new state so that
   * applications can listen to the lifecycle changes of the client.
   * This is an internal method.
   *
   * @param {string} state The state to switch to.
   */


  _proto.setState = function setState(state) {
    if (this.state !== state) {
      this.state = state;
      this.emit(state);
    }
  };

  return DanmakuClient;
}(EventEmitter);

module.exports = DanmakuClient;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9EYW5tYWt1Q2xpZW50LmpzIl0sIm5hbWVzIjpbIkV2ZW50RW1pdHRlciIsInJlcXVpcmUiLCJkZWZhdWx0c0RlZXAiLCJTZWN0b3JTb2NrZXQiLCJNaWRkbGV3YXJlIiwiYWxsIiwibWFuYWdlTGlmZWN5Y2xlIiwid3MiLCJfIiwiY2xpZW50Iiwic2V0U3RhdGUiLCJvbiIsImZvckVhY2giLCJuYW1lIiwib25jZSIsInRlcm1pbmF0ZSIsImRlZmF1bHRDb25mIiwidXJsIiwicm9vbSIsInVpZCIsIm1pZGRsZXdhcmVzIiwib3B0aW9ucyIsInJlamVjdFVuYXV0aG9yaXplZCIsIkRhbm1ha3VDbGllbnQiLCJjb25mIiwic3RhdGUiLCJjb25uZWN0Iiwic29ja2V0IiwibWlkZGxld2FyZSIsImNvbmZpZyIsInN0YXJ0IiwiaW5kZXhPZiIsImVtaXQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFNQSxlQUFlQyxRQUFRLFFBQVIsQ0FBckI7O2VBQ3lCQSxRQUFRLFFBQVIsQztJQUFqQkMsWSxZQUFBQSxZOztBQUVSLElBQU1DLGVBQWVGLFFBQVEsZ0JBQVIsQ0FBckI7O2dCQUM0QkEsUUFBUSxlQUFSLEM7SUFBcEJHLFUsYUFBQUEsVTtJQUFZQyxHLGFBQUFBLEcsRUFFcEI7OztBQUNBLElBQU1DLGtCQUFrQixJQUFJRixVQUFKLENBQWUsVUFBQ0csRUFBRCxFQUFLQyxDQUFMLEVBQVFDLE1BQVIsRUFBbUI7QUFDdERBLFNBQU9DLFFBQVAsQ0FBZ0IsWUFBaEI7QUFDQUgsS0FBR0ksRUFBSCxDQUFNLE1BQU4sRUFBYztBQUFBLFdBQU1GLE9BQU9DLFFBQVAsQ0FBZ0IsUUFBaEIsQ0FBTjtBQUFBLEdBQWQ7QUFDQSxHQUFDLE9BQUQsRUFBVSxPQUFWLEVBQW1CRSxPQUFuQixDQUEyQjtBQUFBLFdBQVFMLEdBQUdJLEVBQUgsQ0FBTUUsSUFBTixFQUFZO0FBQUEsYUFBTUosT0FBT0MsUUFBUCxDQUFnQixZQUFoQixDQUFOO0FBQUEsS0FBWixDQUFSO0FBQUEsR0FBM0I7QUFDQUQsU0FBT0ssSUFBUCxDQUFZLFdBQVosRUFBeUI7QUFBQSxXQUFNUCxHQUFHUSxTQUFILEVBQU47QUFBQSxHQUF6QjtBQUNILENBTHVCLENBQXhCO0FBT0EsSUFBTUMsY0FBYztBQUNoQkMsT0FBSyw4Q0FEVztBQUVoQkMsUUFBTSxDQUZVO0FBR2hCQyxPQUFLLENBSFc7QUFHUjtBQUNSQyxlQUFhZixHQUpHO0FBSUU7QUFDbEJnQixXQUFTO0FBQUVDLHdCQUFvQjtBQUF0QixHQUxPLENBS3dCOztBQUx4QixDQUFwQjs7SUFRTUMsYTs7Ozs7QUFDRjs7Ozs7OztBQU9BLHlCQUFZQyxJQUFaLEVBQWtCO0FBQUE7O0FBQ2Q7QUFDQSxVQUFLQSxJQUFMLEdBQVl0QixhQUFhc0IsSUFBYixFQUFtQlIsV0FBbkIsQ0FBWjtBQUNBLFVBQUtTLEtBQUwsR0FBYSxNQUFiO0FBSGM7QUFJakI7QUFFRDs7Ozs7Ozs7Ozs7U0FPQUMsTyxzQkFBVTtBQUFBOztBQUNOLFFBQU1DLFNBQVMsSUFBSXhCLFlBQUosQ0FBaUIsS0FBS3FCLElBQUwsQ0FBVVAsR0FBM0IsRUFBZ0MsS0FBS08sSUFBTCxDQUFVSCxPQUExQyxDQUFmO0FBQ0ksU0FBS0csSUFBTCxDQUFVSixXQUFkLFNBQTJCZCxlQUEzQixHQUNLTSxPQURMLENBQ2E7QUFBQSxhQUFjZ0IsV0FBV0MsTUFBWCxDQUFrQkYsTUFBbEIsRUFBMEIsT0FBS0gsSUFBL0IsRUFBcUMsTUFBckMsQ0FBZDtBQUFBLEtBRGI7QUFFSCxHO0FBRUQ7Ozs7Ozs7U0FLQU0sSyxvQkFBUTtBQUNKLFFBQUksS0FBS0wsS0FBTCxLQUFlLE1BQW5CLEVBQTJCLEtBQUtDLE9BQUw7QUFDOUIsRztBQUVEOzs7Ozs7Ozs7O1NBUUFYLFMsd0JBQVk7QUFDUixRQUFJLENBQUMsYUFBRCxFQUFnQixZQUFoQixFQUE4QixNQUE5QixFQUFzQ2dCLE9BQXRDLENBQThDLEtBQUtOLEtBQW5ELE1BQThELENBQUMsQ0FBbkUsRUFBc0U7QUFDdEUsU0FBS2YsUUFBTCxDQUFjLGFBQWQ7QUFDQSxTQUFLc0IsSUFBTCxDQUFVLFdBQVY7QUFDSCxHO0FBRUQ7Ozs7Ozs7Ozs7O1NBU0F0QixRLHFCQUFTZSxLLEVBQU87QUFDWixRQUFJLEtBQUtBLEtBQUwsS0FBZUEsS0FBbkIsRUFBMEI7QUFDdEIsV0FBS0EsS0FBTCxHQUFhQSxLQUFiO0FBQ0EsV0FBS08sSUFBTCxDQUFVUCxLQUFWO0FBQ0g7QUFDSixHOzs7RUFoRXVCekIsWTs7QUFtRTVCaUMsT0FBT0MsT0FBUCxHQUFpQlgsYUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKTtcclxuY29uc3QgeyBkZWZhdWx0c0RlZXAgfSA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xyXG5cclxuY29uc3QgU2VjdG9yU29ja2V0ID0gcmVxdWlyZSgnLi9TZWN0b3JTb2NrZXQnKTtcclxuY29uc3QgeyBNaWRkbGV3YXJlLCBhbGwgfSA9IHJlcXVpcmUoJy4vbWlkZGxld2FyZXMnKTtcclxuXHJcbi8vIFRPRE86IEFkZCBkb2N1bWVudGF0aW9uXHJcbmNvbnN0IG1hbmFnZUxpZmVjeWNsZSA9IG5ldyBNaWRkbGV3YXJlKCh3cywgXywgY2xpZW50KSA9PiB7XHJcbiAgICBjbGllbnQuc2V0U3RhdGUoJ2Nvbm5lY3RpbmcnKTtcclxuICAgIHdzLm9uKCdvcGVuJywgKCkgPT4gY2xpZW50LnNldFN0YXRlKCdvcGVuZWQnKSk7XHJcbiAgICBbJ2Nsb3NlJywgJ2Vycm9yJ10uZm9yRWFjaChuYW1lID0+IHdzLm9uKG5hbWUsICgpID0+IGNsaWVudC5zZXRTdGF0ZSgndGVybWluYXRlZCcpKSk7XHJcbiAgICBjbGllbnQub25jZSgndGVybWluYXRlJywgKCkgPT4gd3MudGVybWluYXRlKCkpO1xyXG59KTtcclxuXHJcbmNvbnN0IGRlZmF1bHRDb25mID0ge1xyXG4gICAgdXJsOiAnd3NzOi8vYnJvYWRjYXN0bHYuY2hhdC5iaWxpYmlsaS5jb206MjI0NS9zdWInLFxyXG4gICAgcm9vbTogMSxcclxuICAgIHVpZDogMCwgLy8gd2l0aG91dCBhIHVzZXJcclxuICAgIG1pZGRsZXdhcmVzOiBhbGwsIC8vIHVzZSBhbGwgbWlkZGx3YXJlc1xyXG4gICAgb3B0aW9uczogeyByZWplY3RVbmF1dGhvcml6ZWQ6IGZhbHNlIH0sIC8vIGF2b2lkIHVuYXV0aG9yaXplZCBlcnJvclxyXG59O1xyXG5cclxuY2xhc3MgRGFubWFrdUNsaWVudCBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdHMgdGhlIERhbm1ha3VDbGllbnQgaW5zdGFuY2UuXHJcbiAgICAgKiBBZnRlciBpbml0aWFsaXphdGlvbiwgdGhlIHN0YXRlIG9mIHRoaXMgRGFubWFrdUNsaWVudCBpcyBzZXQgdG8gJ2lkbGUnLFxyXG4gICAgICogYXBwbGljYXRpb25zIHNob3VsZCBjYWxsIHN0YXJ0KCkgdG8gYWN0dWFsbHkgc3RhcnQgdGhlIGNsaWVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0geyp9IGNvbmYgVGhlIGNvbmYgb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25mKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmNvbmYgPSBkZWZhdWx0c0RlZXAoY29uZiwgZGVmYXVsdENvbmYpO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSAnaWRsZSc7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCdWlsZCBjb25uZWN0aW9uIHRvIHRoZSBEYW5tYWt1IHNlcnZlciwgY29uZmlndXJhdGluZyBhbGwgdGhlIG1pZGRsZXdhcmVzLlxyXG4gICAgICogVGhlIHNvY2tldCBpcyBub3Qgc2F2ZWQgaW4gdGhlIERhbm1ha3VDbGllbnQgaW50ZXJmYWNlLCBhcHBsaWNhdGlvbnMgc2hvdWxkIHVzZVxyXG4gICAgICogbWlkZGxld2FyZXMgdG8gYWRkIGZ1bmN0aW9uYWxpdHkuXHJcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZC5cclxuICAgICAqIEZvciBkZXRhaWxzIG9mIGhvdyB0aGlzIG1ldGhvZHMgd29ya3MsIHNlZSBkb2N1bWVudGF0aW9uIG9mIG1hbmFnZUxpZmVjeWNsZS5cclxuICAgICAqL1xyXG4gICAgY29ubmVjdCgpIHtcclxuICAgICAgICBjb25zdCBzb2NrZXQgPSBuZXcgU2VjdG9yU29ja2V0KHRoaXMuY29uZi51cmwsIHRoaXMuY29uZi5vcHRpb25zKTtcclxuICAgICAgICBbLi4udGhpcy5jb25mLm1pZGRsZXdhcmVzLCBtYW5hZ2VMaWZlY3ljbGVdXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKG1pZGRsZXdhcmUgPT4gbWlkZGxld2FyZS5jb25maWcoc29ja2V0LCB0aGlzLmNvbmYsIHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0IHRoaXMgRGFubWFrdUNsaWVudC5cclxuICAgICAqIFRoZSBEYW5tYWt1Q2xpZW50IGluc3RhbmNlIGNhbiBiZSBzdGFydGVkIG9ubHkgd2hlbiBpdHMgc3RhdGUgaXMgJ2lkbGUnLlxyXG4gICAgICogRm9yIGRldGFpbHMgb2YgaG93IHRoaXMgbWV0aG9kcyB3b3Jrcywgc2VlIGRvY3VtZW50YXRpb24gb2YgbWFuYWdlTGlmZWN5Y2xlLlxyXG4gICAgICovXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ2lkbGUnKSB0aGlzLmNvbm5lY3QoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlcm1pbmF0ZSB0aGlzIERhbm1ha3VDbGllbnQuXHJcbiAgICAgKiBPbiB0ZXJtaW5hdGUoKSwgdGhlIGNsaWVudCBpc24ndCB0ZXJtaW5hdGVkIGltbWVkaWF0ZWx5LiBJbiBmYWN0LCBpdCBmaXJzdFxyXG4gICAgICogc3dpdGNoZXMgdG8gJ3Rlcm1pbmF0aW5nJyBzdGF0ZSwgYW5kIHdpbGwgZXZlbnR1YWxseSBzd2l0Y2ggdG8gJ3Rlcm1pbmF0ZWQnXHJcbiAgICAgKiBzdGF0ZSBhZnRlciBzb21lIHRpbWUuXHJcbiAgICAgKiBJZiB0aGUgY3VycmVudCBzdGF0ZSBpcyAndGVybWluYXRpbmcnLCAndGVybWluYXRlZCcgb3IgJ2lkbGUnLCBub3RoaW5nIGhhcHBlbnMuXHJcbiAgICAgKiBGb3IgZGV0YWlscyBvZiBob3cgdGhpcyBtZXRob2RzIHdvcmtzLCBzZWUgZG9jdW1lbnRhdGlvbiBvZiBtYW5hZ2VMaWZlY3ljbGUuXHJcbiAgICAgKi9cclxuICAgIHRlcm1pbmF0ZSgpIHtcclxuICAgICAgICBpZiAoWyd0ZXJtaW5hdGluZycsICd0ZXJtaW5hdGVkJywgJ2lkbGUnXS5pbmRleE9mKHRoaXMuc3RhdGUpICE9PSAtMSkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoJ3Rlcm1pbmF0aW5nJyk7XHJcbiAgICAgICAgdGhpcy5lbWl0KCd0ZXJtaW5hdGUnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGlzIERhbm1ha3VDbGllbnQuXHJcbiAgICAgKiBTdGF0ZXMgTVVTVCBiZSBzd2l0Y2hlZCB1c2luZyB0aGlzIG1ldGhvZCwgZXhjZXB0IGluIHRoZSBjb25zdHJ1Y3Rvci4gc2V0U3RhdGUoKVxyXG4gICAgICogc2V0cyB0aGUgc3RhdGUgYW5kIGVtaXRzIGFuIGV2ZW50IHdpdGggdGhlIG5hbWUgYmVpbmcgdGhlIG5ldyBzdGF0ZSBzbyB0aGF0XHJcbiAgICAgKiBhcHBsaWNhdGlvbnMgY2FuIGxpc3RlbiB0byB0aGUgbGlmZWN5Y2xlIGNoYW5nZXMgb2YgdGhlIGNsaWVudC5cclxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZSBUaGUgc3RhdGUgdG8gc3dpdGNoIHRvLlxyXG4gICAgICovXHJcbiAgICBzZXRTdGF0ZShzdGF0ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlICE9PSBzdGF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdChzdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERhbm1ha3VDbGllbnQ7XHJcbiJdfQ==