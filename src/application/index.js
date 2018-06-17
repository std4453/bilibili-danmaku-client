const { fromPairs } = require('lodash');

const transformers = require('./definitions');

const registry = fromPairs(transformers.map(t => [t.cmd, t]));

module.exports = {
    list: transformers,
    registry,
};
