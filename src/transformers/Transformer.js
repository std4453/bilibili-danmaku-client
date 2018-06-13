const { isFunction } = require('lodash');
const compile = require('./compile');

class Transformer {
    constructor(cmd, name, fnOrDef) {
        this.cmd = cmd;
        this.name = name;
        const fn = isFunction(fnOrDef) ? fnOrDef : compile(fnOrDef);
        this.fn = fn;
    }

    transform(input) {
        return this.fn(input);
    }
}

module.exports = Transformer;
