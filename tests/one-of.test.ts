import { match, oneOf, __ } from '../src';

describe('oneOf', () => {
  it('should match any of the patterns given to oneOf', () => {
    expect(
      match<number>(2)
        .exhaustive()
        .with(oneOf(1, 2, 3), (x) => {
          let _: 1 | 2 | 3 = x;
          return 'one, two or three';
        })
        .with(__.number, () => 'other numbers')
        .run()
    ).toEqual('one, two or three');
  });

  it('should match any of the patterns given to oneOf', () => {
    type Input = { type: 'a' } | { type: 'b' } | { type: 'c' };

    match<Input>({ type: 'a' } as Input)
      .exhaustive()
      .with(oneOf({ type: 'a' as const }, { type: 'b' }), (x) => {
        let _: { type: 'a' } | { type: 'b' } = x;
        return 'a or b';
      })
      .with({ type: 'c' }, () => 'c')
      .run();
  });
});
