require('dotenv').config();

const DanmakuClient = require('./DanmakuClient');

const run = () => new Promise((resolve) => {
    const client = new DanmakuClient({
        room: 1,
    });
    client.start();
    client.on('stateChange', (newState) => {
        if (newState === 'terminated') resolve();
    });
});

(async () => {
    await run();
})();
