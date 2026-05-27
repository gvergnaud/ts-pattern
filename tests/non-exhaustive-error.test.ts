import { NonExhaustiveError, match, P } from '../src';

describe('NonExhaustiveError', () => {
  describe('is thrown by .exhaustive() when no pattern matches', () => {
    it('should throw NonExhaustiveError for unmatched value', () => {
      const input = 'c' as 'a' | 'b' | 'c';
      expect(() =>
        match(input)
          .with('a', () => 1)
          .with('b', () => 2)
          // @ts-expect-error - 'c' is unhandled
          .exhaustive()
      ).toThrow(NonExhaustiveError);
    });

    it('should be an instance of Error', () => {
      expect(() =>
        match('x' as 'x' | 'y')
          .with('y', () => 1)
          // @ts-expect-error
          .exhaustive()
      ).toThrow(Error);
    });
  });

  describe('error message', () => {
    it('should include the unmatched string value', () => {
      expect(() =>
        match('unmatched' as 'unmatched' | 'ok')
          .with('ok', () => 1)
          // @ts-expect-error
          .exhaustive()
      ).toThrow('Pattern matching error: no pattern matches value "unmatched"');
    });

    it('should include the unmatched number value', () => {
      expect(() =>
        match(42 as 42 | 0)
          .with(0, () => 'zero')
          // @ts-expect-error
          .exhaustive()
      ).toThrow('Pattern matching error: no pattern matches value 42');
    });

    it('should include the unmatched object as JSON', () => {
      expect(() =>
        match({ type: 'unknown' } as { type: 'known' } | { type: 'unknown' })
          .with({ type: 'known' }, () => 1)
          // @ts-expect-error
          .exhaustive()
      ).toThrow(
        'Pattern matching error: no pattern matches value {"type":"unknown"}'
      );
    });

    it('should include the unmatched array as JSON', () => {
      expect(() =>
        match([1, 2, 3] as number[] | string[])
          .with(P.array(P.string), () => 'strings')
          // @ts-expect-error
          .exhaustive()
      ).toThrow('Pattern matching error: no pattern matches value [1,2,3]');
    });

    it('should include null', () => {
      expect(() =>
        match(null as null | 'ok')
          .with('ok', () => 1)
          // @ts-expect-error
          .exhaustive()
      ).toThrow('Pattern matching error: no pattern matches value null');
    });

    it('should handle circular references without throwing', () => {
      const circular: any = { a: 1 };
      circular.self = circular;

      // NonExhaustiveError constructor catches JSON.stringify errors and falls back to the raw value
      const error = new NonExhaustiveError(circular);
      expect(error.message).toMatch(/Pattern matching error: no pattern matches value/);
    });
  });

  describe('.input property', () => {
    it('should store the original unmatched value', () => {
      const input = { type: 'unknown', payload: 42 } as
        | { type: 'known'; payload: number }
        | { type: 'unknown'; payload: number };

      let caughtError: NonExhaustiveError | null = null;
      try {
        match(input)
          .with({ type: 'known' }, () => 'ok')
          // @ts-expect-error
          .exhaustive();
      } catch (e) {
        if (e instanceof NonExhaustiveError) caughtError = e;
      }

      expect(caughtError).not.toBeNull();
      expect(caughtError!.input).toBe(input);
    });

    it('should preserve primitive input value', () => {
      const error = new NonExhaustiveError(99);
      expect(error.input).toBe(99);
    });

    it('should preserve null input value', () => {
      const error = new NonExhaustiveError(null);
      expect(error.input).toBeNull();
    });

    it('should preserve undefined input value', () => {
      const error = new NonExhaustiveError(undefined);
      expect(error.input).toBeUndefined();
    });
  });

  describe('can be caught and inspected', () => {
    it('should be catchable by type', () => {
      let caught = false;
      try {
        match('z' as 'z' | 'a')
          .with('a', () => 1)
          // @ts-expect-error
          .exhaustive();
      } catch (e) {
        expect(e).toBeInstanceOf(NonExhaustiveError);
        caught = true;
      }
      expect(caught).toBe(true);
    });

    it('should be catchable by instanceof check', () => {
      let caught: unknown;
      try {
        match('z' as 'z' | 'a')
          .with('a', () => 1)
          // @ts-expect-error
          .exhaustive();
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(NonExhaustiveError);
      expect(caught).toBeInstanceOf(Error);
    });
  });
});
