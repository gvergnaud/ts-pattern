import { isMatching, P } from '../src';

describe('reusing array patterns after spreading', () => {
  it('keeps an existing nested tuple pattern unchanged', () => {
    const numbers = P.array(P.number);
    const nested = [numbers] as const;
    expect(isMatching(nested)([[1, 2]])).toBe(true);
    const spread = ['start', ...numbers] as const;
    expect(isMatching(spread)(['start', 1, 2])).toBe(true);
    expect(isMatching(nested)([[1, 2]])).toBe(true);
    expect(isMatching(nested)([1, 2])).toBe(false);
  });

  it('allows the same array pattern in fixed and variadic positions', () => {
    const numbers = P.array(P.number);
    const pattern = [numbers, ...numbers] as const;
    expect(isMatching(pattern)([[1], 2, 3])).toBe(true);
    expect(isMatching(pattern)([[1], 'no'])).toBe(false);
    expect(isMatching(pattern)([1, 2])).toBe(false);
  });
});
