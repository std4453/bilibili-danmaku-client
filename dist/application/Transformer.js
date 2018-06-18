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
var compile = require('../util/compile');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcHBsaWNhdGlvbi9UcmFuc2Zvcm1lci5qcyJdLCJuYW1lcyI6WyJjb21waWxlIiwicmVxdWlyZSIsIkFwcGxpY2F0aW9uRXZlbnQiLCJUcmFuc2Zvcm1lciIsImNtZCIsIm5hbWUiLCJkZWYiLCJmbiIsInRyYW5zZm9ybSIsImlucHV0IiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7O0FBVUEsSUFBTUEsVUFBVUMsUUFBUSxpQkFBUixDQUFoQjs7QUFDQSxJQUFNQyxtQkFBbUJELFFBQVEsb0JBQVIsQ0FBekI7QUFFQTs7Ozs7Ozs7Ozs7O0lBVU1FLFc7OztBQUNGOzs7Ozs7Ozs7O0FBVUEsdUJBQVlDLEdBQVosRUFBaUJDLElBQWpCLEVBQXVCQyxHQUF2QixFQUE0QjtBQUN4QixTQUFLRixHQUFMLEdBQVdBLEdBQVg7QUFDQSxTQUFLQyxJQUFMLEdBQVlBLElBQVo7QUFDQSxTQUFLRSxFQUFMLEdBQVVQLFFBQVFNLEdBQVIsQ0FBVjtBQUNIO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBYUFFLFMsc0JBQVVDLEssRUFBTztBQUNiLFdBQU8sSUFBSVAsZ0JBQUosQ0FBcUIsS0FBS0csSUFBMUIsRUFBZ0MsS0FBS0UsRUFBTCxDQUFRRSxLQUFSLENBQWhDLENBQVA7QUFDSCxHOzs7OztBQUdMQyxPQUFPQyxPQUFQLEdBQWlCUixXQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUaGlzIGZpbGUgY29udGFpbnMgdGhlIGNsYXNzIGRlZmluaXRpb24gb2YgVHJhbnNmb3JtZXIuXHJcbiAqIFRyYW5zZm9ybWVyIGlzIHVzZWQgdG8gdHJhbnNmb3JtIEpTT05zIGludG8gRXZlbnRzLlxyXG4gKiBTZWUgZG9jdW1lbnRhdGlvbiBvZiBUcmFuc2Zvcm1lciBmb3IgZGV0YWlscy5cclxuICogVGhlIFRyYW1zZm9ybWVyIGNsYXNzIGlzIGNvbnNpZGVyZWQgaW50ZXJuYWwsIHRoYXQgaXMsIGl0IHNob3VsZCBub3QgYmVcclxuICogdXNlZCBieSBhcHBsaWNhdGlvbnMgd2l0aG91dCBnb29kIHJlYXNvbnMuXHJcbiAqXHJcbiAqIEZvciB0aGUgY29uY2VwdCBvZiBEZWZpbml0aW9uIGFuZCBJbnB1dCwgc2VlIGNvbXBpbGUuanMuXHJcbiAqL1xyXG5cclxuY29uc3QgY29tcGlsZSA9IHJlcXVpcmUoJy4uL3V0aWwvY29tcGlsZScpO1xyXG5jb25zdCBBcHBsaWNhdGlvbkV2ZW50ID0gcmVxdWlyZSgnLi9BcHBsaWNhdGlvbkV2ZW50Jyk7XHJcblxyXG4vKipcclxuICogVGhlIFRyYW5zZm9ybWVyIGNsYXNzIGNvbnZlcnRzIEpTT05zIHRvIEV2ZW50cy5cclxuICogQXMgc2VlbiBpbiB0aGUgQXBwbGljYXRpb24gUHJvdG9jb2wsIHRoZSAnY21kJyBwcm9wZXJ0eSBvZiB0aGUgSlNPTiBpc1xyXG4gKiB1c2VkIHRvIGZpbmQgdGhlIHJpZ2h0IHRyYW5zZm9ybWVyIGluIHRoZSBFdmVudCBSZWdpc3RyeS4gSG93ZXZlciBpbiBwcmFjdGlzZSxcclxuICogd2Ugd2FudCB0aGF0IHRoZSAnY21kJyBzdHJpbmcsIHRoZSB0cmFuc2Zvcm1lZCBFdmVudCBuYW1lLCBhbmQgdGhlXHJcbiAqIHRyYW5zZm9ybWF0aW9uIERlZmluaXRpb24gYXJlIGRlZmluZWQgaW4gdGhlIHNhbWUgcGxhY2Ugc28gaXQgd291bGQgYmVcclxuICogZWFzaWVyIHRvIHJlYWQgYW5kIGRlYnVnLiBUaGVyZWZvcmUsIHRoZSAnY21kJyBwcm9wZXJ0eSBpcyBzdG9yZWQgaW5cclxuICogdGhlIFRyYW5zZm9ybWVyIG9iamVjdCwgd2hpbGUgdGhlIEV2ZW50IFJlZ2lzdHJ5IGlzIGdlbmVyYXRlZCBhdCBzdGFydHVwXHJcbiAqIHVzaW5nIHRoZSBsaXN0IG9mIGFsbCBUcmFuc2Zvcm1lcnMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgJ2NtZCcgcHJvcGVydGllcy5cclxuICovXHJcbmNsYXNzIFRyYW5zZm9ybWVyIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgbmV3IFRyYW5zZm9ybWVyIHdpdGggdGhlIHBhcmFtZXRlcnMuXHJcbiAgICAgKiBUaGUgRGVmaW5pdGlvbiBkZWYgaXMgZmlyc3QgY29tcGlsZWQgaW50byBhIGZ1bmN0aW9uIGFuZCB0aGVuIHNhdmVkIGFzIHRoaXMuZm4uXHJcbiAgICAgKiBJbiB0aGlzIHdheSwgZGVmIGNhbiBlaXRoZXIgYmUgYW4gT2JqZWN0LCBhbiBBcnJheSwgb3IgYW4gYWxyZWFkeSBjb21waWxlZFxyXG4gICAgICogRnVuY3Rpb24uIFRoYXQgaXMgdG8gc2F5LCBkZWYgY2FuIGJlIGFueSB2YWxpZCBEZWZpbml0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjbWQgVGhlICdjbWQnIHByb3BlcnR5IG9mIHRoZSBJbnB1dCBKU09OLlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIHRyYW5zZm9ybWVkIEV2ZW50LlxyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbiB8IE9iamVjdCB8IEFycmF5fSBkZWYgVGhlIERlZmluaXRpb24gb2YgdGhpcyBUcmFuc2Zvcm1lci5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoY21kLCBuYW1lLCBkZWYpIHtcclxuICAgICAgICB0aGlzLmNtZCA9IGNtZDtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuZm4gPSBjb21waWxlKGRlZik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFuc2Zvcm0gdGhlIGdpdmVuIElucHV0IGFuZCByZXR1cm4gYW4gRXZlbnQuXHJcbiAgICAgKiBJdCBhc3N1bWVzIHRoYXQgaW5wdXQuY21kIGlzIGVxdWFsIHRvIHRoaXMuaW5wdXQsIG90aGVyd2lzZSB0aGUgYmVoYXZpb3IgaXNcclxuICAgICAqIHVuZGVmaW5lZC5cclxuICAgICAqIEl0IGFzc3VtZXMgdGhhdCB0aGUgRGVmaW5pdGlvbiB1c2VkIHRvIGNvbnN0cnVjdCB0aGlzIFRyYW5zZm9ybWVyIGNhbiB3b3JrXHJcbiAgICAgKiBwcm9vcGVybHkgb24gdGhlIElucHV0LiBGb3IgYWRkaXRpb25hbCByb2J1c3RuZXNzLCBhcHBsaWNhdGlvbnMgY2FuIGNhdGNoXHJcbiAgICAgKiBmb3IgRXJyb3JzIHdoaWxlIGNhbGxpbmcgdHJhbnNmb3JtKCkuIEhvd2V2ZXIsIG1vcmUgbWVhc3VyZXMgbWlnaHQgaGF2ZSB0b1xyXG4gICAgICogYmUgdGFrZW4gaW4gb3JkZXIgdG8gY2hlY2sgZm9yIGZhaWxlZCB0cmFuc2Zvcm1hdGlvbnMgYXBwcm9wcmlhdGVseS4gRm9yXHJcbiAgICAgKiBkZXRhaWxzLCBzZWUgY29tcGlsZS5qcy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXQgVGhlIElucHV0IHRvIHRyYW5zZm9ybS5cclxuICAgICAqIEByZXR1cm5zIHtBcHBsaWNhdGlvbkV2ZW50fSBUaGUgdHJhbnNmb3JtZWQgRXZlbnQuXHJcbiAgICAgKi9cclxuICAgIHRyYW5zZm9ybShpbnB1dCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgQXBwbGljYXRpb25FdmVudCh0aGlzLm5hbWUsIHRoaXMuZm4oaW5wdXQpKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2Zvcm1lcjtcclxuIl19