/**
 * Tests for the .run() method.
 * .run() is an alias for .exhaustive() — it throws NonExhaustiveError
 * when no pattern matches instead of requiring a fallback like .otherwise().
 */
import { NonExhaustiveError, match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('run()', () => {
  it('should return the matched value', () => {
    const result = match<number>(42)
      .with(42, () => 'forty-two')
      .with(P.number, () => 'other number')
      .run();

    expect(result).toBe('forty-two');
  });

  it('should throw NonExhaustiveError when no pattern matches', () => {
    expect(() =>
      match<number>(99)
        .with(1, () => 'one')
        .run()
    ).toThrow(NonExhaustiveError);
  });

  it('should throw with the unmatched input on .input', () => {
    let caught: NonExhaustiveError | null = null;
    try {
      match<string>('z').with('a', () => 1).run();
    } catch (e) {
      if (e instanceof NonExhaustiveError) caught = e;
    }
    expect(caught?.input).toBe('z');
  });

  it('should stop at the first matching branch', () => {
    const second = jest.fn(() => 'second');
    match<'a' | 'b' | 'c'>('a' as 'a' | 'b' | 'c')
      .with('a', () => 'first')
      .with(P.string, second) // would match 'a' but never called
      .run();

    expect(second).not.toHaveBeenCalled();
  });

  it('should work with object patterns', () => {
    type Status = { code: number; msg: string };
    const result = match<Status>({ code: 200, msg: 'OK' })
      .with({ code: 200 }, ({ msg }) => `ok: ${msg}`)
      .with({ code: P.number }, ({ code }) => `other: ${code}`)
      .run();

    expect(result).toBe('ok: OK');
  });

  it('should work with P.select()', () => {
    const result = match<[string, number]>(['hello', 42])
      .with([P.select('name'), P.select('age')], ({ name, age }) => `${name}:${age}`)
      .run();

    expect(result).toBe('hello:42');
  });

  it('should infer the correct return type', () => {
    const result = match<'a' | 'b'>('a')
      .with('a', () => 1 as const)
      .with('b', () => 2 as const)
      .run();

    type t = Expect<Equal<typeof result, 1 | 2>>;
    expect(result).toBe(1);
  });

  it('should behave identically to .exhaustive() for matched inputs', () => {
    const input = { type: 'ok' } as { type: 'ok' } | { type: 'err' };

    const viaRun = match(input)
      .with({ type: 'ok' }, () => 'ok')
      .with({ type: 'err' }, () => 'err')
      .run();

    const viaExhaustive = match(input)
      .with({ type: 'ok' }, () => 'ok')
      .with({ type: 'err' }, () => 'err')
      .exhaustive();

    expect(viaRun).toBe(viaExhaustive);
  });

  it('should return the same result as .exhaustive() for a matched input', () => {
    type AB = 'a' | 'b';
    // Use a function to prevent TypeScript from narrowing input to a literal
    const run = (input: AB) =>
      match(input).with('a', () => 1).with('b', () => 2).run();
    const exhaustive = (input: AB) =>
      match(input).with('a', () => 1).with('b', () => 2).exhaustive();

    expect(run('b')).toBe(exhaustive('b'));
    expect(run('b')).toBe(2);
  });
});
