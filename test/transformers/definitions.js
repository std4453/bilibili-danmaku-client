const { describe, it } = require('mocha');
const assert = require('assert');
const { fromPairs, isArray, isObject, isEmpty } = require('lodash');

const compile = require('../../src/transformers/compile');
const { onExist, on, onWhen, spreadObj } = require('../../src/transformers/helpers');
const all = require('../../src/transformers/definitions');

const transformers = fromPairs(all.map(t => [t.cmd, t]));

// helpers
const iterable = Symbol('iterable');
const chooseFrom = (...values) => ({ [iterable]: values[Symbol.iterator].bind(values) });
function* map(generator, mapper) { for (const value of generator) yield mapper(value); }
function* permutate(values) {
    if (isEmpty(values)) yield [];
    else {
        for (const i of values.keys()) {
            const newValues = [...values];
            newValues.splice(i, 1);
            yield* map(permutate(newValues), arr => [values[i], ...arr]);
        }
    }
}
const permutating = (...values) => ({ [iterable]: permutate.bind(null, values) });

// iterate
function* iterate(template, _keys, offset = 0) {
    if (isObject(template) && iterable in template) yield* template[iterable]();
    else if (isArray(template)) {
        if (offset === template.length) yield [];
        else {
            for (const value of iterate(template[offset])) {
                yield* map(iterate(template, undefined, offset + 1), arr => [value, ...arr]);
            }
        }
    } else if (isObject(template)) {
        const keys = _keys || Object.keys(template);
        if (offset === keys.length) yield {};
        else {
            for (const value of iterate(template[keys[offset]])) {
                yield* map(iterate(template, keys, offset + 1),
                    obj => ({ [keys[offset]]: value, ...obj }));
            }
        }
    } else yield template;
}

// helpers
const fromFlag = bool => (bool ? 1 : 0);

// test
const test = (tInput, tOutput, tMock) => {
    const cInput = compile(tInput);
    const cOutput = compile(tOutput);

    for (const mock of iterate(tMock)) {
        assert.deepStrictEqual(transformers[tInput.cmd].transform(cInput(mock)), cOutput(mock));
    }
};

describe('transformers', () => {
    it('should transform DANMU_MSG correctly', () => {
        const inputTemplate = {
            info: [
                [
                    0,
                    1,
                    25,
                    mock => mock.timestamp,
                    1528474117,
                    -1713334982,
                    0,
                    'd5837852',
                    0,
                ],
                mock => mock.content,
                on(mock => mock.user, [
                    user => user.uid,
                    user => user.name,
                    user => fromFlag(user.isOwner),
                    user => fromFlag(user.isVip),
                    user => fromFlag(user.isSvip),
                    '10000',
                    1,
                    '',
                ]),
                onExist(mock => mock.badge, [
                    badge => badge.level,
                    badge => badge.name,
                    badge => badge.owner,
                    badge => badge.roomId,
                    16746162,
                    '',
                ]),
                [
                    mock => mock.ul.level,
                    0,
                    9868950,
                    mock => mock.ul.ranking,
                ],
                onExist(mock => mock.medal, [
                    medal => medal.first,
                    medal => medal.second,
                ], []),
                0,
                0,
                {
                    uname_color: '',
                },
            ],
            cmd: 'DANMU_MSG',
        };
        const outputTemplate = spreadObj(
            'timestamp', 'content', ['user', 0, 'sender'], 'ul', 'badge', 'medal',
        );

        const mockTemplate = {
            timestamp: 16777215,
            content: 'Hello World!',
            user: {
                uid: 1234567,
                name: 'Uncle Wang',
                isOwner: chooseFrom(true, false),
                isVip: chooseFrom(true, false),
                isSvip: chooseFrom(true, false),
            },
            badge: chooseFrom({
                level: 15,
                name: 'FOO',
                owner: 'Foobar',
                roomId: 4453,
            }, null),
            ul: {
                level: 40,
                ranking: '13352',
            },
            medal: chooseFrom({
                first: 'title-144-1',
                second: 'title-256-1',
            }, null),
        };

        test(inputTemplate, outputTemplate, mockTemplate);
    });

    it('should transform SEND_GIFT correctly', () => {
        const inputUserTemplate = spreadObj(['name', 0, 'uname'], 'uid', 'face', ['guardLevel', 0, 'guard_level']);
        const inputTemplate = {
            cmd: 'SEND_GIFT',
            data: {
                num: mock => mock.num,
                uname: mock => mock.sender.name,
                uid: mock => mock.sender.uid,
                face: mock => mock.sender.face,
                guard_level: mock => mock.sender.guardLevel,
                rcost: 434023,
                top_list: on(mock => mock.topList, [
                    on(list => list[0], {
                        ...inputUserTemplate,
                        rank: 1,
                        score: 4000,
                        isSelf: user => fromFlag(user.isSelf),
                    }), on(list => list[1], {
                        ...inputUserTemplate,
                        rank: 2,
                        score: 2400,
                        isSelf: user => fromFlag(user.isSelf),
                    }), on(list => list[2], {
                        ...inputUserTemplate,
                        rank: 3,
                        score: 2000,
                        isSelf: user => fromFlag(user.isSelf),
                    })]),
                timestamp: mock => mock.timestamp,
                giftType: mock => mock.gift.type,
                giftName: mock => mock.gift.name,
                giftId: mock => mock.gift.id,
                price: mock => mock.gift.price,
                action: mock => mock.action,
                super: 0,
                super_gift_num: mock => mock.superGiftNum,
                rnd: '1596293081',
                newMedal: 0,
                newTitle: 0,
                medal: [],
                title: '',
                beatId: '',
                biz_source: 'live',
                metadata: '',
                remain: mock => mock.remain,
                gold: onExist(mock => mock.left, left => left.gold, 0),
                silver: onExist(mock => mock.left, left => left.silver, 0),
                eventScore: 0,
                eventNum: 0,
                smalltv_msg: [],
                specialGift: null,
                notice_msg: [],
                capsule: {
                    colorful: {
                        coin: 0,
                        change: 0,
                        progress: {
                            now: 0,
                            max: 5000,
                        },
                    },
                    normal: {
                        coin: 0,
                        change: 0,
                        progress: {
                            now: 0,
                            max: 10000,
                        },
                    },
                    move: 1,
                },
                addFollow: 0,
                effect_block: mock => mock.effectBlock,
                coin_type: mock => mock.coinType,
                total_coin: mock => mock.totalCoin,
            },
        };

        const outputUserTemplate = spreadObj('name', 'uid', 'face', 'guardLevel', 'isSelf');
        const outputTemplate = {
            ...spreadObj(
                'timestamp', 'sender', 'num', 'remain', 'superGiftNum', 'left', 'effectBlock',
                'coinType', 'totalCoin', 'gift', 'action',
            ),
            sender: on(mock => mock.sender, spreadObj('name', 'uid', 'face', 'guardLevel')),
            topList: on(mock => mock.topList, [
                on(list => list[0], {
                    rank: 1,
                    spentCoins: 4000,
                    ...outputUserTemplate,
                }),
                on(list => list[1], {
                    rank: 2,
                    spentCoins: 2400,
                    ...outputUserTemplate,
                }),
                on(list => list[2], {
                    rank: 3,
                    spentCoins: 2000,
                    ...outputUserTemplate,
                }),
            ]),
        };

        const users = [
            {
                name: 'Jonason Joestar',
                face: 'http://i0.hdslb.com/bfs/face/asdasdasda.jpg',
                guardLevel: 0,
                uid: 1234567,
                isSelf: false,
            },
            {
                name: 'Hirashikata Jousuke',
                face: 'http://i0.hdslb.com/bfs/face/zxczxczxcz.jpg',
                guardLevel: 1,
                uid: 8901234,
                isSelf: true,
            },
            {
                name: 'Dio Brando',
                face: 'http://i0.hdslb.com/bfs/face/qweqweqweq.jpg',
                guardLevel: 2,
                uid: 5678901,
                isSelf: false,
            },
        ];
        const mockTemplate = {
            timestamp: 16777215,
            sender: chooseFrom(...users),
            num: 123,
            remain: 321,
            superGiftNum: 456,
            left: chooseFrom({ gold: 1234, silver: 5678 }, null),
            effectBlock: 654,
            coinType: chooseFrom('silver', 'gold'),
            totalCoin: 12321,
            gift: chooseFrom({
                name: 'Alpha',
                id: 0,
                type: 1,
                price: 100,
            }, {
                name: 'Beta',
                id: 1,
                type: 1,
                price: 200,
            }, {
                name: 'Gamma',
                id: 2,
                type: 2,
                price: 450000,
            }),
            topList: permutating(...users),
            action: chooseFrom('foo', 'bar'),
        };

        test(inputTemplate, outputTemplate, mockTemplate);
    });

    it('should transform SYS_MSG correctly', () => {
        const inputTemplate = {
            cmd: 'SYS_MSG',
            msg: 'Hello world!',
            msg_text: 'Hello my world!',
            rep: 123,
            styleType: 321,
            url: 'http://live.bilibili.com/123',
            roomid: 123,
            real_roomid: 1234567,
            rnd: 1528469326,
            tv_id: 0,
        };

        const outputTemplate = {
            msg: 'Hello world!',
            msgText: 'Hello my world!',
            rep: 123,
            styleType: 321,
            url: 'http://live.bilibili.com/123',
            realRoomId: 1234567,
            roomId: 123,
        };

        test(inputTemplate, outputTemplate, {});
    });

    it('should transform ROOM_RANK correctly', () => {
        const inputTemplate = {
            data: {
                roomid: 1234,
                rank_desc: 'Foo',
                color: '#FB7299',
                h5_url: 'https://live.bilibili.com/p/eden/rank-h5-current?anchor_uid=123321',
                web_url: 'https://live.bilibili.com/blackboard/room-current-rank.html',
                timestamp: 1528480261,
            },
            cmd: 'ROOM_RANK',
        };

        const outputTemplate = {
            roomId: 1234,
            rank: 'Foo',
            color: '#FB7299',
            h5Url: 'https://live.bilibili.com/p/eden/rank-h5-current?anchor_uid=123321',
            webUrl: 'https://live.bilibili.com/blackboard/room-current-rank.html',
            timestamp: 1528480261,
        };

        test(inputTemplate, outputTemplate, {});
    });

    it('should transform WELCOME correctly', () => {
        const inputTemplate = {
            cmd: 'WELCOME',
            data: {
                uid: 123321,
                uname: 'Uncle Wang',
                is_admin: mock => fromFlag(mock.isAdmin),
                vip: onWhen(mock => mock.vip, vip => vip > 0, 1, undefined),
                svip: onWhen(mock => mock.vip, vip => vip > 1, 1, undefined),
            },
        };

        const outputTemplate = {
            name: 'Uncle Wang',
            uid: 123321,
            isAdmin: mock => mock.isAdmin,
            isVip: mock => mock.vip > 0,
            isSvip: mock => mock.vip > 1,
        };

        const mockTemplate = {
            isAdmin: chooseFrom(true, false),
            vip: chooseFrom(0, 1, 2),
        };

        test(inputTemplate, outputTemplate, mockTemplate);
    });

    it('should transform WELCOME_GUARD correctly', () => {
        const inputTemplate = {
            cmd: 'WELCOME_GUARD',
            data: {
                uid: 123321,
                username: 'Uncle Wang',
                guard_level: mock => mock.guardLevel,
            },
        };

        const outputTemplate = {
            name: 'Uncle Wang',
            uid: 123321,
            guardLevel: mock => mock.guardLevel,
        };

        const mockTemplate = {
            guardLevel: chooseFrom(0, 1, 2, 3),
        };

        test(inputTemplate, outputTemplate, mockTemplate);
    });

    it('should transform COMBO_END correctly', () => {
        const inputTemplate = {
            cmd: 'COMBO_END',
            data: {
                uname: 'Uncle Wang',
                r_uname: 'Uncle Zhu',
                combo_num: 123,
                price: 1234,
                gift_name: 'Alpha',
                gift_id: 12345,
                start_time: 12345678,
                end_time: 23456789,
            },
        };

        const outputTemplate = {
            price: 1234,
            giftId: 12345,
            giftName: 'Alpha',
            comboNum: 123,
            startTime: 12345678,
            endTime: 23456789,
            name: 'Uncle Wang',
            owner: 'Uncle Zhu',
        };

        test(inputTemplate, outputTemplate, {});
    });
});
