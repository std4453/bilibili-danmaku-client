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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcHBsaWNhdGlvbi9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJpc0VtcHR5IiwibmVnYXRlIiwiaXNTdHJpbmciLCJpc0Z1bmN0aW9uIiwiaXNBcnJheSIsImlzT2JqZWN0IiwiZnJvbVBhaXJzIiwiY2FtZWxDYXNlIiwiY29tcGlsZSIsImFzRmxhZyIsImlucHV0Iiwib24iLCJtYXBwZXIiLCJkZWYiLCJjb21waWxlZCIsIm9uV2hlbiIsInByZWRpY2F0ZSIsImRlZjEiLCJkZWYyIiwiY29tcGlsZWQxIiwiY29tcGlsZWQyIiwib25FeGlzdCIsInRvTWFwVmFsIiwidiIsInRvTWFwS2V5IiwiY29udmVydE5hbWVzIiwibmFtZXMiLCJtYXAiLCJuYW1lIiwiYSIsIm1hcFZhbCIsIm1hcEtleSIsInNwcmVhZCIsImNvbnZlcnRlZCIsImluZGV4IiwidW5kZWZpbmVkIiwiZmlsdGVyIiwic3ByZWFkT2JqIiwibyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7O2VBd0JJQSxRQUFRLFFBQVIsQztJQVJBQyxPLFlBQUFBLE87SUFDQUMsTSxZQUFBQSxNO0lBQ0FDLFEsWUFBQUEsUTtJQUNBQyxVLFlBQUFBLFU7SUFDQUMsTyxZQUFBQSxPO0lBQ0FDLFEsWUFBQUEsUTtJQUNBQyxTLFlBQUFBLFM7SUFDQUMsUyxZQUFBQSxTOztBQUdKLElBQU1DLFVBQVVULFFBQVEsV0FBUixDQUFoQjtBQUVBOzs7Ozs7Ozs7Ozs7OztBQVlBLElBQU1VLFNBQVMsU0FBVEEsTUFBUztBQUFBLFNBQVMsQ0FBQyxDQUFDQyxLQUFYO0FBQUEsQ0FBZjtBQUVBOzs7Ozs7Ozs7QUFPQSxJQUFNQyxLQUFLLFNBQUxBLEVBQUssQ0FBQ0MsTUFBRCxFQUFTQyxHQUFULEVBQWlCO0FBQ3hCLE1BQU1DLFdBQVdOLFFBQVFLLEdBQVIsQ0FBakI7QUFDQSxTQUFPO0FBQUEsV0FBU0MsU0FBU0YsT0FBT0YsS0FBUCxDQUFULENBQVQ7QUFBQSxHQUFQO0FBQ0gsQ0FIRDtBQUtBOzs7Ozs7Ozs7Ozs7Ozs7QUFhQSxJQUFNSyxTQUFTLFNBQVRBLE1BQVMsQ0FBQ0gsTUFBRCxFQUFTSSxTQUFULEVBQW9CQyxJQUFwQixFQUEwQkMsSUFBMUIsRUFBMEM7QUFBQSxNQUFoQkEsSUFBZ0I7QUFBaEJBLFFBQWdCLEdBQVQsSUFBUztBQUFBOztBQUNyRCxNQUFNQyxZQUFZWCxRQUFRUyxJQUFSLENBQWxCO0FBQ0EsTUFBTUcsWUFBWVosUUFBUVUsSUFBUixDQUFsQjtBQUNBLFNBQU9QLEdBQUdDLE1BQUgsRUFBVztBQUFBLFdBQVVJLFVBQVVOLEtBQVYsSUFBbUJTLFVBQVVULEtBQVYsQ0FBbkIsR0FBc0NVLFVBQVUsSUFBVixDQUFoRDtBQUFBLEdBQVgsQ0FBUDtBQUNILENBSkQ7QUFNQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBLElBQU1DLFVBQVUsU0FBVkEsT0FBVSxDQUFDVCxNQUFELEVBQVNLLElBQVQsRUFBZUMsSUFBZjtBQUFBLFNBQXdCSCxPQUFPSCxNQUFQLEVBQWVYLE9BQU9ELE9BQVAsQ0FBZixFQUFnQ2lCLElBQWhDLEVBQXNDQyxJQUF0QyxDQUF4QjtBQUFBLENBQWhCO0FBRUE7Ozs7Ozs7Ozs7OztBQVVBLElBQU1JLFdBQVcsU0FBWEEsUUFBVyxDQUFDWixLQUFELEVBQVc7QUFDeEIsTUFBSVAsV0FBV08sS0FBWCxDQUFKLEVBQXVCLE9BQU9BLEtBQVA7QUFDdkIsU0FBTztBQUFBLFdBQUthLENBQUw7QUFBQSxHQUFQO0FBQ0gsQ0FIRDtBQUtBOzs7Ozs7Ozs7Ozs7Ozs7QUFhQSxJQUFNQyxXQUFXLFNBQVhBLFFBQVcsQ0FBQ2QsS0FBRCxFQUFXO0FBQ3hCLE1BQUlQLFdBQVdPLEtBQVgsQ0FBSixFQUF1QixPQUFPQSxLQUFQO0FBQ3ZCLE1BQUlSLFNBQVNRLEtBQVQsQ0FBSixFQUFxQixPQUFPO0FBQUEsV0FBTUEsS0FBTjtBQUFBLEdBQVA7QUFDckIsU0FBT0gsU0FBUDtBQUNILENBSkQ7QUFNQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEyQkEsSUFBTWtCLGVBQWUsU0FBZkEsWUFBZTtBQUFBLG9DQUFJQyxLQUFKO0FBQUlBLFNBQUo7QUFBQTs7QUFBQSxTQUFjQSxNQUM5QkMsR0FEOEIsQ0FDMUI7QUFBQSxXQUFTekIsU0FBUzBCLElBQVQsSUFBaUIsQ0FBQ0EsSUFBRCxDQUFqQixHQUEwQkEsSUFBbkM7QUFBQSxHQUQwQixFQUU5QkQsR0FGOEIsQ0FFMUJuQixRQUFRTyxPQUFPO0FBQUEsV0FBS2MsQ0FBTDtBQUFBLEdBQVAsRUFBZXpCLE9BQWYsRUFBd0I7QUFDakN3QixVQUFNO0FBQUEsYUFBS0MsRUFBRSxDQUFGLENBQUw7QUFBQSxLQUQyQjtBQUVqQ0MsWUFBUTtBQUFBLGFBQUtSLFNBQVNPLEVBQUUsQ0FBRixDQUFULENBQUw7QUFBQSxLQUZ5QjtBQUdqQ0UsWUFBUTtBQUFBLGFBQUtQLFNBQVNLLEVBQUUsQ0FBRixDQUFULENBQUw7QUFBQTtBQUh5QixHQUF4QixDQUFSLENBRjBCLENBQWQ7QUFBQSxDQUFyQjtBQVFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUNBLElBQU1HLFNBQVMsU0FBVEEsTUFBUztBQUFBLFNBQ1gxQixVQUFVbUIsc0NBQ0xFLEdBREssQ0FDRCxVQUFDTSxTQUFELEVBQVlDLEtBQVosRUFBc0I7QUFDdkIsUUFBSSxDQUFDN0IsU0FBUzRCLFNBQVQsQ0FBTCxFQUEwQixPQUFPRSxTQUFQO0FBREgsUUFFZlAsSUFGZSxHQUVVSyxTQUZWLENBRWZMLElBRmU7QUFBQSxRQUVURSxNQUZTLEdBRVVHLFNBRlYsQ0FFVEgsTUFGUztBQUFBLFFBRURDLE1BRkMsR0FFVUUsU0FGVixDQUVERixNQUZDO0FBR3ZCLFdBQU8sQ0FBQ0EsT0FBT0gsSUFBUCxDQUFELEVBQWU7QUFBQSxhQUFLRSxPQUFPRCxFQUFFSyxLQUFGLENBQVAsQ0FBTDtBQUFBLEtBQWYsQ0FBUDtBQUNILEdBTEssRUFNTEUsTUFOSyxDQU1FaEMsT0FORixDQUFWLENBRFc7QUFBQSxDQUFmO0FBU0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0NBLElBQU1pQyxZQUFZLFNBQVpBLFNBQVk7QUFBQSxTQUNkL0IsVUFBVW1CLHNDQUNMVyxNQURLLENBQ0UvQixRQURGLEVBRUxzQixHQUZLLENBRUQ7QUFBQSxRQUFHQyxJQUFILFFBQUdBLElBQUg7QUFBQSxRQUFTRSxNQUFULFFBQVNBLE1BQVQ7QUFBQSxRQUFpQkMsTUFBakIsUUFBaUJBLE1BQWpCO0FBQUEsV0FBOEIsQ0FBQ0EsT0FBT0gsSUFBUCxDQUFELEVBQWU7QUFBQSxhQUFLRSxPQUFPUSxFQUFFVixJQUFGLENBQVAsQ0FBTDtBQUFBLEtBQWYsQ0FBOUI7QUFBQSxHQUZDLENBQVYsQ0FEYztBQUFBLENBQWxCOztBQUtBVyxPQUFPQyxPQUFQLEdBQWlCO0FBQ2IvQixnQkFEYTtBQUViTSxnQkFGYTtBQUdiSixRQUhhO0FBSWJVLGtCQUphO0FBS2JDLG9CQUxhO0FBTWJFLG9CQU5hO0FBT2JDLDRCQVBhO0FBUWJPLGdCQVJhO0FBU2JLO0FBVGEsQ0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogVGhlIGhlbHBlcnMgdXNlZCB3aGlsZSBtYWtpbmcgRGVmaW5pdGlvbnMuXHJcbiAqIFRoZXkgYXJlIG1vc3RseSB1c2VkIHRvIHNpbXBsaWZ5IGNvZGUgb2YgRGVmaW5pdGlvbnMgYW5kIGFjY2VsZXJhdGUgZGV2ZWxvcG1lbnQuXHJcbiAqIFdoZXRoZXIgdGhlc2UgaGVscGVycyBtYWtlIGNvZGUgZWFzaWVyIHRvIHJlYWQgZGVwZW5kcyBvbiB3aGV0aGVyIHRoZSByZWFkZXJcclxuICogaGFzIGEgZ29vZCB1bmRlcnN0YW5kaW5nIG9mIHRoZSBoZWxwZXIgbWV0aG9kcy4gSW4gbW9zdCBjYXNlcywgaXMgdGhlIGRvY3VtZW50YXRpb25cclxuICogb2YgdGhlIGhlbHBlciBtZXRob2RzIGFyZSBjYXJlZnVsbHkgcmVhZCwgdGhlIHJlYWRlciBzaG91bGQgYmUgYWJsZSB0byB1bmRlcnN0YW5kXHJcbiAqIERlZmluaXRpb25zIHdpdGhvdXQgZ3JlYXQgZGlmZmljdWx0aWVzLCBhbmQsIGNvbnNpZGVyaW5nIHRoZSByZWR1Y2VkIGNvZGUgbGVuZ3RoXHJcbiAqIGFuZCB0aGUgaW1wcm92ZWQgY29lcmNpb24sIHJlYWRhYmlsaXR5IHNob3VsZCBiZSBiZXR0ZXIuIEhvd2V2ZXIsIGV4Y2VwdGlvbnMgbWlnaHRcclxuICogZXhpc3QuXHJcbiAqIE1lYW53aGlsZSwgYm90aCB0aGUgaGVscGVycyBhbmQgdGhlIERlZmluaXRpb24gY29kZSBhcmUgY29uc2lkZXJlZCBpbnRlcm5hbCwgdGhhdFxyXG4gKiBpcywgb25lIHNob3VsZCByZWx5IG9uIHRoZSBwcm9qZWN0IFdpa2kgZm9yIHJlZmVyZW5jZSBhbmQgZG9jdW1lbnRhdGlvbiBpbnN0ZWFkIG9mXHJcbiAqIGluLWNvZGUgY29tbWVudHMgd2l0aG91dCBnb29kIHJlYXNvbnMuXHJcbiAqIEZvciBkb2N1bWVudGF0aW9uIGFib3V0IHRoZSBjb25jZXB0cyBEZWZpbml0aW9uLCBjb21waWxlLCBJbnB1dCwgc2VlIGNvbXBpbGUuanMuXHJcbiAqL1xyXG5cclxuY29uc3Qge1xyXG4gICAgaXNFbXB0eSxcclxuICAgIG5lZ2F0ZSxcclxuICAgIGlzU3RyaW5nLFxyXG4gICAgaXNGdW5jdGlvbixcclxuICAgIGlzQXJyYXksXHJcbiAgICBpc09iamVjdCxcclxuICAgIGZyb21QYWlycyxcclxuICAgIGNhbWVsQ2FzZSxcclxufSA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xyXG5cclxuY29uc3QgY29tcGlsZSA9IHJlcXVpcmUoJy4vY29tcGlsZScpO1xyXG5cclxuLyoqXHJcbiAqIEJvb2xpZnkgaW5wdXQuXHJcbiAqIEFzIGRlZmluZWQgaW4gdGhlIHRlc3QsIGFzRmxhZygpIHNob3VsZDpcclxuICogLSByZXR1cm4gdHJ1ZSBmb3IgdHJ1ZS5cclxuICogLSByZXR1cm4gZmFsc2UgZm9yIGZhbHNlLlxyXG4gKiAtIHJldHVybiB0cnVlIGZvciAxLlxyXG4gKiAtIHJldHVybiB0cnVlIGZvciAwLlxyXG4gKiBPdGhlcndpc2UsIGJlaGF2aW9yIGlzIHVuZGVmaW5lZCBhbmQgbm90IHRlc3RlZC5cclxuICpcclxuICogQHBhcmFtIHthbnl9IGlucHV0IFRoZSBpbnB1dCB0byBib29saWZ5LlxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVGhlIGJvb2xpZmllZCByZXN1bHQuXHJcbiAqL1xyXG5jb25zdCBhc0ZsYWcgPSBpbnB1dCA9PiAhIWlucHV0O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybiBhbiBEZWZpbml0aW9uIHRoYXQgZXhlY3V0ZXMgdGhlIHNwZWNpZmllZCBEZWZpbml0aW9uIG9uIHRoZSBJbnB1dCBtYXBwZWQgd2l0aCBtYXBwZXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1hcHBlciBUaGUgZnVuY3Rpb24gdXNlZCB0byBtYXAgSW5wdXQuXHJcbiAqIEBwYXJhbSB7YW55fSBkZWYgVGhlIERlZmluaXRpb24uXHJcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gVGhlIHJldHVybmVkIERlZmluaXRpb24uXHJcbiAqL1xyXG5jb25zdCBvbiA9IChtYXBwZXIsIGRlZikgPT4ge1xyXG4gICAgY29uc3QgY29tcGlsZWQgPSBjb21waWxlKGRlZik7XHJcbiAgICByZXR1cm4gaW5wdXQgPT4gY29tcGlsZWQobWFwcGVyKGlucHV0KSk7XHJcbn07XHJcblxyXG4vKipcclxuICogUmV0dXJuIGFuIERlZmluaXRpb24gdGhhdDpcclxuICogLSBpZiBwcmVkaWNhdGUobWFwcGVyKGlucHV0KSkgcmV0dXJucyB0cnVlLCBleGVjdXRlIGRlZjEgb24gdGhlIElucHV0IG1hcHBlZCB3aXRoIG1hcHBlci5cclxuICogLSBvdGhlcndpc2UsIGV4ZWN1dGUgZGVmMiBvbiB0aGUgaW5wdXQgbWFwcGVyIHdpdGggbWFwcGVyLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtYXBwZXIgVGhlIGZ1bmN0aW9uIHVzZWQgdG8gbWFwIGlucHV0LlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkaWNhdGUgVGhlIGZ1bmN0aW5vIHVzZWQgdG8gZGVjaWRlIHdoZXRoZXIgdGhlIERlZmluaXRpb24gc2hvdWxkIGJlXHJcbiAqICAgZXhlY3V0ZWQgb3Igbm90LlxyXG4gKiBAcGFyYW0ge2FueX0gZGVmMSBUaGUgRGVmaW5pdGlvbiB1c2VkIHdoZW4gcHJlZGljYXRlKG1hcHBlcihpbnB1dCkpIGlzIHRydWUuXHJcbiAqIEBwYXJhbSB7YW55fSBkZWYyIFRoZSBEZWZpbml0aW5vIHVzZWQgd2hlbiBwcmVkaWNhdGUobWFwcGVyKGlucHV0KSkgaXMgZmFsc2UuIERlZmF1bHQgdG9cclxuICogICBudWxsLlxyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFRoZSByZXR1cm5lZCBEZWZpbml0aW9uLlxyXG4gKi9cclxuY29uc3Qgb25XaGVuID0gKG1hcHBlciwgcHJlZGljYXRlLCBkZWYxLCBkZWYyID0gbnVsbCkgPT4ge1xyXG4gICAgY29uc3QgY29tcGlsZWQxID0gY29tcGlsZShkZWYxKTtcclxuICAgIGNvbnN0IGNvbXBpbGVkMiA9IGNvbXBpbGUoZGVmMik7XHJcbiAgICByZXR1cm4gb24obWFwcGVyLCBpbnB1dCA9PiAocHJlZGljYXRlKGlucHV0KSA/IGNvbXBpbGVkMShpbnB1dCkgOiBjb21waWxlZDIobnVsbCkpKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gb25XaGVuKG1hcHBlciwgXy5uZWdhdGUoXy5pc0VtcHR5KSwgZGVmKS5cclxuICogU2VlIGRvY3VtZW50YXRpb24gb2YgbG9kYXNoIGZvciBkZXRhaWxzLlxyXG4gKlxyXG4gKiBUaGUgdHlwaWNhbCB1c2FnZSBvZiBvbkV4aXN0IGlzOlxyXG4gKiBvbkV4aXN0KGEgPT4gYS5kYXRhLCB7IGZvbzogZCA9PiBkLmZvbyB9KTtcclxuICogV2hpY2ggZW5zdXJlcyB0aGF0LCBpZiBhLmRhdGEgaXMgdW5kZWZpbmVkIG9yIHt9LCBkID0+IGQuZm9vIHdpbGwgbm90IGV2ZW4gYmUgZXhlY3V0ZWRcclxuICogYW5kIG5vIEVycm9yIGlzIHRocm93bi5cclxuICogSG93ZXZlciBfLmlzRW1wdHkoKSBpcyBqdXN0IGEgdmVyeSBzaW1wbGUgY2hlY2ssIHNvIHVzZSB0aGlzIG1ldGhvZCBvbmx5IHdoZW4gYXBwbGljYWJsZS5cclxuICpcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWFwcGVyIFRoZSBmdW5jdGlvbiB1c2VkIHRvIG1hcCBpbnB1dC5lXHJcbiAqIEBwYXJhbSB7YW55fSBkZWYxIFRoZSBEZWZpbml0aW9uIHVzZWQgd2hlbiBwcmVkaWNhdGUobWFwcGVyKGlucHV0KSkgaXMgdHJ1ZS5cclxuICogQHBhcmFtIHthbnl9IGRlZjIgVGhlIERlZmluaXRpbm8gdXNlZCB3aGVuIHByZWRpY2F0ZShtYXBwZXIoaW5wdXQpKSBpcyBmYWxzZS4gRGVmYXVsdCB0b1xyXG4gKiAgIG51bGwuXHJcbiAqIEByZXR1cm5zIFRoZSByZXR1cm5lZCBEZWZpbml0aW9uLlxyXG4gKi9cclxuY29uc3Qgb25FeGlzdCA9IChtYXBwZXIsIGRlZjEsIGRlZjIpID0+IG9uV2hlbihtYXBwZXIsIG5lZ2F0ZShpc0VtcHR5KSwgZGVmMSwgZGVmMik7XHJcblxyXG4vKipcclxuICogVHVybiBpbnB1dCBpbnRvIGEgZnVuY3Rpb24gdGhhdCBtYXBzIGlucHV0IHZhbHVlIHRvIGRlc2lyZWQgdmFsdWUuXHJcbiAqIFVzZWQgb25seSBpbiBjb29udmVydE5hbWVzKCkuXHJcbiAqIEFzIGRlZmluZWQgaW4gdGhlIHRlc3QsIHRvTWFwVmFsKCkgc2hvdWxkOlxyXG4gKiAtIHJldHVybiB1bmNoYW5nZWQgZm9yIGEgZnVuY3Rpb24uXHJcbiAqIC0gcmV0dXJuIHYgPT4gdiBvdGhlcndpc2UuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YW55fSBpbnB1dCBUaGUgaW5wdXQgdG8gdHVybiBpbnRvIGEgZnVuY3Rpb24uXHJcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gVGhlIHJldHVybmVkIGZ1bmN0aW9uLlxyXG4gKi9cclxuY29uc3QgdG9NYXBWYWwgPSAoaW5wdXQpID0+IHtcclxuICAgIGlmIChpc0Z1bmN0aW9uKGlucHV0KSkgcmV0dXJuIGlucHV0O1xyXG4gICAgcmV0dXJuIHYgPT4gdjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUdXJuIGlucHV0IGludG8gYSBmdW5jdGlvbiB0aGF0IG1hcHMga2V5IHRvIGRlc2lyZWQga2V5LlxyXG4gKiBVc2VkIG9ubHkgaW4gY29udmVydE5hbWVzKCkuXHJcbiAqIEFzIGRlZmluZWQgaW4gdGhlIHRlc3QuIHRvTWFwS2V5KCkgc2hvdWxkOlxyXG4gKiAtIHJldHVybiB1bmNoYW5nZWQgZm9yIGEgZnVuY3Rpb24uXHJcbiAqIC0gcmV0dXJuICgpID0+IHNyYyBmb3IgYSBzdHJpbmcgc3RyLlxyXG4gKiAtIHJldHVybiBfLmNhbWVsQ2FzZSBvdGhlcndpc2UuXHJcbiAqIF8uY2FtZWxDYXNlIGlzIHVzZWQgb25seSBmb3IgdGhlIGNvbnZlbmllbmNlIG9mIERlZmluaXRpb25zIGluIGRlZmluaXRpb25zLmpzLFxyXG4gKiBhbmQgaXMgZHVlIHRvIGNoYW5nZSBhcyB0aGUgRGVmaW5pdGlvbnMgZXZvbHZlcy5cclxuICpcclxuICogQHBhcmFtIHthbnl9IGlucHV0IFRoZSBpbnB1dCB0byB0dXJuIGludG8gYSBmdW5jdGlvbi5cclxuICogQHJldHVybnMge0Z1bmN0aW9ufSBUaGUgcmV0dXJuZWQgZnVuY3Rpb24uXHJcbiAqL1xyXG5jb25zdCB0b01hcEtleSA9IChpbnB1dCkgPT4ge1xyXG4gICAgaWYgKGlzRnVuY3Rpb24oaW5wdXQpKSByZXR1cm4gaW5wdXQ7XHJcbiAgICBpZiAoaXNTdHJpbmcoaW5wdXQpKSByZXR1cm4gKCkgPT4gaW5wdXQ7XHJcbiAgICByZXR1cm4gY2FtZWxDYXNlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFR1cm4gYXJyYXkgb2YgaW5wdXQgaW50byBhbiB7IG5hbWU6IHN0cmluZywgbWFwVmFsOiBGdW5jdGlvbiwgbWFwS2V5OiBGdW5jdGlvbiB9LlxyXG4gKiBUaGlzIG1ldGhvZCBpcyBpbXBsZW1lbnRzIHRoZSBjb21tb24gbG9naWNzIGluIHNwcmVhZCgpIGFuZCBzcHJlYWRPYmooKS5cclxuICogVGhlIGJlaGF2aW9yIG9mIHRoaXMgbWV0aG9kIGlzIHRoZSBjb252ZW5pZW5jZSBvZiBEZWZpbml0aW9ucyBpbiBkZWZpbml0aW9ucy5qcyxcclxuICogYW5kIGlzIGR1ZSB0byBjaGFuZ2UgYXMgdGhlIERlZmluaXRpb25zIGV2b2x2ZXMuXHJcbiAqIEluIHNob3J0LCBpdCBzdXBwb3J0cyBhIGNvbnZlbmllbnQgd2F5IHRvIGV4dHJhY3QgZGF0YSBmcm9tIElucHV0IGFycmF5cyBvciBvYmplY3RzLFxyXG4gKiBwcm9iYWJseSBjaGFuZ2luZyB0aGUgdmFsdWUgYW5kIHRoZSBrZXkgd2l0aCBhIG1hcHBlciBmdW5jdGlvbiwgYW5kIHVzaW5nIHRoZVxyXG4gKiBtYXBwZWQga2V5IGFuZCB2YWx1ZSB0byBjcmVhdGUgYSBQcm9wZXJ0eSBEZWZpbml0aW9uLlxyXG4gKiBJbiB0aGUgbWVhbndoaWxlLCBjb252ZXJ0TmFtZXMoKSBwcm92aWRlcyBkZWZhdWx0IHZhbHVlcyB0byBlbmFibGUgY3JlYXRpbmcgUHJvcGVydHlcclxuICogRGVmaW5pdGlvbnMgc2ltcGx5IGFuZCBzaG9ydGx5LlxyXG4gKiBJdHMgZGV0YWlsZWQgYmVoYXZpb3IgaXMsIG1hcCBlYWNoIG5hbWUgb2YgbmFtZXMgd2l0aDpcclxuICogLSBJZiBuYW1lIGlzIGEgc3RyaW5nLCBtYXAgW25hbWUsIHVuZGVmaW5lZCwgdW5kZWZpbmVkXSBpbnN0ZWFkLlxyXG4gKiAtIElmIG5hbWUgaXMgYW4gQXJyYXksIHJldHVybiB7IG5hbWU6IG5hbWVbMF0sIG1hcFZhbDogdG9NYXBWYWwobmFtZVsxXSksIG1hcEtleTogbmFtZVsyXSB9LlxyXG4gKiAtIE90aGVyd2lzZSwgcmV0dXJuIG51bGwuXHJcbiAqIFRoZSByZXR1cm4gdmFsdWUgaXMgYW4gYXJyYXksIGVhY2ggZWxlbWVudCBiZWluZyBlaXRoZXI6XHJcbiAqIC0gQW4gb2JqZWN0IHdpdGggeyBuYW1lOiBzdHJpbmcsIG1hcFZhbDogRnVuY3Rpb24sIG1hcEtleTogRnVuY3Rpb24gfS5cclxuICogLSBPciBudWxsLlxyXG4gKiBFYWNoIGVsZW1lbnQgb2YgdGhlIHJldHVybiB2YWx1ZSBjb3JyZXNwb25kcyB0byB0aGUgZWxlbWVudCBpbiBuYW1lcyBvZiB0aGUgc2FtZSBpbmRleCxcclxuICogd2hpY2ggZW5hYmxlcyB0aGUgZnVuY2lvbmFsaXR5IG9mIHNwcmVhZCgpLlxyXG4gKlxyXG4gKiBAcGFyYW0geyhzdHJpbmcgfCBBcnJheSB8ICopW119IG5hbWVzIFRoZSBuYW1lcyB0byBjb252ZXJ0LlxyXG4gKiBAcmV0dXJucyB7KE9iamVjdCB8IG51bGwpW119IFRoZSBjb252ZXJ0ZWQgbmFtZXMuXHJcbiAqIEBzZWUgI3RvTWFwS2V5XHJcbiAqIEBzZWUgI3RvTWFwVmFsXHJcbiAqIEBzZWUgI3NwcmVhZFxyXG4gKiBAc2VlICNzcHJlYWRPYmpcclxuICovXHJcbmNvbnN0IGNvbnZlcnROYW1lcyA9ICguLi5uYW1lcykgPT4gbmFtZXNcclxuICAgIC5tYXAobmFtZSA9PiAoaXNTdHJpbmcobmFtZSkgPyBbbmFtZV0gOiBuYW1lKSlcclxuICAgIC5tYXAoY29tcGlsZShvbldoZW4oYSA9PiBhLCBpc0FycmF5LCB7XHJcbiAgICAgICAgbmFtZTogYSA9PiBhWzBdLFxyXG4gICAgICAgIG1hcFZhbDogYSA9PiB0b01hcFZhbChhWzFdKSxcclxuICAgICAgICBtYXBLZXk6IGEgPT4gdG9NYXBLZXkoYVsyXSksXHJcbiAgICB9KSkpO1xyXG5cclxuLyoqXHJcbiAqIFJldHVybiBhIERlZmluaXRpb24gd2hpY2ggc3ByZWFkIHRoZSBnaXZlbiBuYW1lcy5cclxuICogVGhlIGJlaGF2aW9yIG9mIHRoaXMgbWV0aG9kIGlzIHRoZSBjb252ZW5pZW5jZSBvZiBEZWZpbml0aW9ucyBpbiBkZWZpbml0aW9ucy5qcyxcclxuICogYW5kIGlzIGR1ZSB0byBjaGFuZ2UgYXMgdGhlIERlZmluaXRpb25zIGV2b2x2ZXMuXHJcbiAqIFRoZSBuYW1lIHNwcmVhZCBjb21lcyBmcm9tIHRoZSBzcHJlYWQgc3ludGF4IG9mIEVDTUFTY3JpcHQsIHNpbmNlIHRoaXMgbWV0aG9kXHJcbiAqIHZhZ3VlbHkgZXhwcmVzc2VzIHRoZSBzYW1lIGlkZWEuXHJcbiAqIFRoaXMgbWV0aG9kIHNwcmVhZHMgdGhlIGdpdmVuIG5hbWVzIGludG8gYW4gb2JqZWN0IHRvIGNyZWF0ZSBhbiBEZWZpbml0aW9uLlxyXG4gKiBUeXBpY2FsbHksIGl0IGlzIHVzZWQgYXMgZm9sbG93czpcclxuICogY29uc3QgZGVmID0gc3ByZWFkKCdmb28nLCBbJ2JhcicsIHBhcnNlSW50XSwgMCwgWydiYXonLCAwLCAnZm9vQmFyJ10sIFsnYmFkX2Nhc2UnLCAwXSk7XHJcbiAqIEFuZCB1c2luZyBkZWYgdG8gcGFyc2U6XHJcbiAqIFsnMScsICcyJywgJzMnLCAnNCcsICc1J11cclxuICogeW91IHdpbGwgZ2V0OlxyXG4gKiB7IGZvbzogJzEnLCBiYXI6IDIsIGZvb0JhcjogJzQnLCBiYWRDYXNlOiAnNScgfVxyXG4gKiBFeHBsYW5hdGlvbnMuXHJcbiAqIFRoZSBhcmd1bWVudHMgYXJlIHVzZWQgbGlrZSBtYXBwZXJzLiBXaGVuIHRoZSByZXR1cm5lZCBEZWZpbml0aW9uIGdldHMgYW4gYXJyYXkgaW5wdXQsXHJcbiAqIGl0IG1hcHMgdGhlIGVsZW1lbnRzIGFuZCByZXR1cm4gYW4gb2JqZWN0LlxyXG4gKiBBcyB5b3UgY2FuIHNlZSwgZ2l2aW5nIGEgc2ltcGxlICdmb28nIHNldHMgdGhlICdmb28nIHByb3BlcnR5IHdpdGggdGhlIHZhbHVlIG9mIGlucHV0WzBdLFxyXG4gKiBHaXZpbmcgWydiYXInLCBwYXJzZUludF0gc2V0cyB0aGUgJ2JhcicgcHJvcGVydHkgd2l0aCBwYXJzZUludChpbnB1dFsxXSkuXHJcbiAqIEdpdmluZyAwIGlnbm9yZXMgdGhlIGlucHV0IGVsZW1lbnQsIHRoYXQgaXMsIGlucHV0WzJdLiAoMCBpcyB1c2VkIG9ubHkgYmVjYXVzZSBpdCBpcyBzaG9ydClcclxuICogR2l2aW5nIFsnYmF6JywgMCwgJ2Zvb0JhciddIHNldHMgdGhlICdmb29CYXInIHByb3BlcnR5IHdpdGggaW5wdXRbM10sIHdoZXJlIDAgc3BlY2lmaWVzXHJcbiAqIGlucHV0WzNdIGlzIG5vdCBtYXBwZWQgYW5kIHJldHVybmVkIGRpcmVjdGx5LCAnZm9vQmFyJyBpcyB0aGUgZmluYWwgcHJvcGVydHkgbmFtZSwgYW5kXHJcbiAqICdmb28nIGlzIGlnbm9yZWQuIChCdXQgdGhpcyB3aWxsIGJlIGRpZmZlcmVudCBpbiBzcHJlYWRPYmooKSkuXHJcbiAqIEdpdmluZyBbJ2JhZF9jYXNlJywgMF0gc2V0cyB0aGUgJ2JhZENhc2UnIHByb3BlcnR5IHdpdGggaW5wdXRbNF0sIHdoZXJlIDAgc3BlY2lmaWVzXHJcbiAqIHRoYXQgaW5wdXRbNF0gaXMgbm90IG1hcHBlZCwgJ2JhZF9jYXNlJyBpcyB1c2VkIHRvIHByb2R1Y2UgdGhlIHByb3BlcnR5IG5hbWUgJ2JhZENhc2UnXHJcbiAqIChieSBjb252ZXJ0aW5nIGl0IGludG8gY2FtZWxDYXNlIHdoZW4gbm8gY29udmVydCBmdW5jdGlvbiBpcyBzcGVjaWZpZWQsIHNlZSB0b01hcEtleSgpKS5cclxuICogV2hlbiB1c2luZyBzcHJlYWQoKSwgdGhlIGxhc3QgMiBzeW50YXhlcyBhcmUgcmFyZWx5IHVzZWQsIGJ1dCB0aGV5IGRvIGhhdmUgdGhlaXIgcmVhc29uXHJcbiAqIG9mIGV4aXN0ZW5jZSBpbiBzcHJlYWRPYmooKS5cclxuICogSW4gc2hvcnQsIGl0IHVzZXMgY29udmVydE5hbWVzKCksIGlnbm9yZXMgbnVsbCByZXR1cm4gZWxlbWVudHMsIGFuZCByZXR1cm5zIGEgRGVmaW5pdG9uXHJcbiAqIHRoYXQgbWFwcyBldmVyeSBpbnB1dCBlbGVtZW50IGludG8gYSBwcm9wZXJ0eSBvZiB0aGUgcmV0dXJuZWQgb2JqZWN0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FueVtdfSBuYW1lcyBUaGUgbmFtZXMgdG8gc3ByZWFkLlxyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFRoZSByZXR1cm5lZCBEZWZpbml0aW9uLlxyXG4gKiBAc2VlICNjb252ZXJ0TmFtZXNcclxuICogQHNlZSAjc3ByZWFkT2JqXHJcbiAqL1xyXG5jb25zdCBzcHJlYWQgPSAoLi4ubmFtZXMpID0+XHJcbiAgICBmcm9tUGFpcnMoY29udmVydE5hbWVzKC4uLm5hbWVzKVxyXG4gICAgICAgIC5tYXAoKGNvbnZlcnRlZCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFpc09iamVjdChjb252ZXJ0ZWQpKSByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBjb25zdCB7IG5hbWUsIG1hcFZhbCwgbWFwS2V5IH0gPSBjb252ZXJ0ZWQ7XHJcbiAgICAgICAgICAgIHJldHVybiBbbWFwS2V5KG5hbWUpLCBhID0+IG1hcFZhbChhW2luZGV4XSldO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmZpbHRlcihpc0FycmF5KSk7XHJcblxyXG4vKipcclxuICogUmV0dXJuIGEgRGVmaW5pdGlvbiB3aGljaCBzcHJlYWQgdGhlIGdpdmVuIG5hbWVzLlxyXG4gKiBUaGUgYmVoYXZpb3Igb2YgdGhpcyBtZXRob2QgaXMgdGhlIGNvbnZlbmllbmNlIG9mIERlZmluaXRpb25zIGluIGRlZmluaXRpb25zLmpzLFxyXG4gKiBhbmQgaXMgZHVlIHRvIGNoYW5nZSBhcyB0aGUgRGVmaW5pdGlvbnMgZXZvbHZlcy5cclxuICogVGhlIG5hbWUgc3ByZWFkIGNvbWVzIGZyb20gdGhlIG9iamVjdCBzcHJlYWQgc3ludGF4IG9mIEVDTUFTY3JpcHQsIHNpbmNlIHRoaXMgbWV0aG9kXHJcbiAqIHZhZ3VlbHkgZXhwcmVzc2VzIHRoZSBzYW1lIGlkZWEuXHJcbiAqIFRoaXMgbWV0aG9kIHNwcmVhZHMgdGhlIGdpdmVuIG5hbWVzIGludG8gYW4gb2JqZWN0IHRvIGNyZWF0ZSBhbiBEZWZpbml0aW9uLlxyXG4gKiBUeXBpY2FsbHksIGl0IGlzIHVzZWQgYXMgZm9sbG93czpcclxuICogY29uc3QgZGVmID0gc3ByZWFkT2JqKCdmb28nLCBbJ2JhcicsIHBhcnNlSW50XSwgMCwgWydiYXonLCAwLCAnZm9vQmFyJ10sIFsnYmFkX2Nhc2UnLCAwXSk7XHJcbiAqIEFuZCB1c2luZyBkZWYgdG8gcGFyc2U6XHJcbiAqIHsgZm9vOiAnMScsIGJhcjogJzInLCBiYWE6ICczJywgYmF6OiAnNCcsIGJhZF9jYXNlOiAnNScgfVxyXG4gKiB5b3Ugd2lsbCBnZXQ6XHJcbiAqIHsgZm9vOiAnMScsIGJhcjogMiwgZm9vQmFyOiAnNCcsIGJhZENhc2U6ICc1JyB9XHJcbiAqIEV4cGxhbmF0aW9ucy5cclxuICogVGhlIGFyZ3VtZW50cyBhcmUgdXNlZCBsaWtlIG1hcHBlcnMuIFdoZW4gdGhlIHJldHVybmVkIERlZmluaXRpb24gZ2V0cyBhbiBvYmplY3QgaW5wdXQsXHJcbiAqIGl0IG1hcHMgdGhlIHByb3BlcnRpZXMgYW5kIHJldHVybiBhbm90aGVyIG9iamVjdC5cclxuICogQXMgeW91IGNhbiBzZWUsIGdpdmluZyBhIHNpbXBsZSAnZm9vJyBzZXRzIHRoZSAnZm9vJyBwcm9wZXJ0eSB3aXRoIHRoZSB2YWx1ZSBvZiBpbnB1dC5mb28sXHJcbiAqIEdpdmluZyBbJ2JhcicsIHBhcnNlSW50XSBzZXRzIHRoZSAnYmFyJyBwcm9wZXJ0eSB3aXRoIHBhcnNlSW50KGlucHV0LmJhcikuXHJcbiAqIEdpdmluZyAwIHdpbGwgYmUgbWVhbmluZ2xlc3MsIHRoaXMgc3ludGF4IGlzIG9ubHkgYXZhaWxhYmxlIGluIHNwcmVhZCgpLlxyXG4gKiBHaXZpbmcgWydiYXonLCAwLCAnZm9vQmFyJ10gc2V0cyB0aGUgJ2Zvb0JhcicgcHJvcGVydHkgd2l0aCBpbnB1dC5iYXosIHdoZXJlIDAgc3BlY2lmaWVzXHJcbiAqIGlucHV0LmJheiBpcyBub3QgbWFwcGVkIGFuZCByZXR1cm5lZCBkaXJlY3RseS4gKDAgaXMgdXNlZCBvbmx5IGJlY2F1c2UgaXQgaXMgc2hvcnQsIGFueVxyXG4gKiBub24tc3RyaW5nIGFuZCBub24tQXJyYXkgdmFsdWUgd2lsbCBoYXZlIHRoZSBzYW1lIGVmZmVjdCkgJ2Zvb0JhcicgaXMgdGhlIGZpbmFsIHByb3BlcnR5XHJcbiAqIG5hbWUsIGFuZCAnYmF6JyBpcyB0aGUgcHJvcGVydHkgbmFtZSBpbiBpbnB1dC5cclxuICogR2l2aW5nIFsnYmFkX2Nhc2UnLCAwXSBzZXRzIHRoZSAnYmFkQ2FzZScgcHJvcGVydHkgd2l0aCBpbnB1dC5iYWRfY2FzZSwgd2hlcmUgMCBzcGVjaWZpZXNcclxuICogdGhhdCBpbnB1dC5mb29fYmFyIGlzIG5vdCBtYXBwZWQsICdiYWRfY2FzZScgdGhlIHByb3BlcnR5IG5hbWUgaW4gaW5wdXQgYW5kICdiYWRDYXNlJyBpc1xyXG4gKiB0aGUgY2FtZWxDYXNlIG9mICdiYWRfY2FzZScuIChUaGlzIGlzIHRoZSBkZWZhdWx0IGJlaGF2aW9yIHNpbmNlIHRoZSBrZXkgbWFwcGVyIGlzIG5vdFxyXG4gKiBzcGVjaWZpZWQuIFNlZSB0b01hcEtleSgpIGZvciBkZXRhaWxzKS5cclxuICogV2hlbiB1c2luZyBzcHJlYWQoKSwgdGhlIHRoaXJkIHN5bnRheCBpcyByYXJlbHkgdXNlZCwgYnV0IGl0IGlzIHVzZWZ1bCBpbiBzcHJlYWRPYmooKS5cclxuICogSW4gc2hvcnQsIGl0IHVzZXMgY29udmVydE5hbWVzKCksIGFuZCByZXR1cm5zIGEgRGVmaW5pdG9uIHRoYXQgbWFwcyBldmVyeSBpbnB1dCBwcm9wZXJ0eVxyXG4gKiBpbnRvIGEgcHJvcGVydHkgb2YgdGhlIHJldHVybmVkIG9iamVjdC5cclxuICpcclxuICogQHBhcmFtIHthbnlbXX0gbmFtZXMgVGhlIG5hbWVzIHRvIHNwcmVhZC5cclxuICogQHJldHVybnMge0Z1bmN0aW9ufSBUaGUgcmV0dXJuZWQgRGVmaW5pdGlvbi5cclxuICogQHNlZSAjY29udmVydE5hbWVzXHJcbiAqIEBzZWUgI3NwcmVhZFxyXG4gKi9cclxuY29uc3Qgc3ByZWFkT2JqID0gKC4uLm5hbWVzKSA9PlxyXG4gICAgZnJvbVBhaXJzKGNvbnZlcnROYW1lcyguLi5uYW1lcylcclxuICAgICAgICAuZmlsdGVyKGlzT2JqZWN0KVxyXG4gICAgICAgIC5tYXAoKHsgbmFtZSwgbWFwVmFsLCBtYXBLZXkgfSkgPT4gW21hcEtleShuYW1lKSwgbyA9PiBtYXBWYWwob1tuYW1lXSldKSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGFzRmxhZyxcclxuICAgIG9uV2hlbixcclxuICAgIG9uLFxyXG4gICAgb25FeGlzdCxcclxuICAgIHRvTWFwVmFsLFxyXG4gICAgdG9NYXBLZXksXHJcbiAgICBjb252ZXJ0TmFtZXMsXHJcbiAgICBzcHJlYWQsXHJcbiAgICBzcHJlYWRPYmosXHJcbn07XHJcbiJdfQ==