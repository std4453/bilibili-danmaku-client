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

// helper methods
const asFlag = input => !!input;

const onWhen = (mapper, predicate, src) => {
    const compiled = compile(src);
    return input => (predicate(mapper(input)) ? compiled(mapper(input)) : null);
};

const on = (mapper, src) => onWhen(mapper, () => true, src);

const onExist = (mapper, src) => onWhen(mapper, negate(isEmpty), src);

const toMapVal = (input) => {
    if (isFunction(input)) return input;
    return v => v;
};

const toMapKey = (input) => {
    if (isFunction(input)) return input;
    if (isString(input)) return () => input;
    return k => camelCase(k);
};

const convertNames = (...names) => names
    .map(name => (isString(name) ? [name] : name))
    .map(compile(onWhen(a => a, isArray, {
        name: a => a[0],
        mapVal: a => toMapVal(a[1]),
        mapKey: a => toMapKey(a[2]),
    })));

const spread = (...names) =>
    fromPairs(convertNames(...names)
        .map((converted, index) => {
            if (!isObject(converted)) return undefined;
            const { name, mapVal, mapKey } = converted;
            return [mapKey(name), a => mapVal(a[index])];
        })
        .filter(isArray));

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
