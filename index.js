require('dotenv').config();

const log = require('debug')('bilibili-danmaku-client');

const DanmakuClient = require('./src/DanmakuClient');
const { events } = require('./src/transformers');

const client = new DanmakuClient({
    room: parseInt(process.env.room, 10),
    keepAlive: { enabled: !!process.env.keepAlive },
});
client.start();
events.forEach(event => client.on(event, data => log(data)));
log('Client starting, press CTRL+C to terminate.');

process.on('SIGINT', () => client.terminate());
process.on('SIGTERM', () => client.terminate());
client.on('stateChange', (newState) => {
    if (newState === 'terminated') {
        log('Danmaku client terminated.');
        process.exit(0);
    }
});
