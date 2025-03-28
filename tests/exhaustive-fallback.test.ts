import { match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('Exhaustive fallback function', () => {
  it("should be called if the runtime value isn't expected", () => {
    const input: 'a' | 'b' = 'c' as any;
    const result = match(input)
      .with('a', (x) => x)
      .with('b', (x) => x)
      .exhaustive((v) => ({ unexpectedValue: v }));

    type t = Expect<
      Equal<typeof result, { unexpectedValue: unknown } | 'a' | 'b'>
    >;

    expect(result).toStrictEqual({ unexpectedValue: 'c' });
  });

  it('should throw otherwise', () => {
    expect(() => {
      const input: 'a' | 'b' = 'c' as any;
      return match(input)
        .with('a', (x) => x)
        .with('b', (x) => x)
        .exhaustive();
    }).toThrow();
  });

  it('should return a value assignable to the explicit output type', () => {
    const input: 'a' | 'b' = 'c' as any;
    const res = match<typeof input, 'a' | 'b'>(input)
      .with('a', (x) => x)
      .with('b', (x) => x)
      // @ts-expect-error 'c' isn't assignable to a|b
      .exhaustive(() => {
        // Note: ideally the error message should be here.
        return 'c';
      });
  });

  it('should return a value assignable .returnType<T>()', () => {
    const input: 'a' | 'b' = 'c' as any;
    const res = match(input)
      .returnType<'a' | 'b'>()
      .with('a', (x) => x)
      .with('b', (x) => x)
      // @ts-expect-error 'c' isn't assignable to a|b
      .exhaustive(() => 'c');
  });
});
