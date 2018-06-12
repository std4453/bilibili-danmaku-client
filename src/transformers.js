const { map, mapValues, isEmpty, negate, isString, isFunction, isArray, fromPairs, conformsTo, defaults, camelCase } = require('lodash');

// compiler
const compile = (src) => {
    if (typeof src === 'function') return src;
    else if (src instanceof Array) {
        const compiled = map(src, compile);
        return input => map(compiled, transformer => transformer(input));
    } else if (typeof src === 'object') {
        const compiled = mapValues(src, compile);
        return input => mapValues(compiled, transformer => transformer(input));
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
const onExist = (mapper, src) => onWhen(mapper, negate(isEmpty), src);
const convertNames = (...names) => names
    .map(name => (isString(name) ? [name] : name))
    .map((arr) => {
        if (!isArray(arr)) return null;
        const [name, mapVal, mapKey] = arr;
        const obj = defaults({ name, mapVal, mapKey }, { mapVal: v => v, mapKey: camelCase });
        return conformsTo(obj, { name: isString, mapVal: isFunction, mapKey: isFunction }) ?
            obj : null;
    });
const spread = (...names) => fromPairs(convertNames(...names)
    .map((converted, index) => {
        if (isEmpty(converted)) return undefined;
        const { name, mapVal, mapKey } = converted;
        return [mapKey(name), a => mapVal(a[index])];
    }).filter(negate(isEmpty)));
const spreadObj = (...names) => fromPairs(convertNames(...names)
    .filter(negate(isEmpty))
    .map(({ name, mapVal, mapKey }) => [mapKey(name), o => mapVal(o[name])]));

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
}));
const sysMsg = compile(spreadObj(
    'msg', 'rep', 'styleType', 'url', 'msg_text',
    ['real_roomid', undefined, () => 'realRoomId'],
    ['roomid', undefined, () => 'roomId'],
));
const userSrc = spreadObj(
    'face', 'uid', 'guard_level',
    ['uname', undefined, () => 'name'],
);
const parseTopUser = compile({
    ...userSrc, ...spreadObj('rank', 'score', ['isSelf', asFlag]),
});
const sendGift = compile(on(m => m.data, {
    ...spreadObj(
        'giftName', 'giftId', 'giftType', 'num', 'remain', 'price', 'action', 'timestamp',
        'coin_type', 'total_coin', 'super_gift_num', 'effect_block',
    ),
    sender: userSrc,
    left: onWhen(m => m, m => m.gold > 0 && m.silver > 0, spreadObj('gold', 'silver')),
    topList: d => map(d.top_list, parseTopUser),
}));
const roomRank = compile(on(m => m.data, spreadObj(
    'timestamp', 'color', 'h5_url', 'web_url',
    ['roomid', undefined, () => 'roomId'],
    ['rank_desc', undefined, () => 'rank'],
)));
const welcome = compile(on(m => m.data, {
    ...spreadObj('uid', ['uname', undefined, () => 'name'], ['is_admin', asFlag, camelCase]),
    isVip: d => ('vip' in d && d.vip === 1) || ('svip' in d && d.svip === 1),
    isSvip: d => ('svip' in d && d.svip === 1),
}));
const welcomeGuard = compile(on(m => m.data, spreadObj(
    'uid', 'guard_level', ['username', undefined, () => 'name'],
)));
const comboEnd = compile(on(m => m.data, spreadObj(
    'price', 'gift_id', 'gift_name', 'combo_num', 'price', 'gift_id', 'start_time', 'end_time',
    ['uname', undefined, () => 'name'], // sender name
    ['r_uname', undefined, () => 'owner'], // name of room owner
)));

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
    COMBO_END: new Transformer('comboEnd', comboEnd),
};

module.exports = {
    _private: { // for testing
        compile, asFlag, onWhen, on, onExist, convertNames, spread, spreadObj,
    },

    Transformer,
    ...transformers,
    events: Object.keys(transformers).map(key => transformers[key].name),
    all: transformers,
};
