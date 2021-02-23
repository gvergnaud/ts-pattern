import { DeepExclude } from '../src/types/DeepExclude';
import { Equal, Expect } from '../src/types/helpers';
import { Primitives } from '../src/types/Pattern';
import { BigUnion, Option } from './utils';

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
      type cases = [
        Expect<
          Equal<
            DeepExclude<{ a: { b: 'x' | 'y' } }, { a: { b: 'x' } }>,
            { a: { b: 'y' } }
          >
        >,
        Expect<
          Equal<
            DeepExclude<{ a: { b: 'x' | 'y' | 'z' } }, { a: { b: 'x' } }>,
            { a: { b: 'y' } } | { a: { b: 'z' } }
          >
        >,
        Expect<
          Equal<
            DeepExclude<
              { a: { b: 'x' | 'y' | 'z' }; c: 'u' | 'v' },
              { a: { b: 'x' } }
            >,
            { a: { b: 'y' }; c: 'u' | 'v' } | { a: { b: 'z' }; c: 'u' | 'v' }
          >
        >,
        Expect<
          Equal<
            DeepExclude<
              { a: { b: 'x' | 'y' | 'z' }; c: 'u' | 'v' },
              { c: 'u' }
            >,
            { a: { b: 'x' | 'y' | 'z' }; c: 'v' }
          >
        >,
        Expect<
          Equal<
            DeepExclude<
              { a: { b: 'x' | 'y' | 'z' }; c: 'u' | 'v' },
              { c: 'u' }
            >,
            { a: { b: 'x' | 'y' | 'z' }; c: 'v' }
          >
        >
      ];
    });
  });

  describe('Tuples', () => {
    it('should correctly exclude when it matches', () => {
      type cases = [
        Expect<Equal<DeepExclude<['x' | 'y'], [string]>, never>>,
        Expect<Equal<DeepExclude<['x' | 'y'], ['x']>, ['y']>>
      ];
    });

    it("if it doesn't match, it should leave the data structure untouched", () => {
      type cases = [
        Expect<Equal<DeepExclude<['x' | 'y'], ['z']>, ['x' | 'y']>>,
        Expect<Equal<DeepExclude<['x' | 'y'], []>, ['x' | 'y']>>,
        Expect<Equal<DeepExclude<['x' | 'y'], ['a', 'b', 'c']>, ['x' | 'y']>>
      ];
    });

    it('should work with nested tuples and only distribute what is necessary', () => {
      type cases = [
        Expect<Equal<DeepExclude<[['x' | 'y']], [['x']]>, [['y']]>>,
        Expect<
          Equal<DeepExclude<[['x' | 'y' | 'z']], [['x']]>, [['y']] | [['z']]>
        >,
        Expect<
          Equal<
            DeepExclude<[['x' | 'y' | 'z'], 'u' | 'v'], [['x'], unknown]>,
            [['y'], 'u' | 'v'] | [['z'], 'u' | 'v']
          >
        >,
        Expect<
          Equal<
            DeepExclude<[['x' | 'y' | 'z'], 'u' | 'v'], [unknown, 'v']>,
            [['x' | 'y' | 'z'], 'u']
          >
        >
      ];
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
      type cases = [
        Expect<Equal<DeepExclude<[] | [1, 2, 3], []>, [1, 2, 3]>>,
        Expect<
          Equal<
            DeepExclude<{ values: [] | [1, 2, 3] }, { values: [] }>,
            { values: [1, 2, 3] }
          >
        >,
        Expect<
          Equal<
            DeepExclude<{ values: [1, 2, 3] }, { values: [] }>,
            { values: [1, 2, 3] }
          >
        >,
        Expect<
          Equal<
            DeepExclude<{ values: (1 | 2 | 3)[] }, { values: [] }>,
            { values: (1 | 2 | 3)[] }
          >
        >
      ];
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

  it('should work with bug unions', () => {
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

  it('should work in common cases', () => {});
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
