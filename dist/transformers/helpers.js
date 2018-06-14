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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90cmFuc2Zvcm1lcnMvaGVscGVycy5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiaXNFbXB0eSIsIm5lZ2F0ZSIsImlzU3RyaW5nIiwiaXNGdW5jdGlvbiIsImlzQXJyYXkiLCJpc09iamVjdCIsImZyb21QYWlycyIsImNvbmZvcm1zVG8iLCJkZWZhdWx0cyIsImNhbWVsQ2FzZSIsImNvbXBpbGUiLCJhc0ZsYWciLCJpbnB1dCIsIm9uV2hlbiIsIm1hcHBlciIsInByZWRpY2F0ZSIsInNyYyIsImNvbXBpbGVkIiwib24iLCJvbkV4aXN0IiwiY29udmVydE5hbWVzIiwibmFtZXMiLCJtYXAiLCJuYW1lIiwiYXJyIiwibWFwVmFsIiwibWFwS2V5Iiwib2JqIiwidiIsInNwcmVhZCIsImNvbnZlcnRlZCIsImluZGV4IiwidW5kZWZpbmVkIiwiYSIsImZpbHRlciIsInNwcmVhZE9iaiIsIm8iLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOztlQUFpSEEsUUFBUSxRQUFSLEM7SUFBekdDLE8sWUFBQUEsTztJQUFTQyxNLFlBQUFBLE07SUFBUUMsUSxZQUFBQSxRO0lBQVVDLFUsWUFBQUEsVTtJQUFZQyxPLFlBQUFBLE87SUFBU0MsUSxZQUFBQSxRO0lBQVVDLFMsWUFBQUEsUztJQUFXQyxVLFlBQUFBLFU7SUFBWUMsUSxZQUFBQSxRO0lBQVVDLFMsWUFBQUEsUzs7QUFFbkcsSUFBTUMsVUFBVVgsUUFBUSxXQUFSLENBQWhCLEMsQ0FFQTs7O0FBQ0EsSUFBTVksU0FBUyxTQUFUQSxNQUFTO0FBQUEsU0FBUyxDQUFDLENBQUNDLEtBQVg7QUFBQSxDQUFmOztBQUNBLElBQU1DLFNBQVMsU0FBVEEsTUFBUyxDQUFDQyxNQUFELEVBQVNDLFNBQVQsRUFBb0JDLEdBQXBCLEVBQTRCO0FBQ3ZDLE1BQU1DLFdBQVdQLFFBQVFNLEdBQVIsQ0FBakI7QUFDQSxTQUFPO0FBQUEsV0FBVUQsVUFBVUQsT0FBT0YsS0FBUCxDQUFWLElBQTJCSyxTQUFT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cHR5LCBuZWdhdGUsIGlzU3RyaW5nLCBpc0Z1bmN0aW9uLCBpc0FycmF5LCBpc09iamVjdCwgZnJvbVBhaXJzLCBjb25mb3Jtc1RvLCBkZWZhdWx0cywgY2FtZWxDYXNlIH0gPSByZXF1aXJlKCdsb2Rhc2gnKTtcclxuXHJcbmNvbnN0IGNvbXBpbGUgPSByZXF1aXJlKCcuL2NvbXBpbGUnKTtcclxuXHJcbi8vIGhlbHBlciBtZXRob2RzXHJcbmNvbnN0IGFzRmxhZyA9IGlucHV0ID0+ICEhaW5wdXQ7XHJcbmNvbnN0IG9uV2hlbiA9IChtYXBwZXIsIHByZWRpY2F0ZSwgc3JjKSA9PiB7XHJcbiAgICBjb25zdCBjb21waWxlZCA9IGNvbXBpbGUoc3JjKTtcclxuICAgIHJldHVybiBpbnB1dCA9PiAocHJlZGljYXRlKG1hcHBlcihpbnB1dCkpID8gY29tcGlsZWQobWFwcGVyKGlucHV0KSkgOiBudWxsKTtcclxufTtcclxuY29uc3Qgb24gPSAobWFwcGVyLCBzcmMpID0+IG9uV2hlbihtYXBwZXIsICgpID0+IHRydWUsIHNyYyk7XHJcbmNvbnN0IG9uRXhpc3QgPSAobWFwcGVyLCBzcmMpID0+IG9uV2hlbihtYXBwZXIsIG5lZ2F0ZShpc0VtcHR5KSwgc3JjKTtcclxuY29uc3QgY29udmVydE5hbWVzID0gKC4uLm5hbWVzKSA9PiBuYW1lc1xyXG4gICAgLm1hcChuYW1lID0+IChpc1N0cmluZyhuYW1lKSA/IFtuYW1lXSA6IG5hbWUpKVxyXG4gICAgLm1hcCgoYXJyKSA9PiB7XHJcbiAgICAgICAgaWYgKCFpc0FycmF5KGFycikpIHJldHVybiBudWxsO1xyXG4gICAgICAgIGNvbnN0IFtuYW1lLCBtYXBWYWwsIG1hcEtleV0gPSBhcnI7XHJcbiAgICAgICAgY29uc3Qgb2JqID0gZGVmYXVsdHMoeyBuYW1lLCBtYXBWYWwsIG1hcEtleSB9LCB7IG1hcFZhbDogdiA9PiB2LCBtYXBLZXk6IGNhbWVsQ2FzZSB9KTtcclxuICAgICAgICByZXR1cm4gY29uZm9ybXNUbyhvYmosIHsgbmFtZTogaXNTdHJpbmcsIG1hcFZhbDogaXNGdW5jdGlvbiwgbWFwS2V5OiBpc0Z1bmN0aW9uIH0pID9cclxuICAgICAgICAgICAgb2JqIDogbnVsbDtcclxuICAgIH0pO1xyXG5jb25zdCBzcHJlYWQgPSAoLi4ubmFtZXMpID0+IGZyb21QYWlycyhjb252ZXJ0TmFtZXMoLi4ubmFtZXMpXHJcbiAgICAubWFwKChjb252ZXJ0ZWQsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgaWYgKCFpc09iamVjdChjb252ZXJ0ZWQpKSByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIGNvbnN0IHsgbmFtZSwgbWFwVmFsLCBtYXBLZXkgfSA9IGNvbnZlcnRlZDtcclxuICAgICAgICByZXR1cm4gW21hcEtleShuYW1lKSwgYSA9PiBtYXBWYWwoYVtpbmRleF0pXTtcclxuICAgIH0pLmZpbHRlcihpc0FycmF5KSk7XHJcbmNvbnN0IHNwcmVhZE9iaiA9ICguLi5uYW1lcykgPT4gZnJvbVBhaXJzKGNvbnZlcnROYW1lcyguLi5uYW1lcylcclxuICAgIC5maWx0ZXIoaXNPYmplY3QpLm1hcCgoeyBuYW1lLCBtYXBWYWwsIG1hcEtleSB9KSA9PiBbbWFwS2V5KG5hbWUpLCBvID0+IG1hcFZhbChvW25hbWVdKV0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0geyBhc0ZsYWcsIG9uV2hlbiwgb24sIG9uRXhpc3QsIGNvbnZlcnROYW1lcywgc3ByZWFkLCBzcHJlYWRPYmogfTtcclxuIl19