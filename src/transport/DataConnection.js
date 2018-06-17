const log = require('debug')('bilibili-danmaku-client/DataConnection');

const { CascadeConnection } = require('../connection');
const { SectionConnection, Section, SectionCoder, StringCoder, JsonCoder } = require('./SectionConnection');

const handshakeCoder = new JsonCoder({ controlFlag: true, opCode: 7, binaryFlag: true });
const handshakeAckCoder = new SectionCoder({ controlFlag: true, opCode: 8, binaryFlag: true });
const dataCoder = new JsonCoder({ controlFlag: false, opCode: 5, binaryFlag: false });
const heartbeatCoder = new StringCoder({ controlFlag: true, opCode: 2, binaryFlag: true });
const heartbeatAckCoder = new SectionCoder({ controlFlag: true, opCode: 3, binaryFlag: true });
const coders = [handshakeCoder, handshakeAckCoder, dataCoder, heartbeatCoder, heartbeatAckCoder];

class DataConnection extends CascadeConnection {
    constructor(url, handshakeJson, options = {}) {
        const { section, timeout = 5000, heartbeat = 30000 } = options;
        super(new SectionConnection(coders, url, section), { open: false, message: false });

        this.parent.on('message', sections => sections.forEach(this.processSection.bind(this)));
        this.setupLifecycle(handshakeJson, timeout);
        this.setupHeartbeat(heartbeat);
    }

    setupLifecycle(handshakeJson, timeout) {
        this.parent.on('open', () => {
            log('Sending handshake...');
            this.parent.send([new Section(handshakeCoder, handshakeJson)]);
        });
        setTimeout(() => {
            if (this.state === 'opening') {
                log('Handshake timed out, closing connection...');
                this.onClose();
            }
        }, timeout);
    }

    setupHeartbeat(interval) {
        let heartbeat;
        const sendHeartbeat = () => {
            log('Sending heartbeat...');
            this.parent.send([new Section(heartbeatCoder, '[object Object]')]);
        };
        this.on('open', () => setTimeout(() => {
            sendHeartbeat();
            heartbeat = setInterval(sendHeartbeat, interval);
        }, 1000));
        this.on('close', () => clearInterval(heartbeat));
    }

    processSection(section) {
        switch (this.state) {
        case 'opening':
            if (handshakeAckCoder.hasConstructed(section)) {
                log('Handshake ACK received, handshake successful.');
                this.onOpen();
            }
            break; // ignore other sections
        case 'opened':
            if (dataCoder.hasConstructed(section)) this.onMessage(section.data);
            if (heartbeatAckCoder.hasConstructed(section)) log('Heartbeat ACK received.');
            break; // ignore other sections
        default:
        }
    }

    transform(json) { return [new Section(dataCoder, json)]; } // SectionConnection sends Section[]
}

module.exports = DataConnection;
