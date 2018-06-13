"use strict";

var _require = require('lodash'),
    isFunction = _require.isFunction;

var compile = require('./compile');

var Transformer =
/*#__PURE__*/
function () {
  function Transformer(cmd, name, fnOrDef) {
    this.cmd = cmd;
    this.name = name;
    var fn = isFunction(fnOrDef) ? fnOrDef : compile(fnOrDef);
    this.fn = fn;
  }

  var _proto = Transformer.prototype;

  _proto.transform = function transform(input) {
    return this.fn(input);
  };

  return Transformer;
}();

module.exports = Transformer;
//# sourceMappingURL=Transformer.js.map