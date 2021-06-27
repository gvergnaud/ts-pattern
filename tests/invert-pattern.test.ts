import { Equal, Expect } from '../src/types/helpers';
import { InvertPatternForExclude } from '../src/types/InvertPattern';
import { GuardPattern } from '../src/types/Pattern';
import { PatternType } from '../src/PatternType';

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
});
