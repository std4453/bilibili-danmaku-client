import debug from 'debug';
import DanmakuClient from '@std4453/bilibili-danmaku-client';

localStorage.debug = '*';
const log = debug('bilibili-danmaku-client-site');

const client = new DanmakuClient();
client.start();

client.on('danmaku', event => log(`${event.sender.name}: ${event.content}`));
client.on('sysMsg', event => log(event.msgText));
client.on('gift', event => log(`${event.sender.name} => ${event.giftName} * ${event.num}`));
client.on('vipEnter', event => log(`welcome vip ${event.name}`));
client.on('guardEnter', event => log(`welcome guard ${event.name}`));
client.on('comboEnd', event => log(`[all] ${event.name} => ${event.giftName} * ${event.comboNum}`));
