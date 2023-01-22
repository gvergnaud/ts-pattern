import { Expect, Equal } from '../src/types/helpers';
import { match, P } from '../src';

describe('Numbers', () => {
  it('Should match exact numbers', () => {
    const res = match<number>(1)
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

  it('P.number should match NaN', () => {
    const val: number | null = NaN;
    const res = match(val)
      .with(P.nullish, () => 'bad')
      .with(1, () => 'bad')
      .with(P.number, () => 'good')
      .exhaustive();

    expect(res).toEqual('good');
  });

  it('NaN should match NaN specially', () => {
    const val: number | null = NaN;
    const res = match(val)
      .with(P.nullish, () => 'bad')
      .with(1, () => 'bad')
      .with(NaN, () => 'good')
      .with(P.number, () => 'bad')
      .exhaustive();

    expect(res).toEqual('good');
  });

  it("when matching only NaN, the expression shouldn't be exhaustive", () => {
    const f = (val: number) =>
      match(val)
        .with(NaN, () => 'NaN')
        // @ts-expect-error
        .exhaustive();

    const f2 = (val: number) =>
      match(val)
        .with(NaN, () => 'NaN')
        .with(P.number, () => 'number')
        .exhaustive();
  });
});
