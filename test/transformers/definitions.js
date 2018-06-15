const { describe, it } = require('mocha');
const assert = require('assert');
const { fromPairs, isArray, isObject } = require('lodash');

const compile = require('../../src/transformers/compile');
const { onExist } = require('../../src/transformers/helpers');
const all = require('../../src/transformers/definitions');

const transformers = fromPairs(all.map(t => [t.cmd, t]));

class Possibilities { constructor(values) { this.values = values; } }
const chooseFrom = (...values) => new Possibilities(values);
function* map(generator, mapper) { for (const value of generator) yield mapper(value); }

function* iterate(template, _keys, offset = 0) { // eslint-disable-line consistent-return
    if (template instanceof Possibilities) yield* template.values[Symbol.iterator]();
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
                [
                    mock => mock.user.uid,
                    mock => mock.user.name,
                    mock => (mock.user.isOwner ? 1 : 0),
                    mock => (mock.user.isVip ? 1 : 0),
                    mock => (mock.user.isSvip ? 1 : 0),
                    '10000',
                    1,
                    '',
                ],
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
        const outputTemplate = {
            timestamp: mock => mock.timestamp,
            content: mock => mock.content,
            sender: mock => mock.user,
            ul: mock => mock.ul,
            badge: mock => mock.badge,
            medal: mock => mock.medal,
        };

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
});
