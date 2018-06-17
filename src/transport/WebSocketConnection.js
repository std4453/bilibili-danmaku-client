const WebSocket = require('x-platform-ws');

const { CascadeConnection } = require('../connection');

class WebSocketConnection extends CascadeConnection {
    constructor(...args) {
        super(new WebSocket(...args));
    }
}

module.exports = WebSocketConnection;
