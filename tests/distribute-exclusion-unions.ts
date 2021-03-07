import { DistributeExclusionUnions } from '../src/types/DistributeExclusionUnions';

import { Equal, Expect } from '../src/types/helpers';

describe('DistributeExclusionUnions', () => {
  it('should correctly exclude', () => {
    type cases = [
      Expect<Equal<DistributeExclusionUnions<'a'>, 'a'>>,
      Expect<Equal<DistributeExclusionUnions<'a' | 'b'>, 'a' | 'b'>>,
      Expect<
        Equal<
          DistributeExclusionUnions<{ type: 'a' | 'b' }>,
          { type: 'a' | 'b' }
        >
      >,
      Expect<
        Equal<
          DistributeExclusionUnions<['sb' | 'sc', 'eb' | 'ec']>,
          ['sb' | 'sc', unknown] | [unknown, 'eb' | 'ec']
        >
      >
    ];
  });
});
