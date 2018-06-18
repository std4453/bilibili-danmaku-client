"use strict";

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/**
 * This file contains class definitions of BaseConnection and CascadeConnection.
 * bilibili-danmaku-client is built upon layers of connections, as seen in the
 * Transport Protocol and the Application prototol, while BaseConnection and
 * CascadeConnection provides an identical, flexible, easy-to-use infrastructure
 * for implementing connection layers.
 * The API of the connections look just like that of ws, see documentation. As
 * a result, the WebSocket class of ws can be used directly as a BaseConnection,
 * as seen in WebSocketConnection.js.
 * These two classes are considered internal, that is, applications should not
 * use them directly.
 */
var EventEmitter = require('events');

var _require = require('lodash'),
    defaults = _require.defaults;
/**
 * The base class of all connections.
 * A BaseConnection is an abstraction of all the connections used in this package.
 * All implementations of BaseConnections share the same lifecycle:
 * - Start from state 'opening'.
 * - 'opening' -> 'opened', if the connection is opened succssfully. Emit event 'open'.
 *             -> 'closing', if close() was called.
 *             -> 'closed', if the connection got an error or was closed by the other
 *                side. Emit event 'close'. On error, emit event 'error' with error.
 * - 'opened' -> 'closing', if close() was called.
 *               'closed', if the connection got an error or was closed by the other
 *               side. Emit event 'close'. Or error, emit event 'error' with error.
 * - 'closing' -> 'closed', if the connection was closed. Emit event 'close'.
 * - End in state 'closed'.
 * And in addition to event 'open', 'close', 'error', an event 'message' is emitted
 * on receiving an message from the other side.
 * Note that all methos of BaseConnection have applicable states, check documentation
 * for details.
 */


var BaseConnection =
/*#__PURE__*/
function (_EventEmitter) {
  _inheritsLoose(BaseConnection, _EventEmitter);

  /**
   * Construct a new BaseConnection.
   * The returned BaseConnection will always be in 'opening' state.
   * Implementations should start the connection internally here, and call
   * onOpen() when the connection is successfully opened, or onClose() if the
   * connection is closed from the otherside, or onError() if the connection
   * bumps into an error. Failing to do so will lead to misbahavior of applications.
   */
  function BaseConnection() {
    var _this;

    _this = _EventEmitter.call(this) || this;
    _this.state = 'opening';
    return _this;
  }
  /**
   * Request the connection to close. Internal abstract method.
   * Implementation MUST close the connection at invocation, and invoke onClose()
   * when the connection is closed or onError() when the connection is unable
   * to close. Meanwhile, implementations should setup calling onMessage() on
   * arrival of a message. Otherwise, applications are likely to behave strangely.
   * It is not recommended to dispose of resources here, since closing on error
   * or from the other side will not invoke this method. listen to the 'close'
   * event instead.
   * This method will only be called at state 'closing'.
   */


  var _proto = BaseConnection.prototype;

  _proto.requestClose = function requestClose() {};
  /**
   * Request the connection to send the given data. Internal abstract method.
   * Implementations CAN throw an error if the given data cannot be sent.
   * This method will only be called at state 'opened'.
   * @param {any} data The data to send.
   */


  _proto.requestSend = function requestSend(data) {}; // eslint-disable-line no-unused-vars

  /**
   * Request the connection to close. Final API.
   * This method will only be available at state 'opening' and 'opened'. Otherwise,
   * invocations will be ignored.
   * Note that only at event 'close' will the connection be actually closed.
   * It internally calls requestClose().
   */


  _proto.close = function close() {
    switch (this.state) {
      case 'opening':
      case 'opened':
        this.state = 'closing';
        this.requestClose();
        break;

      default:
    }
  };
  /**
   * Request the connection to send given data. Final API.
   * This method will only be available at state 'opened'. Otherwise, invocations
   * will be ignored.
   * Note that this method might throw an error or ignore invalid date silently. The
   * behavior is up to the definition.
   * It internally calls requestSend().
   * @param {*} data The data to send.
   */


  _proto.send = function send(data) {
    switch (this.state) {
      case 'opened':
        this.requestSend(data);
        break;

      default:
    }
  };
  /**
   * Notify that the connection has opened. Internal callback.
   * This method will manage the lifecycle and emit events.
   * This method will only be available at state 'opening'. Otherwise, invocations
   * will be ignored.
   * This method can be used as a callback to enable asynchronous operations.
   */


  _proto.onOpen = function onOpen() {
    switch (this.state) {
      case 'opening':
        this.state = 'opened';
        this.emit('open');
        break;

      default:
    }
  };
  /**
   * Notify that the connection has bumped into an error. Internal callback.
   * This method will manage the lifecycle and emit events.
   * This method will not be available at state 'closed'. In this case, invocations
   * will be ignored.
   * This method can be used as a callback to enable asynchronous operations.
   */


  _proto.onError = function onError(err) {
    switch (this.state) {
      case 'opening':
      case 'opened':
        this.state = 'closed';
        this.emit('error', err);
        this.emit('close');
        break;

      case 'closing':
        this.state = 'closed';
        this.emit('close');
        break;

      default:
    }
  };
  /**
   * Notify that the connection has closed. Internal callback.
   * This method will manage the lifecycle and emit events.
   * This method will not be available at state 'closed'. In this case, invocations
   * will be ignored.
   * This method can be used as a callback to enable asynchronous operations.
   */


  _proto.onClose = function onClose() {
    switch (this.state) {
      case 'opening':
      case 'opened':
      case 'closing':
        this.state = 'closed';
        this.emit('close');
        break;

      default:
    }
  };
  /**
   * Notify that the connection has received a message. Internal callback.
   * This method will manage the lifecycle and emit events.
   * This method will only be available at state 'opened'. Otherwise, invocations
   * will be ignored.
   * @param {any} data The received data.
   */


  _proto.onMessage = function onMessage(data) {
    switch (this.state) {
      case 'opened':
        this.emit('message', data);
        break;

      default:
    }
  };

  return BaseConnection;
}(EventEmitter);
/**
 * The BaseConnection implementation that connects upon a parent BaseConnection.
 * The CascadeConnection listens to events of the parent BaseConnection to manage its
 * own lifecycle, and delegates methods to the parent BaseConnection. By default, it
 * inherits all events and delegates all methods, however this can be configurated.
 * Meanwhile, it enables transformation and detransformation of sent and received
 * messages.
 */


var CascadeConnection =
/*#__PURE__*/
function (_BaseConnection) {
  _inheritsLoose(CascadeConnection, _BaseConnection);

  /**
   * Constructs a new CascadeConnection with the given BaseConnection.
   * this.parent will be used to store the given parent BaseConnection.
   * inherits determines which events are inherited. By default all events are
   * inherited, that is, 'open', 'close', 'message' and 'error'. Inheritance
   * of event X can be disabled by specifying X: false in inherits, like
   * inherits = { open: false }.
   * On disable the inheritance of event X, implementations should implement
   * the behavior itself by calling onOpen(), onClose(), onError() or onMessage().
   * For disabling inheritance of methods, see documentation of each method.
   * If 'message' event is inherited, detransform() is used to transform data
   * received from parent back to data acceptable by this connection.
   * @param {BaseConnection} parent The parent to inherit.
   * @param {Object} inherits To config which events to inherit.
   */
  function CascadeConnection(parent, inherits) {
    var _this2;

    if (inherits === void 0) {
      inherits = {};
    }

    _this2 = _BaseConnection.call(this) || this;
    _this2.parent = parent;

    var _defaults = defaults(inherits, {
      error: true,
      close: true,
      open: true,
      message: true
    }),
        error = _defaults.error,
        close = _defaults.close,
        open = _defaults.open,
        message = _defaults.message;

    if (error) parent.on('error', _this2.onError.bind(_assertThisInitialized(_assertThisInitialized(_this2))));
    if (close) parent.on('close', _this2.onClose.bind(_assertThisInitialized(_assertThisInitialized(_this2))));
    if (open) parent.on('open', _this2.onOpen.bind(_assertThisInitialized(_assertThisInitialized(_this2))));

    if (message) {
      parent.on('message', function (data) {
        var detransformed = _this2.detransform(data);

        if (typeof detransformed === 'undefined') return;

        _this2.onMessage(detransformed);
      });
    }

    return _this2;
  }
  /**
   * Request connection to send given data. Inherited from BaseConnection.
   * By default, this method uses transform() to transform provided data to data
   * acceptable by parent and use parent.send(). Implementations can override this
   * method to disable delegation.
   * @param {any} data The data to send.
   */


  var _proto2 = CascadeConnection.prototype;

  _proto2.requestSend = function requestSend(data) {
    this.parent.send(this.transform(data));
  };
  /**
   * Request connection to close. Inherited from BaseConnection.
   * By default, this method calls parent.close(). Implementation can override this
   * to disable delegation or add additional behavior.
   */


  _proto2.requestClose = function requestClose() {
    this.parent.close();
  };
  /**
   * Detransform data received from parent back to data acceptable by this connection.
   * By default, this method keeps the data as-is.
   * If undefined is returned, this.onMessage() will not be called.
   * @param {any} data The data to detransform.
   */


  _proto2.detransform = function detransform(data) {
    return data;
  };
  /**
   * Detransform data to send to data acceptable by parent.
   * By default, this method keeps the data as-is.
   * @param {any} data The data to detransform.
   */


  _proto2.transform = function transform(data) {
    return data;
  };

  return CascadeConnection;
}(BaseConnection);

module.exports = {
  BaseConnection: BaseConnection,
  CascadeConnection: CascadeConnection
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL2Nvbm5lY3Rpb24uanMiXSwibmFtZXMiOlsiRXZlbnRFbWl0dGVyIiwicmVxdWlyZSIsImRlZmF1bHRzIiwiQmFzZUNvbm5lY3Rpb24iLCJzdGF0ZSIsInJlcXVlc3RDbG9zZSIsInJlcXVlc3RTZW5kIiwiZGF0YSIsImNsb3NlIiwic2VuZCIsIm9uT3BlbiIsImVtaXQiLCJvbkVycm9yIiwiZXJyIiwib25DbG9zZSIsIm9uTWVzc2FnZSIsIkNhc2NhZGVDb25uZWN0aW9uIiwicGFyZW50IiwiaW5oZXJpdHMiLCJlcnJvciIsIm9wZW4iLCJtZXNzYWdlIiwib24iLCJiaW5kIiwiZGV0cmFuc2Zvcm1lZCIsImRldHJhbnNmb3JtIiwidHJhbnNmb3JtIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7OztBQWFBLElBQU1BLGVBQWVDLFFBQVEsUUFBUixDQUFyQjs7ZUFDcUJBLFFBQVEsUUFBUixDO0lBQWJDLFEsWUFBQUEsUTtBQUVSOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFtQk1DLGM7Ozs7O0FBQ0Y7Ozs7Ozs7O0FBUUEsNEJBQWM7QUFBQTs7QUFDVjtBQUVBLFVBQUtDLEtBQUwsR0FBYSxTQUFiO0FBSFU7QUFJYjtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7U0FXQUMsWSwyQkFBZSxDQUFFLEM7QUFDakI7Ozs7Ozs7O1NBTUFDLFcsd0JBQVlDLEksRUFBTSxDQUFFLEMsRUFBQzs7QUFFckI7Ozs7Ozs7OztTQU9BQyxLLG9CQUFRO0FBQ0osWUFBUSxLQUFLSixLQUFiO0FBQ0EsV0FBSyxTQUFMO0FBQWdCLFdBQUssUUFBTDtBQUNaLGFBQUtBLEtBQUwsR0FBYSxTQUFiO0FBQ0EsYUFBS0MsWUFBTDtBQUNBOztBQUNKO0FBTEE7QUFPSCxHO0FBRUQ7Ozs7Ozs7Ozs7O1NBU0FJLEksaUJBQUtGLEksRUFBTTtBQUNQLFlBQVEsS0FBS0gsS0FBYjtBQUNBLFdBQUssUUFBTDtBQUNJLGFBQUtFLFdB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VUFNQWlCLFcsd0JBQVlsQixJLEVBQU07QUFBRSxXQUFPQSxJQUFQO0FBQWMsRztBQUNsQzs7Ozs7OztVQUtBbUIsUyxzQkFBVW5CLEksRUFBTTtBQUFFLFdBQU9BLElBQVA7QUFBYyxHOzs7RUFsRUpKLGM7O0FBcUVoQ3dCLE9BQU9DLE9BQVAsR0FBaUI7QUFDYnpCLGdDQURhO0FBRWJhO0FBRmEsQ0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogVGhpcyBmaWxlIGNvbnRhaW5zIGNsYXNzIGRlZmluaXRpb25zIG9mIEJhc2VDb25uZWN0aW9uIGFuZCBDYXNjYWRlQ29ubmVjdGlvbi5cclxuICogYmlsaWJpbGktZGFubWFrdS1jbGllbnQgaXMgYnVpbHQgdXBvbiBsYXllcnMgb2YgY29ubmVjdGlvbnMsIGFzIHNlZW4gaW4gdGhlXHJcbiAqIFRyYW5zcG9ydCBQcm90b2NvbCBhbmQgdGhlIEFwcGxpY2F0aW9uIHByb3RvdG9sLCB3aGlsZSBCYXNlQ29ubmVjdGlvbiBhbmRcclxuICogQ2FzY2FkZUNvbm5lY3Rpb24gcHJvdmlkZXMgYW4gaWRlbnRpY2FsLCBmbGV4aWJsZSwgZWFzeS10by11c2UgaW5mcmFzdHJ1Y3R1cmVcclxuICogZm9yIGltcGxlbWVudGluZyBjb25uZWN0aW9uIGxheWVycy5cclxuICogVGhlIEFQSSBvZiB0aGUgY29ubmVjdGlvbnMgbG9vayBqdXN0IGxpa2UgdGhhdCBvZiB3cywgc2VlIGRvY3VtZW50YXRpb24uIEFzXHJcbiAqIGEgcmVzdWx0LCB0aGUgV2ViU29ja2V0IGNsYXNzIG9mIHdzIGNhbiBiZSB1c2VkIGRpcmVjdGx5IGFzIGEgQmFzZUNvbm5lY3Rpb24sXHJcbiAqIGFzIHNlZW4gaW4gV2ViU29ja2V0Q29ubmVjdGlvbi5qcy5cclxuICogVGhlc2UgdHdvIGNsYXNzZXMgYXJlIGNvbnNpZGVyZWQgaW50ZXJuYWwsIHRoYXQgaXMsIGFwcGxpY2F0aW9ucyBzaG91bGQgbm90XHJcbiAqIHVzZSB0aGVtIGRpcmVjdGx5LlxyXG4gKi9cclxuXHJcbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpO1xyXG5jb25zdCB7IGRlZmF1bHRzIH0gPSByZXF1aXJlKCdsb2Rhc2gnKTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgYmFzZSBjbGFzcyBvZiBhbGwgY29ubmVjdGlvbnMuXHJcbiAqIEEgQmFzZUNvbm5lY3Rpb24gaXMgYW4gYWJzdHJhY3Rpb24gb2YgYWxsIHRoZSBjb25uZWN0aW9ucyB1c2VkIGluIHRoaXMgcGFja2FnZS5cclxuICogQWxsIGltcGxlbWVudGF0aW9ucyBvZiBCYXNlQ29ubmVjdGlvbnMgc2hhcmUgdGhlIHNhbWUgbGlmZWN5Y2xlOlxyXG4gKiAtIFN0YXJ0IGZyb20gc3RhdGUgJ29wZW5pbmcnLlxyXG4gKiAtICdvcGVuaW5nJyAtPiAnb3BlbmVkJywgaWYgdGhlIGNvbm5lY3Rpb24gaXMgb3BlbmVkIHN1Y2Nzc2Z1bGx5LiBFbWl0IGV2ZW50ICdvcGVuJy5cclxuICogICAgICAgICAgICAgLT4gJ2Nsb3NpbmcnLCBpZiBjbG9zZSgpIHdhcyBjYWxsZWQuXHJcbiAqICAgICAgICAgICAgIC0+ICdjbG9zZWQnLCBpZiB0aGUgY29ubmVjdGlvbiBnb3QgYW4gZXJyb3Igb3Igd2FzIGNsb3NlZCBieSB0aGUgb3RoZXJcclxuICogICAgICAgICAgICAgICAgc2lkZS4gRW1pdCBldmVudCAnY2xvc2UnLiBPbiBlcnJvciwgZW1pdCBldmVudCAnZXJyb3InIHdpdGggZXJyb3IuXHJcbiAqIC0gJ29wZW5lZCcgLT4gJ2Nsb3NpbmcnLCBpZiBjbG9zZSgpIHdhcyBjYWxsZWQuXHJcbiAqICAgICAgICAgICAgICAgJ2Nsb3NlZCcsIGlmIHRoZSBjb25uZWN0aW9uIGdvdCBhbiBlcnJvciBvciB3YXMgY2xvc2VkIGJ5IHRoZSBvdGhlclxyXG4gKiAgICAgICAgICAgICAgIHNpZGUuIEVtaXQgZXZlbnQgJ2Nsb3NlJy4gT3IgZXJyb3IsIGVtaXQgZXZlbnQgJ2Vycm9yJyB3aXRoIGVycm9yLlxyXG4gKiAtICdjbG9zaW5nJyAtPiAnY2xvc2VkJywgaWYgdGhlIGNvbm5lY3Rpb24gd2FzIGNsb3NlZC4gRW1pdCBldmVudCAnY2xvc2UnLlxyXG4gKiAtIEVuZCBpbiBzdGF0ZSAnY2xvc2VkJy5cclxuICogQW5kIGluIGFkZGl0aW9uIHRvIGV2ZW50ICdvcGVuJywgJ2Nsb3NlJywgJ2Vycm9yJywgYW4gZXZlbnQgJ21lc3NhZ2UnIGlzIGVtaXR0ZWRcclxuICogb24gcmVjZWl2aW5nIGFuIG1lc3NhZ2UgZnJvbSB0aGUgb3RoZXIgc2lkZS5cclxuICogTm90ZSB0aGF0IGFsbCBtZXRob3Mgb2YgQmFzZUNvbm5lY3Rpb24gaGF2ZSBhcHBsaWNhYmxlIHN0YXRlcywgY2hlY2sgZG9jdW1lbnRhdGlvblxyXG4gKiBmb3IgZGV0YWlscy5cclxuICovXHJcbmNsYXNzIEJhc2VDb25uZWN0aW9uIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgbmV3IEJhc2VDb25uZWN0aW9uLlxyXG4gICAgICogVGhlIHJldHVybmVkIEJhc2VDb25uZWN0aW9uIHdpbGwgYWx3YXlzIGJlIGluICdvcGVuaW5nJyBzdGF0ZS5cclxuICAgICAqIEltcGxlbWVudGF0aW9ucyBzaG91bGQgc3RhcnQgdGhlIGNvbm5lY3Rpb24gaW50ZXJuYWxseSBoZXJlLCBhbmQgY2FsbFxyXG4gICAgICogb25PcGVuKCkgd2hlbiB0aGUgY29ubmVjdGlvbiBpcyBzdWNjZXNzZnVsbHkgb3BlbmVkLCBvciBvbkNsb3NlKCkgaWYgdGhlXHJcbiAgICAgKiBjb25uZWN0aW9uIGlzIGNsb3NlZCBmcm9tIHRoZSBvdGhlcnNpZGUsIG9yIG9uRXJyb3IoKSBpZiB0aGUgY29ubmVjdGlvblxyXG4gICAgICogYnVtcHMgaW50byBhbiBlcnJvci4gRmFpbGluZyB0byBkbyBzbyB3aWxsIGxlYWQgdG8gbWlzYmFoYXZpb3Igb2YgYXBwbGljYXRpb25zLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXRlID0gJ29wZW5pbmcnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVxdWVzdCB0aGUgY29ubmVjdGlvbiB0byBjbG9zZS4gSW50ZXJuYWwgYWJzdHJhY3QgbWV0aG9kLlxyXG4gICAgICogSW1wbGVtZW50YXRpb24gTVVTVCBjbG9zZSB0aGUgY29ubmVjdGlvbiBhdCBpbnZvY2F0aW9uLCBhbmQgaW52b2tlIG9uQ2xvc2UoKVxyXG4gICAgICogd2hlbiB0aGUgY29ubmVjdGlvbiBpcyBjbG9zZWQgb3Igb25FcnJvcigpIHdoZW4gdGhlIGNvbm5lY3Rpb24gaXMgdW5hYmxlXHJcbiAgICAgKiB0byBjbG9zZS4gTWVhbndoaWxlLCBpbXBsZW1lbnRhdGlvbnMgc2hvdWxkIHNldHVwIGNhbGxpbmcgb25NZXNzYWdlKCkgb25cclxuICAgICAqIGFycml2YWwgb2YgYSBtZXNzYWdlLiBPdGhlcndpc2UsIGFwcGxpY2F0aW9ucyBhcmUgbGlrZWx5IHRvIGJlaGF2ZSBzdHJhbmdlbHkuXHJcbiAgICAgKiBJdCBpcyBub3QgcmVjb21tZW5kZWQgdG8gZGlzcG9zZSBvZiByZXNvdXJjZXMgaGVyZSwgc2luY2UgY2xvc2luZyBvbiBlcnJvclxyXG4gICAgICogb3IgZnJvbSB0aGUgb3RoZXIgc2lkZSB3aWxsIG5vdCBpbnZva2UgdGhpcyBtZXRob2QuIGxpc3RlbiB0byB0aGUgJ2Nsb3NlJ1xyXG4gICAgICogZXZlbnQgaW5zdGVhZC5cclxuICAgICAqIFRoaXMgbWV0aG9kIHdpbGwgb25seSBiZSBjYWxsZWQgYXQgc3RhdGUgJ2Nsb3NpbmcnLlxyXG4gICAgICovXHJcbiAgICByZXF1ZXN0Q2xvc2UoKSB7fVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXF1ZXN0IHRoZSBjb25uZWN0aW9uIHRvIHNlbmQgdGhlIGdpdmVuIGRhdGEuIEludGVybmFsIGFic3RyYWN0IG1ldGhvZC5cclxuICAgICAqIEltcGxlbWVudGF0aW9ucyBDQU4gdGhyb3cgYW4gZXJyb3IgaWYgdGhlIGdpdmVuIGRhdGEgY2Fubm90IGJlIHNlbnQuXHJcbiAgICAgKiBUaGlzIG1ldGhvZCB3aWxsIG9ubHkgYmUgY2FsbGVkIGF0IHN0YXRlICdvcGVuZWQnLlxyXG4gICAgICogQHBhcmFtIHthbnl9IGRhdGEgVGhlIGRhdGEgdG8gc2VuZC5cclxuICAgICAqL1xyXG4gICAgcmVxdWVzdFNlbmQoZGF0YSkge30gLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVxdWVzdCB0aGUgY29ubmVjdGlvbiB0byBjbG9zZS4gRmluYWwgQVBJLlxyXG4gICAgICogVGhpcyBtZXRob2Qgd2lsbCBvbmx5IGJlIGF2YWlsYWJsZSBhdCBzdGF0ZSAnb3BlbmluZycgYW5kICdvcGVuZWQnLiBPdGhlcndpc2UsXHJcbiAgICAgKiBpbnZvY2F0aW9ucyB3aWxsIGJlIGlnbm9yZWQuXHJcbiAgICAgKiBOb3RlIHRoYXQgb25seSBhdCBldmVudCAnY2xvc2UnIHdpbGwgdGhlIGNvbm5lY3Rpb24gYmUgYWN0dWFsbHkgY2xvc2VkLlxyXG4gICAgICogSXQgaW50ZXJuYWxseSBjYWxscyByZXF1ZXN0Q2xvc2UoKS5cclxuICAgICAqL1xyXG4gICAgY2xvc2UoKSB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XHJcbiAgICAgICAgY2FzZSAnb3BlbmluZyc6IGNhc2UgJ29wZW5lZCc6XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAnY2xvc2luZyc7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdENsb3NlKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVxdWVzdCB0aGUgY29ubmVjdGlvbiB0byBzZW5kIGdpdmVuIGRhdGEuIEZpbmFsIEFQSS5cclxuICAgICAqIFRoaXMgbWV0aG9kIHdpbGwgb25seSBiZSBhdmFpbGFibGUgYXQgc3RhdGUgJ29wZW5lZCcuIE90aGVyd2lzZSwgaW52b2NhdGlvbnNcclxuICAgICAqIHdpbGwgYmUgaWdub3JlZC5cclxuICAgICAqIE5vdGUgdGhhdCB0aGlzIG1ldGhvZCBtaWdodCB0aHJvdyBhbiBlcnJvciBvciBpZ25vcmUgaW52YWxpZCBkYXRlIHNpbGVudGx5LiBUaGVcclxuICAgICAqIGJlaGF2aW9yIGlzIHVwIHRvIHRoZSBkZWZpbml0aW9uLlxyXG4gICAgICogSXQgaW50ZXJuYWxseSBjYWxscyByZXF1ZXN0U2VuZCgpLlxyXG4gICAgICogQHBhcmFtIHsqfSBkYXRhIFRoZSBkYXRhIHRvIHNlbmQuXHJcbiAgICAgKi9cclxuICAgIHNlbmQoZGF0YSkge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZSkge1xyXG4gICAgICAgIGNhc2UgJ29wZW5lZCc6XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdFNlbmQoZGF0YSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTm90aWZ5IHRoYXQgdGhlIGNvbm5lY3Rpb24gaGFzIG9wZW5lZC4gSW50ZXJuYWwgY2FsbGJhY2suXHJcbiAgICAgKiBUaGlzIG1ldGhvZCB3aWxsIG1hbmFnZSB0aGUgbGlmZWN5Y2xlIGFuZCBlbWl0IGV2ZW50cy5cclxuICAgICAqIFRoaXMgbWV0aG9kIHdpbGwgb25seSBiZSBhdmFpbGFibGUgYXQgc3RhdGUgJ29wZW5pbmcnLiBPdGhlcndpc2UsIGludm9jYXRpb25zXHJcbiAgICAgKiB3aWxsIGJlIGlnbm9yZWQuXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBjYW4gYmUgdXNlZCBhcyBhIGNhbGxiYWNrIHRvIGVuYWJsZSBhc3luY2hyb25vdXMgb3BlcmF0aW9ucy5cclxuICAgICAqL1xyXG4gICAgb25PcGVuKCkge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZSkge1xyXG4gICAgICAgIGNhc2UgJ29wZW5pbmcnOlxyXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gJ29wZW5lZCc7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnb3BlbicpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE5vdGlmeSB0aGF0IHRoZSBjb25uZWN0aW9uIGhhcyBidW1wZWQgaW50byBhbiBlcnJvci4gSW50ZXJuYWwgY2FsbGJhY2suXHJcbiAgICAgKiBUaGlzIG1ldGhvZCB3aWxsIG1hbmFnZSB0aGUgbGlmZWN5Y2xlIGFuZCBlbWl0IGV2ZW50cy5cclxuICAgICAqIFRoaXMgbWV0aG9kIHdpbGwgbm90IGJlIGF2YWlsYWJsZSBhdCBzdGF0ZSAnY2xvc2VkJy4gSW4gdGhpcyBjYXNlLCBpbnZvY2F0aW9uc1xyXG4gICAgICogd2lsbCBiZSBpZ25vcmVkLlxyXG4gICAgICogVGhpcyBtZXRob2QgY2FuIGJlIHVzZWQgYXMgYSBjYWxsYmFjayB0byBlbmFibGUgYXN5bmNocm9ub3VzIG9wZXJhdGlvbnMuXHJcbiAgICAgKi9cclxuICAgIG9uRXJyb3IoZXJyKSB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XHJcbiAgICAgICAgY2FzZSAnb3BlbmluZyc6IGNhc2UgJ29wZW5lZCc6XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAnY2xvc2VkJztcclxuICAgICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnY2xvc2UnKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnY2xvc2luZyc6XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAnY2xvc2VkJztcclxuICAgICAgICAgICAgdGhpcy5lbWl0KCdjbG9zZScpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE5vdGlmeSB0aGF0IHRoZSBjb25uZWN0aW9uIGhhcyBjbG9zZWQuIEludGVybmFsIGNhbGxiYWNrLlxyXG4gICAgICogVGhpcyBtZXRob2Qgd2lsbCBtYW5hZ2UgdGhlIGxpZmVjeWNsZSBhbmQgZW1pdCBldmVudHMuXHJcbiAgICAgKiBUaGlzIG1ldGhvZCB3aWxsIG5vdCBiZSBhdmFpbGFibGUgYXQgc3RhdGUgJ2Nsb3NlZCcuIEluIHRoaXMgY2FzZSwgaW52b2NhdGlvbnNcclxuICAgICAqIHdpbGwgYmUgaWdub3JlZC5cclxuICAgICAqIFRoaXMgbWV0aG9kIGNhbiBiZSB1c2VkIGFzIGEgY2FsbGJhY2sgdG8gZW5hYmxlIGFzeW5jaHJvbm91cyBvcGVyYXRpb25zLlxyXG4gICAgICovXHJcbiAgICBvbkNsb3NlKCkge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZSkge1xyXG4gICAgICAgIGNhc2UgJ29wZW5pbmcnOiBjYXNlICdvcGVuZWQnOiBjYXNlICdjbG9zaW5nJzpcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICdjbG9zZWQnO1xyXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Nsb3NlJyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTm90aWZ5IHRoYXQgdGhlIGNvbm5lY3Rpb24gaGFzIHJlY2VpdmVkIGEgbWVzc2FnZS4gSW50ZXJuYWwgY2FsbGJhY2suXHJcbiAgICAgKiBUaGlzIG1ldGhvZCB3aWxsIG1hbmFnZSB0aGUgbGlmZWN5Y2xlIGFuZCBlbWl0IGV2ZW50cy5cclxuICAgICAqIFRoaXMgbWV0aG9kIHdpbGwgb25seSBiZSBhdmFpbGFibGUgYXQgc3RhdGUgJ29wZW5lZCcuIE90aGVyd2lzZSwgaW52b2NhdGlvbnNcclxuICAgICAqIHdpbGwgYmUgaWdub3JlZC5cclxuICAgICAqIEBwYXJhbSB7YW55fSBkYXRhIFRoZSByZWNlaXZlZCBkYXRhLlxyXG4gICAgICovXHJcbiAgICBvbk1lc3NhZ2UoZGF0YSkge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZSkge1xyXG4gICAgICAgIGNhc2UgJ29wZW5lZCc6XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnbWVzc2FnZScsIGRhdGEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBCYXNlQ29ubmVjdGlvbiBpbXBsZW1lbnRhdGlvbiB0aGF0IGNvbm5lY3RzIHVwb24gYSBwYXJlbnQgQmFzZUNvbm5lY3Rpb24uXHJcbiAqIFRoZSBDYXNjYWRlQ29ubmVjdGlvbiBsaXN0ZW5zIHRvIGV2ZW50cyBvZiB0aGUgcGFyZW50IEJhc2VDb25uZWN0aW9uIHRvIG1hbmFnZSBpdHNcclxuICogb3duIGxpZmVjeWNsZSwgYW5kIGRlbGVnYXRlcyBtZXRob2RzIHRvIHRoZSBwYXJlbnQgQmFzZUNvbm5lY3Rpb24uIEJ5IGRlZmF1bHQsIGl0XHJcbiAqIGluaGVyaXRzIGFsbCBldmVudHMgYW5kIGRlbGVnYXRlcyBhbGwgbWV0aG9kcywgaG93ZXZlciB0aGlzIGNhbiBiZSBjb25maWd1cmF0ZWQuXHJcbiAqIE1lYW53aGlsZSwgaXQgZW5hYmxlcyB0cmFuc2Zvcm1hdGlvbiBhbmQgZGV0cmFuc2Zvcm1hdGlvbiBvZiBzZW50IGFuZCByZWNlaXZlZFxyXG4gKiBtZXNzYWdlcy5cclxuICovXHJcbmNsYXNzIENhc2NhZGVDb25uZWN0aW9uIGV4dGVuZHMgQmFzZUNvbm5lY3Rpb24ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IENhc2NhZGVDb25uZWN0aW9uIHdpdGggdGhlIGdpdmVuIEJhc2VDb25uZWN0aW9uLlxyXG4gICAgICogdGhpcy5wYXJlbnQgd2lsbCBiZSB1c2VkIHRvIHN0b3JlIHRoZSBnaXZlbiBwYXJlbnQgQmFzZUNvbm5lY3Rpb24uXHJcbiAgICAgKiBpbmhlcml0cyBkZXRlcm1pbmVzIHdoaWNoIGV2ZW50cyBhcmUgaW5oZXJpdGVkLiBCeSBkZWZhdWx0IGFsbCBldmVudHMgYXJlXHJcbiAgICAgKiBpbmhlcml0ZWQsIHRoYXQgaXMsICdvcGVuJywgJ2Nsb3NlJywgJ21lc3NhZ2UnIGFuZCAnZXJyb3InLiBJbmhlcml0YW5jZVxyXG4gICAgICogb2YgZXZlbnQgWCBjYW4gYmUgZGlzYWJsZWQgYnkgc3BlY2lmeWluZyBYOiBmYWxzZSBpbiBpbmhlcml0cywgbGlrZVxyXG4gICAgICogaW5oZXJpdHMgPSB7IG9wZW46IGZhbHNlIH0uXHJcbiAgICAgKiBPbiBkaXNhYmxlIHRoZSBpbmhlcml0YW5jZSBvZiBldmVudCBYLCBpbXBsZW1lbnRhdGlvbnMgc2hvdWxkIGltcGxlbWVudFxyXG4gICAgICogdGhlIGJlaGF2aW9yIGl0c2VsZiBieSBjYWxsaW5nIG9uT3BlbigpLCBvbkNsb3NlKCksIG9uRXJyb3IoKSBvciBvbk1lc3NhZ2UoKS5cclxuICAgICAqIEZvciBkaXNhYmxpbmcgaW5oZXJpdGFuY2Ugb2YgbWV0aG9kcywgc2VlIGRvY3VtZW50YXRpb24gb2YgZWFjaCBtZXRob2QuXHJcbiAgICAgKiBJZiAnbWVzc2FnZScgZXZlbnQgaXMgaW5oZXJpdGVkLCBkZXRyYW5zZm9ybSgpIGlzIHVzZWQgdG8gdHJhbnNmb3JtIGRhdGFcclxuICAgICAqIHJlY2VpdmVkIGZyb20gcGFyZW50IGJhY2sgdG8gZGF0YSBhY2NlcHRhYmxlIGJ5IHRoaXMgY29ubmVjdGlvbi5cclxuICAgICAqIEBwYXJhbSB7QmFzZUNvbm5lY3Rpb259IHBhcmVudCBUaGUgcGFyZW50IHRvIGluaGVyaXQuXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5oZXJpdHMgVG8gY29uZmlnIHdoaWNoIGV2ZW50cyB0byBpbmhlcml0LlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIGluaGVyaXRzID0ge30pIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcclxuXHJcbiAgICAgICAgY29uc3QgeyBlcnJvciwgY2xvc2UsIG9wZW4sIG1lc3NhZ2UgfSA9XHJcbiAgICAgICAgICAgIGRlZmF1bHRzKGluaGVyaXRzLCB7IGVycm9yOiB0cnVlLCBjbG9zZTogdHJ1ZSwgb3BlbjogdHJ1ZSwgbWVzc2FnZTogdHJ1ZSB9KTtcclxuICAgICAgICBpZiAoZXJyb3IpIHBhcmVudC5vbignZXJyb3InLCB0aGlzLm9uRXJyb3IuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgaWYgKGNsb3NlKSBwYXJlbnQub24oJ2Nsb3NlJywgdGhpcy5vbkNsb3NlLmJpbmQodGhpcykpO1xyXG4gICAgICAgIGlmIChvcGVuKSBwYXJlbnQub24oJ29wZW4nLCB0aGlzLm9uT3Blbi5iaW5kKHRoaXMpKTtcclxuICAgICAgICBpZiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICBwYXJlbnQub24oJ21lc3NhZ2UnLCAoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGV0cmFuc2Zvcm1lZCA9IHRoaXMuZGV0cmFuc2Zvcm0oZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRldHJhbnNmb3JtZWQgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uTWVzc2FnZShkZXRyYW5zZm9ybWVkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVxdWVzdCBjb25uZWN0aW9uIHRvIHNlbmQgZ2l2ZW4gZGF0YS4gSW5oZXJpdGVkIGZyb20gQmFzZUNvbm5lY3Rpb24uXHJcbiAgICAgKiBCeSBkZWZhdWx0LCB0aGlzIG1ldGhvZCB1c2VzIHRyYW5zZm9ybSgpIHRvIHRyYW5zZm9ybSBwcm92aWRlZCBkYXRhIHRvIGRhdGFcclxuICAgICAqIGFjY2VwdGFibGUgYnkgcGFyZW50IGFuZCB1c2UgcGFyZW50LnNlbmQoKS4gSW1wbGVtZW50YXRpb25zIGNhbiBvdmVycmlkZSB0aGlzXHJcbiAgICAgKiBtZXRob2QgdG8gZGlzYWJsZSBkZWxlZ2F0aW9uLlxyXG4gICAgICogQHBhcmFtIHthbnl9IGRhdGEgVGhlIGRhdGEgdG8gc2VuZC5cclxuICAgICAqL1xyXG4gICAgcmVxdWVzdFNlbmQoZGF0YSkge1xyXG4gICAgICAgIHRoaXMucGFyZW50LnNlbmQodGhpcy50cmFuc2Zvcm0oZGF0YSkpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXF1ZXN0IGNvbm5lY3Rpb24gdG8gY2xvc2UuIEluaGVyaXRlZCBmcm9tIEJhc2VDb25uZWN0aW9uLlxyXG4gICAgICogQnkgZGVmYXVsdCwgdGhpcyBtZXRob2QgY2FsbHMgcGFyZW50LmNsb3NlKCkuIEltcGxlbWVudGF0aW9uIGNhbiBvdmVycmlkZSB0aGlzXHJcbiAgICAgKiB0byBkaXNhYmxlIGRlbGVnYXRpb24gb3IgYWRkIGFkZGl0aW9uYWwgYmVoYXZpb3IuXHJcbiAgICAgKi9cclxuICAgIHJlcXVlc3RDbG9zZSgpIHtcclxuICAgICAgICB0aGlzLnBhcmVudC5jbG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGV0cmFuc2Zvcm0gZGF0YSByZWNlaXZlZCBmcm9tIHBhcmVudCBiYWNrIHRvIGRhdGEgYWNjZXB0YWJsZSBieSB0aGlzIGNvbm5lY3Rpb24uXHJcbiAgICAgKiBCeSBkZWZhdWx0LCB0aGlzIG1ldGhvZCBrZWVwcyB0aGUgZGF0YSBhcy1pcy5cclxuICAgICAqIElmIHVuZGVmaW5lZCBpcyByZXR1cm5lZCwgdGhpcy5vbk1lc3NhZ2UoKSB3aWxsIG5vdCBiZSBjYWxsZWQuXHJcbiAgICAgKiBAcGFyYW0ge2FueX0gZGF0YSBUaGUgZGF0YSB0byBkZXRyYW5zZm9ybS5cclxuICAgICAqL1xyXG4gICAgZGV0cmFuc2Zvcm0oZGF0YSkgeyByZXR1cm4gZGF0YTsgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRyYW5zZm9ybSBkYXRhIHRvIHNlbmQgdG8gZGF0YSBhY2NlcHRhYmxlIGJ5IHBhcmVudC5cclxuICAgICAqIEJ5IGRlZmF1bHQsIHRoaXMgbWV0aG9kIGtlZXBzIHRoZSBkYXRhIGFzLWlzLlxyXG4gICAgICogQHBhcmFtIHthbnl9IGRhdGEgVGhlIGRhdGEgdG8gZGV0cmFuc2Zvcm0uXHJcbiAgICAgKi9cclxuICAgIHRyYW5zZm9ybShkYXRhKSB7IHJldHVybiBkYXRhOyB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgQmFzZUNvbm5lY3Rpb24sXHJcbiAgICBDYXNjYWRlQ29ubmVjdGlvbixcclxufTtcclxuIl19