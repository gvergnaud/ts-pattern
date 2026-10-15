import { match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('otherwise', () => {
  it('should pass matched value to otherwise', () => {
    const result = match<number>(42)
      .with(51, (d) => d)
      .otherwise((d) => d);
    expect(result).toBe(42);
  });

  it('should not call otherwise handler when a pattern matches', () => {
    const handler = jest.fn(() => 'fallback');
    const result = match<string>('hello')
      .with('hello', () => 'matched')
      .otherwise(handler);
    expect(result).toBe('matched');
    expect(handler).not.toHaveBeenCalled();
  });

  it('should call otherwise handler when no pattern matches', () => {
    const handler = jest.fn((v: string) => 'fallback');
    match<string>('hello')
      .with('world', () => 'matched')
      .otherwise(handler);
    expect(handler).toHaveBeenCalledWith('hello');
  });

  it('should return the handler return value', () => {
    const result = match<number>(7)
      .with(1, () => 'one')
      .otherwise(() => 'other');
    expect(result).toBe('other');
  });

  it('should work with object patterns', () => {
    type Shape = { kind: 'circle' } | { kind: 'square' };
    const input: Shape = { kind: 'square' };
    const result = match<Shape>(input)
      .with({ kind: 'circle' }, () => 'circle')
      .otherwise(() => 'not a circle');
    expect(result).toBe('not a circle');
  });

  it('should work after multiple .with() clauses', () => {
    const input = 5 as 1 | 2 | 3 | 4 | 5;
    const result = match(input)
      .with(1, () => 'one')
      .with(2, () => 'two')
      .with(3, () => 'three')
      .with(4, () => 'four')
      .otherwise(() => 'other');
    expect(result).toBe('other');
  });

  it('should stop at the first matching .with() clause', () => {
    const handler2 = jest.fn(() => 'second');
    const result = match<number>(1)
      .with(1, () => 'first')
      .with(1, handler2)
      .otherwise(() => 'fallback');
    expect(result).toBe('first');
    expect(handler2).not.toHaveBeenCalled();
  });

  it('should infer the correct return type', () => {
    const result = match<'a' | 'b'>('a')
      .with('a', () => 1 as const)
      .otherwise(() => 2 as const);
    type t = Expect<Equal<typeof result, 1 | 2>>;
    expect(result).toBe(1);
  });

  it('should work with P._ wildcard', () => {
    const result = match<number>(99)
      .with(0, () => 'zero')
      .otherwise((v) => `got ${v}`);
    expect(result).toBe('got 99');
  });

  it('should work with union types', () => {
    type Status = 'idle' | 'loading' | 'error' | 'success';
    const fn = (s: Status) =>
      match(s)
        .with('success', () => 'ok')
        .otherwise(() => 'not ok');

    expect(fn('success')).toBe('ok');
    expect(fn('loading')).toBe('not ok');
    expect(fn('error')).toBe('not ok');
    expect(fn('idle')).toBe('not ok');
  });

  it('should allow returning undefined from otherwise', () => {
    const result = match<number>(1)
      .with(2, () => 'two')
      .otherwise(() => undefined);
    expect(result).toBeUndefined();
  });

  it('should allow otherwise to throw', () => {
    expect(() =>
      match<number>(99)
        .with(0, () => 'zero')
        .otherwise(() => {
          throw new Error('unexpected');
        })
    ).toThrow('unexpected');
  });
});
