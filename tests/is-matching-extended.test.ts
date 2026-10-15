/**
 * Extended tests for isMatching not covered by is-matching.test.ts:
 * - All primitive wildcards
 * - P.not, P.when as patterns
 * - P.optional patterns
 * - String and number predicates
 * - Tuple patterns
 * - P.instanceOf
 * - Set and Map patterns
 * - P.select behavior (selections ignored, only boolean returned)
 * - Composing multiple isMatching checks
 */
import { isMatching, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('isMatching extended', () => {
  describe('primitive wildcards', () => {
    it('P.string', () => {
      expect(isMatching(P.string)('hello')).toBe(true);
      expect(isMatching(P.string)(42)).toBe(false);
      expect(isMatching(P.string)(null)).toBe(false);
    });

    it('P.number', () => {
      expect(isMatching(P.number)(42)).toBe(true);
      expect(isMatching(P.number)('hello')).toBe(false);
      expect(isMatching(P.number)(NaN)).toBe(true); // NaN is typeof 'number'
    });

    it('P.boolean', () => {
      expect(isMatching(P.boolean)(true)).toBe(true);
      expect(isMatching(P.boolean)(false)).toBe(true);
      expect(isMatching(P.boolean)(0)).toBe(false);
    });

    it('P.bigint', () => {
      expect(isMatching(P.bigint)(42n)).toBe(true);
      expect(isMatching(P.bigint)(42)).toBe(false);
    });

    it('P.symbol', () => {
      expect(isMatching(P.symbol)(Symbol('x'))).toBe(true);
      expect(isMatching(P.symbol)('x')).toBe(false);
    });

    it('P.nullish', () => {
      expect(isMatching(P.nullish)(null)).toBe(true);
      expect(isMatching(P.nullish)(undefined)).toBe(true);
      expect(isMatching(P.nullish)(0)).toBe(false);
      expect(isMatching(P.nullish)('')).toBe(false);
    });

    it('P._ (wildcard) matches everything', () => {
      expect(isMatching(P._)('anything')).toBe(true);
      expect(isMatching(P._)(null)).toBe(true);
      expect(isMatching(P._)(undefined)).toBe(true);
      expect(isMatching(P._)(0)).toBe(true);
    });
  });

  describe('P.not', () => {
    it('should return true when value does not match the inner pattern', () => {
      expect(isMatching(P.not(0))(1)).toBe(true);
      expect(isMatching(P.not(0))(0)).toBe(false);
    });

    it('should work with wildcard inner patterns', () => {
      expect(isMatching(P.not(P.string))(42)).toBe(true);
      expect(isMatching(P.not(P.string))('hello')).toBe(false);
    });

    it('should narrow the type in an if-guard', () => {
      const value: unknown = 42;
      if (isMatching(P.not(P.string))(value)) {
        expect(typeof value).not.toBe('string');
      }
    });
  });

  describe('P.when', () => {
    it('should return true when the type predicate matches', () => {
      const isLargeNumber = isMatching(
        P.when((v): v is number => typeof v === 'number' && v > 10)
      );
      expect(isLargeNumber(42)).toBe(true);
      expect(isLargeNumber(5)).toBe(false);
      expect(isLargeNumber('hello')).toBe(false);
    });

    it('should narrow to the predicate type', () => {
      const value: unknown = 42;
      const isNumber = isMatching(
        P.when((v): v is number => typeof v === 'number')
      );
      if (isNumber(value)) {
        type t = Expect<Equal<typeof value, number>>;
        expect(value + 1).toBe(43);
      }
    });
  });

  describe('P.optional', () => {
    it('should match when the field is present', () => {
      expect(isMatching({ age: P.optional(P.number) })({ age: 30 })).toBe(true);
    });

    it('should match when the optional field is absent', () => {
      expect(isMatching({ age: P.optional(P.number) })({})).toBe(true);
    });

    it('should not match when the field has the wrong type', () => {
      expect(isMatching({ age: P.optional(P.number) })({ age: 'old' })).toBe(false);
    });
  });

  describe('string predicates', () => {
    it('P.string.startsWith()', () => {
      expect(isMatching(P.string.startsWith('hello'))('hello world')).toBe(true);
      expect(isMatching(P.string.startsWith('hello'))('world')).toBe(false);
    });

    it('P.string.endsWith()', () => {
      expect(isMatching(P.string.endsWith('.ts'))('index.ts')).toBe(true);
      expect(isMatching(P.string.endsWith('.ts'))('index.js')).toBe(false);
    });

    it('P.string.includes()', () => {
      expect(isMatching(P.string.includes('foo'))('foobar')).toBe(true);
      expect(isMatching(P.string.includes('foo'))('barbaz')).toBe(false);
    });

    it('P.string.regex()', () => {
      expect(isMatching(P.string.regex(/^\d+$/))('123')).toBe(true);
      expect(isMatching(P.string.regex(/^\d+$/))('abc')).toBe(false);
    });
  });

  describe('number predicates', () => {
    it('P.number.gt()', () => {
      expect(isMatching(P.number.gt(10))(11)).toBe(true);
      expect(isMatching(P.number.gt(10))(10)).toBe(false);
    });

    it('P.number.lt()', () => {
      expect(isMatching(P.number.lt(10))(9)).toBe(true);
      expect(isMatching(P.number.lt(10))(10)).toBe(false);
    });

    it('P.number.between()', () => {
      expect(isMatching(P.number.between(1, 10))(5)).toBe(true);
      expect(isMatching(P.number.between(1, 10))(0)).toBe(false);
      expect(isMatching(P.number.between(1, 10))(11)).toBe(false);
    });

    it('P.number.int()', () => {
      expect(isMatching(P.number.int())(5)).toBe(true);
      expect(isMatching(P.number.int())(5.5)).toBe(false);
    });

    it('P.number.positive()', () => {
      expect(isMatching(P.number.positive())(1)).toBe(true);
      expect(isMatching(P.number.positive())(-1)).toBe(false);
      expect(isMatching(P.number.positive())(0)).toBe(false);
    });

    it('P.number.negative()', () => {
      expect(isMatching(P.number.negative())(-1)).toBe(true);
      expect(isMatching(P.number.negative())(1)).toBe(false);
    });
  });

  describe('tuple patterns', () => {
    it('should match a fixed-length tuple', () => {
      const isPair = isMatching([P.string, P.number] as const);
      expect(isPair(['hello', 42])).toBe(true);
      expect(isPair(['hello', 'world'])).toBe(false);
      expect(isPair(['hello'])).toBe(false);
    });

    it('should match nested tuples', () => {
      const isNested = isMatching([P.string, [P.number, P.boolean]] as const);
      expect(isNested(['hi', [1, true]])).toBe(true);
      expect(isNested(['hi', [1, 1]])).toBe(false);
    });

    it('should work as a type guard narrowing the element types', () => {
      const value: unknown = ['hello', 42];
      const isTuple = isMatching([P.string, P.number] as const);
      if (isTuple(value)) {
        type t = Expect<Equal<typeof value, [string, number]>>;
        expect(value[0]).toBe('hello');
      }
    });
  });

  describe('P.instanceOf', () => {
    it('should return true when value is an instance of the class', () => {
      const isError = isMatching(P.instanceOf(Error));
      const isDate = isMatching(P.instanceOf(Date));
      expect(isError(new Error('oops'))).toBe(true);
      expect(isDate(new Date())).toBe(true);
    });

    it('should return false when value is not an instance', () => {
      const isError = isMatching(P.instanceOf(Error));
      const isDate = isMatching(P.instanceOf(Date));
      expect(isError(new Date())).toBe(false);
      expect(isDate(new Error('oops'))).toBe(false);
    });

    it('should match subclasses', () => {
      class CustomError extends Error {}
      const isError = isMatching(P.instanceOf(Error));
      const isCustom = isMatching(P.instanceOf(CustomError));
      expect(isError(new CustomError())).toBe(true);
      expect(isCustom(new Error())).toBe(false);
    });
  });

  describe('Set patterns', () => {
    it('should match a set with the correct element type', () => {
      const isNumberSet = isMatching(P.set(P.number));
      expect(isNumberSet(new Set([1, 2, 3]))).toBe(true);
      expect(isNumberSet(new Set([1, 'two', 3]))).toBe(false);
    });

    it('should not match non-Set values', () => {
      const isNumberSet = isMatching(P.set(P.number));
      expect(isNumberSet([1, 2, 3])).toBe(false);
    });
  });

  describe('Map patterns', () => {
    it('should match a map with the correct key/value types', () => {
      const isStringNumberMap = isMatching(P.map(P.string, P.number));
      expect(isStringNumberMap(new Map([['a', 1], ['b', 2]]))).toBe(true);
      expect(
        isStringNumberMap(new Map<string, string | number>([['a', 1], ['b', 'x']]))
      ).toBe(false);
    });

    it('should not match non-Map values', () => {
      const isStringNumberMap = isMatching(P.map(P.string, P.number));
      expect(isStringNumberMap({ a: 1 })).toBe(false);
    });
  });

  describe('P.select behavior', () => {
    it('should return boolean (selections are not surfaced by isMatching)', () => {
      const hasNameAndAge = isMatching({
        name: P.string.select('name'),
        age: P.number.select('age'),
      });
      const result = hasNameAndAge({ name: 'Alice', age: 30 });
      type t = Expect<Equal<typeof result, boolean>>;
      expect(result).toBe(true);
    });

    it('should return false when a selected field does not match', () => {
      const hasName = isMatching({ name: P.string.select() });
      expect(hasName({ name: 42 })).toBe(false);
    });
  });

  describe('composing isMatching guards', () => {
    it('should work with Array.filter', () => {
      const isActiveUser = isMatching({ active: true, name: P.string });
      const users: unknown[] = [
        { name: 'Alice', active: true },
        { name: 'Bob', active: false },
        { name: 'Charlie', active: true },
        { name: 42, active: true },
      ];
      expect(users.filter(isActiveUser)).toEqual([
        { name: 'Alice', active: true },
        { name: 'Charlie', active: true },
      ]);
    });

    it('should work with Array.find', () => {
      const isError = isMatching(P.instanceOf(Error));
      const values: unknown[] = [1, 'hello', new Error('found'), null];
      expect(values.find(isError)).toBeInstanceOf(Error);
    });

    it('should combine two guards with logical AND', () => {
      const isString = isMatching(P.string);
      const hasAt = isMatching(P.string.includes('@'));
      const value: unknown = 'user@example.com';
      expect(isString(value) && hasAt(value)).toBe(true);
    });
  });
});
