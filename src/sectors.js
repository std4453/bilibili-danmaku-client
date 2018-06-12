/**
 * The sectors module.
 * This module contains class definitions for all the sectors.
 *
 * There are currently 5 types of sectors:
 * 1. Heartbeat sector.
 * 2. Heartbeat ACK sector.
 * 3. JSON data sector.
 * 4. Initialization sector.
 * 5. Initialization ACK sector.
 *
 * On establishment of WebSocket connection, the client sends an initialization sector,
 * and the server responds with an initialization ACK sector. If an initialization sector
 * was not send in the first 5 seconds, the connection will be closed.
 * Then, every 30 seconds, the client sends a heartbeat sector, and the server
 * responds with a heartbeat ACK sector.
 * During the time the connection is open, the server will send JSON data sectors
 * occasionlly, containing necessary data.
 *
 * It is designed that the classes in sectors.js do not know how and when these sectors
 * are send and received, but only their logical definitions: What / what type of data they
 * contain, and how should the data be encoded into binary code, that is, only the CONTENT
 * part of the whole sector. Other work is left to encoding.js to do.
 *
 * To identify different types of sectors, only these classes should be used, and not any
 * other string-ish representation.
 *
 * @module biliDanmakuClient/sectors
 */

const { Buffer } = require('buffer');

const charset = 'utf8';

/** Base class for all sector types */
class Sector {
    /**
     * Encode this Sector into a Buffer object.
     * This is an abstract method and should be overridden by implementations
     * extending Sector.
     */
    encode() { throw new Error('Not implemented.'); } // eslint-disable-line class-methods-use-this
}
/**
 * Class method, decode the Buffer object into a Sector object of the given type.
 * Normally, this should be used like:
 *    MySector.decode(MySector, buf);
 * While the Class argument is still provided to enable overriding, as seen in JSONSector.
 * This is an abstract method and should be overridden by implementations extending Sector.
 *
 * @param {Function} Class The constructor of the target Sector class.
 * @param {Buffer} buf The buffer to decode.
 */
Sector.decode = (Class, buf) => { throw new Error('Not implemented.'); }; // eslint-disable-line no-unused-vars

/** Base class for all JSON-based sector types */
class JSONSector extends Sector {
    constructor(data) { super(); this.data = data; }
    encode() { return Buffer.from(JSON.stringify(this.data), charset); }
}
JSONSector.decode = (Class, buf) => new Class(JSON.parse(buf.toString(charset)));

/** Base class for all raw-buffer-based sector types */
class RawSector extends Sector {
    constructor(buf) { super(); this.buf = buf; }
    encode() { return this.buf; }
}
RawSector.decode = (Class, buf) => new Class(buf);

class HeartbeatSector extends RawSector {
    constructor() { super(Buffer.from('[object Object]', charset)); }
}

class HeartbeatAckSector extends RawSector {
    constructor() { super(Buffer.from([0x00, 0x00, 0x00, 0x00])); }
}

class DataSector extends JSONSector {} // inherit constructor

class InitSector extends JSONSector {} // inherit constructor

class InitAckSector extends RawSector {
    constructor() { super(Buffer.alloc(0)); } // with empty CONTENT part
}

module.exports = {
    Sector,
    RawSector,
    JSONSector,
    HeartbeatSector,
    HeartbeatAckSector,
    DataSector,
    InitSector,
    InitAckSector,
};
