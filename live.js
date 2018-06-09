const log = require('debug')('bili-danmaku-client:live');
const JSONWebSocket = require('./JSONWebSocket');

const DEBUG = true;

const url = 'wss://broadcastlv.chat.bilibili.com:2245/sub';
const getFirstMsg = room => ({
    uid: 0,
    roomid: room,
    protover: 1,
    platform: 'web',
    clientver: '1.4.3',
});
const heartbeatMessage = '[object Object]';
const heartbeatInterval = 30000; // 30s

const processors = {};
const on = (cmd, fn) => { processors[cmd] = fn; };

const connect = room => new Promise((resolve, reject) => {
    // middlewares
    const sendInitial = ws => ws.on('open', () => ws.sendJSON(getFirstMsg(room)));
    const invokeProcessor = ws => ws.on('message', (msg) => {
        if ('cmd' in msg && msg.cmd in processors) processors[msg.cmd](msg);
    });
    const heartbeat = (ws) => {
        const handle = setInterval(() => ws.sendStr(heartbeatMessage), heartbeatInterval);
        const clear = () => clearInterval(handle);
        ws.on('close', clear);
        ws.on('error', clear);
    };
    const nonJSON = ws => ws.on('non-json', msg => log(`Non-JSON message received: ${msg}.`));
    const promisify = (ws) => {
        ws.on('close', (code, reason) => resolve({ code, reason }));
        ws.on('error', reject);
    };

    const socket = new JSONWebSocket(url)
        .use(sendInitial)
        .use(invokeProcessor)
        .use(heartbeat)
        .use(promisify);
    if (DEBUG) socket.use(nonJSON);
});

module.exports = {
    on,
    connect,
};
