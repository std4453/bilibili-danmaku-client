"use strict";

require("core-js/modules/es6.object.assign");

var Transformer = require('./Transformer');

var _require = require('./compile'),
    compile = _require.compile,
    asFlag = _require.asFlag,
    onWhen = _require.onWhen,
    on = _require.on,
    onExist = _require.onExist,
    spread = _require.spread,
    spreadObj = _require.spreadObj; // live start & end


var liveEnd = new Transformer('PREPARING', 'liveEnd', spreadObj(['roomid', parseInt, function () {
  return 'roomId';
}]));
var liveStart = new Transformer('LIVE', 'liveStart', spreadObj(['roomid', parseInt, function () {
  return 'roomId';
}])); // danmaku

var danmaku = new Transformer('DANMU_MSG', 'danmaku', on(function (m) {
  return m.info;
}, {
  timestamp: function timestamp(i) {
    return i[0][4];
  },
  content: function content(i) {
    return i[1];
  },
  sender: on(function (i) {
    return i[2];
  }, spread('uid', 'name', ['isOwner', asFlag], ['isVip', asFlag], ['isSvip', asFlag])),
  badge: onExist(function (i) {
    return i[3];
  }, spread('level', 'name', 'owner', 'roomId')),
  ul: on(function (i) {
    return i[4];
  }, {
    ranking: function ranking(u) {
      return u[3];
    },
    level: function level(u) {
      return u[0];
    }
  }),
  medal: onExist(function (i) {
    return i[5];
  }, spread('first', 'second'))
})); // gift

var userSrc = spreadObj('face', 'uid', 'guard_level', ['uname', undefined, function () {
  return 'name';
}]);
var parseTopUser = compile(Object.assign({}, userSrc, spreadObj('rank', 'score', ['isSelf', asFlag])));
var gift = new Transformer('SEND_GIFT', 'gift', on(function (m) {
  return m.data;
}, Object.assign({}, spreadObj('giftName', 'giftId', 'giftType', 'num', 'remain', 'price', 'action', 'timestamp', 'coin_type', 'total_coin', 'super_gift_num', 'effect_block'), {
  sender: userSrc,
  left: onWhen(function (m) {
    return m;
  }, function (m) {
    return m.gold > 0 && m.silver > 0;
  }, spreadObj('gold', 'silver')),
  topList: function topList(d) {
    return d.top_list.map(parseTopUser);
  }
})));
var tempoStorm = new Transformer('SPECIAL_GIFT', 'tempoStorm', on(function (m) {
  return m.data[39];
}, Object.assign({}, spreadObj('action', 'id'), {
  storm: onWhen(function (d) {
    return d;
  }, function (d) {
    return d.action === 'start';
  }, spreadObj('content', 'time', 'storm_gif', ['hadJoin', undefined, function () {
    return 'joined';
  }], 'num'))
})));
var comboEnd = new Transformer('COMBO_END', 'comboEnd', on(function (m) {
  return m.data;
}, spreadObj('price', 'gift_id', 'gift_name', 'combo_num', 'price', 'gift_id', 'start_time', 'end_time', ['uname', undefined, function () {
  return 'name';
}], // sender name
['r_uname', undefined, function () {
  return 'owner';
}] // name of room owner
))); // broadcast message

var guardMsg = new Transformer('GUARD_MSG', 'guardMsg', spreadObj('msg', ['buy_type', undefined, function () {
  return 'guardLevel';
}]));
var sysMsg = new Transformer('SYS_MSG', 'sysMsg', spreadObj('msg', 'rep', 'styleType', 'url', 'msg_text', ['real_roomid', undefined, function () {
  return 'realRoomId';
}], ['roomid', undefined, function () {
  return 'roomId';
}])); // welcome

var welcomeVip = new Transformer('WELCOME', 'welcomeVip', on(function (m) {
  return m.data;
}, Object.assign({}, spreadObj('uid', ['uname', undefined, function () {
  return 'name';
}], ['is_admin', asFlag]), {
  isVip: function isVip(d) {
    return 'vip' in d && d.vip === 1 || 'svip' in d && d.svip === 1;
  },
  isSvip: function isSvip(d) {
    return 'svip' in d && d.svip === 1;
  }
})));
var welcomeGuard = new Transformer('WELCOME_GUARD', 'welcomeGuard', on(function (m) {
  return m.data;
}, spreadObj('uid', 'guard_level', ['username', undefined, function () {
  return 'name';
}]))); // events

var wishBottle = new Transformer('WISH_BOTTLE', 'wishBottle', on(function (m) {
  return m.data;
}, Object.assign({}, spreadObj('action', 'id'), {
  wish: on(function (m) {
    return m.wish;
  }, spreadObj('content', 'status', 'type', 'type_id', 'uid', 'wish_limit', 'wish_progress', 'count_map', ['ctime', function (str) {
    return new Date(str).getTime();
  }, function () {
    return 'timestamp';
  }], ['uid', undefined, function () {
    return 'anchor';
  }]))
})));
var roomRank = new Transformer('ROOM_RANK', 'roomRank', on(function (m) {
  return m.data;
}, spreadObj('timestamp', 'color', 'h5_url', 'web_url', ['roomid', undefined, function () {
  return 'roomId';
}], ['rank_desc', undefined, function () {
  return 'rank';
}])));
var guardBuy = new Transformer('GUARD_BUY', 'guardBuy', Object.assign({}, on(function (m) {
  return m.data;
}, Object.assign({}, spreadObj('guard_level', 'num'), {
  buyer: spreadObj(['username', undefined, function () {
    return 'name';
  }], 'uid')
})), spreadObj(['roomid', parseInt, function () {
  return 'roomId';
}]))); // blocking

var blockUser = new Transformer('ROOM_BLOCK_MSG', 'blockUser', {
  roomId: function roomId(m) {
    return m.roomid;
  },
  blocked: spreadObj(['uid', parseInt], ['uname', null, function () {
    return 'name';
  }])
});
var silentOn = new Transformer('ROOM_SILENT_ON', 'silentOn', Object.assign({
  roomId: function roomId(m) {
    return m.roomid;
  }
}, on(function (m) {
  return m.data;
}, Object.assign({}, spreadObj('type', 'second'), onWhen(function (d) {
  return d;
}, function (d) {
  return d.type === 'level';
}, spreadObj('level'))))));
var silentOff = new Transformer('ROOM_SILENT_OFF', 'silentOff', spreadObj(['roomid', parseInt, function () {
  return 'roomId`';
}]));
module.exports = [liveStart, liveEnd, danmaku, gift, tempoStorm, comboEnd, guardMsg, sysMsg, welcomeVip, welcomeGuard, wishBottle, roomRank, guardBuy, blockUser, silentOn, silentOff];
//# sourceMappingURL=definitions.js.map