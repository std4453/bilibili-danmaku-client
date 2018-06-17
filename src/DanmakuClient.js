const EventEmitter = require('events');

const ApplicationConnection = require('./application');

class DanmakuClient extends EventEmitter {
    constructor(room, options) {
        super();

        this.room = room;
        this.options = options;
        this.state = 'idle';
    }

    start() {
        this.connection = new ApplicationConnection(this.room, this.options);
        this.state = 'opening';
        this.connection.on('open', () => {
            this.state = 'opened';
            this.emit('open');
        });
        this.connection.on('error', err => this.emit('error', err));
        this.connection.on('close', () => {
            this.state = 'closed';
            this.emit('close');
        });
        this.connection.on('message', event => this.emit('event', event));
    }

    terminate() {
        if (this.state !== 'idle') this.connection.close();
    }
}

module.exports = DanmakuClient;
