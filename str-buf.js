module.exports = {
    str2buf(str) {
        const content = Buffer.from(str, this.encoding);
        const header = Buffer.from([content.length + 16, 0x00100001, 2, 1]);
        return Buffer.concat([header, content]);
    },
    buf2strs(buf) {
        const strs = [];
        var offset = 0;
        while (offset < buf.length) {
            const segLen = buf.readInt32BE(offset);
            strs.push(buf.toString(this.encoding, offset + 16, offset + segLen));
            offset += segLen;
        }
        return strs;
    }
}
