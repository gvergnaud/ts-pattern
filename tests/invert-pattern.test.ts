import { Equal, Expect } from '../src/types/helpers';
import {
  InvertPattern,
  InvertPatternForExclude,
} from '../src/types/InvertPattern';
import { GuardPattern, OptionalPattern } from '../src/types/Pattern';

describe('InvertPatternForExclude', () => {
  it('should correctly invert type guards', () => {
    type cases = [
      Expect<
        Equal<
          InvertPatternForExclude<
            {
              x: GuardPattern<1 | 2 | 3, 3>;
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
              x: GuardPattern<3, 3>;
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
      { a: GuardPattern<unknown, string> },
      { a: string; b: number } | [1, 2]
    >;

    type cases = [
      Expect<
        Equal<
          InvertPatternForExclude<
            { a: GuardPattern<unknown, string> },
            { a: string; b: number } | [1, 2]
          >,
          { a: string }
        >
      >
    ];
  });

  it('should work with tuples', () => {
    type cases = [
      Expect<
        Equal<
          InvertPatternForExclude<[1, 2], { a: string; b: number } | [1, 2]>,
          [1, 2]
        >
      >
    ];
  });

  describe('optional', () => {
    it('an optional pattern in an object should be considered an optional key', () => {
      type input = { sex?: 'a' | 'b' };
      type pattern = { sex: OptionalPattern<'a'> };
      type inverted = InvertPattern<pattern>;

      type cases = [
        Expect<
          Equal<
            inverted,
            {
              sex?: 'a' | undefined;
            }
          >
        >
      ];
    });

    it('an optional pattern in an object should be considered an optional key', () => {
      type input = { sex?: 'a' | 'b' };
      type pattern = { sex: OptionalPattern<'a'> };
      type inverted = InvertPatternForExclude<pattern, input>;

      type cases = [
        Expect<
          Equal<
            inverted,
            {
              sex?: 'a' | undefined;
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
