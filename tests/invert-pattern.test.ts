import { Equal, Expect } from '../src/types/helpers';
import { InvertPatternForExclude } from '../src/types/InvertPattern';
import { GuardPattern } from '../src/types/Pattern';

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
          { x: 3 }
        >
      >
    ];
  });
});
