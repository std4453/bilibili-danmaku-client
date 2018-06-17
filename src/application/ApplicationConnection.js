const { defaultsDeep } = require('lodash');
const log = require('debug')('bilibili-danmaku-client/ApplicationConnection');

const { CascadeConnection } = require('../connection');
const DataConnection = require('../transport');
const { registry } = require('./index');

const url = 'wss://broadcastlv.chat.bilibili.com:2245/sub';
const getHandshake = room => ({
    protoVer: 1,
    platform: 'web',
    clientVer: '1.4.3',
    uid: 0,
    roomid: room,
});
const defaultOptions = { section: { rejectUnauthorized: false } };

class ApplicationConnection extends CascadeConnection {
    constructor(room, options = {}) {
        super(new DataConnection(url, getHandshake(room), defaultsDeep(options, defaultOptions)));
        this.on('open', () => log(`Connection opened: room=${room}.`));
    }

    // eslint-disable-next-line no-unused-vars
    transform(event) { throw new Error('Event -> JSON not supported!'); }
    detransform(json) {
        if (!('cmd' in json)) {
            log('Event invalid without \'cmd\' property:');
            log(json);
            return undefined;
        }
        if (json.cmd in registry) {
            try {
                const event = registry[json.cmd](json);
                return event;
            } catch (e) {
                log('Unable to transform event:');
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
