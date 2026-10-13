import { isMatching, match, P } from '../src';

describe('sparse array patterns', () => {
  it('checks missing array slots against the element pattern', () => {
    expect(isMatching(P.array(P.number), [1, , 3])).toBe(false);
    expect(isMatching(P.array(P.number), new Array(2))).toBe(false);
    expect(isMatching(P.array(P.number), [])).toBe(true);
  });

  it('keeps selections aligned with optional array slots', () => {
    const values = match<Array<number | undefined>>([1, , 3])
      .with(P.array(P.select(P.optional(P.number))), (selected) => selected)
      .run();

    expect(values).toEqual([1, undefined, 3]);
  });

  it('checks missing slots inside a variadic tuple', () => {
    const input: unknown = [0, , 3];
    expect(isMatching([0, ...P.array(P.number)], input)).toBe(false);
    expect(isMatching([0, ...P.array(P.optional(P.number))], input)).toBe(true);
  });
});
