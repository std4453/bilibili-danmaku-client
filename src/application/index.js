/**
 * This file contains the class definition of ApplicationConnection, which implements
 * the Application Protocol.
 * For more information, see Wiki page 'Application Protocol'.
 */

const { defaultsDeep } = require('lodash');
const log = require('debug')('bilibili-danmaku-client/ApplicationConnection');

const { CascadeConnection } = require('../util/connection');
const DataConnection = require('../transport');
const { registry } = require('./definitions');

const url = 'wss://broadcastlv.chat.bilibili.com:2245/sub';
/**
 * Return the handshake JSON with the room id.
 * @param {Number} room The room number.
 */
const getHandshake = room => ({
    protoVer: 1,
    platform: 'web',
    clientVer: '1.4.3',
    uid: 0,
    roomid: room,
});
/**
 * Default options. _.defaultsDeep() is used to merge it with given options.
 * rejectUnauthorized is set to true and passed to WebSocket to avoid
 * authentication errors.
 */
const defaultOptions = { section: { options: { rejectUnauthorized: false } } };

/**
 * ApplicationConnection implements the Application Protocol.
 * However, this implementation does not 100% conform to the original defitnion.
 * The main difference is:
 * ApplicationConnection uses event 'message' instead of 'event' to notify the
 * arraival of an ApplicationEvent.
 * This is because ApplicationConnection extends BaseConnection. Meanwhile,
 * the 'event' event is defined in DanmakuClient, which is a thin wrap over
 * ApplicationConnection.
 * And since ApplicationConnection only supports the Client side, the Event-to-JSON
 * convertion is not supported.
 */
class ApplicationConnection extends CascadeConnection {
    /**
     * Construct a new ApplicationConnection with the given Room id and options.
     * Note that the Room id must be the original Room id, that is, the short Room id
     * is not accepted.
     * For example, one of the official Live Rooms, https://live.bilibili.com/1,
     * uses the original Room id 5440. In this case, trying to connect to Room 1 would
     * not work properly, the correct way is to connect to Room 5440.
     * @param {Number} room The id of the Room to connect to.
     * @param {Object} [options] The options to pass to DataConnection. Merged with defaultOptions.
     */
    constructor(room, options = {}) {
        super(new DataConnection(url, getHandshake(room), defaultsDeep(options, defaultOptions)));
        this.on('open', () => log(`Connection opened: room=${room}.`));
        this.on('close', () => log('Connection closed.'));
    }

    transform() { throw new Error('Event -> JSON not supported!'); }
    detransform(json) {
        if (!('cmd' in json)) {
            log('Event invalid without \'cmd\' property:');
            log(json);
            return undefined;
        }
        if (json.cmd in registry) {
            try {
                const event = registry[json.cmd].transform(json);
                return event;
            } catch (e) {
                log(`Unable to transform event: ${e}`);
                log(json);
                return undefined;
            }
        } else {
            log('Untransformed event:');
            log(json);
            return undefined;
        }
    }
}

module.exports = ApplicationConnection;
