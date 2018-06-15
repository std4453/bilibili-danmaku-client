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

const {
    isEmpty,
    negate,
    isString,
    isFunction,
    isArray,
    isObject,
    fromPairs,
    camelCase,
} = require('lodash');

const compile = require('./compile');

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
const asFlag = input => !!input;

/**
 * Return an Definition that executes the specified Definition on the Input mapped with mapper.
 *
 * @param {Function} mapper The function used to map Input.
 * @param {any} def The Definition.
 * @returns {Function} The returned Definition.
 */
const on = (mapper, def) => {
    const compiled = compile(def);
    return input => compiled(mapper(input));
};

/**
 * Return an Definition that:
 * - if predicate(mapper(input)) returns true, execute the specified Definition on the Input
 *   mapped with mapper.
 * - otherwise, return null.
 *
 * @param {Function} mapper The function used to map input.
 * @param {Function} predicate The functino used to decide whether the Definition should be
 *   executed or not.
 * @param {any} def The Definition.
 * @returns {Function} The returned Definition.
 */
const onWhen = (mapper, predicate, def) => {
    const compiled = compile(def);
    return on(mapper, input => (predicate(input) ? compiled(input) : null));
};

/**
 * Return onWhen(mapper, _.negate(_.isEmpty), def).
 * See documentation of lodash for details.
 *
 * The typical usage of onExist is:
 * onExist(a => a.data, { foo: d => d.foo });
 * Which ensures that, if a.data is undefined or {}, d => d.foo will not even be executed
 * and no Error is thrown.
 * However _.isEmpty() is just a very simple check, so use this method if applicable.
 *
 * @param {Function} mapper The function used to map input.e
 * @param {*} src The Definition.
 * @returns The returned Definition.
 */
const onExist = (mapper, def) => onWhen(mapper, negate(isEmpty), def);

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
const toMapVal = (input) => {
    if (isFunction(input)) return input;
    return v => v;
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
const toMapKey = (input) => {
    if (isFunction(input)) return input;
    if (isString(input)) return () => input;
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
const convertNames = (...names) => names
    .map(name => (isString(name) ? [name] : name))
    .map(compile(onWhen(a => a, isArray, {
        name: a => a[0],
        mapVal: a => toMapVal(a[1]),
        mapKey: a => toMapKey(a[2]),
    })));

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
const spread = (...names) =>
    fromPairs(convertNames(...names)
        .map((converted, index) => {
            if (!isObject(converted)) return undefined;
            const { name, mapVal, mapKey } = converted;
            return [mapKey(name), a => mapVal(a[index])];
        })
        .filter(isArray));

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
const spreadObj = (...names) =>
    fromPairs(convertNames(...names)
        .filter(isObject)
        .map(({ name, mapVal, mapKey }) => [mapKey(name), o => mapVal(o[name])]));

module.exports = {
    asFlag,
    onWhen,
    on,
    onExist,
    toMapVal,
    toMapKey,
    convertNames,
    spread,
    spreadObj,
};
