require('dotenv').config();

const log = require('debug')('bili-danmaku-client');

const DanmakuClient = require('./src/DanmakuClient');
const { events } = require('./src/transformers');

const run = () => new Promise((resolve) => {
    const client = new DanmakuClient({
        room: 5440,
        keepAlive: { enabled: false },
    });
    client.start();
    client.on('stateChange', (newState) => {
        if (newState === 'terminated') resolve();
    });

    events.forEach(event => client.on(event, data => log(data)));
});

(async () => {
    await run();
})();
