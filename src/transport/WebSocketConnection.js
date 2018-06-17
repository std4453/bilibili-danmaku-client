const WebSocket = require('x-platform-ws');

const { CascadeConnection } = require('../util/connection');

class WebSocketConnection extends CascadeConnection {
    constructor(...args) {
        super(new WebSocket(...args));
    }
}

module.exports = WebSocketConnection;
