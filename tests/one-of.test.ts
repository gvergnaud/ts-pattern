import { match, oneOf, __ } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('oneOf', () => {
  it('should match any of the patterns given to oneOf', () => {
    expect(
      match<number>(2)
        // .with(oneOf(1, 2, __), (x) => {
        //   type t = Expect<Equal<typeof x, number>>;
        //   return 'one, two or three';
        // })
        .with(oneOf(1, 2, __.number), (x) => {
          type t = Expect<Equal<typeof x, number>>;
          return 'one, two or three';
        })
        .with(oneOf(1, 2, 3), (x) => {
          type t = Expect<Equal<typeof x, 1 | 2 | 3>>;
          return 'one, two or three';
        })
        .with(oneOf(1, 2, 3), (x) => {
          type t = Expect<Equal<typeof x, 1 | 2 | 3>>;
          return 'one, two or three';
        })
        //.with(__.number, () => 'other numbers')
        .exhaustive()
    ).toEqual('one, two or three');
  });

  it('should match any of the patterns given to oneOf', () => {
    type Input = { type: 'a' } | { type: 'b' } | { type: 'c' };

    match<Input>({ type: 'a' })
      .with(oneOf({ type: 'a' as const }, { type: 'b' }), (x) => {
        type t = Expect<Equal<typeof x, { type: 'a' } | { type: 'b' }>>;
        return 'a or b';
      })
      .with({ type: oneOf('a', 'b') }, (x) => {
        type t = Expect<Equal<typeof x, { type: 'a' } | { type: 'b' }>>;
        return 'a or b';
      })
      .with({ type: 'c' }, () => 'c')
      .exhaustive();
  });
});
