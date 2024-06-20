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
        .with({ prop: P.nullish.optional() }, () => false)
        .otherwise(({ prop }) => {
          type test = Expect<Equal<typeof prop, string>>;
          return true;
        });

    const fn2 = (input: { prop?: 1 | 2 | 3 }) =>
      match(input)
        .with({ prop: P.nullish.optional() }, () => false)
        .with({ prop: 2 }, () => false)
        .otherwise(({ prop }) => {
          type test = Expect<Equal<typeof prop, 1 | 3>>;
          return true;
        });
  });
});
