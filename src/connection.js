const EventEmitter = require('events');
const { defaults } = require('lodash');

class BaseConnection extends EventEmitter {
    constructor() {
        super();

        this.state = 'opening';
    }

    requestClose() {}
    requestSend(data) {} // eslint-disable-line no-unused-vars

    close() {
        switch (this.state) {
        case 'opening': case 'opened':
            this.state = 'closing';
            this.requestClose();
            break;
        default:
        }
    }

    send(data) {
        switch (this.state) {
        case 'opened':
            this.requestSend(data);
            break;
        default:
        }
    }

    onOpen() {
        switch (this.state) {
        case 'opening':
            this.state = 'opened';
            this.emit('open');
            break;
        default:
        }
    }

    onError(err) {
        switch (this.state) {
        case 'opening': case 'opened':
            this.state = 'closed';
            this.emit('error', err);
            this.emit('close');
            break;
        case 'closing':
            this.state = 'closed';
            this.emit('close');
            break;
        default:
        }
    }

    onClose() {
        switch (this.state) {
        case 'opening': case 'opened': case 'closing':
            this.state = 'closed';
            this.emit('close');
            break;
        default:
        }
    }

    onMessage(data) {
        switch (this.state) {
        case 'opened':
            this.emit('message', data);
            break;
        default:
        }
    }
}

class CascadeConnection extends BaseConnection {
    constructor(parent, inherits = {}) {
        super();

        this.parent = parent;

        const { error, close, open, message } =
            defaults(inherits, { error: true, close: true, open: true, message: true });
        if (error) parent.on('error', this.onError.bind(this));
        if (close) parent.on('close', this.onClose.bind(this));
        if (open) parent.on('open', this.onOpen.bind(this));
        if (message) {
            parent.on('message', (data) => {
                const detransformed = this.detransform(data);
                if (typeof detransformed === 'undefined') return;
                this.onMessage(detransformed);
            });
        }
    }

    requestSend(data) {
        this.parent.send(this.transform(data));
    }

    detransform(data) { return data; }
    transform(data) { return data; }
}

module.exports = {
    BaseConnection,
    CascadeConnection,
};
