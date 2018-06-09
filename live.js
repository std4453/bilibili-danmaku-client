const JSONWebSocket = require('./JSONWebSocket');

const DEBUG = true;

const url = 'wss://broadcastlv.chat.bilibili.com:2245/sub';
const getFirstMsg = room => ({
    uid: 0,
    roomid: room,
    protover: 1,
    platform: 'web',
    clientver: '1.4.3'
});
const heartbeatMessage = '[object Object]';
const heartbeatInterval = 30000;  // 30s

const processors = {};
const on = (cmd, fn) => processors[cmd] = fn;

const connect = room => {
    return new Promise((resolve, reject) => {
        var socket = new JSONWebSocket(url);
        
        socket.on('open', () => socket.sendJSON(getFirstMsg(room)));
        socket.on('message', msg => {
            if ('cmd' in msg) {
                if (msg.cmd in processors) processors[msg.cmd](msg);
            }
        });
        const heartbeat = setInterval(() => socket.sendStr(heartbeatMessage), heartbeatInterval);

        if (DEBUG) socket.on('non-json', msg => console.log(`Non-JSON message received: ${msg}.`));
        socket.on('close', (code, reason) => {
            clearInterval(heartbeat);
            resolve({ code: code, reason: reason });
        });
        socket.on('error', error => {
            clearInterval(heartbeat);
            reject(error);
        });
    });
};

const keepAlive = async room => {
    const sleep = time => new Promise(resolve => setTimeout(resolve, time));
    
    while(true) {
        const closeInfo = await connect(room);  // on Error exit keepAlive()
        console.log(`connection to room ${room} closed: ${JSON.stringify(closeInfo)}.`);
        console.log('Reconnecting after 5 seconds.');
        await sleep();
    }
};

module.exports = {
    on: on,
    connect: connect,
    keepAlive: keepAlive
};
