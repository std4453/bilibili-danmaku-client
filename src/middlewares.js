/**
 * The middlewares module.
 * This module contain the class definition of Middleware and implementations of most
 * middlewares used by DanmakuClient. Up till now, only the middleware that manages
 * the lifecycle of DanmakuClient isn't included in middlewares.js, which has good
 * reasons to do so. For more information, see documentation of manageLifecycle in
 * DanmakuClient.js.
 *
 * When writing new Middlewares, it is recommended that implementations only take
 * advantage of the following knowledge to avoid breaking functionalities
 * accidentally:
 * 1. DanmakuClient extends EventEmitter, and 'terminating' is a reserved event name.
 * 2. config() of middleware takes a SectorSocket, a merged conf object, and a
 *    DanmakuClient instance as arguments.
 * 3. Raw conf objects are merged with the default conf object using lodash.defaultsDeep().
 *
 * @module biliDanmakuClient/middlewares
 */

const defaultsDeep = require('lodash.defaultsdeep');
const log = require('debug')('bilibili-danmaku-client/middlewares');

const { InitSector, InitAckSector, HeartbeatSector, DataSector } = require('./sectors');
const { all } = require('./transformers');

/**
 * Middleware are used to config the SectorSocket and the DanmakuClient instance.
 * Middleware instances can be reused arbitrary times, across different SectorSocket
 * and DanmakuClient instances. In fact, it can be called multiple times in an
 * keepAlive connection.
 */
class Middleware {
    /**
     * Constructs the Middleware instance.
     * Different middlewares do not create new classes. Instead, middlewares are merely
     * a config function and a default conf object, and using the constructor of
     * Middleware to create instances. The Middleware class is to enable the
     * middleware.config() pattern and add conf merging ability.
     *
     * @param {Function} config The config function.
     * @param {*} defaultConf The default conf object, optional.
     * @see #config
     */
    constructor(config, defaultConf = {}) {
        this.configFn = config;
        this.defaultConf = defaultConf;
    }

    /**
     * Config the Middleware with the given parameters.
     * The conf parameter is the raw input without default values, since config()
     * merges it with this.defaultConf and builds the actual conf object and call
     * this.configFn() to run the configuration.
     *
     * There are some attributes that are merged automatically and do not need
     * to be merged by middlewares:
     *     url: The url that the SectorSocket is connecting to.
     *     room: The room that the SectorSocket is watching.
     *     uid: The contextual user id. 0 if not specified.
     *
     * @param {SectorSocket} ws The SectorSocket instance.
     * @param {*} conf The raw config object.
     * @param {DanmakuClient} client The DanmakuClient instance.
     */
    config(ws, conf, client) {
        const merged = defaultsDeep(conf, this.defaultConf);
        this.configFn(ws, merged, client);
    }
}

const sendInitial = new Middleware(
    (ws, conf) => ws.on('open', () => {
        ws.send(new InitSector({
            ...conf.initial,
            uid: conf.uid,
            roomid: conf.room,
        }));
    }), {
        initial: {
            protover: 1,
            platform: 'web',
            clientver: '1.4.3',
        },
    },
);

const invokeTransformer = new Middleware(
    (ws, conf, client) => {
        ws.on('sector', (sector) => {
            if (!(sector instanceof DataSector)) return;
            const msg = sector.data;
            if (!('cmd' in msg)) return;
            if (msg.cmd in conf.transformers) {
                const transformer = conf.transformers[msg.cmd];
                client.emit(transformer.name, transformer.transform(msg));
            } else {
                log('Untransformed data sector:');
                log(msg);
            }
        });
    }, {
        transformers: all,
        logUntransformed: true,
    },
);

const sendHeartbeat = new Middleware(
    (ws, conf) => {
        if (!conf.heartbeat.enabled) return;
        const handle = setInterval(() => ws.send(new HeartbeatSector()), conf.heartbeat.interval);
        const clear = () => clearInterval(handle);
        ws.on('close', clear);
        ws.on('error', clear);
    }, {
        heartbeat: {
            enabled: true,
            interval: 30000, // 30s
        },
    },
);

const logLifecycle = new Middleware(
    (ws, conf) => {
        if (!conf.logging) return;
        log(`Connecting to ${conf.url}...`);
        ws.on('open', () => log('Connection opened, sending initial sector...'));
        ws.on('sector', (sector) => {
            if (sector instanceof InitAckSector) {
                log(`Init ACK Sector received: room=${conf.room}, uid=${conf.uid}.`);
            }
        });
        ws.on('close', (code, reason) => log(`Connection closed: code=${code}, reason=${reason}.`));
        ws.on('error', error => log(`Server error: ${error}`));
    }, {
        logging: true,
    },
);

const middlewares = {
    sendInitial,
    invokeTransformer,
    sendHeartbeat,
    logLifecycle,
};

module.exports = {
    Middleware,
    ...middlewares,
    all: Object.keys(middlewares).map(key => middlewares[key]),
};
