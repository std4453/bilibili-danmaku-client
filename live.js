const JSONWebSocket = require('./JSONWebSocket');
const { InitSector, DataSector, HeartbeatSector } = require('./sectors');

const url = 'wss://broadcastlv.chat.bilibili.com:2245/sub';
const getFirstMsg = room => ({
    uid: 0,
    roomid: room,
    protover: 1,
    platform: 'web',
    clientver: '1.4.3',
});
const heartbeatInterval = 30000; // 30s

const processors = {};
const on = (cmd, fn) => { processors[cmd] = fn; };

const connect = room => new Promise((resolve, reject) => {
    // middlewares
    const sendInitial = ws => ws.on('open', () => ws.send(new InitSector(getFirstMsg(room))));
    const invokeProcessor = ws => ws.on('sector', (sector) => {
        if (!(sector instanceof DataSector)) return;
        const msg = sector.data;
        if ('cmd' in msg && msg.cmd in processors) processors[msg.cmd](msg);
    });
    const sendHeartbeat = (ws) => {
        const handle = setInterval(() => ws.send(new HeartbeatSector()), heartbeatInterval);
        const clear = () => clearInterval(handle);
        ws.on('close', clear);
        ws.on('error', clear);
    };
    const promisify = (ws) => {
        ws.on('close', (code, reason) => resolve({ code, reason }));
        ws.on('error', reject);
    };

    new JSONWebSocket(url)
        .use(sendInitial)
        .use(invokeProcessor)
        .use(sendHeartbeat)
        .use(promisify);
});

module.exports = {
    on,
    connect,
};
