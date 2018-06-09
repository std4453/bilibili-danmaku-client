const log = require('debug')('bili-danmaku-client:encoding');

const encoding = 'utf8';

module.exports = {
    /**
     * Encode the given string into a Buffer.
     * The returned Buffer should be passed directly to WebSocket.send().
     *
     * Note that decode(encode(str))[0] === str should always be ture.
     *
     * @param {string} str The string to encode.
     * @returns {Buffer} The encoded Buffer.
     */
    encode(str) {
        const content = Buffer.from(str, encoding);
        const header = Buffer.from([content.length + 16, 0x00100001, 2, 1]); // magic numbers
        return Buffer.concat([header, content]);
    },

    /**
     * Decode the given Buffer and return the source strings.
     * Since one frame might contain multiple messages, the input Buffer is decoded
     * into a string[] instead of a single string.
     * This method assumes that the input Buffer is valid. On invalid input, its
     * behavior is undefined.
     *
     * @param {Buffer} buf The Buffer to decode.
     * @returns {string[]} The decoded strings.
     */
    decode(buf) {
        const strs = [];

        let offset = 0;
        while (offset < buf.length) {
            const segLen = buf.readInt32BE(offset);
            strs.push(buf.toString(encoding, offset + 16, offset + segLen));
            offset += segLen;
        }

        if (offset !== buf.length) {
            log('Invalid Buffer: len=%d, off=%d, buf=%s', offset, buf.length, buf.toString('hex'));
        }

        return strs;
    },
};
