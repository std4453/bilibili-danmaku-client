/**
 * This file contains the class definition of Transformer.
 * Transformer is used to transform JSONs into Events.
 * See documentation of Transformer for details.
 * The Tramsformer class is considered internal, that is, it should not be
 * used by applications without good reasons.
 *
 * For the concept of Definition and Input, see compile.js.
 */

const compile = require('./compile');
const ApplicationEvent = require('./ApplicationEvent');

/**
 * The Transformer class converts JSONs to Events.
 * As seen in the Application Protocol, the 'cmd' property of the JSON is
 * used to find the right transformer in the Event Registry. However in practise,
 * we want that the 'cmd' string, the transformed Event name, and the
 * transformation Definition are defined in the same place so it would be
 * easier to read and debug. Therefore, the 'cmd' property is stored in
 * the Transformer object, while the Event Registry is generated at startup
 * using the list of all Transformers and their corresponding 'cmd' properties.
 */
class Transformer {
    /**
     * Construct a new Transformer with the parameters.
     * The Definition def is first compiled into a function and then saved as this.fn.
     * In this way, def can either be an Object, an Array, or an already compiled
     * Function. That is to say, def can be any valid Definition.
     *
     * @param {string} cmd The 'cmd' property of the Input JSON.
     * @param {string} name The name of the transformed Event.
     * @param {Function | Object | Array} def The Definition of this Transformer.
     */
    constructor(cmd, name, def) {
        this.cmd = cmd;
        this.name = name;
        this.fn = compile(def);
    }

    /**
     * Transform the given Input and return an Event.
     * It assumes that input.cmd is equal to this.input, otherwise the behavior is
     * undefined.
     * It assumes that the Definition used to construct this Transformer can work
     * prooperly on the Input. For additional robustness, applications can catch
     * for Errors while calling transform(). However, more measures might have to
     * be taken in order to check for failed transformations appropriately. For
     * details, see compile.js.
     *
     * @param {Object} input The Input to transform.
     * @returns {ApplicationEvent} The transformed Event.
     */
    transform(input) {
        return new ApplicationEvent(this.name, this.fn(input));
    }
}

module.exports = Transformer;
