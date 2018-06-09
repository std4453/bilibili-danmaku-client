const WebSocket = require('ws');
const EventEmitter = require('events');

const { encode, decode } = require('./encoding');

/**
 * JSONWebSocket is a wrapper WebSocket transfering JSON instead of plain text.
 * However, it is only designed to conform to the internal protocols of the Bilibili Live
 * Websocket Interface, that is, it is not, and will not become, a fully-functional
 * WebSocket-like interface.
 *
 * As an overview, the JSONWebSocket only transfers certain types of sectors, as defined
 * in ./encoding.js. As a wrapper over the WebSocket, this functionality is forced by the
 * class design, and applications should not try to bypass this and access the underlying
 * WebSocket object.
 *
 * EVENTS
 * 'open': When this socket is opened.
 * 'close': When this socket is closed. arg(s): code, reason
 * 'error': When the server sends an error. arg(s): error
 * 'sector': When a sector is received. arg(s): sector
 */
class JSONWebSocket extends EventEmitter {
    /**
     * Construct a new JSONWebSocket object, connecting to the given url.
     * Note that the WebSocket will be opening after this constructor returns, however, due
     * to the single-thread nature of Javascript, it is still possible to add middlewares
     * with use.
     *
     * @param {string} url The url to connect to.
     * @see use
     */
    constructor(url) {
        super();

        const ws = new WebSocket(url);
        this.ws = ws;
        ws.on('message', this.onMessage.bind(this));
        ['open', 'close', 'error'].forEach((eventName) => {
            ws.on(eventName, (...args) => this.emit(eventName, ...args));
        });
    }

    /**
     * Use the middleware for the current JSONWebSocket.
     * This method should be called directly after the JSONWebSocket() constructor.
     * Middlewares are used to add functionality to this plain socket, while enhancing
     * modularization. The idea was taken from the Express middlewares.
     * Middlewares are functions, invoked only once, at the invocation of use(), taking
     * the current JSONWebSocket object and the underlying WebSocket object as arguments.
     * It is typical to add listeners in middlewares, since JSONWebSocket extends
     * EventEmitter, while configuring the WebSocket object might break the functionality
     * of JSONWebSocket itself, so only do so if you know what you're doing.
     * It is safe to assume that the JSONWebSocket is not yet opened nor closed then the
     * middleware is applied.
     *
     * @param {Function} middleware The middleware to use.
     */
    use(middleware) {
        middleware(this, this.ws);
    }

    /**
     * Called on the 'message' event of the underlying WebSocket, decoding Buffer or
     * Buffer[] data to sectors and emitting 'sector' events.
     * This is an internal method.
     *
     * @param {string|Buffer|Buffer[]} data The data of the message.
     */
    onMessage(data) {
        const onBuffer = buf => decode(buf).forEach(sector => this.emit('sector', sector));
        if (data instanceof Buffer) onBuffer(data);
        else if (data instanceof Array) {
            data.filter(el => el instanceof Buffer).forEach(onBuffer);
        }
    }

    /**
     * Send the given sectors, one by one.
     * The sectors are first encoded into Buffers and then send by the WebSocket.
     * For more details about the encoding process, see encoding.js
     *
     * @param {Sector[]} sectors The sectors to send.
     */
    send(...sectors) {
        this.ws.send(encode(sectors));
    }
}

module.exports = JSONWebSocket;
