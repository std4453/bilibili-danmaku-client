const { describe, it } = require('mocha');
const assert = require('assert');

const compile = require('../../src/util/compile');

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
    it('should return it when compiling a primitive', () => {
        assert.deepStrictEqual(compile({ foo: 1 })({}), { foo: 1 });
        assert.deepStrictEqual(compile({ foo: 1 })({ foo: 'bar' }), { foo: 1 });
        assert.deepStrictEqual(compile({ foo: true })({}), { foo: true });
        assert.deepStrictEqual(compile({ foo: true })({ foo: 'bar' }), { foo: true });
    });
    it('should return it error when compiling a string', () => {
        assert.deepStrictEqual(compile({ foo: '' })({}), { foo: '' });
        assert.deepStrictEqual(compile({ foo: '' })({ foo: 'bar' }), { foo: '' });
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
