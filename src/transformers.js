const { compile, asFlag, onWhen, on, onExist, spread, spreadObj } = require('./definition');

// danmaku
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

// welcome
const welcome = compile(on(m => m.data, {
    ...spreadObj('uid', ['uname', undefined, () => 'name'], ['is_admin', asFlag]),
    isVip: d => ('vip' in d && d.vip === 1) || ('svip' in d && d.svip === 1),
    isSvip: d => ('svip' in d && d.svip === 1),
}));
const welcomeGuard = compile(on(m => m.data, spreadObj(
    'uid', 'guard_level', ['username', undefined, () => 'name'],
)));

// guard
const guardBuy = compile({
    ...on(m => m.data, {
        ...spreadObj('guard_level', 'num'),
        buyer: spreadObj(['username', undefined, () => 'name'], 'uid'),
    }),
    ...spreadObj(['roomid', parseInt, () => 'roomId']),
});

// broadcast message
const guardMsg = compile(spreadObj('msg', ['buy_type', undefined, () => 'guardLevel']));
const sysMsg = compile(spreadObj(
    'msg', 'rep', 'styleType', 'url', 'msg_text',
    ['real_roomid', undefined, () => 'realRoomId'],
    ['roomid', undefined, () => 'roomId'],
));

// live start & end
const preparing = compile(spreadObj(['roomid', parseInt, () => 'roomId']));
const live = compile(spreadObj(['roomid', parseInt, () => 'roomId']));

// gift
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
    topList: d => d.top_list.map(parseTopUser),
}));
const specialGift = compile(on(m => m.data[39], {
    ...spreadObj('action', 'id'),
    storm: onWhen(d => d, d => d.action === 'start', spreadObj(
        'content', 'time', 'storm_gif', ['hadJoin', undefined, () => 'joined'], 'num',
    )),
}));
const comboEnd = compile(on(m => m.data, spreadObj(
    'price', 'gift_id', 'gift_name', 'combo_num', 'price', 'gift_id', 'start_time', 'end_time',
    ['uname', undefined, () => 'name'], // sender name
    ['r_uname', undefined, () => 'owner'], // name of room owner
)));

// events
const wishBottle = compile(on(m => m.data, {
    ...spreadObj('action', 'id'),
    wish: on(m => m.wish, spreadObj(
        'content', 'status', 'type', 'type_id', 'uid', 'wish_limit', 'wish_progress', 'count_map',
        ['ctime', str => new Date(str).getTime(), () => 'timestamp'],
        ['uid', undefined, () => 'anchor'],
    )),
}));
const roomRank = compile(on(m => m.data, spreadObj(
    'timestamp', 'color', 'h5_url', 'web_url',
    ['roomid', undefined, () => 'roomId'],
    ['rank_desc', undefined, () => 'rank'],
)));

// blocking
const roomBlockMsg = compile({
    roomId: m => m.roomid,
    blockedUser: spreadObj(['uid', parseInt], ['uname', null, () => 'name']),
});
const roomSilentOn = compile({
    roomId: m => m.roomid,
    ...on(m => m.data, {
        ...spreadObj('type', 'second'),
        ...onWhen(d => d, d => d.type === 'level', spreadObj('level')),
    }),
});
const roomSilentOff = compile(spreadObj(['roomid', parseInt, () => 'roomId`']));

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
    GUARD_MSG: new Transformer('guardMsg', guardMsg),
    GUARD_BUY: new Transformer('guardBuy', guardBuy),
    LIVE: new Transformer('liveStart', live),
    PREPARING: new Transformer('liveEnd', preparing),
    SPECIAL_GIFT: new Transformer('tempoStorm', specialGift),
    WISH_BOTTLE: new Transformer('wish', wishBottle),
    ROOM_BLOCK_MSG: new Transformer('blockUser', roomBlockMsg),
    ROOM_SILENT_ON: new Transformer('silentOn', roomSilentOn),
    ROOM_SILENT_OFF: new Transformer('silentOff', roomSilentOff),
};

module.exports = {
    Transformer,
    ...transformers,
    events: Object.keys(transformers).map(key => transformers[key].name),
    all: transformers,
};
