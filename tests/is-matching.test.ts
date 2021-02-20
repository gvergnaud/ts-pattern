import { Equal, Expect } from '../src/types/helpers';
import { IsMatching } from '../src/types/IsMatching';
import { NotPattern } from '../src/types/Pattern';

describe('IsMatching', () => {
  it('should return true if the pattern matches the input', () => {
    type cases = [
      Expect<
        Equal<
          IsMatching<{ type: 'a'; color: 'yellow' | 'green' }, { type: 'a' }>,
          true
        >
      >
    ];
  });

  it('should return false if the pattern does not matches the input', () => {
    type cases = [
      Expect<
        Equal<
          IsMatching<{ type: 'a'; color: 'yellow' | 'green' }, { type: 'b' }>,
          false
        >
      >
    ];
  });
});
