import { Equal, Expect, IsPlainObject, Primitives } from '../src/types/helpers';
import { IsMatching } from '../src/types/IsMatching';
import { Option } from './types-catalog/utils';

describe('IsMatching', () => {
  describe('should return true if the pattern matches the input,  false otherwise', () => {
    it('Literals', () => {
      type cases = [
        Expect<Equal<IsMatching<'c' | 'd', 'c'>, true>>,
        Expect<Equal<IsMatching<'c' | 'd', 'a'>, false>>,
        Expect<Equal<IsMatching<'c' | 'd', unknown>, true>>,

        Expect<Equal<IsMatching<1 | 2, 1>, true>>,
        Expect<Equal<IsMatching<1 | 2, 3>, false>>,
        Expect<Equal<IsMatching<1 | 2, unknown>, true>>,

        Expect<Equal<IsMatching<1 | 'a', 1>, true>>,
        Expect<Equal<IsMatching<1 | 'a', 'a'>, true>>,
        Expect<Equal<IsMatching<1 | 'a', 2>, false>>,
        Expect<Equal<IsMatching<1 | 'a', 'b'>, false>>,
        Expect<Equal<IsMatching<1 | 'a', unknown>, true>>
      ];
    });

    it('Object', () => {
      type cases = [
        Expect<
          Equal<
            IsMatching<{ type: 'a'; color: 'yellow' | 'green' }, { type: 'a' }>,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<{ type: 'a'; color: 'yellow' | 'green' }, { type: 'b' }>,
            false
          >
        >,
        Expect<
          Equal<
            IsMatching<
              { type: 'a'; value: { type: 'c'; value: { type: 'd' } } } | 12,
              { type: 'a' }
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<
              { type: 'a'; value: { type: 'c'; value: { type: 'd' } } } | 12,
              12
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<
              | {
                  type: 'a';
                  value:
                    | { type: 'c'; value: { type: 'd' } | 2 }
                    | { type: 'e'; value: { type: 'f' } | 3 };
                }
              | 12,
              { type: 'a'; value: { type: 'c' } }
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<
              | {
                  type: 'a';
                  value:
                    | { type: 'c'; value: { type: 'd' } | 2 }
                    | { type: 'e'; value: { type: 'f' } | 3 };
                }
              | 12,
              { type: 'a'; value: { type: 'c'; value: 2 } }
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<
              {
                type: 'a';
                value:
                  | { type: 'c'; value: { type: 'd' } | 2 }
                  | { type: 'e'; value: { type: 'f' } | 3 };
              },
              { type: 'a'; value: { type: 'c'; value: 3 } }
            >,
            false //  value: 3 isn't compatible with type: 'c'
          >
        >,
        Expect<
          Equal<
            IsMatching<12, { type: 'a'; value: { type: 'c'; value: 3 } }>,
            false
          >
        >,
        Expect<
          Equal<
            IsMatching<
              | { type: 'c'; value: { type: 'd' } | 2 }
              | { type: 'e'; value: { type: 'f' } | 3 },
              { type: 'c'; value: 3 }
            >,
            false
          >
        >,
        Expect<
          Equal<
            IsMatching<
              | { type: 'c'; value: { type: 'd' } | 2 }
              | { type: 'e'; value: { type: 'f' } | 3 },
              { type: 'c' }
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<
              | { type: 'c'; value: { type: 'd' } | 2 }
              | { type: 'e'; value: { type: 'f' } | 3 },
              { value: 3 }
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<
              { type: 'c'; value: { type: 'd' } | 2 },
              { type: 'c'; value: 3 }
            >,
            false
          >
        >,
        Expect<
          Equal<
            IsMatching<
              Option<{ type: 'a' } | { type: 'b' }>,
              { kind: 'some'; value: { type: 'a' } }
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<
              Option<{ type: 'a' } | { type: 'b' }>,
              { kind: 'some'; value: { type: 'c' } }
            >,
            false
          >
        >,
        Expect<Equal<IsMatching<{ type: 'a' }, {}>, false>>,
        Expect<Equal<IsMatching<{}, { type: 'a' }>, false>>
      ];
    });

    it('Tuples', () => {
      type State = {};
      type Msg = [type: 'Login'] | [type: 'UrlChange', url: string];

      type cases = [
        Expect<Equal<IsMatching<['a', 'c' | 'd'], ['a', 'd']>, true>>,
        Expect<Equal<IsMatching<['a', 'c' | 'd'], ['a', unknown]>, true>>,
        Expect<Equal<IsMatching<['a', 'c' | 'd'], ['a', 'f']>, false>>,
        Expect<Equal<IsMatching<['a', 'c' | 'd'], ['b', 'c']>, false>>,
        Expect<Equal<IsMatching<['a', 'c' | 'd', 'd'], ['b', 'c']>, false>>,
        Expect<Equal<IsMatching<[], []>, true>>,
        Expect<Equal<IsMatching<['a'], []>, false>>,
        Expect<Equal<IsMatching<['a'], ['a', 'b', 'c']>, false>>,
        Expect<Equal<IsMatching<[], ['a', 'b', 'c']>, false>>,
        Expect<
          Equal<
            IsMatching<
              [Option<{ type: 'a' } | { type: 'b' }>, 'c' | 'd'],
              [{ kind: 'some'; value: { type: 'a' } }, unknown]
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<[State, Msg], [unknown, ['UrlChange', unknown]]>,
            true
          >
        >,
        Expect<
          Equal<IsMatching<[State, Msg], [unknown, ['Login', unknown]]>, false>
        >,
        Expect<Equal<IsMatching<[State, Msg], [unknown, ['Login']]>, true>>
      ];
    });

    it('Lists', () => {
      type cases = [
        Expect<Equal<IsMatching<('a' | 'b')[], 'a'[]>, true>>,
        Expect<Equal<IsMatching<('a' | 'b')[], 'b'[]>, true>>,
        Expect<Equal<IsMatching<('a' | 'b')[], 'c'[]>, false>>,
        Expect<Equal<IsMatching<{ x: ['a' | 'b'] }[], { x: ['a'] }[]>, true>>,
        Expect<Equal<IsMatching<{ x: ['a' | 'b'] }[], { x: ['c'] }[]>, false>>
      ];
    });

    it('Sets', () => {
      type cases = [
        Expect<Equal<IsMatching<Set<'a' | 'b'>, Set<'a'>>, true>>,
        Expect<Equal<IsMatching<Set<'a' | 'b'>, Set<'b'>>, true>>,
        Expect<Equal<IsMatching<Set<'a' | 'b'>, Set<'c'>>, false>>,
        Expect<
          Equal<IsMatching<Set<{ x: ['a' | 'b'] }>, Set<{ x: ['a'] }>>, true>
        >,
        Expect<
          Equal<IsMatching<Set<{ x: ['a' | 'b'] }>, Set<{ x: ['c'] }>>, false>
        >
      ];
    });

    it('Maps', () => {
      type cases = [
        Expect<
          Equal<IsMatching<Map<string, 'a' | 'b'>, Map<string, 'a'>>, true>
        >,
        Expect<
          Equal<IsMatching<Map<'hello', 'a' | 'b'>, Map<'hello', 'b'>>, true>
        >,
        Expect<
          Equal<IsMatching<Map<string, 'a' | 'b'>, Map<string, 'c'>>, false>
        >,
        Expect<
          Equal<IsMatching<Map<'hello', 'a' | 'b'>, Map<string, 'a'>>, false>
        >,
        Expect<
          Equal<
            IsMatching<
              Map<string, { x: ['a' | 'b'] }>,
              Map<string, { x: ['a'] }>
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<
              Map<string, { x: ['a' | 'b'] }>,
              Map<string, { x: ['c'] }>
            >,
            false
          >
        >
      ];
    });

    it('pattern is a union types', () => {
      type cases = [
        Expect<Equal<IsMatching<'d', 'd' | 'e'>, true>>,
        Expect<Equal<IsMatching<'f', 'd' | 'e'>, false>>,
        Expect<
          Equal<
            IsMatching<
              | { type: 'd'; value: boolean }
              | { type: 'e'; value: string[] }
              | { type: 'f'; value: number[] },
              {
                type: 'd' | 'e';
              }
            >,
            true
          >
        >
      ];
    });
  });
});
