import { Equal, Expect } from '../src/types/helpers';
import { InvertPatternForExclude } from '../src/types/InvertPattern';
import { Matchable } from '../src/types/Pattern';

describe('InvertPatternForExclude', () => {
  it('should correctly invert type guards', () => {
    type cases = [
      Expect<
        Equal<
          InvertPatternForExclude<
            {
              x: Matchable<1 | 2 | 3, 3>;
            },
            { x: 1 | 2 | 3 }
          >,
          { x: 3 }
        >
      >,
      Expect<
        Equal<
          InvertPatternForExclude<
            {
              x: Matchable<3, 3>;
            },
            { x: 1 } | { x: 2 } | { x: 3 }
          >,
          { x: 3 } | { x: 3 } | { x: 3 }
        >
      >
    ];
  });

  it('should work with objects', () => {
    type t = InvertPatternForExclude<
      { a: Matchable<unknown, string> },
      { a: string; b: number } | [1, 2]
    >;

    type cases = [
      Expect<
        Equal<
          InvertPatternForExclude<
            { a: Matchable<unknown, string> },
            { a: string; b: number } | [1, 2]
          >,
          { a: string }
        >
      >
    ];
  });

  describe('Tuples', () => {
    it('should work with tuples', () => {
      type cases = [
        Expect<
          Equal<
            InvertPatternForExclude<[1, 2], { a: string; b: number } | [1, 2]>,
            readonly [1, 2]
          >
        >
      ];
    });

    it('should return readonly tuples because both mutable and readonly are assignable to them', () => {
      type cases = [
        Expect<
          Equal<
            InvertPatternForExclude<[[[1, 2]]], { a: string } | [[[1, 2]]]>,
            readonly [readonly [readonly [1, 2]]]
          >
        >
      ];
    });
  });

  describe('optional', () => {
    type OptionalPattern<a> = Matchable<unknown, a, 'optional'>;

    it('an optional pattern in an object should be considered an optional key', () => {
      type input = { key?: 'a' | 'b' };
      type pattern = { key: OptionalPattern<'a'> };
      type inverted = InvertPatternForExclude<pattern, input>;

      type cases = [
        Expect<
          Equal<
            inverted,
            {
              key?: 'a' | undefined;
            }
          >
        >
      ];
    });
    it('the inverted value should be the intersection of all the inverted patterns', () => {
      type x = InvertPatternForExclude<
        { type2: 'c'; data: OptionalPattern<'f'> },
        { type: 'a' | 'b'; type2: 'c' | 'd'; data?: 'f' | 'g' }
      >;
      type cases = [Expect<Equal<x, { type2: 'c'; data?: 'f' | undefined }>>];
    });

    it('an optional pattern in an object should be considered an optional key', () => {
      type input = { key?: 'a' | 'b' };
      type pattern = { key: OptionalPattern<'a'> };
      type inverted = InvertPatternForExclude<pattern, input>;

      type cases = [
        Expect<
          Equal<
            inverted,
            {
              key?: 'a' | undefined;
            }
          >
        >
      ];
    });
  });

  describe('issue #44', () => {
    it('if the pattern contains unknown keys, inverted this pattern should keep them', () => {
      type input = { sex: 'a' | 'b'; age: 'c' | 'd' };
      type pattern = { sex: 'a'; unknownKey: 'c' };
      type inverted = InvertPatternForExclude<pattern, input>;

      type cases = [Expect<Equal<inverted, pattern>>];
    });
  });
});
