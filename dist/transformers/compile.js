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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90cmFuc2Zvcm1lcnMvY29tcGlsZS5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwibWFwIiwibWFwVmFsdWVzIiwiaXNBcnJheSIsImlzT2JqZWN0IiwiY29tcGlsZSIsInNyYyIsImNvbXBpbGVkIiwidHJhbnNmb3JtZXIiLCJpbnB1dCIsIkVycm9yIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7ZUFBOENBLFFBQVEsUUFBUixDO0lBQXRDQyxHLFlBQUFBLEc7SUFBS0MsUyxZQUFBQSxTO0lBQVdDLE8sWUFBQUEsTztJQUFTQyxRLFlBQUFBLFEsRUFFakM7OztBQUNBLElBQU1DLFVBQVUsU0FBVkEsT0FBVSxDQUFDQyxHQUFELEVBQVM7QUFDckIsTUFBSSxPQUFPQSxHQUFQLEtBQWUsVUFBbkIsRUFBK0IsT0FBT0EsR0FBUCxDQUEvQixLQUNLLElBQUlILFFBQVFHLEdBQVIsQ0FBSixFQUFrQjtBQUNuQixRQUFNQyxXQUFXTixJQUFJSyxHQUFKLEVBQVNELE9BQVQsQ0FBakI7QUFDQSxXQUFPO0FBQUEsYUFBU0osSUFBSU0sUUFBSixFQUFjO0FBQUEsZUFBZUMsWUFBWUMsS0FBWixDQUFmO0FBQUEsT0FBZCxDQUFUO0FBQUEsS0FBUDtBQUNILEdBSEksTUFHRSxJQUFJTCxTQUFTRSxHQUFULENBQUosRUFBbUI7QUFDdEIsUUFBTUMsWUFBV0wsVUFBVUksR0FBVixFQUFlRCxPQUFmLENBQWpCOztBQUNBLFdBQU87QUFBQSxhQUFTSCxVQUFVSyxTQUFWLEVBQW9CO0FBQUEsZUFBZUMsWUFBWUMsS0FBWixDQUFmO0FBQUEsT0FBcEIsQ0FBVDtBQUFBLEtBQVA7QUFDSDtBQUNELFFBQU0sSUFBSUMsS0FBSix5QkFBZ0NKLEdBQWhDLE9BQU47QUFDSCxDQVZEOztBQVlBSyxPQUFPQyxPQUFQLEdBQWlCUCxPQUFqQiIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHsgbWFwLCBtYXBWYWx1ZXMsIGlzQXJyYXksIGlzT2JqZWN0IH0gPSByZXF1aXJlKCdsb2Rhc2gnKTtcclxuXHJcbi8vIGNvbXBpbGVyXHJcbmNvbnN0IGNvbXBpbGUgPSAoc3JjKSA9PiB7XHJcbiAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHNyYztcclxuICAgIGVsc2UgaWYgKGlzQXJyYXkoc3JjKSkge1xyXG4gICAgICAgIGNvbnN0IGNvbXBpbGVkID0gbWFwKHNyYywgY29tcGlsZSk7XHJcbiAgICAgICAgcmV0dXJuIGlucHV0ID0+IG1hcChjb21waWxlZCwgdHJhbnNmb3JtZXIgPT4gdHJhbnNmb3JtZXIoaW5wdXQpKTtcclxuICAgIH0gZWxzZSBpZiAoaXNPYmplY3Qoc3JjKSkge1xyXG4gICAgICAgIGNvbnN0IGNvbXBpbGVkID0gbWFwVmFsdWVzKHNyYywgY29tcGlsZSk7XHJcbiAgICAgICAgcmV0dXJuIGlucHV0ID0+IG1hcFZhbHVlcyhjb21waWxlZCwgdHJhbnNmb3JtZXIgPT4gdHJhbnNmb3JtZXIoaW5wdXQpKTtcclxuICAgIH1cclxuICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGNvbXBpbGU6ICR7c3JjfS5gKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY29tcGlsZTtcclxuIl19