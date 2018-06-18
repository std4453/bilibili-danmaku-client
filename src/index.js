/**
 * This file contains the class definition of DanmakuClient, the only API
 * open to applications.
 * The Wiki page 'DanmakuClient' contains more choreographed documentation,
 * see that instead.
 */

const EventEmitter = require('events');

const ApplicationConnection = require('./application');

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
class DanmakuClient extends EventEmitter {
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
    constructor(room, options) {
        super();

        this.room = room;
        this.options = options;
        this.state = 'idle';
    }

    /**
     * Start the DanmakuClient.
     * This method is only available in state 'idle'. Otherwise nothing will happen.
     * Internally the underlying ApplicationConnection is not created before start(),
     * so this.connection will not be available then,
     */
    start() {
        if (this.state !== 'idle') return;
        this.connection = new ApplicationConnection(this.room, this.options);
        this.state = 'opening';
        this.connection.on('open', () => {
            this.state = 'opened';
            this.emit('open');
        });
        this.connection.on('error', err => this.emit('error', err));
        this.connection.on('close', () => {
            this.state = 'closed';
            this.emit('close');
        });
        this.connection.on('message', event => this.emit('event', event));
    }

    /**
     * Request closing of the DanmakuClient.
     * Note that this method will return immediately after requesting. The client will
     * be actually closed at time when the 'close' event is emitted.
     */
    terminate() {
        if (this.state === 'opening' || this.state === 'opened') this.connection.close();
    }
}

module.exports = DanmakuClient;
