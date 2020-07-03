import { match, __ } from '../src';
import { NotNever } from './utils';

describe('Numbers', () => {
  it('Should match exact numbers', () => {
    const res = match(1)
      .with(1, (v) => {
        const notNever: NotNever<typeof v> = true;
        const inferenceCheck: 1 = v;
        return v * 2;
      })
      .with(2, (v) => {
        const notNever: NotNever<typeof v> = true;
        const inferenceCheck: 2 = v;
        return v * v;
      })
      .otherwise(() => -1);

    const inferenceCheck: [NotNever<typeof res>, number] = [true, res];

    expect(res).toEqual(2);
  });
});
