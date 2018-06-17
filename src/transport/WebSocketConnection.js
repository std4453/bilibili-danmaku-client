const WebSocket = require('x-platform-ws');

const { CascadeConnection } = require('../util/connection');

/**
 * BaseConnection implementation wrapping a WebSocket from x-platform-ws.
 * Since BaseConnection imitates the API of ws (which x-platform-ws internally
 * uses), the wrapping is as simple as putting an elephant into a refridgerator.
 */
class WebSocketConnection extends CascadeConnection {
    /**
     * Construct a new WebSocketConnection.
     * All arguments are passed onto WebSocket for initialization.
     * @param {any[]} args Arguments to pass to new WebSocket().
     */
    constructor(...args) {
        super(new WebSocket(...args));
    }
}

module.exports = WebSocketConnection;
