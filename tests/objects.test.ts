import { isMatching, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('Objects', () => {
  it('should work with symbols', () => {
    const symbolA = Symbol('symbol-a');
    const symbolB = Symbol('symbol-b');
    const obj: { [symbolA]: { [symbolB]: 'foo' | 'bar' } } = {
      [symbolA]: { [symbolB]: 'foo' },
    };
    if (isMatching({ [symbolA]: { [symbolB]: 'foo' } }, obj)) {
      type t = Expect<Equal<typeof obj, { [symbolA]: { [symbolB]: 'foo' } }>>;
    } else {
      throw new Error('Expected obj to match the foo pattern!');
    }
    if (isMatching({ [symbolA]: { [symbolB]: 'bar' } }, obj)) {
      type t = Expect<
        Equal<
          typeof obj,
          { [symbolA]: { [symbolB]: 'foo' } } & {
            [symbolA]: { [symbolB]: 'bar' };
          }
        >
      >;
      throw new Error('Expected obj to not match the bar pattern!');
    }
  });
});
