/**
 * Extended tests for variadic tuple patterns not covered by variadic-tuples.test.ts:
 * - isMatching with variadic patterns
 * - Named select at head + variadic + tail when middle is empty
 * - Nested object patterns inside variadic arrays
 * - P.when (guard) inside variadic array elements
 * - Multiple variadic patterns in one .with() throws an error
 * - Select at all three positions with various input lengths
 */
import { isMatching, match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('variadic tuples extended', () => {
  describe('isMatching with variadic patterns', () => {
    it('should return true for [head, ...rest] when array is non-empty', () => {
      const isNonEmpty = isMatching([P.any, ...P.array()]);
      expect(isNonEmpty([1])).toBe(true);
      expect(isNonEmpty([1, 2, 3])).toBe(true);
      expect(isNonEmpty([])).toBe(false);
    });

    it('should return true for [...rest, tail] when array is non-empty', () => {
      const endsWithNumber = isMatching([...P.array(), P.number]);
      expect(endsWithNumber([1])).toBe(true);
      expect(endsWithNumber([1, 2, 3])).toBe(true);
      expect(endsWithNumber([])).toBe(false);
      expect(endsWithNumber(['a', 'b'])).toBe(false);
    });

    it('should return true for [head, ...middle[], tail] with at least 2 elements', () => {
      const hasBothEnds = isMatching([P.number, ...P.array(), P.string]);
      expect(hasBothEnds([1, 'end'])).toBe(true);
      expect(hasBothEnds([1, 2, 3, 'end'])).toBe(true);
      expect(hasBothEnds([1])).toBe(false);
      expect(hasBothEnds([])).toBe(false);
    });

    it('should narrow the type for variadic patterns', () => {
      const value: unknown = [1, 2, 3];
      const isTuple = isMatching([P.number, ...P.array(P.number)]);
      if (isTuple(value)) {
        type t = Expect<Equal<typeof value, [number, ...number[]]>>;
        expect(Array.isArray(value)).toBe(true);
      }
    });
  });

  describe('[sel(a), ...sel(b)[], sel(c)] with various input lengths', () => {
    const f = (xs: unknown[]) =>
      match(xs)
        .with(
          [
            P.select('head', P.number),
            ...P.array(P.select('mid', P.number)),
            P.select('tail', P.string),
          ],
          (sel) => sel
        )
        .otherwise(() => null);

    it('should select head, empty middle, and tail', () => {
      // [42, '!'] → head=42, mid=[], tail='!'
      expect(f([42, '!'])).toEqual({ head: 42, mid: [], tail: '!' });
    });

    it('should select head, one middle element, and tail', () => {
      expect(f([42, 1, '!'])).toEqual({ head: 42, mid: [1], tail: '!' });
    });

    it('should select head, multiple middle elements, and tail', () => {
      expect(f([42, 1, 2, 3, '!'])).toEqual({ head: 42, mid: [1, 2, 3], tail: '!' });
    });

    it('should not match when types are wrong', () => {
      expect(f([42, 1, 2])).toBeNull(); // no string tail
      expect(f(['a', 1, '!'])).toBeNull(); // head not number
    });
  });

  describe('nested object patterns inside variadic arrays', () => {
    it('should match [head, ...rows] where rows are objects', () => {
      const input: unknown = ['header', { value: 1 }, { value: 2 }];

      const result = match(input)
        .with(
          [
            P.select('title', P.string),
            ...P.array({ value: P.select('values', P.number) }),
          ],
          ({ title, values }) => ({ title, values })
        )
        .otherwise(() => null);

      expect(result).toEqual({ title: 'header', values: [1, 2] });
    });

    it('should match [head, ...rows, tail] where rows are typed objects', () => {
      const input: unknown = [0, { x: 1 }, { x: 2 }, 99];

      const result = match(input)
        .with(
          [
            P.select('first', P.number),
            ...P.array({ x: P.select('xs', P.number) }),
            P.select('last', P.number),
          ],
          ({ first, xs, last }) => ({ first, xs, last })
        )
        .otherwise(() => null);

      expect(result).toEqual({ first: 0, xs: [1, 2], last: 99 });
    });

    it('should not match when a nested object field has the wrong type', () => {
      const input: unknown = ['header', { value: 'not-a-number' }];

      const result = match(input)
        .with(
          [P.string, ...P.array({ value: P.number })],
          () => 'matched'
        )
        .otherwise(() => 'no match');

      expect(result).toBe('no match');
    });
  });

  describe('P.when (guard) inside variadic array elements', () => {
    it('should match when all elements satisfy the guard', () => {
      const result = match<number[]>([11, 22, 33])
        .with(
          [
            P.number,
            ...P.array(P.when((v): v is number => typeof v === 'number' && v > 10)),
          ],
          () => 'all big'
        )
        .otherwise(() => 'some small');

      expect(result).toBe('all big');
    });

    it('should not match when a middle element fails the guard', () => {
      const result = match<number[]>([11, 5, 33])
        .with(
          [
            P.number,
            ...P.array(P.when((v): v is number => typeof v === 'number' && v > 10)),
          ],
          () => 'all big'
        )
        .otherwise(() => 'some small');

      expect(result).toBe('some small');
    });
  });

  describe('multiple variadic patterns throws at runtime', () => {
    it('should throw when two ...P.array() appear in one pattern', () => {
      expect(() =>
        match([1, 2, 3])
          .with(
            [...P.array(P.number), ...P.array(P.string)] as any,
            () => 'matched'
          )
          .otherwise(() => 'no match')
      ).toThrow(
        'Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.'
      );
    });
  });

  describe('select on variadic with .select() chain method', () => {
    it('should select the variadic portion using .select()', () => {
      const result = match<(number | string)[]>([1, 2, 3, 4])
        .with([1, ...P.array(P.number).select()], (rest) => {
          type t = Expect<Equal<typeof rest, number[]>>;
          return rest;
        })
        .otherwise(() => []);

      expect(result).toEqual([2, 3, 4]);
    });

    it('should select an empty array when only the head matches', () => {
      const result = match<(number | string)[]>([1])
        .with([1, ...P.array(P.number).select()], (rest) => rest)
        .otherwise(() => null);

      expect(result).toEqual([]);
    });

    it('[...P.array(P.number).select(), tail] selects the prefix', () => {
      const result = match<(number | string)[]>([1, 2, 3, 'end'])
        .with([...P.array(P.number).select(), P.string], (prefix) => prefix)
        .otherwise(() => null);

      expect(result).toEqual([1, 2, 3]);
    });
  });
});
