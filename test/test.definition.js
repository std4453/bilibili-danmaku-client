/* global describe it */
const { toString, negate, isEmpty } = require('lodash');
const assert = require('assert');

const {
    compile,
    asFlag,
    on,
    onExist,
    convertNames,
    spread,
    spreadObj,
} = require('../src/definition')._private; // eslint-disable-line no-underscore-dangle

describe('transformers', () => {
    describe('compile', () => {
        it('should return directly when compiling a function', () => {
            assert.equal(compile(m => 1)({}), 1); // eslint-disable-line no-unused-vars
        });
        it('should compile every key when compiling an object', () => {
            const fn = compile({
                foo: o => o.baz,
                bar: o => o.qux,
            });
            const obj = {
                baz: 1,
                qux: 2,
            };
            const result = {
                foo: 1,
                bar: 2,
            };
            assert.deepStrictEqual(fn(obj), result);
        });
        it('should compile objects deeply', () => {
            const arr = [1, 2, 3, 4];
            const fn = compile({
                foo: a => a[0],
                bar: {
                    baz: a => a[1],
                    qux: a => a[2],
                    quux: {
                        quuz: a => a[3],
                    },
                },
            });
            const result = {
                foo: 1,
                bar: {
                    baz: 2,
                    qux: 3,
                    quux: {
                        quuz: 4,
                    },
                },
            };
            assert.deepStrictEqual(fn(arr), result);
        });
        it('should compile arrays', () => {
            const fn = compile([
                a => a[3],
                a => a[2],
                a => a[1],
                a => a[0],
            ]);
            const arr = [12, 34, 56, 78];
            const result = [78, 56, 34, 12];
            assert.deepStrictEqual(fn(arr), result);
        });
        it('should compile arrays deeply', () => {
            const fn = compile([
                a => a[3],
                a => a[2],
                [a => a[1], [a => a[0]]],
            ]);
            const arr = [12, 34, 56, 78];
            const result = [78, 56, [34, [12]]];
            assert.deepStrictEqual(fn(arr), result);
        });
        it('should compile arrays and objects together', () => {
            const fn = compile({
                first: o => o[0],
                second: o => o[1],
                third: o => o[2],
                fourth: [o => o[3].foo, {
                    fifth: {
                        sixth: o => o[3].bar[0],
                        seventh: [o => o[3].bar[1].baz],
                    },
                }],
            });
            const obj = [12, 34, 56, {
                foo: 78,
                bar: [910, {
                    baz: 1112,
                }],
            }];
            const result = {
                first: 12,
                second: 34,
                third: 56,
                fourth: [78, {
                    fifth: {
                        sixth: 910,
                        seventh: [1112],
                    },
                }],
            };
            assert.deepStrictEqual(fn(obj), result);
        });
        it('should throw an error when compiling a primitive', () => {
            assert.throws(() => {
                compile(1);
            });
        });
        it('should throw an error when compiling a string', () => {
            assert.throws(() => {
                compile('');
            });
        });
        it('should not compile the same source again', () => {
            const source = {
                foo: o => o.foo,
            };
            const compiled = compile(source);
            const compiledAgain = compile(compiled);
            assert.strictEqual(compiled, compiledAgain);
            assert.deepStrictEqual(compiledAgain({ foo: 1 }), { foo: 1 });
        });
    });

    describe('asFlag', () => {
        it('should return true on true', () => {
            assert.equal(asFlag(true), true);
        });
        it('should return false on false', () => {
            assert.equal(asFlag(false), false);
        });
        it('should return true on 1', () => {
            assert.equal(asFlag(1), true);
        });
        it('should return false on 0', () => {
            assert.equal(asFlag(0), false);
        });
    });

    describe('on', () => {
        it('should compile source on element of object', () => {
            const fn = compile(on(o => o.foo, {
                bar: f => f.bar,
                baz: f => f.baz,
            }));
            const obj = {
                foo: {
                    bar: 1,
                    baz: 2,
                },
            };
            const result = {
                bar: 1,
                baz: 2,
            };
            assert.deepStrictEqual(fn(obj), result);
        });
        it('should compile source on element of array', () => {
            const fn = compile(on(a => a[0], [a => a[1], a => a[0]]));
            const arr = [[1, 2], 3];
            const result = [2, 1];
            assert.deepStrictEqual(fn(arr), result);
        });
    });

    describe('onExist', () => {
        const fn = compile({
            data: onExist(o => o.arr, {
                first: arr => arr[0],
                second: arr => arr[1],
            }),
        });
        it('should return null when not exist', () => {
            const obj = {
                data: 1,
            };
            const result = {
                data: null,
            };
            assert.deepStrictEqual(fn(obj), result);
        });
        it('should run compiled when exist', () => {
            const obj = {
                arr: [1, 2],
            };
            const result = {
                data: {
                    first: 1,
                    second: 2,
                },
            };
            assert.deepStrictEqual(fn(obj), result);
        });
    });

    describe('convertNames', () => {
        it('should accept strings', () => {
            const source = ['foo', 'bar'];
            const converted = convertNames(...source);
            const obj = { qux: 123 };
            converted.forEach(({ name, mapVal }, index) => {
                assert.equal(name, source[index]);
                assert.equal(mapVal(obj), obj);
            });
        });
        it('should accept functions', () => {
            const source = [['foo', parseInt, '123', 123], ['bar', toString, 456, '456']];
            const converted = convertNames(...source);
            converted
                .filter(negate(isEmpty))
                .forEach(({ name, mapVal } = {}, index) => {
                    const [sName,, sTest, sResult] = source[index];
                    assert.equal(name, sName);
                    assert.equal(mapVal(sTest), sResult);
                });
        });
        it('should ignore non-string primitives', () => {
            assert.deepStrictEqual(
                convertNames(1, 0.1, true, undefined, null),
                [null, null, null, null, null],
            );
        });
        it('should ignore invalid arrays', () => {
            assert.deepStrictEqual(
                convertNames([], ['foo', 'bar'], ['foo', {}], ['foo', 1]),
                [null, null, null, null],
            );
        });
    });

    describe('spread', () => {
        it('should accept strings', () => {
            const fn = compile(spread('foo', 'bar'));
            const arr = [1, 2];
            const result = { foo: 1, bar: 2 };
            assert.deepStrictEqual(fn(arr), result);
        });
        it('should accept functions', () => {
            const fn = compile(spread(['foo', parseInt], ['bar', parseInt]));
            const arr = ['1', '2'];
            const result = { foo: 1, bar: 2 };
            assert.deepStrictEqual(fn(arr), result);
        });
        it('should skip other things', () => {
            const fn = compile(spread(
                'foo', // okay
                1, // skipped
                undefined, // skipped
                parseInt, // skipped
                ['bar'], // invalid array, skipped
                ['bar', parseInt], // okay
            ));
            const arr = ['1', '2', '3', '4', '5', '6'];
            const result = { foo: '1', bar: 6 };
            assert.deepStrictEqual(fn(arr), result);
        });
    });

    describe('spreadObj', () => {
        it('should accept strings', () => {
            const fn = compile(spreadObj('foo', 'bar'));
            const obj = { foo: 1, bar: 2 };
            const result = { foo: 1, bar: 2 };
            assert.deepStrictEqual(fn(obj), result);
        });
        it('should accept functions', () => {
            const fn = compile(spreadObj(['foo', parseInt], ['bar', parseInt]));
            const obj = { foo: '1', bar: '2' };
            const result = { foo: 1, bar: 2 };
            assert.deepStrictEqual(fn(obj), result);
        });
    });
});
