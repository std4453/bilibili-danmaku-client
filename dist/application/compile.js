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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcHBsaWNhdGlvbi9jb21waWxlLmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJtYXAiLCJtYXBWYWx1ZXMiLCJpc0FycmF5IiwiaXNPYmplY3QiLCJjb21waWxlIiwiZGVmIiwiY29tcGlsZWQiLCJ0cmFuc2Zvcm1lciIsImlucHV0IiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7ZUFBOENBLFFBQVEsUUFBUixDO0lBQXRDQyxHLFlBQUFBLEc7SUFBS0MsUyxZQUFBQSxTO0lBQVdDLE8sWUFBQUEsTztJQUFTQyxRLFlBQUFBLFE7QUFFakM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlGQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkEsSUFBTUMsVUFBVSxTQUFWQSxPQUFVLENBQUNDLEdBQUQsRUFBUztBQUNyQixNQUFJLE9BQU9BLEdBQVAsS0FBZSxVQUFuQixFQUErQixPQUFPQSxHQUFQLENBQS9CLEtBQ0ssSUFBSUgsUUFBUUcsR0FBUixDQUFKLEVBQWtCO0FBQ25CLFFBQU1DLFdBQVdOLElBQUlLLEdBQUosRUFBU0QsT0FBVCxDQUFqQjtBQUNBLFdBQU87QUFBQSxhQUFTSixJQUFJTSxRQUFKLEVBQWM7QUFBQSxlQUFlQyxZQUFZQyxLQUFaLENBQWY7QUFBQSxPQUFkLENBQVQ7QUFBQSxLQUFQO0FBQ0gsR0FISSxNQUdFLElBQUlMLFNBQVNFLEdBQVQsQ0FBSixFQUFtQjtBQUN0QixRQUFNQyxZQUFXTCxVQUFVSSxHQUFWLEVBQWVELE9BQWYsQ0FBakI7O0FBQ0EsV0FBTztBQUFBLGFBQVNILFVBQVVLLFNBQVYsRUFBb0I7QUFBQSxlQUFlQyxZQUFZQyxLQUFaLENBQWY7QUFBQSxPQUFwQixDQUFUO0FBQUEsS0FBUDtBQUNIO0FBQ0QsU0FBTztBQUFBLFdBQU1ILEdBQU47QUFBQSxHQUFQO0FBQ0gsQ0FWRDs7QUFZQUksT0FBT0MsT0FBUCxHQUFpQk4sT0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7IG1hcCwgbWFwVmFsdWVzLCBpc0FycmF5LCBpc09iamVjdCB9ID0gcmVxdWlyZSgnbG9kYXNoJyk7XHJcblxyXG4vKipcclxuICogQ29tcGlsZS5qcyBkZWZpbmVzIGNvbXBpbGUoKSAtIHRoZSBjb3JlIHRvIHRoZSBEZWZpbml0aW9uIG1vZHVsZS5cclxuICogY29tcGlsZSgpIGhhcyBpdHMgb3duIGRvY3VtZW50YXRpb24sIGFuZCBoZXJlLCB0aGUgRGVmaW5pdGlvbiBtb2R1bGUgaXNcclxuICogZGVzY3JpYmVkLlxyXG4gKlxyXG4gKiBBIERlZmluaXRpb24gZGVmaW5lcyBob3cgdG8gY3JlYXRlIGEgcmVzdWx0IGZyb20gYW4gSW5wdXQuIFRoaXMgY29uY2VwdFxyXG4gKiBpcyBvZnRlbiBleHByZXNzZXMgYXMgZnVuY3Rpb25zLCB3aGlsZSBEZWZpbml0aW9uIGZvY3VzZXMgb24gdGhlIGZvbGxvd2luZ1xyXG4gKiBjaGFyYWN0ZXJpc3RpY3M6IFJlYWRhYmlsaXR5IGFuZCBzaW1wbGljaXR5LlxyXG4gKiBSZWFkYWJpbGl0eSBtYWlubHkgbGVhZHMgdG8gdGhlIHN0cnVjdHVyZWQgbmF0dXJlIG9mIERlZmluaXRpb25zLCB0b2dldGhlclxyXG4gKiB3aXRoIGl0cyBuYXRpdmUtRUNNQVNjcmlwdCBzeW50YXguIEl0cyBwb3dzZXIgYW5kIGVsZWdhbmNlIGNhbiBiZSBzZWVuXHJcbiAqIGluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZTpcclxuICpcclxuICogY29uc3QgZGVmID0gY29tcGlsZSh7XHJcbiAqICAgICBmb286IGEgPT4gYVswXSxcclxuICogICAgIGJhcjogYSA9PiBhWzFdLFxyXG4gKiAgICAgYmF6OiBbYSA9PiBhWzJdLCBhID0+IGFbM10sIHtcclxuICogICAgICAgICBxdXg6IGEgPT4gYVs0XSxcclxuICogICAgICAgICBxdXV4OiBhID0+IGFbNV0sXHJcbiAqICAgICB9XSxcclxuICogfSk7XHJcbiAqIGNvbnN0IHJlc3VsdCA9IGRlZihbMCwgMSwgMiwgMywgNCwgNV0pO1xyXG4gKlxyXG4gKiBBbmQgcmVzdWx0IHdpbGwgYmU6XHJcbiAqIHtcclxuICogICAgIGZvbzogMCxcclxuICogICAgIGJhcjogMSxcclxuICogICAgIGJhejogWzIsIDMsIHtcclxuICogICAgICAgICBxdXg6IDQsXHJcbiAqICAgICAgICAgcXV1ejogNSxcclxuICogICAgIH1dLFxyXG4gKiB9XHJcbiAqXHJcbiAqIEkgaG9wZSB5b3UndmUgZ290IHRoZSBpZGVhLiBUaGUgRGVmaW5pdGlvbiBsb29rcyBqdXN0IGxpa2UgdGhlIHJlc3VsdCwgZXhjZXB0XHJcbiAqIHRoYXQgZXZlcnkgdmFsdWUgaXMgcmVwbGFjZWQgYnkgYSBmdW5jdGlvbiB0aGF0IHByb2R1Y2VzIHRoZSB2YWx1ZSBmcm9tIHRoZSBJbnB1dCxcclxuICogd2hpY2ggbWFrZXMgdGhlIERlZmluaXRpb24gY29kZSB2ZXJ5IGVhc3kgdG8gcmVhZCBhbmQgdW5kZXJzdGFuZC4gUmVhZGVycyBjYW5cclxuICogZ2V0IGEgZGlyZWN0IGltYWdlIG9mIHdoYXQgd2lsbCBiZSBwcm9kdWNlZCBieSB0aGlzIERlZmluaXRpb24uXHJcbiAqIEFuZCBub3cgeW91J3ZlIGdvdCB0aGUgaWRlYSBvZiBJbnB1dCwgbGV0J3Mgc2VlIHNpbXBsaWNpdHkuXHJcbiAqXHJcbiAqIFNpbXBsaWNpdHkgbGVhZHMgdG8gdGhlIHJlY3Vyc2l2ZSBhbmQgZnJhY3RhbCBmZWF0dXJlIG9mIERlZmluaXRpb24sIGFsb25nIHdpdGhcclxuICogdGhlIGNvbXBpbGUoKSBmdW5jdGlvbi5cclxuICogU28gaW4gdGhlIHByZXZpb3VzIGV4YW1wbGUgeW91IGNhbiBzZWUgdGhhdCB0aGUgJ3F1eCcgYW5kICdxdXV4JyBwcm9wZXJ0aWVzIGFyZVxyXG4gKiBkZWVwIGluc2lkZSB0aGUgRGVmaW5pdGlvbi4gRGVzcGl0ZSBvZiB0aGlzLCB0aGV5IGFyZSBzdGlsbCBjb3JyZWN0bHkgY29tcGlsZWRcclxuICogYW5kIGV4ZWN1dGVkIHRvIGNyZWF0ZSB0aGUgcmVzdWx0LiBUaGlzIGlzIHJlY3Vyc2l2ZW5lc3MuXHJcbiAqIEFuZCB3aGF0IGFib3V0IGZyYWN0YWw/IEl0IG1lYW5zIHRoYXQ6XHJcbiAqIEV2ZXJ5IHBhcnQgb2YgYSBEZWZpbml0aW9uIGlzIGEgRGVmaW5pdGlvbi4gQSBEZWZpbml0aW9uIGNvbXBpbGVkIGlzIHN0aWxsIGFcclxuICogRGVmaW5pdGlvbi5cclxuICogRGVmaW5pdGlvbiBpcyBkZWZpbmVkIGFzIHRoZSB3YXkgdG8gY3JlYXRlIGEgcmVzdWx0IGZyb20gYW4gSW5wdXQuIEJ1dCB0aGlzICd3YXknXHJcbiAqIHRoaW5nIGlzIG5vdCByZXN0cmljdGVkIHRvIGEgZnVuY3Rpb24uIEluIGZhY3QsIGFueXRoaW5nIHRoYXQgZGVzY3JpYmVzLCBvcnRcclxuICogY2FuIGRlc2NyaWJlIHRoaXMgd2F5IGlzIGEgRGVmaW5pdGlvbi5cclxuICogT2YgY291cnNlLCBwcm9ncmFtbWF0aWNhbGx5LCB3ZSBoYXZlIHRvIHVzZSBhIGZ1bmN0aW9uIHRvIGRvIHRoZSBjb252ZXJzaW9uLFxyXG4gKiBhbmQgdGhpcyBpcyBleGFjdGx5IHdoYXQgY29tcGlsZSgpIGRvZXM6IEdpdmVuIGFueSBEZWZpbml0aW9uLCBjb21waWxlKClcclxuICogdHVybnMgaXQgaW50byBhIGZ1bmN0aW9uLiBUaGlzIGZ1bmN0aW9uIGFjY2VwdHMgdGhlIElucHV0IGFuZCByZXR1cm5zIHRoZVxyXG4gKiByZXN1bHQuIE5vdGUgdGhhdCB0aGlzIGZ1bmN0aW9uIGlzIGFsc28gYSBEZWZpbml0aW9uIHNpbmNlIGl0IGNhbiBhbHNvXHJcbiAqIGRlc2NyaWJlIHRoZSB3YXkgb2YgY29udmVyc2lvbiwgd2hpY2ggbWVhbnMgdGhhdCB3ZSBjYW4gY29tcGlsZSBhIHBhcnQgb2ZcclxuICogYSBEZWZpbml0aW9uIGFuZCB1c2UgaXQgc29tZSBodW5kcmVkcyBvZiB0aW1lcyB0byBzYXZlIHRoZSB0b3RhbCBjb21waWxhdGlvblxyXG4gKiB0aW1lLlxyXG4gKiBBbmQgYnkgc2F5aW5nIGV2ZXJ0IHBhcnQgb2YgYSBEZWZpbml0aW9uIGlzIGEgRGVmaW5pdGlvbiwgaXQgbWVhbnMgdGhhdFxyXG4gKiBhbGwgcHJpbWl0aXZlcyBhcmUgRGVmaW5pdGlvbnMsIHNpbmNlIDQyIGlzIGEgcGFydCBvZiB0aGUgRGVmaW5pdGlvblxyXG4gKiB7IGFuc3dlcjogNDIgfS5cclxuICpcclxuICogSW4gdGhlIGNvbnRleHQgb2YgYSBEZWZpbml0aW9uLCB3ZSB1c2UgdHdvIHZlcmJzOlxyXG4gKiAxLiBDb21waWxlOiBDb21waWxlIGFueSBEZWZpbml0aW9uIGFuZCBjcmVhdGUgYSBmdW5jdGlvbiBEZWZpbml0aW9uLlxyXG4gKiAyLiBFeGVjdXRlOiBDYWxsIHRoZSBjb21waWxlZCBmdW5jaW9uIHZlcnNpb24gb2YgYSBEZWZpbml0aW9uLlxyXG4gKlxyXG4gKiBUaGUgRGVmaW5pdGlvbiBjb2RlIGludGVncmF0ZXMgd2VsbCB3aXRoIHRoZSBFQ01BU2NyaXB0IHN5bnRheCwgYW5kIGluIG9yZGVyXHJcbiAqIHRvIG1ha2UgdGhlIGNvZGUgZXZlbiBtb3JlIHNpbXBsZXIsIHRoZXJlIHR3byBtYWluIHdheXM6XHJcbiAqIDEuIFVzZSB0aGUgaGVscGVyIGZ1bmN0aW9ucyBwcm92aWRlZCBpbiBoZWxwZXJzLmpzLlxyXG4gKiAyLiBVc2UgRVM2IHN5bnRheGVzIGxpa2UgdGhlIHNwcmVhZCBzeW50YXgsIGFzIHNlZW4gaW4gZGVmaW5pdGlvbnMuanMuXHJcbiAqXHJcbiAqIEFib3V0IGVycm9yczogVGhlIERlZmluaXRpb24gbW9kdWxlIGlzIGRlc2lnbmVkIHRvIGJlIHNpbXBsZSwgc28gZXJyb3IgaGFuZGxpbmdcclxuICogaXMgbm90IGluY2x1ZGVkLiBOb3JtYWxseSwgYnkgdXNpbmcgdGhlIG9uV2hlbigpIGhlbHBlciBmdW5jdGlvbiwgcmFyZWx5IGFuXHJcbiAqIGVycm9yIHdvdWxkIGhhdmUgdG8gYmUgdGhyb3duLiBIb3dldmVyLCBpbiBjYXNlIG9mIHN1Y2ggbmVjZXNzaXR5LCB5b3Ugc2hvdWxkXHJcbiAqIGNhdGNoIGZvciBlcnJvcnMgb3V0c2lkZSB0aGUgY29tcGlsZWQgZnVuY3Rpb24gRGVmaW5pdGlvbiwgYW5kIGJlIGNhcmVmdWw6XHJcbiAqIGEgPT4gYVswXSBleGVjdXRlZCB1cG9uIFtdIG9yIGEgPT4gYS5mb28gZXhlY3V0ZWQgb3BvbiB7fSB3aWxsIG9ubHkgZ2V0IGFuXHJcbiAqIHVuZGVmaW5lZCB3aXRob3V0IGFueSBlcnJvcnMuIFlvdSBtaWdodCBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IG5vIHVuZGVmaW5lZFxyXG4gKiBpcyBwcm9kdWNlZCBvbiBjb3JyZWN0IElucHV0cywgYW5kIGNoZWNrIGZvciB1bmRlZmluZWQgdG8gdGhyb3cgYW4gZXJyb3IuXHJcbiAqXHJcbiAqIE5ldmVydGhlbGVzcywgY29tcGlsZS5qcyBpcyBjb25zaWRlcmVkIGludGVybmFsLCB0aGF0IGlzLCBvbmUgc2hvdWxkIHJlYWQgdGhlXHJcbiAqIHByb2plY3QgV2lraSBhbmQgdXNlIHB1YmxpYyBBUEkgaW5zdGVhZCBvZiByZWFkaW5nIGluLWNvZGUgZG9jdW1lbnRhdGlvbi5cclxuICovXHJcblxyXG4vKipcclxuICogQ29tcGlsZSB0aGUgRGVmaW5pdGlvbi5cclxuICogSW4gZGV0YWlscywgY29tcGlsZSgpIHdvcmtzIGFzIGZvbGxvd3M6XHJcbiAqIC0gQSBmdW5jdGlvbiBEZWZpbml0aW9uIGlzIGNvbXBpbGVkIGFzIHRoZSBmdW5jdGlvbiBpdHNlbGYuIEluIHByYWN0aWNlLFxyXG4gKiAgIHRoaXMgbWVhbnMgdGhhdCBhIERlZmluaXRpb24gY2FuIGJlIGNvbXBpbGVkIG9ubHkgb25jZSwgY29tcGlsaW5nIDEwMCB0aW1lc1xyXG4gKiAgIHdpbGwgcHJvZHVjZSBzdHJpY3RseSB0aGUgc2F2ZSByZXN1bHQgYXMgY29tcGlsaW5nIG9uZSBzaW5nbGUgdGltZS5cclxuICogLSBBbiBBcnJheSBEZWZpbml0aW9uIGlzIGNvbXBpbGVkIGJ5IGNvbXBpbGluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIGFycmF5LFxyXG4gKiAgIHJldHVybmluZyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBBcnJheSBjb250YWluaW5nIHRoZSByZXN1bHQgb2ZcclxuICogICBleGVjdXRpbmcgYWxsIHRoZSBlbGVtZW50IERlZmluaXRpb25zLlxyXG4gKiAtIEFuIG9iamVjdCBEZWZpbml0aW9uIGlzIGNvbXBpbGVkIGJ5IGNvbXBpbGVkIGVhY2ggcHJvcGVydHkgb2YgdGhlIG9iamVjdCxcclxuICogICByZXR1cm5pbmcgYSBmdW5jdGlvbmkgdGhhdCByZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSByZXN1bHRzIG9mXHJcbiAqICAgZXhlY3V0aW5nIGFsbCB0aGUgcHJvcGVydHkgRGVmaW5pdGlvbnMuXHJcbiAqIC0gT3RoZXJ3aXNlLCB0aGUgRGVmaW5pdGlvbiBpcyBjb21waWxlZCBhcyBhIGZ1bmN0aW9uIHJldHVybmluZyB0aGUgRGVmaW5pdGlvblxyXG4gKiAgIGl0c2VsZi5cclxuICpcclxuICogQHBhcmFtIHsqfSBkZWYgVGhlIERlZmluaXRpb24gdG8gY29tcGlsZS5cclxuICogQHJldHVybnMge0Z1bmN0aW9ufSBUaGUgY29tcGlsZWQgZnVuY3Rpb24uXHJcbiAqL1xyXG5jb25zdCBjb21waWxlID0gKGRlZikgPT4ge1xyXG4gICAgaWYgKHR5cGVvZiBkZWYgPT09ICdmdW5jdGlvbicpIHJldHVybiBkZWY7XHJcbiAgICBlbHNlIGlmIChpc0FycmF5KGRlZikpIHtcclxuICAgICAgICBjb25zdCBjb21waWxlZCA9IG1hcChkZWYsIGNvbXBpbGUpO1xyXG4gICAgICAgIHJldHVybiBpbnB1dCA9PiBtYXAoY29tcGlsZWQsIHRyYW5zZm9ybWVyID0+IHRyYW5zZm9ybWVyKGlucHV0KSk7XHJcbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KGRlZikpIHtcclxuICAgICAgICBjb25zdCBjb21waWxlZCA9IG1hcFZhbHVlcyhkZWYsIGNvbXBpbGUpO1xyXG4gICAgICAgIHJldHVybiBpbnB1dCA9PiBtYXBWYWx1ZXMoY29tcGlsZWQsIHRyYW5zZm9ybWVyID0+IHRyYW5zZm9ybWVyKGlucHV0KSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKCkgPT4gZGVmO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjb21waWxlO1xyXG4iXX0=