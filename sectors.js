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
    encode() { return Buffer.from(this.data, charset); }
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
    constructor() { super(Buffer.alloc(0)); }  // with empty CONTENT part
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
