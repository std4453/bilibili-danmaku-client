const { Buffer } = require('buffer');
const log = require('debug')('bilibili-danmaku-client/SectionConnection');
const { isEqual } = require('lodash');

const { CascadeConnection } = require('../connection');
const WebSocketConnection = require('./WebSocketConnection');

const protoVer = 0x10;
const encoding = 'utf8';

class Section {
    constructor(coder, data) {
        this.coder = coder;
        this.data = data;
    }
}

class SectionCoder {
    constructor(header) { this.header = header; }
    encode(data) { return data; }
    decode(buf) { return buf; }
    hasConstructed(section) { return section.coder === this; }
    construct(data) { return new Section(this, this.decode(data)); }
}

class StringCoder extends SectionCoder {
    encode(str) { return Buffer.from(str, encoding); }
    decode(buf) { return buf.toString(encoding); }
}

class JsonCoder extends StringCoder {
    encode(json) { return super.encode(JSON.stringify(json)); }
    decode(buf) { return JSON.parse(super.decode(buf)); }
}

class SectionConnection extends CascadeConnection {
    constructor(coders, url, { protocols, options } = {}) {
        super(new WebSocketConnection(url, protocols, options));
        this.coders = coders;
    }

    transform(sections) {
        return Buffer.concat(sections.map(this.encodeSection.bind(this)));
    }

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
