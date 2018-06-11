const EventEmitter = require('events');
const defaultsDeep = require('lodash.defaultsdeep');
const log = require('debug')('bilibili-danmaku-client/client');

const SectorSocket = require('./SectorSocket');
const { Middleware, all } = require('./middlewares');

// TODO: make this more elegant.
/**
 * The Middleware that manages the lifecycle of DanmakuClient.
 * This middleware is necessary for DanmakuClient to work correctly and is so closely
 * related to the internal mechanics of DanmakuClient so that it must be placed in
 * DanmakuClient.js.
 *
 * Lifecycle of DanmakuClient instance are described with their state attribute.
 * A list of all possible lifecycle states are:
 * 'idle': When the client is not yet started.
 * 'connecting': When the client is started and trying to connect to the remote server.
 * 'opened': When the WebSocket connection is opened and ready to send and receive data.
 * 'reconnecting': When the DanmakuClient is in keepAlive mode and waiting to reconnect.
 * 'terminating': When the termination is request and waiting for the actual termination
 *     to take place.
 * 'terminated': When the client is terminated.
 *
 * Each DanmakuClient has a mode, keepAlive or non-keepAlive, configured by setting
 * conf.keepAlive.enabled.
 * In non-keepAlive mode, the client terminates directly after the WebSocket is closed
 * or gets an error. In keepAlive mode, the client waits for some time interval and then
 * tries to reconnecto to the server again.
 *
 * State transitions are as follows:
 * Start from 'idle'.
 * 'idle' -> 'connecting' on start()
 * 'connecting' -> 'terminated' on non-keepAlive and connection error
 *              -> 'opened' on successful connection
 *              -> 'terminating' on terminate()
 * 'opened' -> 'terminated' on non-keepAlive and connection close / error
 *          -> 'reconnecting' on keepAlive and connection close / error
 *          -> 'terminating' on terminate()
 * 'reconnecting' -> 'connecting' after some time interval
 *                -> 'terminating' on terminate()
 * 'terminating' -> 'terminated' on connection close / next setState() call
 * 'terminated' is the final state.
 */
const manageLifecycle = new Middleware(
    (ws, conf, client) => {
        // If terminate is requested, switch to terminated and return false, else return true.
        const checkTerminate = () => {
            if (client.state === 'terminating') {
                client.setState('terminated');
                return false;
            }
            return true;
        };

        if (!checkTerminate()) return;
        client.setState('connecting');
        ws.on('open', () => { if (checkTerminate()) client.setState('opened'); });

        const closeAction = conf.keepAlive.enabled ? () => {
            if (!checkTerminate()) return;
            if (client.state === 'reconnecting') return;

            const reconnStr = conf.keepAlive.reconnectInterval.toFixed(0);
            log(`Connection to ${conf.url} closed / got an error while in keepAlive mode, therefore DanmakuClient will auto-reconnect after ${reconnStr} seconds.`);
            log('To terminate the client, call terminate().');
            client.setState('reconnecting');

            const reconnect = () => { if (checkTerminate()) client.connect(); };
            setTimeout(reconnect, conf.keepAlive.reconnectInterval);
        } : () => { if (checkTerminate()) client.setState('terminated'); };
        ['close', 'error'].forEach(name => ws.on(name, closeAction));

        client.once('terminate', () => ws.terminate());
    }, {
        keepAlive: {
            enabled: true,
            reconnectInterval: 5000,
        },
    },
);

const defaultConf = {
    url: 'wss://broadcastlv.chat.bilibili.com:2245/sub',
    room: 1,
    uid: 0,
    middlewares: all,
};

class DanmakuClient extends EventEmitter {
    /**
     * Constructs the DanmakuClient instance.
     * After initialization, the state of this DanmakuClient is set to 'idle',
     * applications should call start() to actually start the client.
     *
     * @param {*} conf The conf object.
     */
    constructor(conf) {
        super();
        this.conf = defaultsDeep(conf, defaultConf);
        this.state = 'idle';
    }

    /**
     * Build connection to the Danmaku server, configurating all the middlewares.
     * The socket is not saved in the DanmakuClient interface, applications should use
     * middlewares to add functionality.
     * This is an internal method.
     * For details of how this methods works, see documentation of manageLifecycle.
     */
    connect() {
        const socket = new SectorSocket(this.conf.url);
        [...this.conf.middlewares, manageLifecycle]
            .forEach(middleware => middleware.config(socket, this.conf, this));
    }

    /**
     * Start this DanmakuClient.
     * The DanmakuClient instance can be started only when its state is 'idle'.
     * For details of how this methods works, see documentation of manageLifecycle.
     */
    start() {
        if (this.state === 'idle') this.connect();
    }

    /**
     * Terminate this DanmakuClient.
     * On terminate(), the client isn't terminated immediately. In fact, it first
     * switches to 'terminating' state, and will eventually switch to 'terminated'
     * state after some time.
     * If the current state is 'terminating', 'terminated' or 'idle', nothing happens.
     * For details of how this methods works, see documentation of manageLifecycle.
     */
    terminate() {
        if (['terminating', 'terminated', 'idle'].indexOf(this.state) !== -1) return;
        this.setState('terminating');
        this.emit('terminate');
    }

    /**
     * Set the current state of this DanmakuClient.
     * States MUST be switched using this method, except in the constructor. setState()
     * sets the state and emits the 'stateChange' event so that applications can
     * listen to the lifecycle changes of the client.
     * This is an internal method.
     *
     * @param {string} state The state to switch to.
     */
    setState(state) {
        const oldState = this.state;
        this.state = state;
        if (oldState !== state) this.emit('stateChange', state, oldState);
    }
}

module.exports = DanmakuClient;
