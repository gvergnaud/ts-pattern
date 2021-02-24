import { Expect, Equal } from '../src/types/helpers';
import { match, __ } from '../src';

describe('Numbers', () => {
  it('Should match exact numbers', () => {
    const res = match(1)
      .with(1, (v) => {
        type t = Expect<Equal<typeof v, 1>>;
        return v * 2;
      })
      .with(2, (v) => {
        type t = Expect<Equal<typeof v, 2>>;
        return v * v;
      })
      .otherwise(() => -1);

    type t = Expect<Equal<typeof res, number>>;

    expect(res).toEqual(2);
  });
});
