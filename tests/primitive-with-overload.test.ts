import { match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

/**
 * `.with(pattern, handler)` has a fast overload for primitive patterns.
 * These tests make sure it doesn't change how the other patterns are
 * typed, since TypeScript tries this overload first.
 */
describe('fast overload for primitive patterns', () => {
  it('should still infer the input of P.when in a 2-argument .with()', () => {
    const f = (input: number) =>
      match(input)
        .with(
          P.when((x) => {
            type t = Expect<Equal<typeof x, number>>;
            return x > 10;
          }),
          (x) => {
            type t = Expect<Equal<typeof x, number>>;
            return 'big';
          }
        )
        .otherwise(() => 'small');

    expect(f(20)).toBe('big');
    expect(f(2)).toBe('small');

    const g = (input: { n: number } | 'none') =>
      match(input)
        .with({ n: P.when((x) => x > 10) }, ({ n }) => {
          type t = Expect<Equal<typeof n, number>>;
          return 'big';
        })
        .with('none', (x) => {
          type t = Expect<Equal<typeof x, 'none'>>;
          return 'none';
        })
        .otherwise(() => 'small');

    expect(g({ n: 20 })).toBe('big');
    expect(g('none')).toBe('none');
  });

  it('should narrow and exclude branded literal patterns', () => {
    type Id = string & { __brand: 'Id' };
    const id = 'x' as Id;

    const f = (input: Id) =>
      match(input)
        .with(id, (x) => {
          type t = Expect<Equal<typeof x, Id>>;
          return 'id';
        })
        .exhaustive();

    expect(f(id)).toBe('id');
  });

  it('should not let an invalid literal break the rest of the chain', () => {
    type Country = 'France' | 'USA' | 'Spain';
    const f = (input: Country) =>
      match(input)
        // @ts-expect-error: 'US' instead of 'USA'
        .with('US', () => 'typo')
        .with('France', (x) => {
          type t = Expect<Equal<typeof x, 'France'>>;
          return 'Europe';
        })
        .with('Spain', () => 'Europe')
        // @ts-expect-error: 'USA' is still not handled
        .exhaustive();

    expect(f('France')).toBe('Europe');
  });
});
