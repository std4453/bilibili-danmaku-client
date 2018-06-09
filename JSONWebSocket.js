const WebSocket = require('ws');
const EventEmitter = require('events');
const { str2buf, buf2strs } = require('./encoding');

class JSONWebSocket extends EventEmitter {
    constructor(url) {
        var ws = this.ws = new WebSocket(url);
        ws.on('message', this.onMessage.bind(this));
        ['open', 'close', 'error'].forEach(eventName => {
            ws.on(eventName, (...args) => this.emit(eventName, ...args));
        })
    }

    // Event related
    onMessage(data) {
        if (data instanceof Buffer) this.onBuffer(data);
        else if (data instanceof Array) {
            data.filter(el => el instanceof Buffer)
                .forEach(this.onBuffer.bind(this));
        }
    }

    onBuffer(buf) {
        buf2strs(buf).forEach(str => {
            try {
                this.emit('message', JSON.parse(str));
            } catch (e) {
                this.emit('non-json', str);
            }
        });
    }

    // Sending
    sendStr(str, ...args) {
        this.ws.send(str2buf(str), ...args);
    }

    sendJSON(obj, ...args) {
        this.sendStr(JSON.stringify(obj), ...args);
    }
}

module.exports = JSONWebSocket;
