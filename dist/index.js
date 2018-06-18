"use strict";

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/**
 * This file contains the class definition of DanmakuClient, the only API
 * open to applications.
 * The Wiki page 'DanmakuClient' contains more choreographed documentation,
 * see that instead.
 */
var EventEmitter = require('events');

var ApplicationConnection = require('./application');
/**
 * DanmakuClient is the only open API to applications.
 * Internally it is a thin wrap over ApplicationConnection, which provides a
 * more explicit control of the lifecycle and partial backwards compatibility
 * to the old version.
 * The lifecycle of DanmakuClient is as follows:
 * - Start from state 'idle'.
 * - 'idle' -> 'opening': On start().
 * - 'opening' -> 'opened': When connection is successfully opened. Emit event 'open'.
 *             -> 'closing': On terminate().
 *             -> 'closed': If the connection is closed by the server. Emit event 'close'.
 *             -> 'closed': If an error has occurred. Emit event 'close'. Emit event
 *                          'error' with the error.
 * - 'opened' -> 'closing': On terminate().
 *            -> 'closed': If the connection is closed by the server. Emit event 'close'.
 *            -> 'closed': If an error has occurred. Emit event 'close'. Emit event
 *                         'error' with the error.
 * - 'closing' -> 'closed': When connection is succefully closed. Emit event 'close'.
 * - End in state 'closed'.
 */


var DanmakuClient =
/*#__PURE__*/
function (_EventEmitter) {
  _inheritsLoose(DanmakuClient, _EventEmitter);

  /**
   * Construct a new DanmakuClient with the given Room id and options.
   * Note that the Room id must be the original Room id, that is, the short Room id
   * is not accepted.
   * For example, one of the official Live Rooms, https://live.bilibili.com/1,
   * uses the original Room id 5440. In this case, trying to connect to Room 1 would
   * not work properly, the correct way is to connect to Room 5440.
   * @param {Number} room The id of the Room to connect to.
   * @param {Object} [options] The options to pass to ApplicationConnection.
   *   Use this only when you know what you're doing.
   */
  function DanmakuClient(room, options) {
    var _this;

    _this = _EventEmitter.call(this) || this;
    _this.room = room;
    _this.options = options;
    _this.state = 'idle';
    return _this;
  }
  /**
   * Start the DanmakuClient.
   * This method is only available in state 'idle'. Otherwise nothing will happen.
   * Internally the underlying ApplicationConnection is not created before start(),
   * so this.connection will not be available then,
   */


  var _proto = DanmakuClient.prototype;

  _proto.start = function start() {
    var _this2 = this;

    if (this.state !== 'idle') return;
    this.connection = new ApplicationConnection(this.room, this.options);
    this.state = 'opening';
    this.connection.on('open', function () {
      _this2.state = 'opened';

      _this2.emit('open');
    });
    this.connection.on('error', function (err) {
      return _this2.emit('error', err);
    });
    this.connection.on('close', function () {
      _this2.state = 'closed';

      _this2.emit('close');
    });
    this.connection.on('message', function (event) {
      return _this2.emit('event', event);
    });
  };
  /**
   * Request closing of the DanmakuClient.
   * Note that this method will return immediately after requesting. The client will
   * be actually closed at time when the 'close' event is emitted.
   */


  _proto.terminate = function terminate() {
    if (this.state === 'opening' || this.state === 'opened') this.connection.close();
  };

  return DanmakuClient;
}(EventEmitter);

module.exports = DanmakuClient;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJFdmVudEVtaXR0ZXIiLCJyZXF1aXJlIiwiQXBwbGljYXRpb25Db25uZWN0aW9uIiwiRGFubWFrdUNsaWVudCIsInJvb20iLCJvcHRpb25zIiwic3RhdGUiLCJzdGFydCIsImNvbm5lY3Rpb24iLCJvbiIsImVtaXQiLCJlcnIiLCJldmVudCIsInRlcm1pbmF0ZSIsImNsb3NlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7Ozs7QUFPQSxJQUFNQSxlQUFlQyxRQUFRLFFBQVIsQ0FBckI7O0FBRUEsSUFBTUMsd0JBQXdCRCxRQUFRLGVBQVIsQ0FBOUI7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQW9CTUUsYTs7Ozs7QUFDRjs7Ozs7Ozs7Ozs7QUFXQSx5QkFBWUMsSUFBWixFQUFrQkMsT0FBbEIsRUFBMkI7QUFBQTs7QUFDdkI7QUFFQSxVQUFLRCxJQUFMLEdBQVlBLElBQVo7QUFDQSxVQUFLQyxPQUFMLEdBQWVBLE9BQWY7QUFDQSxVQUFLQyxLQUFMLEdBQWEsTUFBYjtBQUx1QjtBQU0xQjtBQUVEOzs7Ozs7Ozs7O1NBTUFDLEssb0JBQVE7QUFBQTs7QUFDSixRQUFJLEtBQUtELEtBQUwsS0FBZSxNQUFuQixFQUEyQjtBQUMzQixTQUFLRSxVQUFMLEdBQWtCLElBQUlOLHFCQUFKLENBQTBCLEtBQUtFLElBQS9CLEVBQXFDLEtBQUtDLE9BQTFDLENBQWxCO0FBQ0EsU0FBS0MsS0FBTCxHQUFhLFNBQWI7QUFDQSxTQUFLRSxVQUFMLENBQWdCQyxFQUFoQixDQUFtQixNQUFuQixFQUEyQixZQUFNO0FBQzdCLGFBQUtILEtBQUwsR0FBYSxRQUFiOztBQUNBLGFBQUtJLElBQUwsQ0FBVSxNQUFWO0FBQ0gsS0FIRDtBQUlBLFNBQUtGLFVBQUwsQ0FBZ0JDLEVBQWhCLENBQW1CLE9BQW5CLEVBQTRCO0FBQUEsYUFBTyxPQUFLQyxJQUFMLENBQVUsT0FBVixFQUFtQkMsR0FBbkIsQ0FBUDtBQUFBLEtBQTVCO0FBQ0EsU0FBS0gsVUFBTCxDQUFnQkMsRUFBaEIsQ0FBbUIsT0FBbkIsRUFBNEIsWUFBTTtBQUM5QixhQUFLSCxLQUFMLEdBQWEsUUFBYjs7QUFDQSxhQUFLSSxJQUFMLENBQVUsT0FBVjtBQUNILEtBSEQ7QUFJQSxTQUFLRixVQUFMLENBQWdCQyxFQUFoQixDQUFtQixTQUFuQixFQUE4QjtBQUFBLGFBQVMsT0FBS0MsSUFBTCxDQUFVLE9BQVYsRUFBbUJFLEtBQW5CLENBQVQ7QUFBQSxLQUE5QjtBQUNILEc7QUFFRDs7Ozs7OztTQUtBQyxTLHdCQUFZO0FBQ1IsUUFBSSxLQUFLUCxLQUFMLEtBQWUsU0FBZixJQUE0QixLQUFLQSxLQUFMLEtBQWUsUUFBL0MsRUFBeUQsS0FBS0UsVUFBTCxDQUFnQk0sS0FBaEI7QUFDNUQsRzs7O0VBakR1QmQsWTs7QUFvRDVCZSxPQUFPQyxPQUFQLEdBQWlCYixhQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUaGlzIGZpbGUgY29udGFpbnMgdGhlIGNsYXNzIGRlZmluaXRpb24gb2YgRGFubWFrdUNsaWVudCwgdGhlIG9ubHkgQVBJXHJcbiAqIG9wZW4gdG8gYXBwbGljYXRpb25zLlxyXG4gKiBUaGUgV2lraSBwYWdlICdEYW5tYWt1Q2xpZW50JyBjb250YWlucyBtb3JlIGNob3Jlb2dyYXBoZWQgZG9jdW1lbnRhdGlvbixcclxuICogc2VlIHRoYXQgaW5zdGVhZC5cclxuICovXHJcblxyXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKTtcclxuXHJcbmNvbnN0IEFwcGxpY2F0aW9uQ29ubmVjdGlvbiA9IHJlcXVpcmUoJy4vYXBwbGljYXRpb24nKTtcclxuXHJcbi8qKlxyXG4gKiBEYW5tYWt1Q2xpZW50IGlzIHRoZSBvbmx5IG9wZW4gQVBJIHRvIGFwcGxpY2F0aW9ucy5cclxuICogSW50ZXJuYWxseSBpdCBpcyBhIHRoaW4gd3JhcCBvdmVyIEFwcGxpY2F0aW9uQ29ubmVjdGlvbiwgd2hpY2ggcHJvdmlkZXMgYVxyXG4gKiBtb3JlIGV4cGxpY2l0IGNvbnRyb2wgb2YgdGhlIGxpZmVjeWNsZSBhbmQgcGFydGlhbCBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxyXG4gKiB0byB0aGUgb2xkIHZlcnNpb24uXHJcbiAqIFRoZSBsaWZlY3ljbGUgb2YgRGFubWFrdUNsaWVudCBpcyBhcyBmb2xsb3dzOlxyXG4gKiAtIFN0YXJ0IGZyb20gc3RhdGUgJ2lkbGUnLlxyXG4gKiAtICdpZGxlJyAtPiAnb3BlbmluZyc6IE9uIHN0YXJ0KCkuXHJcbiAqIC0gJ29wZW5pbmcnIC0+ICdvcGVuZWQnOiBXaGVuIGNvbm5lY3Rpb24gaXMgc3VjY2Vzc2Z1bGx5IG9wZW5lZC4gRW1pdCBldmVudCAnb3BlbicuXHJcbiAqICAgICAgICAgICAgIC0+ICdjbG9zaW5nJzogT24gdGVybWluYXRlKCkuXHJcbiAqICAgICAgICAgICAgIC0+ICdjbG9zZWQnOiBJZiB0aGUgY29ubmVjdGlvbiBpcyBjbG9zZWQgYnkgdGhlIHNlcnZlci4gRW1pdCBldmVudCAnY2xvc2UnLlxyXG4gKiAgICAgICAgICAgICAtPiAnY2xvc2VkJzogSWYgYW4gZXJyb3IgaGFzIG9jY3VycmVkLiBFbWl0IGV2ZW50ICdjbG9zZScuIEVtaXQgZXZlbnRcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICdlcnJvcicgd2l0aCB0aGUgZXJyb3IuXHJcbiAqIC0gJ29wZW5lZCcgLT4gJ2Nsb3NpbmcnOiBPbiB0ZXJtaW5hdGUoKS5cclxuICogICAgICAgICAgICAtPiAnY2xvc2VkJzogSWYgdGhlIGNvbm5lY3Rpb24gaXMgY2xvc2VkIGJ5IHRoZSBzZXJ2ZXIuIEVtaXQgZXZlbnQgJ2Nsb3NlJy5cclxuICogICAgICAgICAgICAtPiAnY2xvc2VkJzogSWYgYW4gZXJyb3IgaGFzIG9jY3VycmVkLiBFbWl0IGV2ZW50ICdjbG9zZScuIEVtaXQgZXZlbnRcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgJ2Vycm9yJyB3aXRoIHRoZSBlcnJvci5cclxuICogLSAnY2xvc2luZycgLT4gJ2Nsb3NlZCc6IFdoZW4gY29ubmVjdGlvbiBpcyBzdWNjZWZ1bGx5IGNsb3NlZC4gRW1pdCBldmVudCAnY2xvc2UnLlxyXG4gKiAtIEVuZCBpbiBzdGF0ZSAnY2xvc2VkJy5cclxuICovXHJcbmNsYXNzIERhbm1ha3VDbGllbnQgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgYSBuZXcgRGFubWFrdUNsaWVudCB3aXRoIHRoZSBnaXZlbiBSb29tIGlkIGFuZCBvcHRpb25zLlxyXG4gICAgICogTm90ZSB0aGF0IHRoZSBSb29tIGlkIG11c3QgYmUgdGhlIG9yaWdpbmFsIFJvb20gaWQsIHRoYXQgaXMsIHRoZSBzaG9ydCBSb29tIGlkXHJcbiAgICAgKiBpcyBub3QgYWNjZXB0ZWQuXHJcbiAgICAgKiBGb3IgZXhhbXBsZSwgb25lIG9mIHRoZSBvZmZpY2lhbCBMaXZlIFJvb21zLCBodHRwczovL2xpdmUuYmlsaWJpbGkuY29tLzEsXHJcbiAgICAgKiB1c2VzIHRoZSBvcmlnaW5hbCBSb29tIGlkIDU0NDAuIEluIHRoaXMgY2FzZSwgdHJ5aW5nIHRvIGNvbm5lY3QgdG8gUm9vbSAxIHdvdWxkXHJcbiAgICAgKiBub3Qgd29yayBwcm9wZXJseSwgdGhlIGNvcnJlY3Qgd2F5IGlzIHRvIGNvbm5lY3QgdG8gUm9vbSA1NDQwLlxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJvb20gVGhlIGlkIG9mIHRoZSBSb29tIHRvIGNvbm5lY3QgdG8uXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIHRvIHBhc3MgdG8gQXBwbGljYXRpb25Db25uZWN0aW9uLlxyXG4gICAgICogICBVc2UgdGhpcyBvbmx5IHdoZW4geW91IGtub3cgd2hhdCB5b3UncmUgZG9pbmcuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHJvb20sIG9wdGlvbnMpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLnJvb20gPSByb29tO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdpZGxlJztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0IHRoZSBEYW5tYWt1Q2xpZW50LlxyXG4gICAgICogVGhpcyBtZXRob2QgaXMgb25seSBhdmFpbGFibGUgaW4gc3RhdGUgJ2lkbGUnLiBPdGhlcndpc2Ugbm90aGluZyB3aWxsIGhhcHBlbi5cclxuICAgICAqIEludGVybmFsbHkgdGhlIHVuZGVybHlpbmcgQXBwbGljYXRpb25Db25uZWN0aW9uIGlzIG5vdCBjcmVhdGVkIGJlZm9yZSBzdGFydCgpLFxyXG4gICAgICogc28gdGhpcy5jb25uZWN0aW9uIHdpbGwgbm90IGJlIGF2YWlsYWJsZSB0aGVuLFxyXG4gICAgICovXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zdGF0ZSAhPT0gJ2lkbGUnKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uID0gbmV3IEFwcGxpY2F0aW9uQ29ubmVjdGlvbih0aGlzLnJvb20sIHRoaXMub3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdvcGVuaW5nJztcclxuICAgICAgICB0aGlzLmNvbm5lY3Rpb24ub24oJ29wZW4nLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAnb3BlbmVkJztcclxuICAgICAgICAgICAgdGhpcy5lbWl0KCdvcGVuJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uLm9uKCdlcnJvcicsIGVyciA9PiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKSk7XHJcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uLm9uKCdjbG9zZScsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICdjbG9zZWQnO1xyXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Nsb3NlJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uLm9uKCdtZXNzYWdlJywgZXZlbnQgPT4gdGhpcy5lbWl0KCdldmVudCcsIGV2ZW50KSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXF1ZXN0IGNsb3Npbmcgb2YgdGhlIERhbm1ha3VDbGllbnQuXHJcbiAgICAgKiBOb3RlIHRoYXQgdGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gaW1tZWRpYXRlbHkgYWZ0ZXIgcmVxdWVzdGluZy4gVGhlIGNsaWVudCB3aWxsXHJcbiAgICAgKiBiZSBhY3R1YWxseSBjbG9zZWQgYXQgdGltZSB3aGVuIHRoZSAnY2xvc2UnIGV2ZW50IGlzIGVtaXR0ZWQuXHJcbiAgICAgKi9cclxuICAgIHRlcm1pbmF0ZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ29wZW5pbmcnIHx8IHRoaXMuc3RhdGUgPT09ICdvcGVuZWQnKSB0aGlzLmNvbm5lY3Rpb24uY2xvc2UoKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEYW5tYWt1Q2xpZW50O1xyXG4iXX0=