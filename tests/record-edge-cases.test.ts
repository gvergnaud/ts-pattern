/**
 * Edge case tests for P.record() not covered by record.test.ts:
 * - isMatching integration
 * - P.when / P.not as value patterns
 * - P.record inside P.union
 * - Null-prototype objects
 * - Records with undefined/null values
 * - Named select in both key and value simultaneously
 * - Runtime behavior of invalid key patterns (FIXME documented in record.test.ts)
 * - Prototype properties are not matched
 */
import { isMatching, match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('P.record edge cases', () => {
  describe('isMatching with P.record', () => {
    it('should return true for a matching record (curried form)', () => {
      const isStringNumberRecord = isMatching(P.record(P.string, P.number));
      expect(isStringNumberRecord({ a: 1, b: 2 })).toBe(true);
    });

    it('should return false for a non-matching record (curried form)', () => {
      const isStringNumberRecord = isMatching(P.record(P.string, P.number));
      expect(isStringNumberRecord({ a: 1, b: 'string' })).toBe(false);
    });

    it('should work as a filter predicate', () => {
      const isStringNumberRecord = isMatching(P.record(P.string, P.number));
      const values: unknown[] = [{ a: 1 }, { a: 'x' }, null, [], 42];
      expect(values.filter(isStringNumberRecord)).toEqual([{ a: 1 }]);
    });

    it('should narrow the type when used in an if-guard', () => {
      const input: unknown = { x: 1, y: 2 };
      if (isMatching(P.record(P.string, P.number))(input)) {
        type t = Expect<Equal<typeof input, Record<string, number>>>;
        expect(Object.values(input).every((v) => typeof v === 'number')).toBe(
          true
        );
      }
    });

    it('should return false for null', () => {
      const isRecord = isMatching(P.record(P.string, P.number));
      expect(isRecord(null)).toBe(false);
    });

    it('should return false for arrays', () => {
      const isRecord = isMatching(P.record(P.string, P.number));
      expect(isRecord([1, 2, 3])).toBe(false);
    });
  });

  describe('P.when in value position', () => {
    it('should match when all values satisfy the guard', () => {
      const result = match<Record<string, number>>({ a: 15, b: 25 })
        .with(
          P.record(P.string, P.when((v): v is number => typeof v === 'number' && v > 10)),
          () => 'all > 10'
        )
        .otherwise(() => 'no match');

      expect(result).toBe('all > 10');
    });

    it('should not match when any value fails the guard', () => {
      const result = match<Record<string, number>>({ a: 15, b: 5 })
        .with(
          P.record(P.string, P.when((v): v is number => typeof v === 'number' && v > 10)),
          () => 'all > 10'
        )
        .otherwise(() => 'no match');

      expect(result).toBe('no match');
    });

    it('should match empty objects (vacuously true)', () => {
      const result = match<Record<string, number>>({})
        .with(
          P.record(P.string, P.when((v): v is number => typeof v === 'number' && v > 10)),
          () => 'all > 10'
        )
        .otherwise(() => 'no match');

      expect(result).toBe('all > 10');
    });
  });

  describe('P.not in value position', () => {
    it('should match when no value equals the excluded literal', () => {
      const result = match<Record<string, number>>({ a: 1, b: 2 })
        .with(P.record(P.string, P.not(0)), () => 'no zeros')
        .otherwise(() => 'has zero');

      expect(result).toBe('no zeros');
    });

    it('should not match when a value equals the excluded literal', () => {
      const result = match<Record<string, number>>({ a: 1, b: 0 })
        .with(P.record(P.string, P.not(0)), () => 'has zero')
        .otherwise(() => 'no zeros');

      expect(result).toBe('no zeros');
    });
  });

  describe('P.record inside P.union', () => {
    it('should match the record branch', () => {
      const result = match<Record<string, number> | string>({ a: 1 })
        .with(P.union(P.record(P.string, P.number), P.string), (v) =>
          typeof v === 'string' ? 'string' : 'record'
        )
        .otherwise(() => 'no match');

      expect(result).toBe('record');
    });

    it('should match the string branch', () => {
      const result = match<Record<string, number> | string>('hello')
        .with(P.union(P.record(P.string, P.number), P.string), (v) =>
          typeof v === 'string' ? 'string' : 'record'
        )
        .otherwise(() => 'no match');

      expect(result).toBe('string');
    });
  });

  describe('null-prototype objects', () => {
    it('should match a null-prototype object', () => {
      const obj: unknown = Object.assign(Object.create(null), { a: 1, b: 2 });

      const result = match(obj)
        .with(P.record(P.string, P.number), () => 'matched')
        .otherwise(() => 'no match');

      expect(result).toBe('matched');
    });

    it('should not match a null-prototype object with wrong value types', () => {
      const obj: unknown = Object.assign(Object.create(null), { a: 'x' });

      const result = match(obj)
        .with(P.record(P.string, P.number), () => 'matched')
        .otherwise(() => 'no match');

      expect(result).toBe('no match');
    });
  });

  describe('records with undefined or null values', () => {
    it('should not match when a value is undefined and pattern expects string', () => {
      const result = match<Record<string, string | undefined>>({ a: undefined })
        .with(P.record(P.string, P.string), () => 'matched')
        .otherwise(() => 'no match');

      expect(result).toBe('no match');
    });

    it('should not match when a value is null and pattern expects number', () => {
      const result = match<Record<string, number | null>>({ a: null })
        .with(P.record(P.string, P.number), () => 'matched')
        .otherwise(() => 'no match');

      expect(result).toBe('no match');
    });

    it('should match a record with null/undefined values using P.nullish', () => {
      const result = match<Record<string, null | undefined>>({
        a: null,
        b: undefined,
      })
        .with(P.record(P.string, P.nullish), () => 'matched')
        .otherwise(() => 'no match');

      expect(result).toBe('matched');
    });
  });

  describe('named select in both key and value simultaneously', () => {
    it('should collect keys and values into separate named selections', () => {
      const input: unknown = { a: 1, b: 2 };

      const result = match(input)
        .with(
          P.record(P.string.select('keys'), P.number.select('values')),
          ({ keys, values }) => {
            type t1 = Expect<Equal<typeof keys, string[]>>;
            type t2 = Expect<Equal<typeof values, number[]>>;
            return { keys: [...keys].sort(), values: [...values].sort() };
          }
        )
        .otherwise(() => null);

      expect(result).toEqual({ keys: ['a', 'b'], values: [1, 2] });
    });

    it('selections are undefined for empty objects (no entries to iterate)', () => {
      // When a record is empty, recordEvery never calls the predicate, so
      // P.select() accumulation never runs — selections remain undefined.
      const input: unknown = {};

      const result = match(input)
        .with(
          P.record(P.string.select('keys'), P.number.select('values')),
          ({ keys, values }) => ({ keys, values })
        )
        .otherwise(() => null);

      expect(result).toEqual({ keys: undefined, values: undefined });
    });
  });

  describe('prototype properties are ignored', () => {
    it('should only check own properties, not inherited ones', () => {
      // toString, valueOf, etc. on Object.prototype are NOT own keys
      // Reflect.ownKeys only returns own properties
      class MyRecord {
        a = 1;
        b = 2;
      }

      const result = match(new MyRecord())
        .with(P.record(P.string, P.number), () => 'matched')
        .otherwise(() => 'no match');

      expect(result).toBe('matched');
    });
  });

  describe('runtime behavior of invalid key pattern (type system FIXME)', () => {
    it('P.array() in key position does not match non-empty objects at runtime', () => {
      // TypeScript currently does not error on P.array() as a key pattern (known FIXME).
      // At runtime: keys are strings, P.array() only matches arrays → each key check fails.
      const result = match<unknown>({ a: 1, b: 2 })
        .with(P.record(P.array(), P.number), () => 'matched')
        .otherwise(() => 'no match');

      expect(result).toBe('no match');
    });

    it('P.array() in key position matches empty objects (vacuously true)', () => {
      // recordEvery returns true when there are no entries to iterate
      const result = match<unknown>({})
        .with(P.record(P.array(), P.number), () => 'matched')
        .otherwise(() => 'no match');

      expect(result).toBe('matched');
    });
  });
});
