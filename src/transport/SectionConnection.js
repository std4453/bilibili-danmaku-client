/**
 * This file implements the Section Layer of the Transport Protocol.
 * See Wiki for Protocol definition. Please note that this implementation
 * does not 100% conform to the defition in the Wiki page.
 * Here, SectionConnection implements the actual Section Layer, which
 * transports instances of Section. Different kinds of Section are not
 * implemented by inheriting Section, instead, applications should use or
 * inherit SectionCoder and its subclasses.
 * See index.js for examples.
 */

const { Buffer } = require('buffer');
const log = require('debug')('bilibili-danmaku-client/SectionConnection');
const { isEqual } = require('lodash');

const { CascadeConnection } = require('../util/connection');
const WebSocketConnection = require('./WebSocketConnection');

const protoVer = 0x10;
const encoding = 'utf8';

/**
 * Section is sent through the Section Layer.
 * Section is a simple object. Its 'coder' property specifies the type of
 * this Section, while its 'data' property is the data is contains.
 * Sections can contain any kind of data, however data that cannot be
 * transformed by its coder will be useless and problematic. Therefore,
 * whoever specifies the coder should be responsible specifying the data.
 * Section should not be subclassed. A typical usage is:
 * const coder = new JsonCoder({ controlFlag: true, opCode: 10, binaryFlag: false });
 * const section = new Section(coder, { foo: 1 });
 */
class Section {
    /**
     * Constructs a new Section.
     * @param {SectionCoder} coder The coder of this Section.
     * @param {any} data The data of this Section.
     */
    constructor(coder, data) {
        this.coder = coder;
        this.data = data;
    }
}

/**
 * SectionCoder is used to encode and decode Sections to and from Buffers.
 * Meanwhile, SectionCoder also contains a 'header' property which specifies
 * the header that should be used for all Sections with this coder.
 * SectionCoder should be subclassed to support encoding and decoding of
 * different types of data, however only new instances should be used to support
 * different headers.
 * Meanwhile, SectionCoder instances should be reused across Sections. Since
 * section.coder === this is used in hasConstructed(), only one SectionCoder with
 * the same header should be used in the same application.
 */
class SectionCoder {
    /**
     * Constructs a new SectionCoder with the given header.
     * Header MUST contain the following properties:
     * controlFlag: boolean,
     * opCode: Number,
     * binaryFlag: boolean.
     * Detailed definitions can be found in Wiki page 'Transport Protocol'.
     * @param {Object} header The header object of this SectionCoder.
     */
    constructor(header) { this.header = header; }
    /**
     * Encode the data of the Section into Buffer.
     * By default, the data is kept as-is. Therefore non-Buffer data might lead to
     * an error.
     * @param {any} data The data to encode.
     * @returns {Buffer} The encoded buffer.
     */
    encode(data) { return data; }
    /**
     * Decode the Buffer back to the Section data.
     * By default, the Buffer is kept as-is.
     * Typically construct() is used to construct a new Section with decoded data
     * and this coder.
     * @param {Buffer} buf The buffer to decode.
     * @returns {any} The decoded data.
     */
    decode(buf) { return buf; }
    /**
     * Return whether the Section is constructed by this SectionCoder.
     * section is constructed by an coder by section = coder.construct() or
     * by section = new Section(coder, data).
     * @param {Section} section The section to check.
     * @return {boolean} Whether the Section is constructed by this SectionCoder.
     */
    hasConstructed(section) { return section.coder === this; }
    /**
     * Construct a Section with this SectionCoder and decoded data.
     * @param {Buffer} data The data to decode.
     * @returns {Section} The constructed Section.
     */
    construct(data) { return new Section(this, this.decode(data)); }
}

/**
 * Implementation of SectionCoder that encodes and decodes strings.
 */
class StringCoder extends SectionCoder {
    encode(str) { return Buffer.from(str, encoding); }
    decode(buf) { return buf.toString(encoding); }
}

/**
 * Implementation of SectionCoder that encodes and decodes JSONs.
 */
class JsonCoder extends StringCoder {
    encode(json) { return super.encode(JSON.stringify(json)); }
    decode(buf) { return JSON.parse(super.decode(buf)); }
}

/**
 * SectionConnection implements the Section Layer of the Transport Protocol.
 * It uses WebSocketConnection as implementation of the Connection Layer and uses
 * CascadeConnection to wrap over it.
 * As specified in the Transport Protocol, SectionConnection is stateless, and
 * inherits events from and delegates method to the Connection Layer.
 * As a flaw in the Transport Protocol, Sections can contain arbitrary types
 * of data, while the convertion from Buffer to the data is done in the Data Layer.
 * However, Sections have to be constructed in the Section layer, so in the
 * implementation, the debundling process of Section Layer and the convertion
 * process of the Data Layer are combinded together to form the transform() and
 * detransform() methods of CascadeConnection.
 */
class SectionConnection extends CascadeConnection {
    /**
     * Construct a new SectionConnection.
     * @param {SectionCoder[]} coders The list of coders to use.
     * @param {String} url The url to connect to.
     * @param {String | String[] | undefined} protocols The WebSocket protocols to use.
     * @param {Object | undefined} options The options used to configure WebSocketConnection.
     */
    constructor(coders, url, { protocols, options } = {}) {
        super(new WebSocketConnection(url, protocols, options));
        this.coders = coders;
    }

    /**
     * Transform given sections to Buffer. See super method documentation.
     * This method implements the bundling process.
     * Note that the SectionConnection actually transports arrays of Section, so
     * connection.send(new Section(...)) will result in an error.
     * @param {Section[]} sections The sections to transform to Buffer.
     * @returns {Buffer} The transformed Buffer.
     */
    transform(sections) {
        return Buffer.concat(sections.map(this.encodeSection.bind(this)));
    }

    /**
     * Detransform given Buffer back to a list of Sections. See super method documentation.
     * This method implements the debundling process.
     * Note that the SectionConnection actuallt transports arrays of Section so
     * the 'message' event will be emitted with a Section[] as argument.
     * @param {BufferEncoding} buf The Buffer to detransform.
     * @returns {Section[]} The detransformed Sections.
     */
    detransform(buf) {
        const sections = [];
        for (let off = 0; off < buf.length; off = this.decodeSection(sections, buf, off));
        return sections;
    }

    encodeSection(section) {
        try {
            const { coder, data } = section;
            const content = coder.encode(data);
            const header = Buffer.alloc(16);
            header.writeInt32BE(content.length + 16, 0);
            header.writeInt16BE(protoVer, 4);
            header[7] = coder.header.controlFlag ? 0x01 : 0x00;
            header.writeInt32BE(coder.header.opCode, 8);
            header[15] = coder.header.binaryFlag ? 0x01 : 0x00;
            return Buffer.concat([header, content]);
        } catch (e) {
            log(`Unable to encode section: section=${section}, error=${e}.`);
            return Buffer.alloc(0);
        }
    }

    decodeSection(sections, buf, offset) {
        if (buf.length < offset + 16) {
            log(`Unable to read section header: offset=${offset}, length=${buf.length}.`);
            return buf.length; // finish detransformation
        }
        const sectionLen = buf.readInt32BE(offset); // sectionLen = CONTENT length + 16
        if (sectionLen < 16) {
            log(`Invalid section length: ${sectionLen}.`);
            return buf.length; // critical error, stop detransformation
        }
        if (sectionLen + offset > buf.length) {
            log(`Section too long: end=${sectionLen + offset}, length=${buf.length}.`);
            return buf.length; // critical error, stop detransformation
        }
        const sectionProtoVer = buf.readInt16BE(offset + 4);
        if (sectionProtoVer !== protoVer) {
            log(`Invalid section header: protoVer=${sectionProtoVer}, expected=${protoVer}.`);
            return offset + sectionLen; // skip this section
        }
        const sectionHeader = {
            controlFlag: buf[offset + 7] === 0x01,
            opCode: buf.readInt32BE(offset + 8),
            binaryFlag: buf[offset + 15] === 0x01,
        };
        for (const coder of this.coders) {
            if (isEqual(coder.header, sectionHeader)) {
                const contentBuf = buf.slice(offset + 16, offset + sectionLen);
                try {
                    sections.push(coder.construct(contentBuf));
                } catch (e) {
                    log(`Unable to decode section: content=${contentBuf}, coder=${coder}.`);
                }
                return offset + sectionLen; // proceed to next section & break loop
            }
        }
        log(`No matching section found: header=${sectionHeader}.`);
        return offset + sectionLen; // skip this section
    }
}

module.exports = {
    Section,
    SectionCoder,
    StringCoder,
    JsonCoder,
    SectionConnection,
};
