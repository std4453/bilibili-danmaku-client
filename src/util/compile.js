const { map, mapValues, isArray, isObject } = require('lodash');

/**
 * Compile.js defines compile() - the core to the Definition module.
 * compile() has its own documentation, and here, the Definition module is
 * described.
 *
 * A Definition defines how to create a result from an Input. This concept
 * is often expresses as functions, while Definition focuses on the following
 * characteristics: Readability and simplicity.
 * Readability mainly leads to the structured nature of Definitions, together
 * with its native-ECMAScript syntax. Its powser and elegance can be seen
 * in the following example:
 *
 * const def = compile({
 *     foo: a => a[0],
 *     bar: a => a[1],
 *     baz: [a => a[2], a => a[3], {
 *         qux: a => a[4],
 *         quux: a => a[5],
 *     }],
 * });
 * const result = def([0, 1, 2, 3, 4, 5]);
 *
 * And result will be:
 * {
 *     foo: 0,
 *     bar: 1,
 *     baz: [2, 3, {
 *         qux: 4,
 *         quuz: 5,
 *     }],
 * }
 *
 * I hope you've got the idea. The Definition looks just like the result, except
 * that every value is replaced by a function that produces the value from the Input,
 * which makes the Definition code very easy to read and understand. Readers can
 * get a direct image of what will be produced by this Definition.
 * And now you've got the idea of Input, let's see simplicity.
 *
 * Simplicity leads to the recursive and fractal feature of Definition, along with
 * the compile() function.
 * So in the previous example you can see that the 'qux' and 'quux' properties are
 * deep inside the Definition. Despite of this, they are still correctly compiled
 * and executed to create the result. This is recursiveness.
 * And what about fractal? It means that:
 * Every part of a Definition is a Definition. A Definition compiled is still a
 * Definition.
 * Definition is defined as the way to create a result from an Input. But this 'way'
 * thing is not restricted to a function. In fact, anything that describes, ort
 * can describe this way is a Definition.
 * Of course, programmatically, we have to use a function to do the conversion,
 * and this is exactly what compile() does: Given any Definition, compile()
 * turns it into a function. This function accepts the Input and returns the
 * result. Note that this function is also a Definition since it can also
 * describe the way of conversion, which means that we can compile a part of
 * a Definition and use it some hundreds of times to save the total compilation
 * time.
 * And by saying evert part of a Definition is a Definition, it means that
 * all primitives are Definitions, since 42 is a part of the Definition
 * { answer: 42 }.
 *
 * In the context of a Definition, we use two verbs:
 * 1. Compile: Compile any Definition and create a function Definition.
 * 2. Execute: Call the compiled funcion version of a Definition.
 *
 * The Definition code integrates well with the ECMAScript syntax, and in order
 * to make the code even more simpler, there two main ways:
 * 1. Use the helper functions provided in helpers.js.
 * 2. Use ES6 syntaxes like the spread syntax, as seen in definitions.js.
 *
 * About errors: The Definition module is designed to be simple, so error handling
 * is not included. Normally, by using the onWhen() helper function, rarely an
 * error would have to be thrown. However, in case of such necessity, you should
 * catch for errors outside the compiled function Definition, and be careful:
 * a => a[0] executed upon [] or a => a.foo executed opon {} will only get an
 * undefined without any errors. You might have to make sure that no undefined
 * is produced on correct Inputs, and check for undefined to throw an error.
 *
 * Nevertheless, compile.js is considered internal, that is, one should read the
 * project Wiki and use public API instead of reading in-code documentation.
 */

/**
 * Compile the Definition.
 * In details, compile() works as follows:
 * - A function Definition is compiled as the function itself. In practice,
 *   this means that a Definition can be compiled only once, compiling 100 times
 *   will produce strictly the save result as compiling one single time.
 * - An Array Definition is compiled by compiling each element of the array,
 *   returning a function that returns an Array containing the result of
 *   executing all the element Definitions.
 * - An object Definition is compiled by compiled each property of the object,
 *   returning a functioni that returns an object containing the results of
 *   executing all the property Definitions.
 * - Otherwise, the Definition is compiled as a function returning the Definition
 *   itself.
 *
 * @param {*} def The Definition to compile.
 * @returns {Function} The compiled function.
 */
const compile = (def) => {
    if (typeof def === 'function') return def;
    else if (isArray(def)) {
        const compiled = map(def, compile);
        return input => map(compiled, transformer => transformer(input));
    } else if (isObject(def)) {
        const compiled = mapValues(def, compile);
        return input => mapValues(compiled, transformer => transformer(input));
    }
    return () => def;
};

module.exports = compile;
