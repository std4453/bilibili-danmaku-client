"use strict";

/**
 * The helpers used while making Definitions.
 * They are mostly used to simplify code of Definitions and accelerate development.
 * Whether these helpers make code easier to read depends on whether the reader
 * has a good understanding of the helper methods. In most cases, is the documentation
 * of the helper methods are carefully read, the reader should be able to understand
 * Definitions without great difficulties, and, considering the reduced code length
 * and the improved coercion, readability should be better. However, exceptions might
 * exist.
 * Meanwhile, both the helpers and the Definition code are considered internal, that
 * is, one should rely on the project Wiki for reference and documentation instead of
 * in-code comments without good reasons.
 * For documentation about the concepts Definition, compile, Input, see compile.js.
 */
var _require = require('lodash'),
    isEmpty = _require.isEmpty,
    negate = _require.negate,
    isString = _require.isString,
    isFunction = _require.isFunction,
    isArray = _require.isArray,
    isObject = _require.isObject,
    fromPairs = _require.fromPairs,
    camelCase = _require.camelCase;

var compile = require('./compile');
/**
 * Boolify input.
 * As defined in the test, asFlag() should:
 * - return true for true.
 * - return false for false.
 * - return true for 1.
 * - return true for 0.
 * Otherwise, behavior is undefined and not tested.
 *
 * @param {any} input The input to boolify.
 * @returns {boolean} The boolified result.
 */


var asFlag = function asFlag(input) {
  return !!input;
};
/**
 * Return an Definition that executes the specified Definition on the Input mapped with mapper.
 *
 * @param {Function} mapper The function used to map Input.
 * @param {any} def The Definition.
 * @returns {Function} The returned Definition.
 */


var on = function on(mapper, def) {
  var compiled = compile(def);
  return function (input) {
    return compiled(mapper(input));
  };
};
/**
 * Return an Definition that:
 * - if predicate(mapper(input)) returns true, execute def1 on the Input mapped with mapper.
 * - otherwise, execute def2 on the input mapper with mapper.
 *
 * @param {Function} mapper The function used to map input.
 * @param {Function} predicate The functino used to decide whether the Definition should be
 *   executed or not.
 * @param {any} def1 The Definition used when predicate(mapper(input)) is true.
 * @param {any} def2 The Definitino used when predicate(mapper(input)) is false. Default to
 *   null.
 * @returns {Function} The returned Definition.
 */


var onWhen = function onWhen(mapper, predicate, def1, def2) {
  if (def2 === void 0) {
    def2 = null;
  }

  var compiled1 = compile(def1);
  var compiled2 = compile(def2);
  return on(mapper, function (input) {
    return predicate(input) ? compiled1(input) : compiled2(null);
  });
};
/**
 * Return onWhen(mapper, _.negate(_.isEmpty), def).
 * See documentation of lodash for details.
 *
 * The typical usage of onExist is:
 * onExist(a => a.data, { foo: d => d.foo });
 * Which ensures that, if a.data is undefined or {}, d => d.foo will not even be executed
 * and no Error is thrown.
 * However _.isEmpty() is just a very simple check, so use this method only when applicable.
 *
 * @param {Function} mapper The function used to map input.e
 * @param {any} def1 The Definition used when predicate(mapper(input)) is true.
 * @param {any} def2 The Definitino used when predicate(mapper(input)) is false. Default to
 *   null.
 * @returns The returned Definition.
 */


var onExist = function onExist(mapper, def1, def2) {
  return onWhen(mapper, negate(isEmpty), def1, def2);
};
/**
 * Turn input into a function that maps input value to desired value.
 * Used only in coonvertNames().
 * As defined in the test, toMapVal() should:
 * - return unchanged for a function.
 * - return v => v otherwise.
 *
 * @param {any} input The input to turn into a function.
 * @returns {Function} The returned function.
 */


var toMapVal = function toMapVal(input) {
  if (isFunction(input)) return input;
  return function (v) {
    return v;
  };
};
/**
 * Turn input into a function that maps key to desired key.
 * Used only in convertNames().
 * As defined in the test. toMapKey() should:
 * - return unchanged for a function.
 * - return () => src for a string str.
 * - return _.camelCase otherwise.
 * _.camelCase is used only for the convenience of Definitions in definitions.js,
 * and is due to change as the Definitions evolves.
 *
 * @param {any} input The input to turn into a function.
 * @returns {Function} The returned function.
 */


var toMapKey = function toMapKey(input) {
  if (isFunction(input)) return input;
  if (isString(input)) return function () {
    return input;
  };
  return camelCase;
};
/**
 * Turn array of input into an { name: string, mapVal: Function, mapKey: Function }.
 * This method is implements the common logics in spread() and spreadObj().
 * The behavior of this method is the convenience of Definitions in definitions.js,
 * and is due to change as the Definitions evolves.
 * In short, it supports a convenient way to extract data from Input arrays or objects,
 * probably changing the value and the key with a mapper function, and using the
 * mapped key and value to create a Property Definition.
 * In the meanwhile, convertNames() provides default values to enable creating Property
 * Definitions simply and shortly.
 * Its detailed behavior is, map each name of names with:
 * - If name is a string, map [name, undefined, undefined] instead.
 * - If name is an Array, return { name: name[0], mapVal: toMapVal(name[1]), mapKey: name[2] }.
 * - Otherwise, return null.
 * The return value is an array, each element being either:
 * - An object with { name: string, mapVal: Function, mapKey: Function }.
 * - Or null.
 * Each element of the return value corresponds to the element in names of the same index,
 * which enables the funcionality of spread().
 *
 * @param {(string | Array | *)[]} names The names to convert.
 * @returns {(Object | null)[]} The converted names.
 * @see #toMapKey
 * @see #toMapVal
 * @see #spread
 * @see #spreadObj
 */


var convertNames = function convertNames() {
  for (var _len = arguments.length, names = new Array(_len), _key = 0; _key < _len; _key++) {
    names[_key] = arguments[_key];
  }

  return names.map(function (name) {
    return isString(name) ? [name] : name;
  }).map(compile(onWhen(function (a) {
    return a;
  }, isArray, {
    name: function name(a) {
      return a[0];
    },
    mapVal: function mapVal(a) {
      return toMapVal(a[1]);
    },
    mapKey: function mapKey(a) {
      return toMapKey(a[2]);
    }
  })));
};
/**
 * Return a Definition which spread the given names.
 * The behavior of this method is the convenience of Definitions in definitions.js,
 * and is due to change as the Definitions evolves.
 * The name spread comes from the spread syntax of ECMAScript, since this method
 * vaguely expresses the same idea.
 * This method spreads the given names into an object to create an Definition.
 * Typically, it is used as follows:
 * const def = spread('foo', ['bar', parseInt], 0, ['baz', 0, 'fooBar'], ['bad_case', 0]);
 * And using def to parse:
 * ['1', '2', '3', '4', '5']
 * you will get:
 * { foo: '1', bar: 2, fooBar: '4', badCase: '5' }
 * Explanations.
 * The arguments are used like mappers. When the returned Definition gets an array input,
 * it maps the elements and return an object.
 * As you can see, giving a simple 'foo' sets the 'foo' property with the value of input[0],
 * Giving ['bar', parseInt] sets the 'bar' property with parseInt(input[1]).
 * Giving 0 ignores the input element, that is, input[2]. (0 is used only because it is short)
 * Giving ['baz', 0, 'fooBar'] sets the 'fooBar' property with input[3], where 0 specifies
 * input[3] is not mapped and returned directly, 'fooBar' is the final property name, and
 * 'foo' is ignored. (But this will be different in spreadObj()).
 * Giving ['bad_case', 0] sets the 'badCase' property with input[4], where 0 specifies
 * that input[4] is not mapped, 'bad_case' is used to produce the property name 'badCase'
 * (by converting it into camelCase when no convert function is specified, see toMapKey()).
 * When using spread(), the last 2 syntaxes are rarely used, but they do have their reason
 * of existence in spreadObj().
 * In short, it uses convertNames(), ignores null return elements, and returns a Definiton
 * that maps every input element into a property of the returned object.
 *
 * @param {any[]} names The names to spread.
 * @returns {Function} The returned Definition.
 * @see #convertNames
 * @see #spreadObj
 */


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
/**
 * Return a Definition which spread the given names.
 * The behavior of this method is the convenience of Definitions in definitions.js,
 * and is due to change as the Definitions evolves.
 * The name spread comes from the object spread syntax of ECMAScript, since this method
 * vaguely expresses the same idea.
 * This method spreads the given names into an object to create an Definition.
 * Typically, it is used as follows:
 * const def = spreadObj('foo', ['bar', parseInt], 0, ['baz', 0, 'fooBar'], ['bad_case', 0]);
 * And using def to parse:
 * { foo: '1', bar: '2', baa: '3', baz: '4', bad_case: '5' }
 * you will get:
 * { foo: '1', bar: 2, fooBar: '4', badCase: '5' }
 * Explanations.
 * The arguments are used like mappers. When the returned Definition gets an object input,
 * it maps the properties and return another object.
 * As you can see, giving a simple 'foo' sets the 'foo' property with the value of input.foo,
 * Giving ['bar', parseInt] sets the 'bar' property with parseInt(input.bar).
 * Giving 0 will be meaningless, this syntax is only available in spread().
 * Giving ['baz', 0, 'fooBar'] sets the 'fooBar' property with input.baz, where 0 specifies
 * input.baz is not mapped and returned directly. (0 is used only because it is short, any
 * non-string and non-Array value will have the same effect) 'fooBar' is the final property
 * name, and 'baz' is the property name in input.
 * Giving ['bad_case', 0] sets the 'badCase' property with input.bad_case, where 0 specifies
 * that input.foo_bar is not mapped, 'bad_case' the property name in input and 'badCase' is
 * the camelCase of 'bad_case'. (This is the default behavior since the key mapper is not
 * specified. See toMapKey() for details).
 * When using spread(), the third syntax is rarely used, but it is useful in spreadObj().
 * In short, it uses convertNames(), and returns a Definiton that maps every input property
 * into a property of the returned object.
 *
 * @param {any[]} names The names to spread.
 * @returns {Function} The returned Definition.
 * @see #convertNames
 * @see #spread
 */


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
  toMapVal: toMapVal,
  toMapKey: toMapKey,
  convertNames: convertNames,
  spread: spread,
  spreadObj: spreadObj
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL2hlbHBlcnMuanMiXSwibmFtZXMiOlsicmVxdWlyZSIsImlzRW1wdHkiLCJuZWdhdGUiLCJpc1N0cmluZyIsImlzRnVuY3Rpb24iLCJpc0FycmF5IiwiaXNPYmplY3QiLCJmcm9tUGFpcnMiLCJjYW1lbENhc2UiLCJjb21waWxlIiwiYXNGbGFnIiwiaW5wdXQiLCJvbiIsIm1hcHBlciIsImRlZiIsImNvbXBpbGVkIiwib25XaGVuIiwicHJlZGljYXRlIiwiZGVmMSIsImRlZjIiLCJjb21waWxlZDEiLCJjb21waWxlZDIiLCJvbkV4aXN0IiwidG9NYXBWYWwiLCJ2IiwidG9NYXBLZXkiLCJjb252ZXJ0TmFtZXMiLCJuYW1lcyIsIm1hcCIsIm5hbWUiLCJhIiwibWFwVmFsIiwibWFwS2V5Iiwic3ByZWFkIiwiY29udmVydGVkIiwiaW5kZXgiLCJ1bmRlZmluZWQiLCJmaWx0ZXIiLCJzcHJlYWRPYmoiLCJvIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7ZUF3QklBLFFBQVEsUUFBUixDO0lBUkFDLE8sWUFBQUEsTztJQUNBQyxNLFlBQUFBLE07SUFDQUMsUSxZQUFBQSxRO0lBQ0FDLFUsWUFBQUEsVTtJQUNBQyxPLFlBQUFBLE87SUFDQUMsUSxZQUFBQSxRO0lBQ0FDLFMsWUFBQUEsUztJQUNBQyxTLFlBQUFBLFM7O0FBR0osSUFBTUMsVUFBVVQsUUFBUSxXQUFSLENBQWhCO0FBRUE7Ozs7Ozs7Ozs7Ozs7O0FBWUEsSUFBTVUsU0FBUyxTQUFUQSxNQUFTO0FBQUEsU0FBUyxDQUFDLENBQUNDLEtBQVg7QUFBQSxDQUFmO0FBRUE7Ozs7Ozs7OztBQU9BLElBQU1DLEtBQUssU0FBTEEsRUFBSyxDQUFDQyxNQUFELEVBQVNDLEdBQVQsRUFBaUI7QUFDeEIsTUFBTUMsV0FBV04sUUFBUUssR0FBUixDQUFqQjtBQUNBLFNBQU87QUFBQSxXQUFTQyxTQUFTRixPQUFPRixLQUFQLENBQVQsQ0FB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QUFTQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQ0EsSUFBTWlDLFlBQVksU0FBWkEsU0FBWTtBQUFBLFNBQ2QvQixVQUFVbUIsc0NBQ0xXLE1BREssQ0FDRS9CLFFBREYsRUFFTHNCLEdBRkssQ0FFRDtBQUFBLFFBQUdDLElBQUgsUUFBR0EsSUFBSDtBQUFBLFFBQVNFLE1BQVQsUUFBU0EsTUFBVDtBQUFBLFFBQWlCQyxNQUFqQixRQUFpQkEsTUFBakI7QUFBQSxXQUE4QixDQUFDQSxPQUFPSCxJQUFQLENBQUQsRUFBZTtBQUFBLGFBQUtFLE9BQU9RLEVBQUVWLElBQUYsQ0FBUCxDQUFMO0FBQUEsS0FBZixDQUE5QjtBQUFBLEdBRkMsQ0FBVixDQURjO0FBQUEsQ0FBbEI7O0FBS0FXLE9BQU9DLE9BQVAsR0FBaUI7QUFDYi9CLGdCQURhO0FBRWJNLGdCQUZhO0FBR2JKLFFBSGE7QUFJYlUsa0JBSmE7QUFLYkMsb0JBTGE7QUFNYkUsb0JBTmE7QUFPYkMsNEJBUGE7QUFRYk8sZ0JBUmE7QUFTYks7QUFUYSxDQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUaGUgaGVscGVycyB1c2VkIHdoaWxlIG1ha2luZyBEZWZpbml0aW9ucy5cclxuICogVGhleSBhcmUgbW9zdGx5IHVzZWQgdG8gc2ltcGxpZnkgY29kZSBvZiBEZWZpbml0aW9ucyBhbmQgYWNjZWxlcmF0ZSBkZXZlbG9wbWVudC5cclxuICogV2hldGhlciB0aGVzZSBoZWxwZXJzIG1ha2UgY29kZSBlYXNpZXIgdG8gcmVhZCBkZXBlbmRzIG9uIHdoZXRoZXIgdGhlIHJlYWRlclxyXG4gKiBoYXMgYSBnb29kIHVuZGVyc3RhbmRpbmcgb2YgdGhlIGhlbHBlciBtZXRob2RzLiBJbiBtb3N0IGNhc2VzLCBpcyB0aGUgZG9jdW1lbnRhdGlvblxyXG4gKiBvZiB0aGUgaGVscGVyIG1ldGhvZHMgYXJlIGNhcmVmdWxseSByZWFkLCB0aGUgcmVhZGVyIHNob3VsZCBiZSBhYmxlIHRvIHVuZGVyc3RhbmRcclxuICogRGVmaW5pdGlvbnMgd2l0aG91dCBncmVhdCBkaWZmaWN1bHRpZXMsIGFuZCwgY29uc2lkZXJpbmcgdGhlIHJlZHVjZWQgY29kZSBsZW5ndGhcclxuICogYW5kIHRoZSBpbXByb3ZlZCBjb2VyY2lvbiwgcmVhZGFiaWxpdHkgc2hvdWxkIGJlIGJldHRlci4gSG93ZXZlciwgZXhjZXB0aW9ucyBtaWdodFxyXG4gKiBleGlzdC5cclxuICogTWVhbndoaWxlLCBib3RoIHRoZSBoZWxwZXJzIGFuZCB0aGUgRGVmaW5pdGlvbiBjb2RlIGFyZSBjb25zaWRlcmVkIGludGVybmFsLCB0aGF0XHJcbiAqIGlzLCBvbmUgc2hvdWxkIHJlbHkgb24gdGhlIHByb2plY3QgV2lraSBmb3IgcmVmZXJlbmNlIGFuZCBkb2N1bWVudGF0aW9uIGluc3RlYWQgb2ZcclxuICogaW4tY29kZSBjb21tZW50cyB3aXRob3V0IGdvb2QgcmVhc29ucy5cclxuICogRm9yIGRvY3VtZW50YXRpb24gYWJvdXQgdGhlIGNvbmNlcHRzIERlZmluaXRpb24sIGNvbXBpbGUsIElucHV0LCBzZWUgY29tcGlsZS5qcy5cclxuICovXHJcblxyXG5jb25zdCB7XHJcbiAgICBpc0VtcHR5LFxyXG4gICAgbmVnYXRlLFxyXG4gICAgaXNTdHJpbmcsXHJcbiAgICBpc0Z1bmN0aW9uLFxyXG4gICAgaXNBcnJheSxcclxuICAgIGlzT2JqZWN0LFxyXG4gICAgZnJvbVBhaXJzLFxyXG4gICAgY2FtZWxDYXNlLFxyXG59ID0gcmVxdWlyZSgnbG9kYXNoJyk7XHJcblxyXG5jb25zdCBjb21waWxlID0gcmVxdWlyZSgnLi9jb21waWxlJyk7XHJcblxyXG4vKipcclxuICogQm9vbGlmeSBpbnB1dC5cclxuICogQXMgZGVmaW5lZCBpbiB0aGUgdGVzdCwgYXNGbGFnKCkgc2hvdWxkOlxyXG4gKiAtIHJldHVybiB0cnVlIGZvciB0cnVlLlxyXG4gKiAtIHJldHVybiBmYWxzZSBmb3IgZmFsc2UuXHJcbiAqIC0gcmV0dXJuIHRydWUgZm9yIDEuXHJcbiAqIC0gcmV0dXJuIHRydWUgZm9yIDAuXHJcbiAqIE90aGVyd2lzZSwgYmVoYXZpb3IgaXMgdW5kZWZpbmVkIGFuZCBub3QgdGVzdGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FueX0gaW5wdXQgVGhlIGlucHV0IHRvIGJvb2xpZnkuXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSBUaGUgYm9vbGlmaWVkIHJlc3VsdC5cclxuICovXHJcbmNvbnN0IGFzRmxhZyA9IGlucHV0ID0+ICEhaW5wdXQ7XHJcblxyXG4vKipcclxuICogUmV0dXJuIGFuIERlZmluaXRpb24gdGhhdCBleGVjdXRlcyB0aGUgc3BlY2lmaWVkIERlZmluaXRpb24gb24gdGhlIElucHV0IG1hcHBlZCB3aXRoIG1hcHBlci5cclxuICpcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWFwcGVyIFRoZSBmdW5jdGlvbiB1c2VkIHRvIG1hcCBJbnB1dC5cclxuICogQHBhcmFtIHthbnl9IGRlZiBUaGUgRGVmaW5pdGlvbi5cclxuICogQHJldHVybnMge0Z1bmN0aW9ufSBUaGUgcmV0dXJuZWQgRGVmaW5pdGlvbi5cclxuICovXHJcbmNvbnN0IG9uID0gKG1hcHBlciwgZGVmKSA9PiB7XHJcbiAgICBjb25zdCBjb21waWxlZCA9IGNvbXBpbGUoZGVmKTtcclxuICAgIHJldHVybiBpbnB1dCA9PiBjb21waWxlZChtYXBwZXIoaW5wdXQpKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gYW4gRGVmaW5pdGlvbiB0aGF0OlxyXG4gKiAtIGlmIHByZWRpY2F0ZShtYXBwZXIoaW5wdXQpKSByZXR1cm5zIHRydWUsIGV4ZWN1dGUgZGVmMSBvbiB0aGUgSW5wdXQgbWFwcGVkIHdpdGggbWFwcGVyLlxyXG4gKiAtIG90aGVyd2lzZSwgZXhlY3V0ZSBkZWYyIG9uIHRoZSBpbnB1dCBtYXBwZXIgd2l0aCBtYXBwZXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1hcHBlciBUaGUgZnVuY3Rpb24gdXNlZCB0byBtYXAgaW5wdXQuXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRpY2F0ZSBUaGUgZnVuY3Rpbm8gdXNlZCB0byBkZWNpZGUgd2hldGhlciB0aGUgRGVmaW5pdGlvbiBzaG91bGQgYmVcclxuICogICBleGVjdXRlZCBvciBub3QuXHJcbiAqIEBwYXJhbSB7YW55fSBkZWYxIFRoZSBEZWZpbml0aW9uIHVzZWQgd2hlbiBwcmVkaWNhdGUobWFwcGVyKGlucHV0KSkgaXMgdHJ1ZS5cclxuICogQHBhcmFtIHthbnl9IGRlZjIgVGhlIERlZmluaXRpbm8gdXNlZCB3aGVuIHByZWRpY2F0ZShtYXBwZXIoaW5wdXQpKSBpcyBmYWxzZS4gRGVmYXVsdCB0b1xyXG4gKiAgIG51bGwuXHJcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gVGhlIHJldHVybmVkIERlZmluaXRpb24uXHJcbiAqL1xyXG5jb25zdCBvbldoZW4gPSAobWFwcGVyLCBwcmVkaWNhdGUsIGRlZjEsIGRlZjIgPSBudWxsKSA9PiB7XHJcbiAgICBjb25zdCBjb21waWxlZDEgPSBjb21waWxlKGRlZjEpO1xyXG4gICAgY29uc3QgY29tcGlsZWQyID0gY29tcGlsZShkZWYyKTtcclxuICAgIHJldHVybiBvbihtYXBwZXIsIGlucHV0ID0+IChwcmVkaWNhdGUoaW5wdXQpID8gY29tcGlsZWQxKGlucHV0KSA6IGNvbXBpbGVkMihudWxsKSkpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybiBvbldoZW4obWFwcGVyLCBfLm5lZ2F0ZShfLmlzRW1wdHkpLCBkZWYpLlxyXG4gKiBTZWUgZG9jdW1lbnRhdGlvbiBvZiBsb2Rhc2ggZm9yIGRldGFpbHMuXHJcbiAqXHJcbiAqIFRoZSB0eXBpY2FsIHVzYWdlIG9mIG9uRXhpc3QgaXM6XHJcbiAqIG9uRXhpc3QoYSA9PiBhLmRhdGEsIHsgZm9vOiBkID0+IGQuZm9vIH0pO1xyXG4gKiBXaGljaCBlbnN1cmVzIHRoYXQsIGlmIGEuZGF0YSBpcyB1bmRlZmluZWQgb3Ige30sIGQgPT4gZC5mb28gd2lsbCBub3QgZXZlbiBiZSBleGVjdXRlZFxyXG4gKiBhbmQgbm8gRXJyb3IgaXMgdGhyb3duLlxyXG4gKiBIb3dldmVyIF8uaXNFbXB0eSgpIGlzIGp1c3QgYSB2ZXJ5IHNpbXBsZSBjaGVjaywgc28gdXNlIHRoaXMgbWV0aG9kIG9ubHkgd2hlbiBhcHBsaWNhYmxlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtYXBwZXIgVGhlIGZ1bmN0aW9uIHVzZWQgdG8gbWFwIGlucHV0LmVcclxuICogQHBhcmFtIHthbnl9IGRlZjEgVGhlIERlZmluaXRpb24gdXNlZCB3aGVuIHByZWRpY2F0ZShtYXBwZXIoaW5wdXQpKSBpcyB0cnVlLlxyXG4gKiBAcGFyYW0ge2FueX0gZGVmMiBUaGUgRGVmaW5pdGlubyB1c2VkIHdoZW4gcHJlZGljYXRlKG1hcHBlcihpbnB1dCkpIGlzIGZhbHNlLiBEZWZhdWx0IHRvXHJcbiAqICAgbnVsbC5cclxuICogQHJldHVybnMgVGhlIHJldHVybmVkIERlZmluaXRpb24uXHJcbiAqL1xyXG5jb25zdCBvbkV4aXN0ID0gKG1hcHBlciwgZGVmMSwgZGVmMikgPT4gb25XaGVuKG1hcHBlciwgbmVnYXRlKGlzRW1wdHkpLCBkZWYxLCBkZWYyKTtcclxuXHJcbi8qKlxyXG4gKiBUdXJuIGlucHV0IGludG8gYSBmdW5jdGlvbiB0aGF0IG1hcHMgaW5wdXQgdmFsdWUgdG8gZGVzaXJlZCB2YWx1ZS5cclxuICogVXNlZCBvbmx5IGluIGNvb252ZXJ0TmFtZXMoKS5cclxuICogQXMgZGVmaW5lZCBpbiB0aGUgdGVzdCwgdG9NYXBWYWwoKSBzaG91bGQ6XHJcbiAqIC0gcmV0dXJuIHVuY2hhbmdlZCBmb3IgYSBmdW5jdGlvbi5cclxuICogLSByZXR1cm4gdiA9PiB2IG90aGVyd2lzZS5cclxuICpcclxuICogQHBhcmFtIHthbnl9IGlucHV0IFRoZSBpbnB1dCB0byB0dXJuIGludG8gYSBmdW5jdGlvbi5cclxuICogQHJldHVybnMge0Z1bmN0aW9ufSBUaGUgcmV0dXJuZWQgZnVuY3Rpb24uXHJcbiAqL1xyXG5jb25zdCB0b01hcFZhbCA9IChpbnB1dCkgPT4ge1xyXG4gICAgaWYgKGlzRnVuY3Rpb24oaW5wdXQpKSByZXR1cm4gaW5wdXQ7XHJcbiAgICByZXR1cm4gdiA9PiB2O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFR1cm4gaW5wdXQgaW50byBhIGZ1bmN0aW9uIHRoYXQgbWFwcyBrZXkgdG8gZGVzaXJlZCBrZXkuXHJcbiAqIFVzZWQgb25seSBpbiBjb252ZXJ0TmFtZXMoKS5cclxuICogQXMgZGVmaW5lZCBpbiB0aGUgdGVzdC4gdG9NYXBLZXkoKSBzaG91bGQ6XHJcbiAqIC0gcmV0dXJuIHVuY2hhbmdlZCBmb3IgYSBmdW5jdGlvbi5cclxuICogLSByZXR1cm4gKCkgPT4gc3JjIGZvciBhIHN0cmluZyBzdHIuXHJcbiAqIC0gcmV0dXJuIF8uY2FtZWxDYXNlIG90aGVyd2lzZS5cclxuICogXy5jYW1lbENhc2UgaXMgdXNlZCBvbmx5IGZvciB0aGUgY29udmVuaWVuY2Ugb2YgRGVmaW5pdGlvbnMgaW4gZGVmaW5pdGlvbnMuanMsXHJcbiAqIGFuZCBpcyBkdWUgdG8gY2hhbmdlIGFzIHRoZSBEZWZpbml0aW9ucyBldm9sdmVzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FueX0gaW5wdXQgVGhlIGlucHV0IHRvIHR1cm4gaW50byBhIGZ1bmN0aW9uLlxyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFRoZSByZXR1cm5lZCBmdW5jdGlvbi5cclxuICovXHJcbmNvbnN0IHRvTWFwS2V5ID0gKGlucHV0KSA9PiB7XHJcbiAgICBpZiAoaXNGdW5jdGlvbihpbnB1dCkpIHJldHVybiBpbnB1dDtcclxuICAgIGlmIChpc1N0cmluZyhpbnB1dCkpIHJldHVybiAoKSA9PiBpbnB1dDtcclxuICAgIHJldHVybiBjYW1lbENhc2U7XHJcbn07XHJcblxyXG4vKipcclxuICogVHVybiBhcnJheSBvZiBpbnB1dCBpbnRvIGFuIHsgbmFtZTogc3RyaW5nLCBtYXBWYWw6IEZ1bmN0aW9uLCBtYXBLZXk6IEZ1bmN0aW9uIH0uXHJcbiAqIFRoaXMgbWV0aG9kIGlzIGltcGxlbWVudHMgdGhlIGNvbW1vbiBsb2dpY3MgaW4gc3ByZWFkKCkgYW5kIHNwcmVhZE9iaigpLlxyXG4gKiBUaGUgYmVoYXZpb3Igb2YgdGhpcyBtZXRob2QgaXMgdGhlIGNvbnZlbmllbmNlIG9mIERlZmluaXRpb25zIGluIGRlZmluaXRpb25zLmpzLFxyXG4gKiBhbmQgaXMgZHVlIHRvIGNoYW5nZSBhcyB0aGUgRGVmaW5pdGlvbnMgZXZvbHZlcy5cclxuICogSW4gc2hvcnQsIGl0IHN1cHBvcnRzIGEgY29udmVuaWVudCB3YXkgdG8gZXh0cmFjdCBkYXRhIGZyb20gSW5wdXQgYXJyYXlzIG9yIG9iamVjdHMsXHJcbiAqIHByb2JhYmx5IGNoYW5naW5nIHRoZSB2YWx1ZSBhbmQgdGhlIGtleSB3aXRoIGEgbWFwcGVyIGZ1bmN0aW9uLCBhbmQgdXNpbmcgdGhlXHJcbiAqIG1hcHBlZCBrZXkgYW5kIHZhbHVlIHRvIGNyZWF0ZSBhIFByb3BlcnR5IERlZmluaXRpb24uXHJcbiAqIEluIHRoZSBtZWFud2hpbGUsIGNvbnZlcnROYW1lcygpIHByb3ZpZGVzIGRlZmF1bHQgdmFsdWVzIHRvIGVuYWJsZSBjcmVhdGluZyBQcm9wZXJ0eVxyXG4gKiBEZWZpbml0aW9ucyBzaW1wbHkgYW5kIHNob3J0bHkuXHJcbiAqIEl0cyBkZXRhaWxlZCBiZWhhdmlvciBpcywgbWFwIGVhY2ggbmFtZSBvZiBuYW1lcyB3aXRoOlxyXG4gKiAtIElmIG5hbWUgaXMgYSBzdHJpbmcsIG1hcCBbbmFtZSwgdW5kZWZpbmVkLCB1bmRlZmluZWRdIGluc3RlYWQuXHJcbiAqIC0gSWYgbmFtZSBpcyBhbiBBcnJheSwgcmV0dXJuIHsgbmFtZTogbmFtZVswXSwgbWFwVmFsOiB0b01hcFZhbChuYW1lWzFdKSwgbWFwS2V5OiBuYW1lWzJdIH0uXHJcbiAqIC0gT3RoZXJ3aXNlLCByZXR1cm4gbnVsbC5cclxuICogVGhlIHJldHVybiB2YWx1ZSBpcyBhbiBhcnJheSwgZWFjaCBlbGVtZW50IGJlaW5nIGVpdGhlcjpcclxuICogLSBBbiBvYmplY3Qgd2l0aCB7IG5hbWU6IHN0cmluZywgbWFwVmFsOiBGdW5jdGlvbiwgbWFwS2V5OiBGdW5jdGlvbiB9LlxyXG4gKiAtIE9yIG51bGwuXHJcbiAqIEVhY2ggZWxlbWVudCBvZiB0aGUgcmV0dXJuIHZhbHVlIGNvcnJlc3BvbmRzIHRvIHRoZSBlbGVtZW50IGluIG5hbWVzIG9mIHRoZSBzYW1lIGluZGV4LFxyXG4gKiB3aGljaCBlbmFibGVzIHRoZSBmdW5jaW9uYWxpdHkgb2Ygc3ByZWFkKCkuXHJcbiAqXHJcbiAqIEBwYXJhbSB7KHN0cmluZyB8IEFycmF5IHwgKilbXX0gbmFtZXMgVGhlIG5hbWVzIHRvIGNvbnZlcnQuXHJcbiAqIEByZXR1cm5zIHsoT2JqZWN0IHwgbnVsbClbXX0gVGhlIGNvbnZlcnRlZCBuYW1lcy5cclxuICogQHNlZSAjdG9NYXBLZXlcclxuICogQHNlZSAjdG9NYXBWYWxcclxuICogQHNlZSAjc3ByZWFkXHJcbiAqIEBzZWUgI3NwcmVhZE9ialxyXG4gKi9cclxuY29uc3QgY29udmVydE5hbWVzID0gKC4uLm5hbWVzKSA9PiBuYW1lc1xyXG4gICAgLm1hcChuYW1lID0+IChpc1N0cmluZyhuYW1lKSA/IFtuYW1lXSA6IG5hbWUpKVxyXG4gICAgLm1hcChjb21waWxlKG9uV2hlbihhID0+IGEsIGlzQXJyYXksIHtcclxuICAgICAgICBuYW1lOiBhID0+IGFbMF0sXHJcbiAgICAgICAgbWFwVmFsOiBhID0+IHRvTWFwVmFsKGFbMV0pLFxyXG4gICAgICAgIG1hcEtleTogYSA9PiB0b01hcEtleShhWzJdKSxcclxuICAgIH0pKSk7XHJcblxyXG4vKipcclxuICogUmV0dXJuIGEgRGVmaW5pdGlvbiB3aGljaCBzcHJlYWQgdGhlIGdpdmVuIG5hbWVzLlxyXG4gKiBUaGUgYmVoYXZpb3Igb2YgdGhpcyBtZXRob2QgaXMgdGhlIGNvbnZlbmllbmNlIG9mIERlZmluaXRpb25zIGluIGRlZmluaXRpb25zLmpzLFxyXG4gKiBhbmQgaXMgZHVlIHRvIGNoYW5nZSBhcyB0aGUgRGVmaW5pdGlvbnMgZXZvbHZlcy5cclxuICogVGhlIG5hbWUgc3ByZWFkIGNvbWVzIGZyb20gdGhlIHNwcmVhZCBzeW50YXggb2YgRUNNQVNjcmlwdCwgc2luY2UgdGhpcyBtZXRob2RcclxuICogdmFndWVseSBleHByZXNzZXMgdGhlIHNhbWUgaWRlYS5cclxuICogVGhpcyBtZXRob2Qgc3ByZWFkcyB0aGUgZ2l2ZW4gbmFtZXMgaW50byBhbiBvYmplY3QgdG8gY3JlYXRlIGFuIERlZmluaXRpb24uXHJcbiAqIFR5cGljYWxseSwgaXQgaXMgdXNlZCBhcyBmb2xsb3dzOlxyXG4gKiBjb25zdCBkZWYgPSBzcHJlYWQoJ2ZvbycsIFsnYmFyJywgcGFyc2VJbnRdLCAwLCBbJ2JheicsIDAsICdmb29CYXInXSwgWydiYWRfY2FzZScsIDBdKTtcclxuICogQW5kIHVzaW5nIGRlZiB0byBwYXJzZTpcclxuICogWycxJywgJzInLCAnMycsICc0JywgJzUnXVxyXG4gKiB5b3Ugd2lsbCBnZXQ6XHJcbiAqIHsgZm9vOiAnMScsIGJhcjogMiwgZm9vQmFyOiAnNCcsIGJhZENhc2U6ICc1JyB9XHJcbiAqIEV4cGxhbmF0aW9ucy5cclxuICogVGhlIGFyZ3VtZW50cyBhcmUgdXNlZCBsaWtlIG1hcHBlcnMuIFdoZW4gdGhlIHJldHVybmVkIERlZmluaXRpb24gZ2V0cyBhbiBhcnJheSBpbnB1dCxcclxuICogaXQgbWFwcyB0aGUgZWxlbWVudHMgYW5kIHJldHVybiBhbiBvYmplY3QuXHJcbiAqIEFzIHlvdSBjYW4gc2VlLCBnaXZpbmcgYSBzaW1wbGUgJ2Zvbycgc2V0cyB0aGUgJ2ZvbycgcHJvcGVydHkgd2l0aCB0aGUgdmFsdWUgb2YgaW5wdXRbMF0sXHJcbiAqIEdpdmluZyBbJ2JhcicsIHBhcnNlSW50XSBzZXRzIHRoZSAnYmFyJyBwcm9wZXJ0eSB3aXRoIHBhcnNlSW50KGlucHV0WzFdKS5cclxuICogR2l2aW5nIDAgaWdub3JlcyB0aGUgaW5wdXQgZWxlbWVudCwgdGhhdCBpcywgaW5wdXRbMl0uICgwIGlzIHVzZWQgb25seSBiZWNhdXNlIGl0IGlzIHNob3J0KVxyXG4gKiBHaXZpbmcgWydiYXonLCAwLCAnZm9vQmFyJ10gc2V0cyB0aGUgJ2Zvb0JhcicgcHJvcGVydHkgd2l0aCBpbnB1dFszXSwgd2hlcmUgMCBzcGVjaWZpZXNcclxuICogaW5wdXRbM10gaXMgbm90IG1hcHBlZCBhbmQgcmV0dXJuZWQgZGlyZWN0bHksICdmb29CYXInIGlzIHRoZSBmaW5hbCBwcm9wZXJ0eSBuYW1lLCBhbmRcclxuICogJ2ZvbycgaXMgaWdub3JlZC4gKEJ1dCB0aGlzIHdpbGwgYmUgZGlmZmVyZW50IGluIHNwcmVhZE9iaigpKS5cclxuICogR2l2aW5nIFsnYmFkX2Nhc2UnLCAwXSBzZXRzIHRoZSAnYmFkQ2FzZScgcHJvcGVydHkgd2l0aCBpbnB1dFs0XSwgd2hlcmUgMCBzcGVjaWZpZXNcclxuICogdGhhdCBpbnB1dFs0XSBpcyBub3QgbWFwcGVkLCAnYmFkX2Nhc2UnIGlzIHVzZWQgdG8gcHJvZHVjZSB0aGUgcHJvcGVydHkgbmFtZSAnYmFkQ2FzZSdcclxuICogKGJ5IGNvbnZlcnRpbmcgaXQgaW50byBjYW1lbENhc2Ugd2hlbiBubyBjb252ZXJ0IGZ1bmN0aW9uIGlzIHNwZWNpZmllZCwgc2VlIHRvTWFwS2V5KCkpLlxyXG4gKiBXaGVuIHVzaW5nIHNwcmVhZCgpLCB0aGUgbGFzdCAyIHN5bnRheGVzIGFyZSByYXJlbHkgdXNlZCwgYnV0IHRoZXkgZG8gaGF2ZSB0aGVpciByZWFzb25cclxuICogb2YgZXhpc3RlbmNlIGluIHNwcmVhZE9iaigpLlxyXG4gKiBJbiBzaG9ydCwgaXQgdXNlcyBjb252ZXJ0TmFtZXMoKSwgaWdub3JlcyBudWxsIHJldHVybiBlbGVtZW50cywgYW5kIHJldHVybnMgYSBEZWZpbml0b25cclxuICogdGhhdCBtYXBzIGV2ZXJ5IGlucHV0IGVsZW1lbnQgaW50byBhIHByb3BlcnR5IG9mIHRoZSByZXR1cm5lZCBvYmplY3QuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YW55W119IG5hbWVzIFRoZSBuYW1lcyB0byBzcHJlYWQuXHJcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gVGhlIHJldHVybmVkIERlZmluaXRpb24uXHJcbiAqIEBzZWUgI2NvbnZlcnROYW1lc1xyXG4gKiBAc2VlICNzcHJlYWRPYmpcclxuICovXHJcbmNvbnN0IHNwcmVhZCA9ICguLi5uYW1lcykgPT5cclxuICAgIGZyb21QYWlycyhjb252ZXJ0TmFtZXMoLi4ubmFtZXMpXHJcbiAgICAgICAgLm1hcCgoY29udmVydGVkLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWlzT2JqZWN0KGNvbnZlcnRlZCkpIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgbmFtZSwgbWFwVmFsLCBtYXBLZXkgfSA9IGNvbnZlcnRlZDtcclxuICAgICAgICAgICAgcmV0dXJuIFttYXBLZXkobmFtZSksIGEgPT4gbWFwVmFsKGFbaW5kZXhdKV07XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZmlsdGVyKGlzQXJyYXkpKTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gYSBEZWZpbml0aW9uIHdoaWNoIHNwcmVhZCB0aGUgZ2l2ZW4gbmFtZXMuXHJcbiAqIFRoZSBiZWhhdmlvciBvZiB0aGlzIG1ldGhvZCBpcyB0aGUgY29udmVuaWVuY2Ugb2YgRGVmaW5pdGlvbnMgaW4gZGVmaW5pdGlvbnMuanMsXHJcbiAqIGFuZCBpcyBkdWUgdG8gY2hhbmdlIGFzIHRoZSBEZWZpbml0aW9ucyBldm9sdmVzLlxyXG4gKiBUaGUgbmFtZSBzcHJlYWQgY29tZXMgZnJvbSB0aGUgb2JqZWN0IHNwcmVhZCBzeW50YXggb2YgRUNNQVNjcmlwdCwgc2luY2UgdGhpcyBtZXRob2RcclxuICogdmFndWVseSBleHByZXNzZXMgdGhlIHNhbWUgaWRlYS5cclxuICogVGhpcyBtZXRob2Qgc3ByZWFkcyB0aGUgZ2l2ZW4gbmFtZXMgaW50byBhbiBvYmplY3QgdG8gY3JlYXRlIGFuIERlZmluaXRpb24uXHJcbiAqIFR5cGljYWxseSwgaXQgaXMgdXNlZCBhcyBmb2xsb3dzOlxyXG4gKiBjb25zdCBkZWYgPSBzcHJlYWRPYmooJ2ZvbycsIFsnYmFyJywgcGFyc2VJbnRdLCAwLCBbJ2JheicsIDAsICdmb29CYXInXSwgWydiYWRfY2FzZScsIDBdKTtcclxuICogQW5kIHVzaW5nIGRlZiB0byBwYXJzZTpcclxuICogeyBmb286ICcxJywgYmFyOiAnMicsIGJhYTogJzMnLCBiYXo6ICc0JywgYmFkX2Nhc2U6ICc1JyB9XHJcbiAqIHlvdSB3aWxsIGdldDpcclxuICogeyBmb286ICcxJywgYmFyOiAyLCBmb29CYXI6ICc0JywgYmFkQ2FzZTogJzUnIH1cclxuICogRXhwbGFuYXRpb25zLlxyXG4gKiBUaGUgYXJndW1lbnRzIGFyZSB1c2VkIGxpa2UgbWFwcGVycy4gV2hlbiB0aGUgcmV0dXJuZWQgRGVmaW5pdGlvbiBnZXRzIGFuIG9iamVjdCBpbnB1dCxcclxuICogaXQgbWFwcyB0aGUgcHJvcGVydGllcyBhbmQgcmV0dXJuIGFub3RoZXIgb2JqZWN0LlxyXG4gKiBBcyB5b3UgY2FuIHNlZSwgZ2l2aW5nIGEgc2ltcGxlICdmb28nIHNldHMgdGhlICdmb28nIHByb3BlcnR5IHdpdGggdGhlIHZhbHVlIG9mIGlucHV0LmZvbyxcclxuICogR2l2aW5nIFsnYmFyJywgcGFyc2VJbnRdIHNldHMgdGhlICdiYXInIHByb3BlcnR5IHdpdGggcGFyc2VJbnQoaW5wdXQuYmFyKS5cclxuICogR2l2aW5nIDAgd2lsbCBiZSBtZWFuaW5nbGVzcywgdGhpcyBzeW50YXggaXMgb25seSBhdmFpbGFibGUgaW4gc3ByZWFkKCkuXHJcbiAqIEdpdmluZyBbJ2JheicsIDAsICdmb29CYXInXSBzZXRzIHRoZSAnZm9vQmFyJyBwcm9wZXJ0eSB3aXRoIGlucHV0LmJheiwgd2hlcmUgMCBzcGVjaWZpZXNcclxuICogaW5wdXQuYmF6IGlzIG5vdCBtYXBwZWQgYW5kIHJldHVybmVkIGRpcmVjdGx5LiAoMCBpcyB1c2VkIG9ubHkgYmVjYXVzZSBpdCBpcyBzaG9ydCwgYW55XHJcbiAqIG5vbi1zdHJpbmcgYW5kIG5vbi1BcnJheSB2YWx1ZSB3aWxsIGhhdmUgdGhlIHNhbWUgZWZmZWN0KSAnZm9vQmFyJyBpcyB0aGUgZmluYWwgcHJvcGVydHlcclxuICogbmFtZSwgYW5kICdiYXonIGlzIHRoZSBwcm9wZXJ0eSBuYW1lIGluIGlucHV0LlxyXG4gKiBHaXZpbmcgWydiYWRfY2FzZScsIDBdIHNldHMgdGhlICdiYWRDYXNlJyBwcm9wZXJ0eSB3aXRoIGlucHV0LmJhZF9jYXNlLCB3aGVyZSAwIHNwZWNpZmllc1xyXG4gKiB0aGF0IGlucHV0LmZvb19iYXIgaXMgbm90IG1hcHBlZCwgJ2JhZF9jYXNlJyB0aGUgcHJvcGVydHkgbmFtZSBpbiBpbnB1dCBhbmQgJ2JhZENhc2UnIGlzXHJcbiAqIHRoZSBjYW1lbENhc2Ugb2YgJ2JhZF9jYXNlJy4gKFRoaXMgaXMgdGhlIGRlZmF1bHQgYmVoYXZpb3Igc2luY2UgdGhlIGtleSBtYXBwZXIgaXMgbm90XHJcbiAqIHNwZWNpZmllZC4gU2VlIHRvTWFwS2V5KCkgZm9yIGRldGFpbHMpLlxyXG4gKiBXaGVuIHVzaW5nIHNwcmVhZCgpLCB0aGUgdGhpcmQgc3ludGF4IGlzIHJhcmVseSB1c2VkLCBidXQgaXQgaXMgdXNlZnVsIGluIHNwcmVhZE9iaigpLlxyXG4gKiBJbiBzaG9ydCwgaXQgdXNlcyBjb252ZXJ0TmFtZXMoKSwgYW5kIHJldHVybnMgYSBEZWZpbml0b24gdGhhdCBtYXBzIGV2ZXJ5IGlucHV0IHByb3BlcnR5XHJcbiAqIGludG8gYSBwcm9wZXJ0eSBvZiB0aGUgcmV0dXJuZWQgb2JqZWN0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FueVtdfSBuYW1lcyBUaGUgbmFtZXMgdG8gc3ByZWFkLlxyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFRoZSByZXR1cm5lZCBEZWZpbml0aW9uLlxyXG4gKiBAc2VlICNjb252ZXJ0TmFtZXNcclxuICogQHNlZSAjc3ByZWFkXHJcbiAqL1xyXG5jb25zdCBzcHJlYWRPYmogPSAoLi4ubmFtZXMpID0+XHJcbiAgICBmcm9tUGFpcnMoY29udmVydE5hbWVzKC4uLm5hbWVzKVxyXG4gICAgICAgIC5maWx0ZXIoaXNPYmplY3QpXHJcbiAgICAgICAgLm1hcCgoeyBuYW1lLCBtYXBWYWwsIG1hcEtleSB9KSA9PiBbbWFwS2V5KG5hbWUpLCBvID0+IG1hcFZhbChvW25hbWVdKV0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgYXNGbGFnLFxyXG4gICAgb25XaGVuLFxyXG4gICAgb24sXHJcbiAgICBvbkV4aXN0LFxyXG4gICAgdG9NYXBWYWwsXHJcbiAgICB0b01hcEtleSxcclxuICAgIGNvbnZlcnROYW1lcyxcclxuICAgIHNwcmVhZCxcclxuICAgIHNwcmVhZE9iaixcclxufTtcclxuIl19