require('dotenv').config();

const ProxyAgent = require('proxy-agent');
const log = require('debug')('bilibili-danmaku-client');

const DanmakuClient = require('./src/DanmakuClient');

const client = new DanmakuClient({
    room: parseInt(process.env.room, 10),
    keepAlive: { enabled: !!process.env.keepAlive },
    options: {
        agent: process.env.http_proxy ? new ProxyAgent(process.env.http_proxy) : undefined,
    },
});
client.start();

client.on('danmaku', event => log(`${event.sender.name}: ${event.content}`));
client.on('sysMsg', event => log(event.msgText));
client.on('gift', event => log(`${event.sender.name} => ${event.giftName} * ${event.num}`));
client.on('vipEnter', event => log(`welcome vip ${event.name}`));
client.on('guardEnter', event => log(`welcome guard ${event.name}`));
client.on('comboEnd', event => log(`[all] ${event.name} => ${event.giftName} * ${event.comboNum}`));
log('Client starting, press CTRL+C to terminate.');

process.on('SIGINT', () => client.terminate());
process.on('SIGTERM', () => client.terminate());
client.on('terminated', () => {
    log('Danmaku client terminated.');
    process.exit(0);
});
