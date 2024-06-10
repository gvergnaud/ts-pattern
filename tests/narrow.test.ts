import { P, match } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('P.narrow', () => {
  it('should correctly narrow the input type', () => {
    type Input = ['a' | 'b' | 'c', 'a' | 'b' | 'c'];
    const Pattern = ['a', P.union('a', 'b')] as const;

    type Narrowed = P.narrow<Input, typeof Pattern>;
    //     ^?
    type test = Expect<Equal<Narrowed, ['a', 'a' | 'b']>>;
  });
});

describe('.narrow() method', () => {
  it('should excluded values from deeply nested union types.', () => {
    const fn = (input: { prop?: string }) =>
      match(input)
        .with({ prop: P.nullish }, () => false)
        .narrow()
        .otherwise(({ prop }) => {
          type test = Expect<Equal<typeof prop, string>>;
          return true;
        });
  });
});
