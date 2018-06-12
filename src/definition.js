const { map, mapValues, isEmpty, negate, isString, isFunction, isArray, fromPairs, conformsTo, defaults, camelCase } = require('lodash');

// compiler
const compile = (src) => {
    if (typeof src === 'function') return src;
    else if (src instanceof Array) {
        const compiled = map(src, compile);
        return input => map(compiled, transformer => transformer(input));
    } else if (typeof src === 'object') {
        const compiled = mapValues(src, compile);
        return input => mapValues(compiled, transformer => transformer(input));
    }
    throw new Error(`Unable to compile: ${src}.`);
};

// helper methods
const asFlag = input => !!input;
const onWhen = (mapper, predicate, src) => {
    const compiled = compile(src);
    return input => (predicate(mapper(input)) ? compiled(mapper(input)) : null);
};
const on = (mapper, src) => onWhen(mapper, () => true, src);
const onExist = (mapper, src) => onWhen(mapper, negate(isEmpty), src);
const convertNames = (...names) => names
    .map(name => (isString(name) ? [name] : name))
    .map((arr) => {
        if (!isArray(arr)) return null;
        const [name, mapVal, mapKey] = arr;
        const obj = defaults({ name, mapVal, mapKey }, { mapVal: v => v, mapKey: camelCase });
        return conformsTo(obj, { name: isString, mapVal: isFunction, mapKey: isFunction }) ?
            obj : null;
    });
const spread = (...names) => fromPairs(convertNames(...names)
    .map((converted, index) => {
        if (isEmpty(converted)) return undefined;
        const { name, mapVal, mapKey } = converted;
        return [mapKey(name), a => mapVal(a[index])];
    }).filter(negate(isEmpty)));
const spreadObj = (...names) => fromPairs(convertNames(...names)
    .filter(negate(isEmpty))
    .map(({ name, mapVal, mapKey }) => [mapKey(name), o => mapVal(o[name])]));

module.exports = {
    _private: { // for testing
        compile, asFlag, onWhen, on, onExist, convertNames, spread, spreadObj,
    },

    compile,
    asFlag,
    onWhen,
    on,
    onExist,
    spread,
    spreadObj,
};
