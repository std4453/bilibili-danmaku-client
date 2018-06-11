// compiler
const map = (obj, fn) => {
    const mapped = {};
    Object.keys(obj).forEach((key) => { mapped[key] = fn(obj[key]); });
    return mapped;
};
const compile = (src) => {
    if (typeof src === 'function') return src;
    else if (src instanceof Array) {
        const compiled = src.map(compile);
        return input => compiled.map(transformer => transformer(input));
    } else if (typeof src === 'object') {
        const compiled = map(src, compile);
        return input => map(compiled, transformer => transformer(input));
    }
    throw new Error(`Unable to compile: ${src}.`);
};

// helper methods
const asFlag = input => !!input;
const onWhen = (mapper, predicate, src) => {
    const compiled = compile(src);
    return input => (predicate(mapper(input)) ? compiled(mapper(input)) : null);
};
const on = (mapper, src) => onWhen(mapper, () => true, src);
const exists = (input) => {
    if (typeof input === 'undefined' || input === null) return false;
    if (input instanceof Array) return input.length !== 0;
    if (typeof input === 'object') return Object.keys(input).length !== 0;
    return false;
};
const onExist = (mapper, src) => onWhen(mapper, exists, src);
const convertNames = (...names) => names
    .map((nameOrArr) => {
        if (nameOrArr instanceof Array && nameOrArr.length >= 2) {
            const [name, fn] = nameOrArr;
            if (!(typeof name === 'string') || !(fn instanceof Function)) return null;
            return { name, fn };
        } else if (typeof nameOrArr === 'string') return { name: nameOrArr, fn: n => n };
        return null;
    });
const spread = (...names) => {
    const src = {};
    convertNames(...names).forEach((converted, index) => {
        if (converted === null) return;
        const { name, fn } = converted;
        src[name] = a => fn(a[index]);
    });
    return src;
};
const spreadObj = (...names) => {
    const src = {};
    convertNames(...names)
        .filter(converted => converted !== null)
        .forEach(({ name, fn }) => { src[name] = o => fn(o[name]); });
    return src;
};

// definitions
const danmuMsg = compile(on(m => m.info, {
    timestamp: i => i[0][4],
    content: i => i[1],
    sender: on(i => i[2], spread('uid', 'name', ['isOwner', asFlag], ['isVip', asFlag], ['isSvip', asFlag])),
    badge: onExist(i => i[3], spread('level', 'name', 'owner', 'roomId')),
    ul: on(i => i[4], {
        ranking: u => u[3],
        level: u => u[0],
    }),
    medal: onExist(i => i[5], spread('first', 'second')),
    unameColor: i => i[8].uname_color,
}));
const sysMsg = compile({
    ...spreadObj('msg', 'rep', 'styleType', 'url'),
    msgText: m => m.msg_text,
    realRoomId: m => m.real_roomid,
    roomId: m => m.roomid,
});
const userSrc = {
    ...spreadObj('face', 'uid'),
    guardLevel: o => o.guard_level,
    name: o => o.uname,
};
const parseTopUser = compile({
    ...userSrc,
    ...spreadObj('rank', 'score', ['isSelf', asFlag]),
});
const sendGift = compile(on(m => m.data, {
    ...spreadObj('giftName', 'giftId', 'num', 'price', 'action', 'timestamp'),
    sender: userSrc,
    topList: on(d => d.top_list, [
        on(l => l[0], parseTopUser),
        on(l => l[1], parseTopUser),
        on(l => l[2], parseTopUser),
    ]),
    coinType: d => d.coin_type,
    totalCoin: d => d.total_coin,
}));
const roomRank = compile(on(m => m.data, {
    ...spreadObj('timestamp', 'color'),
    roomId: d => d.roomid,
    rank: d => d.rank_desc,
    h5Url: d => d.h5_url,
    webUrl: d => d.web_url,
}));
const welcome = compile(on(m => m.data, {
    uid: d => d.uid,
    name: d => d.uname,
    isAdmin: d => asFlag(d.is_admin),
    isVip: d => ('vip' in d && d.vip === 1) || ('svip' in d && d.svip === 1),
    isSvip: d => ('svip' in d && d.svip === 1),
}));
const welcomeGuard = compile(on(m => m.data, {
    uid: d => d.uid,
    name: d => d.username,
    guardLevel: d => d.guard_level,
}));

// transformer
class Transformer {
    constructor(name, fn) {
        this.name = name;
        this.fn = fn;
    }

    transform(input) {
        return this.fn(input);
    }
}

const transformers = {
    DANMU_MSG: new Transformer('danmaku', danmuMsg),
    SYS_MSG: new Transformer('sysMsg', sysMsg),
    SEND_GIFT: new Transformer('gift', sendGift),
    ROOM_RANK: new Transformer('roomRank', roomRank),
    WELCOME: new Transformer('vipEnter', welcome),
    WELCOME_GUARD: new Transformer('guardEnter', welcomeGuard),
};

module.exports = {
    _private: { // for testing
        map, compile, asFlag, onWhen, on, exists, onExist, convertNames, spread, spreadObj,
    },

    Transformer,
    ...transformers,
    events: Object.keys(transformers).map(key => transformers[key].name),
    all: transformers,
};
