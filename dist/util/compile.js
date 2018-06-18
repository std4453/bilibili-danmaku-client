"use strict";

var _require = require('lodash'),
    map = _require.map,
    mapValues = _require.mapValues,
    isArray = _require.isArray,
    isObject = _require.isObject;
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


var compile = function compile(def) {
  if (typeof def === 'function') return def;else if (isArray(def)) {
    var compiled = map(def, compile);
    return function (input) {
      return map(compiled, function (transformer) {
        return transformer(input);
      });
    };
  } else if (isObject(def)) {
    var _compiled = mapValues(def, compile);

    return function (input) {
      return mapValues(_compiled, function (transformer) {
        return transformer(input);
      });
    };
  }
  return function () {
    return def;
  };
};

module.exports = compile;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL2NvbXBpbGUuanMiXSwibmFtZXMiOlsicmVxdWlyZSIsIm1hcCIsIm1hcFZhbHVlcyIsImlzQXJyYXkiLCJpc09iamVjdCIsImNvbXBpbGUiLCJkZWYiLCJjb21waWxlZCIsInRyYW5zZm9ybWVyIiwiaW5wdXQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOztlQUE4Q0EsUUFBUSxRQUFSLEM7SUFBdENDLEcsWUFBQUEsRztJQUFLQyxTLFlBQUFBLFM7SUFBV0MsTyxZQUFBQSxPO0lBQVNDLFEsWUFBQUEsUTtBQUVqQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUZBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCQSxJQUFNQyxVQUFVLFNBQVZBLE9BQVUsQ0FBQ0MsR0FBRCxFQUFTO0FBQ3JCLE1BQUksT0FBT0EsR0FBUCxLQUFlLFVBQW5CLEVBQStCLE9BQU9BLEdBQVAsQ0FBL0IsS0FDSyxJQUFJSCxRQUFRRyxHQUFSLENBQUosRUFBa0I7QUFDbkIsUUFBTUMsV0FBV04sSUFBSUssR0FBSixFQUFTRCxPQUFULENBQWpCO0FBQ0EsV0FBTztBQUFBLGFBQVNKLElBQUlNLFFBQUosRUFBYztBQUFBLGVBQWVDLFlBQVlDLEtBQVosQ0FBZjtBQUFBLE9BQWQsQ0FBVDtBQUFBLEtBQVA7QUFDSCxHQUhJLE1BR0UsSUFBSUwsU0FBU0UsR0FBVCxDQUFKLEVBQW1CO0FBQ3RCLFFBQU1DLFlBQVdMLFVBQVVJLEdBQVYsRUFBZUQsT0FBZixDQUFqQjs7QUFDQSxXQUFPO0FBQUEsYUFBU0gsVUFBVUssU0FBVixFQUFvQjtBQUFBLGVBQWVDLFlBQVlDLEtBQVosQ0FBZjtBQUFBLE9BQXBCLENBQVQ7QUFBQSxLQUFQO0FBQ0g7QUFDRCxTQUFPO0FBQUEsV0FBTUgsR0FBTjtBQUFBLEdBQVA7QUFDSCxDQVZEOztBQVlBSSxPQUFPQyxPQUFQLEdBQWlCTixPQUFqQiIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHsgbWFwLCBtYXBWYWx1ZXMsIGlzQXJyYXksIGlzT2JqZWN0IH0gPSByZXF1aXJlKCdsb2Rhc2gnKTtcclxuXHJcbi8qKlxyXG4gKiBDb21waWxlLmpzIGRlZmluZXMgY29tcGlsZSgpIC0gdGhlIGNvcmUgdG8gdGhlIERlZmluaXRpb24gbW9kdWxlLlxyXG4gKiBjb21waWxlKCkgaGFzIGl0cyBvd24gZG9jdW1lbnRhdGlvbiwgYW5kIGhlcmUsIHRoZSBEZWZpbml0aW9uIG1vZHVsZSBpc1xyXG4gKiBkZXNjcmliZWQuXHJcbiAqXHJcbiAqIEEgRGVmaW5pdGlvbiBkZWZpbmVzIGhvdyB0byBjcmVhdGUgYSByZXN1bHQgZnJvbSBhbiBJbnB1dC4gVGhpcyBjb25jZXB0XHJcbiAqIGlzIG9mdGVuIGV4cHJlc3NlcyBhcyBmdW5jdGlvbnMsIHdoaWxlIERlZmluaXRpb24gZm9jdXNlcyBvbiB0aGUgZm9sbG93aW5nXHJcbiAqIGNoYXJhY3RlcmlzdGljczogUmVhZGFiaWxpdHkgYW5kIHNpbXBsaWNpdHkuXHJcbiAqIFJlYWRhYmlsaXR5IG1haW5seSBsZWFkcyB0byB0aGUgc3RydWN0dXJlZCBuYXR1cmUgb2YgRGVmaW5pdGlvbnMsIHRvZ2V0aGVyXHJcbiAqIHdpdGggaXRzIG5hdGl2ZS1FQ01BU2NyaXB0IHN5bnRheC4gSXRzIHBvd3NlciBhbmQgZWxlZ2FuY2UgY2FuIGJlIHNlZW5cclxuICogaW4gdGhlIGZvbGxvd2luZyBleGFtcGxlOlxyXG4gKlxyXG4gKiBjb25zdCBkZWYgPSBjb21waWxlKHtcclxuICogICAgIGZvbzogYSA9PiBhWzBdLFxyXG4gKiAgICAgYmFyOiBhID0+IGFbMV0sXHJcbiAqICAgICBiYXo6IFthID0+IGFbMl0sIGEgPT4gYVszXSwge1xyXG4gKiAgICAgICAgIHF1eDogYSA9PiBhWzRdLFxyXG4gKiAgICAgICAgIHF1dXg6IGEgPT4gYVs1XSxcclxuICogICAgIH1dLFxyXG4gKiB9KTtcclxuICogY29uc3QgcmVzdWx0ID0gZGVmKFswLCAxLCAyLCAzLCA0LCA1XSk7XHJcbiAqXHJcbiAqIEFuZCByZXN1bHQgd2lsbCBiZTpcclxuICoge1xyXG4gKiAgICAgZm9vOiAwLFxyXG4gKiAgICAgYmFyOiAxLFxyXG4gKiAgICAgYmF6OiBbMiwgMywge1xyXG4gKiAgICAgICAgIHF1eDogNCxcclxuICogICAgICAgICBxdXV6OiA1LFxyXG4gKiAgICAgfV0sXHJcbiAqIH1cclxuICpcclxuICogSSBob3BlIHlvdSd2ZSBnb3QgdGhlIGlkZWEuIFRoZSBEZWZpbml0aW9uIGxvb2tzIGp1c3QgbGlrZSB0aGUgcmVzdWx0LCBleGNlcHRcclxuICogdGhhdCBldmVyeSB2YWx1ZSBpcyByZXBsYWNlZCBieSBhIGZ1bmN0aW9uIHRoYXQgcHJvZHVjZXMgdGhlIHZhbHVlIGZyb20gdGhlIElucHV0LFxyXG4gKiB3aGljaCBtYWtlcyB0aGUgRGVmaW5pdGlvbiBjb2RlIHZlcnkgZWFzeSB0byByZWFkIGFuZCB1bmRlcnN0YW5kLiBSZWFkZXJzIGNhblxyXG4gKiBnZXQgYSBkaXJlY3QgaW1hZ2Ugb2Ygd2hhdCB3aWxsIGJlIHByb2R1Y2VkIGJ5IHRoaXMgRGVmaW5pdGlvbi5cclxuICogQW5kIG5vdyB5b3UndmUgZ290IHRoZSBpZGVhIG9mIElucHV0LCBsZXQncyBzZWUgc2ltcGxpY2l0eS5cclxuICpcclxuICogU2ltcGxpY2l0eSBsZWFkcyB0byB0aGUgcmVjdXJzaXZlIGFuZCBmcmFjdGFsIGZlYXR1cmUgb2YgRGVmaW5pdGlvbiwgYWxvbmcgd2l0aFxyXG4gKiB0aGUgY29tcGlsZSgpIGZ1bmN0aW9uLlxyXG4gKiBTbyBpbiB0aGUgcHJldmlvdXMgZXhhbXBsZSB5b3UgY2FuIHNlZSB0aGF0IHRoZSAncXV4JyBhbmQgJ3F1dXgnIHByb3BlcnRpZXMgYXJlXHJcbiAqIGRlZXAgaW5zaWRlIHRoZSBEZWZpbml0aW9uLiBEZXNwaXRlIG9mIHRoaXMsIHRoZXkgYXJlIHN0aWxsIGNvcnJlY3RseSBjb21waWxlZFxyXG4gKiBhbmQgZXhlY3V0ZWQgdG8gY3JlYXRlIHRoZSByZXN1bHQuIFRoaXMgaXMgcmVjdXJzaXZlbmVzcy5cclxuICogQW5kIHdoYXQgYWJvdXQgZnJhY3RhbD8gSXQgbWVhbnMgdGhhdDpcclxuICogRXZlcnkgcGFydCBvZiBhIERlZmluaXRpb24gaXMgYSBEZWZpbml0aW9uLiBBIERlZmluaXRpb24gY29tcGlsZWQgaXMgc3RpbGwgYVxyXG4gKiBEZWZpbml0aW9uLlxyXG4gKiBEZWZpbml0aW9uIGlzIGRlZmluZWQgYXMgdGhlIHdheSB0byBjcmVhdGUgYSByZXN1bHQgZnJvbSBhbiBJbnB1dC4gQnV0IHRoaXMgJ3dheSdcclxuICogdGhpbmcgaXMgbm90IHJlc3RyaWN0ZWQgdG8gYSBmdW5jdGlvbi4gSW4gZmFjdCwgYW55dGhpbmcgdGhhdCBkZXNjcmliZXMsIG9ydFxyXG4gKiBjYW4gZGVzY3JpYmUgdGhpcyB3YXkgaXMgYSBEZWZpbml0aW9uLlxyXG4gKiBPZiBjb3Vyc2UsIHByb2dyYW1tYXRpY2FsbHksIHdlIGhhdmUgdG8gdXNlIGEgZnVuY3Rpb24gdG8gZG8gdGhlIGNvbnZlcnNpb24sXHJcbiAqIGFuZCB0aGlzIGlzIGV4YWN0bHkgd2hhdCBjb21waWxlKCkgZG9lczogR2l2ZW4gYW55IERlZmluaXRpb24sIGNvbXBpbGUoKVxyXG4gKiB0dXJucyBpdCBpbnRvIGEgZnVuY3Rpb24uIFRoaXMgZnVuY3Rpb24gYWNjZXB0cyB0aGUgSW5wdXQgYW5kIHJldHVybnMgdGhlXHJcbiAqIHJlc3VsdC4gTm90ZSB0aGF0IHRoaXMgZnVuY3Rpb24gaXMgYWxzbyBhIERlZmluaXRpb24gc2luY2UgaXQgY2FuIGFsc29cclxuICogZGVzY3JpYmUgdGhlIHdheSBvZiBjb252ZXJzaW9uLCB3aGljaCBtZWFucyB0aGF0IHdlIGNhbiBjb21waWxlIGEgcGFydCBvZlxyXG4gKiBhIERlZmluaXRpb24gYW5kIHVzZSBpdCBzb21lIGh1bmRyZWRzIG9mIHRpbWVzIHRvIHNhdmUgdGhlIHRvdGFsIGNvbXBpbGF0aW9uXHJcbiAqIHRpbWUuXHJcbiAqIEFuZCBieSBzYXlpbmcgZXZlcnQgcGFydCBvZiBhIERlZmluaXRpb24gaXMgYSBEZWZpbml0aW9uLCBpdCBtZWFucyB0aGF0XHJcbiAqIGFsbCBwcmltaXRpdmVzIGFyZSBEZWZpbml0aW9ucywgc2luY2UgNDIgaXMgYSBwYXJ0IG9mIHRoZSBEZWZpbml0aW9uXHJcbiAqIHsgYW5zd2VyOiA0MiB9LlxyXG4gKlxyXG4gKiBJbiB0aGUgY29udGV4dCBvZiBhIERlZmluaXRpb24sIHdlIHVzZSB0d28gdmVyYnM6XHJcbiAqIDEuIENvbXBpbGU6IENvbXBpbGUgYW55IERlZmluaXRpb24gYW5kIGNyZWF0ZSBhIGZ1bmN0aW9uIERlZmluaXRpb24uXHJcbiAqIDIuIEV4ZWN1dGU6IENhbGwgdGhlIGNvbXBpbGVkIGZ1bmNpb24gdmVyc2lvbiBvZiBhIERlZmluaXRpb24uXHJcbiAqXHJcbiAqIFRoZSBEZWZpbml0aW9uIGNvZGUgaW50ZWdyYXRlcyB3ZWxsIHdpdGggdGhlIEVDTUFTY3JpcHQgc3ludGF4LCBhbmQgaW4gb3JkZXJcclxuICogdG8gbWFrZSB0aGUgY29kZSBldmVuIG1vcmUgc2ltcGxlciwgdGhlcmUgdHdvIG1haW4gd2F5czpcclxuICogMS4gVXNlIHRoZSBoZWxwZXIgZnVuY3Rpb25zIHByb3ZpZGVkIGluIGhlbHBlcnMuanMuXHJcbiAqIDIuIFVzZSBFUzYgc3ludGF4ZXMgbGlrZSB0aGUgc3ByZWFkIHN5bnRheCwgYXMgc2VlbiBpbiBkZWZpbml0aW9ucy5qcy5cclxuICpcclxuICogQWJvdXQgZXJyb3JzOiBUaGUgRGVmaW5pdGlvbiBtb2R1bGUgaXMgZGVzaWduZWQgdG8gYmUgc2ltcGxlLCBzbyBlcnJvciBoYW5kbGluZ1xyXG4gKiBpcyBub3QgaW5jbHVkZWQuIE5vcm1hbGx5LCBieSB1c2luZyB0aGUgb25XaGVuKCkgaGVscGVyIGZ1bmN0aW9uLCByYXJlbHkgYW5cclxuICogZXJyb3Igd291bGQgaGF2ZSB0byBiZSB0aHJvd24uIEhvd2V2ZXIsIGluIGNhc2Ugb2Ygc3VjaCBuZWNlc3NpdHksIHlvdSBzaG91bGRcclxuICogY2F0Y2ggZm9yIGVycm9ycyBvdXRzaWRlIHRoZSBjb21waWxlZCBmdW5jdGlvbiBEZWZpbml0aW9uLCBhbmQgYmUgY2FyZWZ1bDpcclxuICogYSA9PiBhWzBdIGV4ZWN1dGVkIHVwb24gW10gb3IgYSA9PiBhLmZvbyBleGVjdXRlZCBvcG9uIHt9IHdpbGwgb25seSBnZXQgYW5cclxuICogdW5kZWZpbmVkIHdpdGhvdXQgYW55IGVycm9ycy4gWW91IG1pZ2h0IGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgbm8gdW5kZWZpbmVkXHJcbiAqIGlzIHByb2R1Y2VkIG9uIGNvcnJlY3QgSW5wdXRzLCBhbmQgY2hlY2sgZm9yIHVuZGVmaW5lZCB0byB0aHJvdyBhbiBlcnJvci5cclxuICpcclxuICogTmV2ZXJ0aGVsZXNzLCBjb21waWxlLmpzIGlzIGNvbnNpZGVyZWQgaW50ZXJuYWwsIHRoYXQgaXMsIG9uZSBzaG91bGQgcmVhZCB0aGVcclxuICogcHJvamVjdCBXaWtpIGFuZCB1c2UgcHVibGljIEFQSSBpbnN0ZWFkIG9mIHJlYWRpbmcgaW4tY29kZSBkb2N1bWVudGF0aW9uLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBDb21waWxlIHRoZSBEZWZpbml0aW9uLlxyXG4gKiBJbiBkZXRhaWxzLCBjb21waWxlKCkgd29ya3MgYXMgZm9sbG93czpcclxuICogLSBBIGZ1bmN0aW9uIERlZmluaXRpb24gaXMgY29tcGlsZWQgYXMgdGhlIGZ1bmN0aW9uIGl0c2VsZi4gSW4gcHJhY3RpY2UsXHJcbiAqICAgdGhpcyBtZWFucyB0aGF0IGEgRGVmaW5pdGlvbiBjYW4gYmUgY29tcGlsZWQgb25seSBvbmNlLCBjb21waWxpbmcgMTAwIHRpbWVzXHJcbiAqICAgd2lsbCBwcm9kdWNlIHN0cmljdGx5IHRoZSBzYXZlIHJlc3VsdCBhcyBjb21waWxpbmcgb25lIHNpbmdsZSB0aW1lLlxyXG4gKiAtIEFuIEFycmF5IERlZmluaXRpb24gaXMgY29tcGlsZWQgYnkgY29tcGlsaW5nIGVhY2ggZWxlbWVudCBvZiB0aGUgYXJyYXksXHJcbiAqICAgcmV0dXJuaW5nIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIEFycmF5IGNvbnRhaW5pbmcgdGhlIHJlc3VsdCBvZlxyXG4gKiAgIGV4ZWN1dGluZyBhbGwgdGhlIGVsZW1lbnQgRGVmaW5pdGlvbnMuXHJcbiAqIC0gQW4gb2JqZWN0IERlZmluaXRpb24gaXMgY29tcGlsZWQgYnkgY29tcGlsZWQgZWFjaCBwcm9wZXJ0eSBvZiB0aGUgb2JqZWN0LFxyXG4gKiAgIHJldHVybmluZyBhIGZ1bmN0aW9uaSB0aGF0IHJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHJlc3VsdHMgb2ZcclxuICogICBleGVjdXRpbmcgYWxsIHRoZSBwcm9wZXJ0eSBEZWZpbml0aW9ucy5cclxuICogLSBPdGhlcndpc2UsIHRoZSBEZWZpbml0aW9uIGlzIGNvbXBpbGVkIGFzIGEgZnVuY3Rpb24gcmV0dXJuaW5nIHRoZSBEZWZpbml0aW9uXHJcbiAqICAgaXRzZWxmLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IGRlZiBUaGUgRGVmaW5pdGlvbiB0byBjb21waWxlLlxyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFRoZSBjb21waWxlZCBmdW5jdGlvbi5cclxuICovXHJcbmNvbnN0IGNvbXBpbGUgPSAoZGVmKSA9PiB7XHJcbiAgICBpZiAodHlwZW9mIGRlZiA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGRlZjtcclxuICAgIGVsc2UgaWYgKGlzQXJyYXkoZGVmKSkge1xyXG4gICAgICAgIGNvbnN0IGNvbXBpbGVkID0gbWFwKGRlZiwgY29tcGlsZSk7XHJcbiAgICAgICAgcmV0dXJuIGlucHV0ID0+IG1hcChjb21waWxlZCwgdHJhbnNmb3JtZXIgPT4gdHJhbnNmb3JtZXIoaW5wdXQpKTtcclxuICAgIH0gZWxzZSBpZiAoaXNPYmplY3QoZGVmKSkge1xyXG4gICAgICAgIGNvbnN0IGNvbXBpbGVkID0gbWFwVmFsdWVzKGRlZiwgY29tcGlsZSk7XHJcbiAgICAgICAgcmV0dXJuIGlucHV0ID0+IG1hcFZhbHVlcyhjb21waWxlZCwgdHJhbnNmb3JtZXIgPT4gdHJhbnNmb3JtZXIoaW5wdXQpKTtcclxuICAgIH1cclxuICAgIHJldHVybiAoKSA9PiBkZWY7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNvbXBpbGU7XHJcbiJdfQ==