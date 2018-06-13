"use strict";

var transformers = require('./definitions');

module.exports = {
  events: transformers.map(function (t) {
    return t.name;
  }),
  all: transformers
};
//# sourceMappingURL=index.js.map