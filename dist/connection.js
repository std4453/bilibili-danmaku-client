"use strict";

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var EventEmitter = require('events');

var _require = require('lodash'),
    defaults = _require.defaults;

var BaseConnection =
/*#__PURE__*/
function (_EventEmitter) {
  _inheritsLoose(BaseConnection, _EventEmitter);

  function BaseConnection() {
    var _this;

    _this = _EventEmitter.call(this) || this;
    _this.state = 'opening';
    return _this;
  }

  var _proto = BaseConnection.prototype;

  _proto.requestClose = function requestClose() {};

  _proto.requestSend = function requestSend(data) {}; // eslint-disable-line no-unused-vars


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

  _proto.send = function send(data) {
    switch (this.state) {
      case 'opened':
        this.requestSend(data);
        break;

      default:
    }
  };

  _proto.onOpen = function onOpen() {
    switch (this.state) {
      case 'opening':
        this.state = 'opened';
        this.emit('open');
        break;

      default:
    }
  };

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

var CascadeConnection =
/*#__PURE__*/
function (_BaseConnection) {
  _inheritsLoose(CascadeConnection, _BaseConnection);

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

  var _proto2 = CascadeConnection.prototype;

  _proto2.requestSend = function requestSend(data) {
    this.parent.send(this.transform(data));
  };

  _proto2.requestClose = function requestClose() {
    this.parent.close();
  };

  _proto2.detransform = function detransform(data) {
    return data;
  };

  _proto2.transform = function transform(data) {
    return data;
  };

  return CascadeConnection;
}(BaseConnection);

module.exports = {
  BaseConnection: BaseConnection,
  CascadeConnection: CascadeConnection
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25uZWN0aW9uLmpzIl0sIm5hbWVzIjpbIkV2ZW50RW1pdHRlciIsInJlcXVpcmUiLCJkZWZhdWx0cyIsIkJhc2VDb25uZWN0aW9uIiwic3RhdGUiLCJyZXF1ZXN0Q2xvc2UiLCJyZXF1ZXN0U2VuZCIsImRhdGEiLCJjbG9zZSIsInNlbmQiLCJvbk9wZW4iLCJlbWl0Iiwib25FcnJvciIsImVyciIsIm9uQ2xvc2UiLCJvbk1lc3NhZ2UiLCJDYXNjYWRlQ29ubmVjdGlvbiIsInBhcmVudCIsImluaGVyaXRzIiwiZXJyb3IiLCJvcGVuIiwibWVzc2FnZSIsIm9uIiwiYmluZCIsImRldHJhbnNmb3JtZWQiLCJkZXRyYW5zZm9ybSIsInRyYW5zZm9ybSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU1BLGVBQWVDLFFBQVEsUUFBUixDQUFyQjs7ZUFDcUJBLFFBQVEsUUFBUixDO0lBQWJDLFEsWUFBQUEsUTs7SUFFRkMsYzs7Ozs7QUFDRiw0QkFBYztBQUFBOztBQUNWO0FBRUEsVUFBS0MsS0FBTCxHQUFhLFNBQWI7QUFIVTtBQUliOzs7O1NBRURDLFksMkJBQWUsQ0FBRSxDOztTQUNqQkMsVyx3QkFBWUMsSSxFQUFNLENBQUUsQyxFQUFDOzs7U0FFckJDLEssb0JBQVE7QUFDSixZQUFRLEtBQUtKLEtBQWI7QUFDQSxXQUFLLFNBQUw7QUFBZ0IsV0FBSyxRQUFMO0FBQ1osYUFBS0EsS0FBTCxHQUFhLFNBQWI7QUFDQSxhQUFLQyxZQUFMO0FBQ0E7O0FBQ0o7QUFMQTtBQU9ILEc7O1NBRURJLEksaUJBQUtGLEksRUFBTTtBQUNQLFlBQVEsS0FBS0gsS0FBYjtBQUNBLFdBQUssUUFBTDtBQUNJLGFBQUtFLFdBQUwsQ0FBaUJDLElBQWpCO0FBQ0E7O0FBQ0o7QUFKQTtBQU1ILEc7O1NBRURHLE0scUJBQVM7QUFDTCxZQUFRLEtBQUtOLEtBQWI7QUFDQSxXQUFLLFNBQUw7QUFDSSxhQUFLQSxLQUFMLEdBQWEsUUFB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Y29uc3QgeyBkZWZhdWx0cyB9ID0gcmVxdWlyZSgnbG9kYXNoJyk7XHJcblxyXG5jbGFzcyBCYXNlQ29ubmVjdGlvbiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXRlID0gJ29wZW5pbmcnO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcXVlc3RDbG9zZSgpIHt9XHJcbiAgICByZXF1ZXN0U2VuZChkYXRhKSB7fSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcblxyXG4gICAgY2xvc2UoKSB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XHJcbiAgICAgICAgY2FzZSAnb3BlbmluZyc6IGNhc2UgJ29wZW5lZCc6XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAnY2xvc2luZyc7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdENsb3NlKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNlbmQoZGF0YSkge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZSkge1xyXG4gICAgICAgIGNhc2UgJ29wZW5lZCc6XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdFNlbmQoZGF0YSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uT3BlbigpIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcclxuICAgICAgICBjYXNlICdvcGVuaW5nJzpcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICdvcGVuZWQnO1xyXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ29wZW4nKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25FcnJvcihlcnIpIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcclxuICAgICAgICBjYXNlICdvcGVuaW5nJzogY2FzZSAnb3BlbmVkJzpcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICdjbG9zZWQnO1xyXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcclxuICAgICAgICAgICAgdGhpcy5lbWl0KCdjbG9zZScpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdjbG9zaW5nJzpcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICdjbG9zZWQnO1xyXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Nsb3NlJyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uQ2xvc2UoKSB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XHJcbiAgICAgICAgY2FzZSAnb3BlbmluZyc6IGNhc2UgJ29wZW5lZCc6IGNhc2UgJ2Nsb3NpbmcnOlxyXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gJ2Nsb3NlZCc7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnY2xvc2UnKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25NZXNzYWdlKGRhdGEpIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcclxuICAgICAgICBjYXNlICdvcGVuZWQnOlxyXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ21lc3NhZ2UnLCBkYXRhKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIENhc2NhZGVDb25uZWN0aW9uIGV4dGVuZHMgQmFzZUNvbm5lY3Rpb24ge1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBpbmhlcml0cyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XHJcblxyXG4gICAgICAgIGNvbnN0IHsgZXJyb3IsIGNsb3NlLCBvcGVuLCBtZXNzYWdlIH0gPVxyXG4gICAgICAgICAgICBkZWZhdWx0cyhpbmhlcml0cywgeyBlcnJvcjogdHJ1ZSwgY2xvc2U6IHRydWUsIG9wZW46IHRydWUsIG1lc3NhZ2U6IHRydWUgfSk7XHJcbiAgICAgICAgaWYgKGVycm9yKSBwYXJlbnQub24oJ2Vycm9yJywgdGhpcy5vbkVycm9yLmJpbmQodGhpcykpO1xyXG4gICAgICAgIGlmIChjbG9zZSkgcGFyZW50Lm9uKCdjbG9zZScsIHRoaXMub25DbG9zZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICBpZiAob3BlbikgcGFyZW50Lm9uKCdvcGVuJywgdGhpcy5vbk9wZW4uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgaWYgKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgcGFyZW50Lm9uKCdtZXNzYWdlJywgKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRldHJhbnNmb3JtZWQgPSB0aGlzLmRldHJhbnNmb3JtKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkZXRyYW5zZm9ybWVkID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbk1lc3NhZ2UoZGV0cmFuc2Zvcm1lZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXF1ZXN0U2VuZChkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5wYXJlbnQuc2VuZCh0aGlzLnRyYW5zZm9ybShkYXRhKSk7XHJcbiAgICB9XHJcbiAgICByZXF1ZXN0Q2xvc2UoKSB7XHJcbiAgICAgICAgdGhpcy5wYXJlbnQuY2xvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBkZXRyYW5zZm9ybShkYXRhKSB7IHJldHVybiBkYXRhOyB9XHJcbiAgICB0cmFuc2Zvcm0oZGF0YSkgeyByZXR1cm4gZGF0YTsgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEJhc2VDb25uZWN0aW9uLFxyXG4gICAgQ2FzY2FkZUNvbm5lY3Rpb24sXHJcbn07XHJcbiJdfQ==