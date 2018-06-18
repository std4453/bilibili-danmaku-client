"use strict";

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.reflect.construct");

require("core-js/modules/es6.object.set-prototype-of");

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var WebSocket = require('x-platform-ws');

var _require = require('../util/connection'),
    CascadeConnection = _require.CascadeConnection;
/**
 * BaseConnection implementation wrapping a WebSocket from x-platform-ws.
 * Since BaseConnection imitates the API of ws (which x-platform-ws internally
 * uses), the wrapping is as simple as putting an elephant into a refridgerator.
 */


var WebSocketConnection =
/*#__PURE__*/
function (_CascadeConnection) {
  _inheritsLoose(WebSocketConnection, _CascadeConnection);

  /**
   * Construct a new WebSocketConnection.
   * All arguments are passed onto WebSocket for initialization.
   * @param {any[]} args Arguments to pass to new WebSocket().
   */
  function WebSocketConnection() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _CascadeConnection.call(this, _construct(WebSocket, args)) || this;
  }

  return WebSocketConnection;
}(CascadeConnection);

module.exports = WebSocketConnection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90cmFuc3BvcnQvV2ViU29ja2V0Q29ubmVjdGlvbi5qcyJdLCJuYW1lcyI6WyJXZWJTb2NrZXQiLCJyZXF1aXJlIiwiQ2FzY2FkZUNvbm5lY3Rpb24iLCJXZWJTb2NrZXRDb25uZWN0aW9uIiwiYXJncyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxZQUFZQyxRQUFRLGVBQVIsQ0FBbEI7O2VBRThCQSxRQUFRLG9CQUFSLEM7SUFBdEJDLGlCLFlBQUFBLGlCO0FBRVI7Ozs7Ozs7SUFLTUMsbUI7Ozs7O0FBQ0Y7Ozs7O0FBS0EsaUNBQXFCO0FBQUEsc0NBQU5DLElBQU07QUFBTkEsVUFBTTtBQUFBOztBQUFBLFdBQ2pCLHlDQUFVSixTQUFWLEVBQXVCSSxJQUF2QixFQURpQjtBQUVwQjs7O0VBUjZCRixpQjs7QUFXbENHLE9BQU9DLE9BQVAsR0FBaUJILG1CQUFqQiIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFdlYlNvY2tldCA9IHJlcXVpcmUoJ3gtcGxhdGZvcm0td3MnKTtcclxuXHJcbmNvbnN0IHsgQ2FzY2FkZUNvbm5lY3Rpb24gfSA9IHJlcXVpcmUoJy4uL3V0aWwvY29ubmVjdGlvbicpO1xyXG5cclxuLyoqXHJcbiAqIEJhc2VDb25uZWN0aW9uIGltcGxlbWVudGF0aW9uIHdyYXBwaW5nIGEgV2ViU29ja2V0IGZyb20geC1wbGF0Zm9ybS13cy5cclxuICogU2luY2UgQmFzZUNvbm5lY3Rpb24gaW1pdGF0ZXMgdGhlIEFQSSBvZiB3cyAod2hpY2ggeC1wbGF0Zm9ybS13cyBpbnRlcm5hbGx5XHJcbiAqIHVzZXMpLCB0aGUgd3JhcHBpbmcgaXMgYXMgc2ltcGxlIGFzIHB1dHRpbmcgYW4gZWxlcGhhbnQgaW50byBhIHJlZnJpZGdlcmF0b3IuXHJcbiAqL1xyXG5jbGFzcyBXZWJTb2NrZXRDb25uZWN0aW9uIGV4dGVuZHMgQ2FzY2FkZUNvbm5lY3Rpb24ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgYSBuZXcgV2ViU29ja2V0Q29ubmVjdGlvbi5cclxuICAgICAqIEFsbCBhcmd1bWVudHMgYXJlIHBhc3NlZCBvbnRvIFdlYlNvY2tldCBmb3IgaW5pdGlhbGl6YXRpb24uXHJcbiAgICAgKiBAcGFyYW0ge2FueVtdfSBhcmdzIEFyZ3VtZW50cyB0byBwYXNzIHRvIG5ldyBXZWJTb2NrZXQoKS5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgIHN1cGVyKG5ldyBXZWJTb2NrZXQoLi4uYXJncykpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFdlYlNvY2tldENvbm5lY3Rpb247XHJcbiJdfQ==