"use strict";

/**
 * This file contains the class definition of Transformer.
 * Transformer is used to transform JSONs into Events.
 * See documentation of Transformer for details.
 * The Tramsformer class is considered internal, that is, it should not be
 * used by applications without good reasons.
 *
 * For the concept of Definition and Input, see compile.js.
 */
var compile = require('./compile');

var ApplicationEvent = require('./ApplicationEvent');
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


var Transformer =
/*#__PURE__*/
function () {
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
  function Transformer(cmd, name, def) {
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


  var _proto = Transformer.prototype;

  _proto.transform = function transform(input) {
    return new ApplicationEvent(this.name, this.fn(input));
  };

  return Transformer;
}();

module.exports = Transformer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcHBsaWNhdGlvbi9UcmFuc2Zvcm1lci5qcyJdLCJuYW1lcyI6WyJjb21waWxlIiwicmVxdWlyZSIsIkFwcGxpY2F0aW9uRXZlbnQiLCJUcmFuc2Zvcm1lciIsImNtZCIsIm5hbWUiLCJkZWYiLCJmbiIsInRyYW5zZm9ybSIsImlucHV0IiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7O0FBVUEsSUFBTUEsVUFBVUMsUUFBUSxXQUFSLENBQWhCOztBQUNBLElBQU1DLG1CQUFtQkQsUUFBUSxvQkFBUixDQUF6QjtBQUVBOzs7Ozs7Ozs7Ozs7SUFVTUUsVzs7O0FBQ0Y7Ozs7Ozs7Ozs7QUFVQSx1QkFBWUMsR0FBWixFQUFpQkMsSUFBakIsRUFBdUJDLEdBQXZCLEVBQTRCO0FBQ3hCLFNBQUtGLEdBQUwsR0FBV0EsR0FBWDtBQUNBLFNBQUtDLElBQUwsR0FBWUEsSUFBWjtBQUNBLFNBQUtFLEVBQUwsR0FBVVAsUUFBUU0sR0FBUixDQUFWO0FBQ0g7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FhQUUsUyxzQkFBVUMsSyxFQUFPO0FBQ2IsV0FBTyxJQUFJUCxnQkFBSixDQUFxQixLQUFLRyxJQUExQixFQUFnQyxLQUFLRSxFQUFMLENBQVFFLEtBQVIsQ0FBaEMsQ0FBUDtBQUNILEc7Ozs7O0FBR0xDLE9BQU9DLE9BQVAsR0FBaUJSLFdBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIFRoaXMgZmlsZSBjb250YWlucyB0aGUgY2xhc3MgZGVmaW5pdGlvbiBvZiBUcmFuc2Zvcm1lci5cclxuICogVHJhbnNmb3JtZXIgaXMgdXNlZCB0byB0cmFuc2Zvcm0gSlNPTnMgaW50byBFdmVudHMuXHJcbiAqIFNlZSBkb2N1bWVudGF0aW9uIG9mIFRyYW5zZm9ybWVyIGZvciBkZXRhaWxzLlxyXG4gKiBUaGUgVHJhbXNmb3JtZXIgY2xhc3MgaXMgY29uc2lkZXJlZCBpbnRlcm5hbCwgdGhhdCBpcywgaXQgc2hvdWxkIG5vdCBiZVxyXG4gKiB1c2VkIGJ5IGFwcGxpY2F0aW9ucyB3aXRob3V0IGdvb2QgcmVhc29ucy5cclxuICpcclxuICogRm9yIHRoZSBjb25jZXB0IG9mIERlZmluaXRpb24gYW5kIElucHV0LCBzZWUgY29tcGlsZS5qcy5cclxuICovXHJcblxyXG5jb25zdCBjb21waWxlID0gcmVxdWlyZSgnLi9jb21waWxlJyk7XHJcbmNvbnN0IEFwcGxpY2F0aW9uRXZlbnQgPSByZXF1aXJlKCcuL0FwcGxpY2F0aW9uRXZlbnQnKTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgVHJhbnNmb3JtZXIgY2xhc3MgY29udmVydHMgSlNPTnMgdG8gRXZlbnRzLlxyXG4gKiBBcyBzZWVuIGluIHRoZSBBcHBsaWNhdGlvbiBQcm90b2NvbCwgdGhlICdjbWQnIHByb3BlcnR5IG9mIHRoZSBKU09OIGlzXHJcbiAqIHVzZWQgdG8gZmluZCB0aGUgcmlnaHQgdHJhbnNmb3JtZXIgaW4gdGhlIEV2ZW50IFJlZ2lzdHJ5LiBIb3dldmVyIGluIHByYWN0aXNlLFxyXG4gKiB3ZSB3YW50IHRoYXQgdGhlICdjbWQnIHN0cmluZywgdGhlIHRyYW5zZm9ybWVkIEV2ZW50IG5hbWUsIGFuZCB0aGVcclxuICogdHJhbnNmb3JtYXRpb24gRGVmaW5pdGlvbiBhcmUgZGVmaW5lZCBpbiB0aGUgc2FtZSBwbGFjZSBzbyBpdCB3b3VsZCBiZVxyXG4gKiBlYXNpZXIgdG8gcmVhZCBhbmQgZGVidWcuIFRoZXJlZm9yZSwgdGhlICdjbWQnIHByb3BlcnR5IGlzIHN0b3JlZCBpblxyXG4gKiB0aGUgVHJhbnNmb3JtZXIgb2JqZWN0LCB3aGlsZSB0aGUgRXZlbnQgUmVnaXN0cnkgaXMgZ2VuZXJhdGVkIGF0IHN0YXJ0dXBcclxuICogdXNpbmcgdGhlIGxpc3Qgb2YgYWxsIFRyYW5zZm9ybWVycyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyAnY21kJyBwcm9wZXJ0aWVzLlxyXG4gKi9cclxuY2xhc3MgVHJhbnNmb3JtZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgYSBuZXcgVHJhbnNmb3JtZXIgd2l0aCB0aGUgcGFyYW1ldGVycy5cclxuICAgICAqIFRoZSBEZWZpbml0aW9uIGRlZiBpcyBmaXJzdCBjb21waWxlZCBpbnRvIGEgZnVuY3Rpb24gYW5kIHRoZW4gc2F2ZWQgYXMgdGhpcy5mbi5cclxuICAgICAqIEluIHRoaXMgd2F5LCBkZWYgY2FuIGVpdGhlciBiZSBhbiBPYmplY3QsIGFuIEFycmF5LCBvciBhbiBhbHJlYWR5IGNvbXBpbGVkXHJcbiAgICAgKiBGdW5jdGlvbi4gVGhhdCBpcyB0byBzYXksIGRlZiBjYW4gYmUgYW55IHZhbGlkIERlZmluaXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNtZCBUaGUgJ2NtZCcgcHJvcGVydHkgb2YgdGhlIElucHV0IEpTT04uXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgdHJhbnNmb3JtZWQgRXZlbnQuXHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9uIHwgT2JqZWN0IHwgQXJyYXl9IGRlZiBUaGUgRGVmaW5pdGlvbiBvZiB0aGlzIFRyYW5zZm9ybWVyLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihjbWQsIG5hbWUsIGRlZikge1xyXG4gICAgICAgIHRoaXMuY21kID0gY21kO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5mbiA9IGNvbXBpbGUoZGVmKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyYW5zZm9ybSB0aGUgZ2l2ZW4gSW5wdXQgYW5kIHJldHVybiBhbiBFdmVudC5cclxuICAgICAqIEl0IGFzc3VtZXMgdGhhdCBpbnB1dC5jbWQgaXMgZXF1YWwgdG8gdGhpcy5pbnB1dCwgb3RoZXJ3aXNlIHRoZSBiZWhhdmlvciBpc1xyXG4gICAgICogdW5kZWZpbmVkLlxyXG4gICAgICogSXQgYXNzdW1lcyB0aGF0IHRoZSBEZWZpbml0aW9uIHVzZWQgdG8gY29uc3RydWN0IHRoaXMgVHJhbnNmb3JtZXIgY2FuIHdvcmtcclxuICAgICAqIHByb29wZXJseSBvbiB0aGUgSW5wdXQuIEZvciBhZGRpdGlvbmFsIHJvYnVzdG5lc3MsIGFwcGxpY2F0aW9ucyBjYW4gY2F0Y2hcclxuICAgICAqIGZvciBFcnJvcnMgd2hpbGUgY2FsbGluZyB0cmFuc2Zvcm0oKS4gSG93ZXZlciwgbW9yZSBtZWFzdXJlcyBtaWdodCBoYXZlIHRvXHJcbiAgICAgKiBiZSB0YWtlbiBpbiBvcmRlciB0byBjaGVjayBmb3IgZmFpbGVkIHRyYW5zZm9ybWF0aW9ucyBhcHByb3ByaWF0ZWx5LiBGb3JcclxuICAgICAqIGRldGFpbHMsIHNlZSBjb21waWxlLmpzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dCBUaGUgSW5wdXQgdG8gdHJhbnNmb3JtLlxyXG4gICAgICogQHJldHVybnMge0FwcGxpY2F0aW9uRXZlbnR9IFRoZSB0cmFuc2Zvcm1lZCBFdmVudC5cclxuICAgICAqL1xyXG4gICAgdHJhbnNmb3JtKGlucHV0KSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBBcHBsaWNhdGlvbkV2ZW50KHRoaXMubmFtZSwgdGhpcy5mbihpbnB1dCkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zZm9ybWVyO1xyXG4iXX0=