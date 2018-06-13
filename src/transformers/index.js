const transformers = require('./definitions');

module.exports = {
    events: transformers.map(t => t.name),
    all: transformers,
};
