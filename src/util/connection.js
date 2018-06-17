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

const EventEmitter = require('events');
const { defaults } = require('lodash');

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
class BaseConnection extends EventEmitter {
    /**
     * Construct a new BaseConnection.
     * The returned BaseConnection will always be in 'opening' state.
     * Implementations should start the connection internally here, and call
     * onOpen() when the connection is successfully opened, or onClose() if the
     * connection is closed from the otherside, or onError() if the connection
     * bumps into an error. Failing to do so will lead to misbahavior of applications.
     */
    constructor() {
        super();

        this.state = 'opening';
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
    requestClose() {}
    /**
     * Request the connection to send the given data. Internal abstract method.
     * Implementations CAN throw an error if the given data cannot be sent.
     * This method will only be called at state 'opened'.
     * @param {any} data The data to send.
     */
    requestSend(data) {} // eslint-disable-line no-unused-vars

    /**
     * Request the connection to close. Final API.
     * This method will only be available at state 'opening' and 'opened'. Otherwise,
     * invocations will be ignored.
     * Note that only at event 'close' will the connection be actually closed.
     * It internally calls requestClose().
     */
    close() {
        switch (this.state) {
        case 'opening': case 'opened':
            this.state = 'closing';
            this.requestClose();
            break;
        default:
        }
    }

    /**
     * Request the connection to send given data. Final API.
     * This method will only be available at state 'opened'. Otherwise, invocations
     * will be ignored.
     * Note that this method might throw an error or ignore invalid date silently. The
     * behavior is up to the definition.
     * It internally calls requestSend().
     * @param {*} data The data to send.
     */
    send(data) {
        switch (this.state) {
        case 'opened':
            this.requestSend(data);
            break;
        default:
        }
    }

    /**
     * Notify that the connection has opened. Internal callback.
     * This method will manage the lifecycle and emit events.
     * This method will only be available at state 'opening'. Otherwise, invocations
     * will be ignored.
     * This method can be used as a callback to enable asynchronous operations.
     */
    onOpen() {
        switch (this.state) {
        case 'opening':
            this.state = 'opened';
            this.emit('open');
            break;
        default:
        }
    }

    /**
     * Notify that the connection has bumped into an error. Internal callback.
     * This method will manage the lifecycle and emit events.
     * This method will not be available at state 'closed'. In this case, invocations
     * will be ignored.
     * This method can be used as a callback to enable asynchronous operations.
     */
    onError(err) {
        switch (this.state) {
        case 'opening': case 'opened':
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
    }

    /**
     * Notify that the connection has closed. Internal callback.
     * This method will manage the lifecycle and emit events.
     * This method will not be available at state 'closed'. In this case, invocations
     * will be ignored.
     * This method can be used as a callback to enable asynchronous operations.
     */
    onClose() {
        switch (this.state) {
        case 'opening': case 'opened': case 'closing':
            this.state = 'closed';
            this.emit('close');
            break;
        default:
        }
    }

    /**
     * Notify that the connection has received a message. Internal callback.
     * This method will manage the lifecycle and emit events.
     * This method will only be available at state 'opened'. Otherwise, invocations
     * will be ignored.
     * @param {any} data The received data.
     */
    onMessage(data) {
        switch (this.state) {
        case 'opened':
            this.emit('message', data);
            break;
        default:
        }
    }
}

/**
 * The BaseConnection implementation that connects upon a parent BaseConnection.
 * The CascadeConnection listens to events of the parent BaseConnection to manage its
 * own lifecycle, and delegates methods to the parent BaseConnection. By default, it
 * inherits all events and delegates all methods, however this can be configurated.
 * Meanwhile, it enables transformation and detransformation of sent and received
 * messages.
 */
class CascadeConnection extends BaseConnection {
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
    constructor(parent, inherits = {}) {
        super();

        this.parent = parent;

        const { error, close, open, message } =
            defaults(inherits, { error: true, close: true, open: true, message: true });
        if (error) parent.on('error', this.onError.bind(this));
        if (close) parent.on('close', this.onClose.bind(this));
        if (open) parent.on('open', this.onOpen.bind(this));
        if (message) {
            parent.on('message', (data) => {
                const detransformed = this.detransform(data);
                if (typeof detransformed === 'undefined') return;
                this.onMessage(detransformed);
            });
        }
    }

    /**
     * Request connection to send given data. Inherited from BaseConnection.
     * By default, this method uses transform() to transform provided data to data
     * acceptable by parent and use parent.send(). Implementations can override this
     * method to disable delegation.
     * @param {any} data The data to send.
     */
    requestSend(data) {
        this.parent.send(this.transform(data));
    }
    /**
     * Request connection to close. Inherited from BaseConnection.
     * By default, this method calls parent.close(). Implementation can override this
     * to disable delegation or add additional behavior.
     */
    requestClose() {
        this.parent.close();
    }

    /**
     * Detransform data received from parent back to data acceptable by this connection.
     * By default, this method keeps the data as-is.
     * If undefined is returned, this.onMessage() will not be called.
     * @param {any} data The data to detransform.
     */
    detransform(data) { return data; }
    /**
     * Detransform data to send to data acceptable by parent.
     * By default, this method keeps the data as-is.
     * @param {any} data The data to detransform.
     */
    transform(data) { return data; }
}

module.exports = {
    BaseConnection,
    CascadeConnection,
};
