process.env.DEBUG = '*';

const log = require('debug')('bilibili-danmaku-client/test');

const DanmakuClient = require('./src');

const client = new DanmakuClient(5441);
client.start();
client.on('event', ({ name, content }) => {
    switch (name) {
    case 'danmaku':
        log(`${content.sender.name}: ${content.content}`);
        break;
    case 'gift':
        log(`${content.sender.name} => ${content.gift.name} * ${content.num}`);
        break;
    default:
    }
});

process.on('SIGINT', () => client.terminate());
