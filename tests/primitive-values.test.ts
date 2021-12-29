import { match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('Primitive values', () => {
  it('patterns can be any literal value', () => {
    const x = 2 as unknown;

    expect(
      match(x)
        .with(true, (x) => {
          type t = Expect<Equal<typeof x, true>>;
          return 'true';
        })
        .with(false, (x) => {
          type t = Expect<Equal<typeof x, false>>;
          return 'false';
        })
        .with(null, (x) => {
          type t = Expect<Equal<typeof x, null>>;
          return 'null';
        })
        .with(undefined, (x) => {
          type t = Expect<Equal<typeof x, undefined>>;
          return 'undefined';
        })
        .with(Symbol.for('Hello'), (x) => {
          type t = Expect<Equal<typeof x, symbol>>;
          return 'Symbol';
        })
        .with('hello', (x) => {
          type t = Expect<Equal<typeof x, 'hello'>>;
          return 'hello';
        })
        .with(1, (x) => {
          type t = Expect<Equal<typeof x, 1>>;
          return '1';
        })
        .with(2000n, (x) => {
          type t = Expect<Equal<typeof x, 2000n>>;
          return '2000n';
        })
        .with(2, (x) => {
          type t = Expect<Equal<typeof x, 2>>;
          return '2';
        })
        .otherwise(() => '?')
    ).toEqual('2');
  });

  it('primitive patterns should correctly narrow the value', () => {
    const f = (x: unknown) =>
      match(x)
        .with(P.boolean, (x) => {
          type t = Expect<Equal<typeof x, boolean>>;
          return 'boolean';
        })
        .with(P.nullish, (x) => {
          type t = Expect<Equal<typeof x, null | undefined>>;
          return 'nullish';
        })
        .with(P.symbol, (x) => {
          type t = Expect<Equal<typeof x, symbol>>;
          return 'symbol';
        })
        .with(P.string, (x) => {
          type t = Expect<Equal<typeof x, string>>;
          return 'string';
        })
        .with(P.number, (x) => {
          type t = Expect<Equal<typeof x, number>>;
          return 'number';
        })
        .with(P.bigint, (x) => {
          type t = Expect<Equal<typeof x, bigint>>;
          return 'bigint';
        })
        .otherwise(() => '?');

    expect(f(true)).toEqual('boolean');
    expect(f(null)).toEqual('nullish');
    expect(f(Symbol('hello'))).toEqual('symbol');
    expect(f('hello')).toEqual('string');
    expect(f(20)).toEqual('number');
    expect(f(100n)).toEqual('bigint');
  });
});
