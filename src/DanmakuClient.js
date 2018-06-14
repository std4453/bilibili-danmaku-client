const EventEmitter = require('events');
const { defaultsDeep } = require('lodash');

const SectorSocket = require('./SectorSocket');
const { Middleware, all } = require('./middlewares');

// TODO: Add documentation
const manageLifecycle = new Middleware((ws, _, client) => {
    client.setState('connecting');
    ws.on('open', () => client.setState('opened'));
    ['close', 'error'].forEach(name => ws.on(name, () => client.setState('terminated')));
    client.once('terminate', () => ws.terminate());
});

const defaultConf = {
    url: 'wss://broadcastlv.chat.bilibili.com:2245/sub',
    room: 1,
    uid: 0, // without a user
    middlewares: all, // use all middlwares
    options: { rejectUnauthorized: false }, // avoid unauthorized error
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
        const socket = new SectorSocket(this.conf.url, this.conf.options);
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
     * sets the state and emits an event with the name being the new state so that
     * applications can listen to the lifecycle changes of the client.
     * This is an internal method.
     *
     * @param {string} state The state to switch to.
     */
    setState(state) {
        if (this.state !== state) {
            this.state = state;
            this.emit(state);
        }
    }
}

module.exports = DanmakuClient;
