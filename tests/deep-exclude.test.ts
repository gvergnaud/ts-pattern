import { DeepExclude } from '../src/types/DeepExclude';
import { Primitives, Equal, Expect } from '../src/types/helpers';
import { BigUnion, Option, State } from './types-catalog/utils';

type Colors = 'pink' | 'purple' | 'red' | 'yellow' | 'blue';

describe('DeepExclude', () => {
  it('Primitives', () => {
    type cases = [
      Expect<Equal<DeepExclude<string, 'hello'>, string>>,
      Expect<Equal<DeepExclude<string, string>, never>>,
      Expect<Equal<DeepExclude<string | number, string>, number>>,
      Expect<Equal<DeepExclude<string | number, boolean>, string | number>>,
      Expect<
        Equal<
          DeepExclude<Primitives, null | undefined>,
          string | number | bigint | boolean | symbol
        >
      >,
      Expect<Equal<DeepExclude<Primitives, never>, Primitives>>
    ];
  });

  it('Literals', () => {
    type cases = [
      Expect<Equal<DeepExclude<'hello' | 'bonjour', 'hello'>, 'bonjour'>>,
      Expect<
        Equal<DeepExclude<'hello' | 'bonjour', 'hola'>, 'hello' | 'bonjour'>
      >,
      Expect<Equal<DeepExclude<1 | 2 | 3, 3>, 1 | 2>>,
      Expect<Equal<DeepExclude<'hello' | 1, string>, 1>>,
      Expect<Equal<DeepExclude<'hello' | 1, number>, 'hello'>>,
      Expect<Equal<DeepExclude<200n | number, bigint>, number>>,
      Expect<Equal<DeepExclude<undefined | number, number>, undefined>>
    ];
  });

  describe('Objects', () => {
    it('should correctly exclude when it matches', () => {
      type cases = [
        Expect<Equal<DeepExclude<{ a: 'x' | 'y' }, { a: string }>, never>>,
        Expect<Equal<DeepExclude<{ a: 'x' | 'y' }, { a: 'x' }>, { a: 'y' }>>
      ];
    });

    it("if it doesn't match, it should leave the data structure untouched", () => {
      type cases = [
        Expect<
          Equal<DeepExclude<{ a: 'x' | 'y' }, { b: 'x' }>, { a: 'x' | 'y' }>
        >,
        Expect<
          Equal<DeepExclude<{ a: 'x' | 'y' }, { a: 'z' }>, { a: 'x' | 'y' }>
        >
      ];
    });

    it('should work with nested object and only distribute what is necessary', () => {
      type res1 = DeepExclude<
        { str: string | null | undefined },
        { str: string }
      >;
      type test1 = Expect<Equal<res1, { str: null | undefined }>>;

      type res2 = DeepExclude<
        { str: string | null | undefined },
        { str: null | undefined }
      >;
      type test2 = Expect<Equal<res2, { str: string }>>;

      type test3 = Expect<
        Equal<
          DeepExclude<{ a: { b: 'x' | 'y' } }, { a: { b: 'x' } }>,
          { a: { b: 'y' } }
        >
      >;

      type res4 = DeepExclude<{ a: { b: 'x' | 'y' | 'z' } }, { a: { b: 'x' } }>;
      type test4 = Expect<Equal<res4, { a: { b: 'y' | 'z' } }>>;

      type res5 = DeepExclude<
        { a: { b: 'x' | 'y' | 'z' }; c: 'u' | 'v' },
        { a: { b: 'x' } }
      >;
      type test5 = Expect<Equal<res5, { c: 'u' | 'v'; a: { b: 'y' | 'z' } }>>;

      type test6 = Expect<
        Equal<
          DeepExclude<{ a: { b: 'x' | 'y' | 'z' }; c: 'u' | 'v' }, { c: 'u' }>,
          { a: { b: 'x' | 'y' | 'z' }; c: 'v' }
        >
      >;

      type test7 = Expect<
        Equal<
          DeepExclude<{ a: { b: 'x' | 'y' | 'z' }; c: 'u' | 'v' }, { c: 'u' }>,
          { a: { b: 'x' | 'y' | 'z' }; c: 'v' }
        >
      >;
    });
  });

  describe('Tuples', () => {
    it('should correctly exclude when it matches', () => {
      type res1 = DeepExclude<['x' | 'y'], [string]>;
      type test1 = Expect<Equal<res1, never>>;
      type test2 = Expect<Equal<DeepExclude<['x' | 'y'], ['x']>, ['y']>>;
      type test3 = Expect<
        Equal<DeepExclude<[string, string], readonly [unknown, unknown]>, never>
      >;

      type res4 = DeepExclude<[number, State], [unknown, { status: 'error' }]>;
      type type4 = Expect<
        Equal<
          res4,
          [
            number,
            (
              | { status: 'idle' }
              | { status: 'loading' }
              | { status: 'success'; data: string }
            )
          ]
        >
      >;

      type res5 = DeepExclude<
        readonly [number, State],
        [unknown, { status: 'error' }]
      >;
      type test5 = Expect<
        Equal<
          res5,
          [
            number,
            (
              | { status: 'idle' }
              | { status: 'loading' }
              | { status: 'success'; data: string }
            )
          ]
        >
      >;
    });

    it("if it doesn't match, it should leave the data structure untouched", () => {
      type cases = [
        Expect<Equal<DeepExclude<['x' | 'y'], ['z']>, ['x' | 'y']>>,
        Expect<Equal<DeepExclude<['x' | 'y'], []>, ['x' | 'y']>>,
        Expect<Equal<DeepExclude<['x' | 'y'], ['a', 'b', 'c']>, ['x' | 'y']>>
      ];
    });

    it('should work with nested tuples and only distribute what is necessary', () => {
      type test1 = Expect<Equal<DeepExclude<[['x' | 'y']], [['x']]>, [['y']]>>;

      type res2 = DeepExclude<[['x' | 'y' | 'z']], [['x']]>;
      type test2 = Expect<Equal<res2, [['y' | 'z']]>>;

      type res3 = DeepExclude<[['x' | 'y' | 'z'], 'u' | 'v'], [['x'], unknown]>;
      type test3 = Expect<Equal<res3, [['y' | 'z'], 'u' | 'v']>>;

      type res4 = DeepExclude<[['x' | 'y' | 'z'], 'u' | 'v'], [unknown, 'v']>;
      type test4 = Expect<Equal<res4, [['x' | 'y' | 'z'], 'u']>>;
    });

    it('should work with nested unary tuples', () => {
      type State = {};
      type Msg = [type: 'Login'] | [type: 'UrlChange', url: string];
      type Input = [State, Msg];

      type cases = [
        Expect<Equal<DeepExclude<[[number]], [[unknown]]>, never>>,
        Expect<Equal<DeepExclude<[[[number]]], [[[unknown]]]>, never>>,
        Expect<Equal<DeepExclude<[[[[number]]]], [[[[unknown]]]]>, never>>,
        Expect<
          Equal<
            DeepExclude<[[[number]]], readonly [readonly [readonly [unknown]]]>,
            never
          >
        >,
        Expect<
          Equal<
            DeepExclude<
              readonly [[[[{ t: number }]]]],
              readonly [[[[{ t: unknown }]]]]
            >,
            never
          >
        >,
        Expect<
          Equal<
            DeepExclude<[{}, Msg], [unknown, ['UrlChange', unknown]]>,
            [{}, [type: 'Login']]
          >
        >
      ];
    });
  });

  describe('Variadic', () => {
    it('should correctly turn variadic exclude into their opposite', () => {
      type res1 = DeepExclude<number[], [number, ...number[]]>;
      type test1 = Expect<Equal<res1, []>>;

      type res2 = DeepExclude<number[], []>;
      type test2 = Expect<Equal<res2, [number, ...number[]]>>;

      type res3 = DeepExclude<number[], [...number[], number]>;
      type test3 = Expect<Equal<res3, []>>;

      type res4 = DeepExclude<[number, ...number[]], [...number[], number]>;
      // @ts-expect-error fixme! never would make more sense here.
      type test4 = Expect<Equal<res4, never>>;
    });

    it('should only exclude if the pattern really matches', () => {
      type res1 = DeepExclude<number[], [string, ...number[]]>;
      type test1 = Expect<Equal<res1, number[]>>;

      type res3 = DeepExclude<number[], [...string[], number]>;
      type test3 = Expect<Equal<res3, number[]>>;

      // matches, but some cases may not have been handled.
      type res4 = DeepExclude<[number, ...string[]], [...number[], string]>;
      type test4 = Expect<Equal<res4, [number, ...string[]]>>;
    });
  });

  describe('List', () => {
    type cases = [
      Expect<Equal<DeepExclude<(1 | 2 | 3)[], 1[]>, (1 | 2 | 3)[]>>,
      Expect<Equal<DeepExclude<(1 | 2 | 3)[], (1 | 2 | 3)[]>, never>>,
      Expect<Equal<DeepExclude<(1 | 2 | 3)[], unknown[]>, never>>,
      Expect<
        Equal<DeepExclude<(1 | 2 | 3)[] | string[], string[]>, (1 | 2 | 3)[]>
      >
    ];

    it('should work with empty list patterns', () => {
      type res1 = DeepExclude<{ values: (1 | 2 | 3)[] }, { values: [] }>;
      type test1 = Expect<
        Equal<res1, { values: [1 | 2 | 3, ...(1 | 2 | 3)[]] }>
      >;

      type res2 = DeepExclude<[] | [1, 2, 3], []>;
      type test2 = Expect<Equal<res2, [1, 2, 3]>>;

      type res3 = DeepExclude<{ values: [] | [1, 2, 3] }, { values: [] }>;
      type test3 = Expect<Equal<res3, { values: [1, 2, 3] }>>;

      type res4 = DeepExclude<{ values: [1, 2, 3] }, { values: [] }>;
      type test4 = Expect<Equal<res4, { values: [1, 2, 3] }>>;
    });
  });

  describe('Sets', () => {
    type cases = [
      Expect<Equal<DeepExclude<Set<1 | 2 | 3>, Set<1>>, Set<1 | 2 | 3>>>,
      Expect<Equal<DeepExclude<Set<1 | 2 | 3>, Set<1 | 2 | 3>>, never>>,
      Expect<Equal<DeepExclude<Set<1 | 2 | 3>, Set<unknown>>, never>>,
      Expect<
        Equal<
          DeepExclude<Set<1 | 2 | 3> | Set<string>, Set<string>>,
          Set<1 | 2 | 3>
        >
      >
    ];
  });

  describe('Maps', () => {
    type cases = [
      Expect<
        Equal<
          DeepExclude<Map<string, 1 | 2 | 3>, Map<string, 1>>,
          Map<string, 1 | 2 | 3>
        >
      >,
      Expect<
        Equal<
          DeepExclude<Map<string, 1 | 2 | 3>, Map<string, 1 | 2 | 3>>,
          never
        >
      >,
      Expect<
        Equal<DeepExclude<Map<string, 1 | 2 | 3>, Map<string, unknown>>, never>
      >,
      Expect<
        Equal<
          DeepExclude<
            Map<string, 1 | 2 | 3> | Map<string, string>,
            Map<string, string>
          >,
          Map<string, 1 | 2 | 3>
        >
      >
    ];
  });

  it('should work with big unions', () => {
    type cases = [
      Expect<
        Equal<
          DeepExclude<
            | { type: 'textWithColor'; union: BigUnion }
            | {
                type: 'textWithColorAndBackground';
                union: BigUnion;
                union2: BigUnion;
              },
            { type: 'textWithColor' }
          >,
          {
            type: 'textWithColorAndBackground';
            union: BigUnion;
            union2: BigUnion;
          }
        >
      >,
      Expect<
        Equal<
          DeepExclude<
            | { type: 'textWithColor'; union: BigUnion }
            | {
                type: 'textWithColorAndBackground';
                union: BigUnion;
                union2: BigUnion;
              },
            {
              type: 'textWithColorAndBackground';
              union: Exclude<BigUnion, 'a'>;
            }
          >,
          | { type: 'textWithColor'; union: BigUnion }
          | {
              type: 'textWithColorAndBackground';
              union: 'a';
              union2: BigUnion;
            }
        >
      >
    ];
  });

  it('should work in common cases', () => {
    type cases = [
      Expect<Equal<DeepExclude<'a' | 'b' | 'c', 'a'>, 'b' | 'c'>>,
      Expect<
        Equal<
          DeepExclude<
            | { type: 'textWithColor'; color: Colors }
            | {
                type: 'textWithColorAndBackground';
                color: Colors;
                backgroundColor: Colors;
              },
            { type: 'textWithColor' }
          >,
          {
            type: 'textWithColorAndBackground';
            color: Colors;
            backgroundColor: Colors;
          }
        >
      >,
      Expect<
        Equal<
          DeepExclude<
            | { type: 'textWithColor'; color: Colors }
            | {
                type: 'textWithColorAndBackground';
                color: Colors;
                backgroundColor: Colors;
              },
            { type: 'textWithColor'; color: 'pink' }
          >,
          | {
              type: 'textWithColorAndBackground';
              color: Colors;
              backgroundColor: Colors;
            }
          | { type: 'textWithColor'; color: 'purple' }
          | { type: 'textWithColor'; color: 'red' }
          | { type: 'textWithColor'; color: 'yellow' }
          | { type: 'textWithColor'; color: 'blue' }
        >
      >,
      Expect<
        Equal<
          DeepExclude<
            [Option<{ type: 'a' } | { type: 'b' }>, 'c' | 'd'],
            [{ kind: 'some'; value: { type: 'a' } }, any]
          >,
          | [{ kind: 'none' }, 'c' | 'd']
          | [{ kind: 'some'; value: { type: 'b' } }, 'c' | 'd']
        >
      >,
      Expect<
        Equal<
          DeepExclude<
            { x: 'a' | 'b'; y: 'c' | 'd'; z: 'e' | 'f' },
            { x: 'a'; y: 'c' }
          >,
          | { x: 'b'; y: 'c'; z: 'e' | 'f' }
          | { x: 'b'; y: 'd'; z: 'e' | 'f' }
          | { x: 'a'; y: 'd'; z: 'e' | 'f' }
        >
      >
    ];
  });

  describe('Multiple patterns', () => {
    it('should work when pattern is a union', () => {
      type cases = [
        Expect<
          Equal<
            DeepExclude<
              { x: 'a' | 'b'; y: 'c' | 'd'; z: 'e' | 'f' },
              { x: 'a'; y: 'c' } | { x: 'b'; y: 'c' }
            >,
            { x: 'b'; y: 'd'; z: 'e' | 'f' } | { x: 'a'; y: 'd'; z: 'e' | 'f' }
          >
        >,
        Expect<
          Equal<
            DeepExclude<
              { a: { b: 'x' | 'y' | 'z' }; c: 'u' | 'v' },
              { c: 'u' } | { a: { b: 'x' } }
            >,
            { a: { b: 'y' }; c: 'v' } | { a: { b: 'z' }; c: 'v' }
          >
        >
      ];
    });
  });

  describe('Excluding nested unions', () => {
    it('should correctly exclude', () => {
      type cases = [
        Expect<
          Equal<
            DeepExclude<
              ['a' | 'b' | 'c', 'a' | 'b' | 'c'],
              ['b' | 'c', 'b' | 'c']
            >,
            ['a', 'a'] | ['a', 'b'] | ['a', 'c'] | ['b', 'a'] | ['c', 'a']
          >
        >,
        Expect<
          Equal<
            DeepExclude<
              ['a' | 'b' | 'c', { type: 'a' | 'b' | 'c' }],
              ['b' | 'c', { type: 'c' }]
            >,
            | ['a', { type: 'c' }]
            | ['a', { type: 'a' }]
            | ['a', { type: 'b' }]
            | ['b', { type: 'a' }]
            | ['b', { type: 'b' }]
            | ['c', { type: 'a' }]
            | ['c', { type: 'b' }]
          >
        >,
        Expect<
          Equal<
            DeepExclude<
              ['a' | 'b' | 'c', { type: 'a' | 'b' | 'c' }],
              ['b' | 'c', { type: 'b' | 'c' }]
            >,
            | ['a', { type: 'a' }]
            | ['a', { type: 'b' }]
            | ['a', { type: 'c' }]
            | ['b', { type: 'a' }]
            | ['c', { type: 'a' }]
          >
        >,
        Expect<
          Equal<
            DeepExclude<
              ['a' | 'b' | 'c', { type: 'a' | 'b' | 'c' | 'd' }],
              ['b' | 'c', { type: 'b' | 'c' }]
            >,
            | ['a', { type: 'a' }]
            | ['a', { type: 'b' }]
            | ['a', { type: 'c' }]
            | ['a', { type: 'd' }]
            | ['b', { type: 'a' }]
            | ['b', { type: 'd' }]
            | ['c', { type: 'a' }]
            | ['c', { type: 'd' }]
          >
        >
      ];
    });
  });

  describe('readonly', () => {
    type Input = readonly ['a' | 'b', 'c' | 'd'];
    type p = ['a', 'c'] | ['a', 'd'] | ['b', 'c'] | ['b', 'd'];

    type cases = [
      Expect<
        Equal<
          DeepExclude<Input, ['a', 'c']>,
          ['a', 'd'] | ['b', 'c'] | ['b', 'd']
        >
      >,
      Expect<Equal<DeepExclude<Input, p>, never>>
    ];
  });

  it('should work with unknown', () => {
    type cases = [
      Expect<
        Equal<
          DeepExclude<
            [number, { type: 'a'; b: string }],
            [unknown, { type: 'a'; b: unknown }]
          >,
          never
        >
      >
    ];
  });

  it('should work when `b` contains a union', () => {
    type t = Expect<
      Equal<
        DeepExclude<
          {
            type: 'c';
            value:
              | { type: 'd'; value: boolean }
              | { type: 'e'; value: string[] }
              | { type: 'f'; value: number[] };
          },
          {
            type: 'c';
            value: {
              type: 'd' | 'e';
            };
          }
        >,
        { type: 'c'; value: { type: 'f'; value: number[] } }
      >
    >;
  });

  describe('should not distribute when a single union is matched', () => {
    type res1 = DeepExclude<readonly [1 | 2 | 3, 'c' | 'd'], [1, unknown]>;
    type test1 = Expect<Equal<res1, [2 | 3, 'c' | 'd']>>;

    type res2 = DeepExclude<
      readonly [1 | 2 | 3, 'c' | 'd'] | [2 | 3, 'c' | 'e'],
      [1, 'c']
    >;
    type test2 = Expect<Equal<res1, [2 | 3, 'c' | 'd']>>;
  });
});
