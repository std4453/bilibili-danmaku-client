/**
 * This file contains class definitino for DataConenction, the implementation of the
 * Data Layer of the Transport Protocol.
 */

const log = require('debug')('bilibili-danmaku-client/DataConnection');

const { CascadeConnection } = require('../util/connection');
const { SectionConnection, Section, SectionCoder, StringCoder, JsonCoder } = require('./SectionConnection');

// Section types are represented by SectionCoders.
// See SectionConnection.js for more information.
const handshakeCoder = new JsonCoder({ controlFlag: true, opCode: 7, binaryFlag: true });
const handshakeAckCoder = new SectionCoder({ controlFlag: true, opCode: 8, binaryFlag: true });
const dataCoder = new JsonCoder({ controlFlag: false, opCode: 5, binaryFlag: false });
const heartbeatCoder = new StringCoder({ controlFlag: true, opCode: 2, binaryFlag: true });
const heartbeatAckCoder = new SectionCoder({ controlFlag: true, opCode: 3, binaryFlag: true });
const coders = [handshakeCoder, handshakeAckCoder, dataCoder, heartbeatCoder, heartbeatAckCoder];

/**
 * DataConnection implements the Data Layer of the Transport Protocol.
 * It builds upon the Section Layer, so the Application Protocol can build upon this
 * class directly.
 * The convertion process of the Data Layer is moved to the Section Layer, see
 * SectioConnection.js for more information.
 */
class DataConnection extends CascadeConnection {
    /**
     * Constructs a new DataConnection with the given parameters.
     * options contain 3 properties:
     * - property 'section', the options passed to SectionConnection as the third parameter.
     * - property 'timeout', the time to wait before handshake fails. Defaulted to 5s.
     * - property 'heartbeat', the time interval between heartbeats. Defaulted to 30s.
     * Note that the DataConnection opens only after both:
     * - The underlyinf SecdtionConnection has successfully opened.
     * - and the handshake process has finished successfully.
     * Note that DataConnection sends and receives JSONs, so it does not transforms and
     * detransforms Section[] messages of the SectionConnection directly.
     * @param {String} url The URL to connect to.
     * @param {Object} handshakeJson The handshake JSON to use.
     * @param {Object} options The options.
     */
    constructor(url, handshakeJson, options = {}) {
        const { section, timeout = 5000, heartbeat = 30000 } = options;
        super(new SectionConnection(coders, url, section), { open: false, message: false });

        this.parent.on('message', sections => sections.forEach(s => this.emit('section', s)));
        this.on('section', (s) => {
            if (this.state === 'opened' && dataCoder.hasConstructed(s)) this.onMessage(s.data);
        });

        this.setupHandshake(handshakeJson, timeout);
        this.setupHeartbeat(heartbeat);
    }

    /**
     * Setup the handshake process. For more information about the handshake process,
     * see Wiki page 'Application Protocol'.
     * The connection will be closed after the given timeout if no Handshake ACK Section has
     * been received. In this case, a 'close' event will be emitted but no 'error' event.
     * @param {Object} handshakeJson The JSON to send as handshake.
     * @param {Number} timeout Time to wait before closing.
     */
    setupHandshake(handshakeJson, timeout) {
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
        this.on('section', (section) => {
            if (this.state === 'opening' && handshakeAckCoder.hasConstructed(section)) {
                log('Handshake ACK received, handshake successful.');
                this.onOpen();
            }
        });
    }

    /**
     * Setup the heartbeat process. For more information about the heartbeat process,
     * see Wiki page 'Application Protocol'.
     * The hearbeat will start immediately after the opening of the connection, and will
     * stop at closing.
     * @param {Number} interval Time bewteen heartbeats.
     */
    setupHeartbeat(interval) {
        let heartbeat;
        const sendHeartbeat = () => {
            log('Sending heartbeat...');
            this.parent.send([new Section(heartbeatCoder, '[object Object]')]);
        };
        this.on('open', () => {
            sendHeartbeat();
            heartbeat = setInterval(sendHeartbeat, interval);
        });
        this.on('close', () => clearInterval(heartbeat));
        this.on('section', (section) => {
            if (this.state === 'opened' && heartbeatAckCoder.hasConstructed(section)) {
                log('Heartbeat ACK received.');
            }
        });
    }

    transform(json) { return [new Section(dataCoder, json)]; } // SectionConnection sends Section[]
}

module.exports = DataConnection;
