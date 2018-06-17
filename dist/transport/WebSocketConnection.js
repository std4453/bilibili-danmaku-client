"use strict";

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.reflect.construct");

require("core-js/modules/es6.object.set-prototype-of");

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var WebSocket = require('x-platform-ws');

var _require = require('../connection'),
    CascadeConnection = _require.CascadeConnection;

var WebSocketConnection =
/*#__PURE__*/
function (_CascadeConnection) {
  _inheritsLoose(WebSocketConnection, _CascadeConnection);

  function WebSocketConnection() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _CascadeConnection.call(this, _construct(WebSocket, args)) || this;
  }

  return WebSocketConnection;
}(CascadeConnection);

module.exports = WebSocketConnection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90cmFuc3BvcnQvV2ViU29ja2V0Q29ubmVjdGlvbi5qcyJdLCJuYW1lcyI6WyJXZWJTb2NrZXQiLCJyZXF1aXJlIiwiQ2FzY2FkZUNvbm5lY3Rpb24iLCJXZWJTb2NrZXRDb25uZWN0aW9uIiwiYXJncyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxZQUFZQyxRQUFRLGVBQVIsQ0FBbEI7O2VBRThCQSxRQUFRLGVBQVIsQztJQUF0QkMsaUIsWUFBQUEsaUI7O0lBRUZDLG1COzs7OztBQUNGLGlDQUFxQjtBQUFBLHNDQUFOQyxJQUFNO0FBQU5BLFVBQU07QUFBQTs7QUFBQSxXQUNqQix5Q0FBVUosU0FBVixFQUF1QkksSUFBdkIsRUFEaUI7QUFFcEI7OztFQUg2QkYsaUI7O0FBTWxDRyxPQUFPQyxPQUFQLEdBQWlCSCxtQkFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBXZWJTb2NrZXQgPSByZXF1aXJlKCd4LXBsYXRmb3JtLXdzJyk7XHJcblxyXG5jb25zdCB7IENhc2NhZGVDb25uZWN0aW9uIH0gPSByZXF1aXJlKCcuLi9jb25uZWN0aW9uJyk7XHJcblxyXG5jbGFzcyBXZWJTb2NrZXRDb25uZWN0aW9uIGV4dGVuZHMgQ2FzY2FkZUNvbm5lY3Rpb24ge1xyXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgIHN1cGVyKG5ldyBXZWJTb2NrZXQoLi4uYXJncykpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFdlYlNvY2tldENvbm5lY3Rpb247XHJcbiJdfQ==