import { isMatching, match, P } from '../src';

describe('selecting an explicit undefined pattern', () => {
  it('restricts anonymous selections to undefined', () => {
    const accepts = isMatching(P.select(undefined));
    expect(accepts(undefined)).toBe(true);
    expect(accepts(null)).toBe(false);
    expect(accepts(0)).toBe(false);
    expect(accepts('value')).toBe(false);
  });

  it('restricts named selections to undefined', () => {
    const accepts = isMatching(P.select('value', undefined));
    expect(accepts(undefined)).toBe(true);
    expect(accepts(null)).toBe(false);
    expect(accepts(0)).toBe(false);
    expect(accepts('value')).toBe(false);
  });

  it('passes undefined to selection handlers', () => {
    expect(
      match<unknown>(undefined)
        .with(P.select(undefined), (value) => value)
        .otherwise(() => 'fallback')
    ).toBeUndefined();
    expect(
      match<unknown>(undefined)
        .with(P.select('value', undefined), (selection) => selection)
        .otherwise(() => 'fallback')
    ).toEqual({ value: undefined });
  });

  it('keeps selections without a pattern unrestricted', () => {
    for (const value of [undefined, null, 0, 'value']) {
      expect(isMatching(P.select())(value)).toBe(true);
      expect(isMatching(P.select('value'))(value)).toBe(true);
    }
  });
});
