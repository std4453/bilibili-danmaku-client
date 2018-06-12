const WebSocket = require('x-platform-ws');
const EventEmitter = require('events');

const { encode, decode } = require('./encoding');

/**
 * SectorSocket is a wrapper WebSocket transfering only Sectors, by conforming to the
 * internal protocols of the Bilibili Live Websocket Interface.
 * Sectors are defined in ./sectors.js.
 *
 * EVENTS
 * 'open': When this socket is opened.
 * 'close': When this socket is closed. arg(s): code, reason
 * 'error': When the server sends an error. arg(s): error
 * 'sector': When a sector is received. arg(s): sector
 */
class SectorSocket extends EventEmitter {
    /**
     * Construct a new SectorSocket object, connecting to the given url.
     * The 'options' parameter is used to enable customization of the WebSocket connection,
     * like setting the proxy, adding headers, etc.. For more details, see documentation
     * of ws.
     * Note that the WebSocket will be opening after this constructor returns, however, due
     * to the single-thread nature of Javascript, it is still possible to add middlewares
     * with use.
     *
     * @param {string} url The url to connect to.
     * @param {*} options The options used to customize the WebSocket connection, optional.
     * @see use
     */
    constructor(url, options = {}) {
        super();

        const ws = new WebSocket(url, undefined, options);
        this.ws = ws;
        ws.on('message', this.onMessage.bind(this));
        ['open', 'close', 'error'].forEach((eventName) => {
            ws.on(eventName, (...args) => this.emit(eventName, ...args));
        });
    }

    /**
     * Use the middleware for the current SectorSocket.
     * This method should be called directly after the SectorSocket() constructor.
     * Middlewares are used to add functionality to this plain socket, while enhancing
     * modularization. The idea was taken from the Express middlewares.
     * Middlewares are functions, invoked only once, at the invocation of use(), taking
     * the current SectorSocket object as argument.
     * It is typical to add listeners in middlewares, since SectorSocket extends
     * EventEmitter.
     * It is safe to assume that the SectorSocket is not yet opened nor closed then the
     * middleware is applied.
     *
     * @param {Function} middleware The middleware to use.
     */
    use(middleware) {
        middleware(this);
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
        this.ws.send(encode(...sectors));
    }

    /**
     * Terminate the socket.
     * Note that an 'close' event will be emitted after terminate().
     * Behavior of calling other methods on the SectorSocket instance after terminate is
     * undefined and should be avoided.
     */
    terminate() {
        this.ws.terminate();
    }
}

module.exports = SectorSocket;
