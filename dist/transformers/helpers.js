"use strict";

var _require = require('lodash'),
    isEmpty = _require.isEmpty,
    negate = _require.negate,
    isString = _require.isString,
    isFunction = _require.isFunction,
    isArray = _require.isArray,
    isObject = _require.isObject,
    fromPairs = _require.fromPairs,
    conformsTo = _require.conformsTo,
    defaults = _require.defaults,
    camelCase = _require.camelCase;

var compile = require('./compile'); // helper methods


var asFlag = function asFlag(input) {
  return !!input;
};

var onWhen = function onWhen(mapper, predicate, src) {
  var compiled = compile(src);
  return function (input) {
    return predicate(mapper(input)) ? compiled(mapper(input)) : null;
  };
};

var on = function on(mapper, src) {
  return onWhen(mapper, function () {
    return true;
  }, src);
};

var onExist = function onExist(mapper, src) {
  return onWhen(mapper, negate(isEmpty), src);
};

var convertNames = function convertNames() {
  for (var _len = arguments.length, names = new Array(_len), _key = 0; _key < _len; _key++) {
    names[_key] = arguments[_key];
  }

  return names.map(function (name) {
    return isString(name) ? [name] : name;
  }).map(function (arr) {
    if (!isArray(arr)) return null;
    var name = arr[0],
        mapVal = arr[1],
        mapKey = arr[2];
    var obj = defaults({
      name: name,
      mapVal: mapVal,
      mapKey: mapKey
    }, {
      mapVal: function mapVal(v) {
        return v;
      },
      mapKey: camelCase
    });
    return conformsTo(obj, {
      name: isString,
      mapVal: isFunction,
      mapKey: isFunction
    }) ? obj : null;
  });
};

var spread = function spread() {
  return fromPairs(convertNames.apply(void 0, arguments).map(function (converted, index) {
    if (!isObject(converted)) return undefined;
    var name = converted.name,
        mapVal = converted.mapVal,
        mapKey = converted.mapKey;
    return [mapKey(name), function (a) {
      return mapVal(a[index]);
    }];
  }).filter(isArray));
};

var spreadObj = function spreadObj() {
  return fromPairs(convertNames.apply(void 0, arguments).filter(isObject).map(function (_ref) {
    var name = _ref.name,
        mapVal = _ref.mapVal,
        mapKey = _ref.mapKey;
    return [mapKey(name), function (o) {
      return mapVal(o[name]);
    }];
  }));
};

module.exports = {
  asFlag: asFlag,
  onWhen: onWhen,
  on: on,
  onExist: onExist,
  convertNames: convertNames,
  spread: spread,
  spreadObj: spreadObj
};
//# sourceMappingURL=helpers.js.map