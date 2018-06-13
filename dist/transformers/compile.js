"use strict";

var _require = require('lodash'),
    map = _require.map,
    mapValues = _require.mapValues,
    isArray = _require.isArray,
    isObject = _require.isObject; // compiler


var compile = function compile(src) {
  if (typeof src === 'function') return src;else if (isArray(src)) {
    var compiled = map(src, compile);
    return function (input) {
      return map(compiled, function (transformer) {
        return transformer(input);
      });
    };
  } else if (isObject(src)) {
    var _compiled = mapValues(src, compile);

    return function (input) {
      return mapValues(_compiled, function (transformer) {
        return transformer(input);
      });
    };
  }
  throw new Error("Unable to compile: " + src + ".");
};

module.exports = compile;
//# sourceMappingURL=compile.js.map