const { map, mapValues, isArray, isObject } = require('lodash');

// compiler
const compile = (src) => {
    if (typeof src === 'function') return src;
    else if (isArray(src)) {
        const compiled = map(src, compile);
        return input => map(compiled, transformer => transformer(input));
    } else if (isObject(src)) {
        const compiled = mapValues(src, compile);
        return input => mapValues(compiled, transformer => transformer(input));
    }
    return () => src;
};

module.exports = compile;
