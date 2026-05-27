/**
 * Tests for combining multiple advanced features together:
 * P.select() + P.when() + P.intersection() + P.optional() + P.array()
 */
import { match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('combining advanced patterns', () => {
  describe('P.select() + guard (.with 3-arg form)', () => {
    it('should select values and apply a guard on the full input', () => {
      type Input = { score: number; name: string };
      const input: Input = { score: 95, name: 'Alice' };

      const result = match(input)
        .with(
          { score: P.select('score'), name: P.select('name') },
          (val) => val.score > 90,
          ({ score, name }) => `${name} passed with ${score}`
        )
        .otherwise(() => 'failed');

      expect(result).toBe('Alice passed with 95');
    });

    it('should not match when guard returns false', () => {
      type Input = { score: number; name: string };
      const result = match<Input>({ score: 40, name: 'Bob' })
        .with(
          { score: P.select('score'), name: P.select('name') },
          (val) => val.score > 90,
          ({ score, name }) => `${name} passed with ${score}`
        )
        .otherwise(() => 'failed');

      expect(result).toBe('failed');
    });

    it('should select anonymous value and apply a guard', () => {
      const result = match<number>(42)
        .with(
          P.select(),
          (n) => n > 10,
          (n) => `big: ${n}`
        )
        .otherwise(() => 'small');

      expect(result).toBe('big: 42');
    });
  });

  describe('P.select() + P.intersection()', () => {
    it('should select from an intersection pattern', () => {
      const result = match({ age: 25, role: 'admin' })
        .with(
          P.intersection({ age: P.number }, { role: P.select('role') }),
          ({ role }) => `role is ${role}`
        )
        .otherwise(() => 'no match');

      expect(result).toBe('role is admin');
    });

    it('should not match when intersection fails', () => {
      const result = match<{ age: number | string; role: string }>({
        age: 'not-a-number',
        role: 'admin',
      })
        .with(
          P.intersection({ age: P.number }, { role: P.select('role') }),
          ({ role }) => `role is ${role}`
        )
        .otherwise(() => 'no match');

      expect(result).toBe('no match');
    });
  });

  describe('P.select() + P.optional()', () => {
    it('should select an optional field that is present', () => {
      type Input = { name: string; age?: number };
      const result = match<Input>({ name: 'Bob', age: 30 })
        .with(
          { name: P.select('name'), age: P.optional(P.select('age')) },
          ({ name, age }) => `${name} is ${age}`
        )
        .otherwise(() => 'no match');

      expect(result).toBe('Bob is 30');
    });

    it('should select an optional field that is absent', () => {
      type Input = { name: string; age?: number };
      const result = match<Input>({ name: 'Bob' })
        .with(
          { name: P.select('name'), age: P.optional(P.select('age')) },
          ({ name, age }) => {
            type t = Expect<Equal<typeof age, number | undefined>>;
            return `${name} age=${age}`;
          }
        )
        .otherwise(() => 'no match');

      expect(result).toBe('Bob age=undefined');
    });
  });

  describe('P.array() + P.select()', () => {
    it('should select from array elements', () => {
      type Item = { value: number };
      const input: Item[] = [{ value: 1 }, { value: 2 }, { value: 3 }];

      const result = match(input)
        .with(P.array({ value: P.select('values') }), ({ values }) => {
          type t = Expect<Equal<typeof values, number[]>>;
          return values.reduce((a, b) => a + b, 0);
        })
        .otherwise(() => -1);

      expect(result).toBe(6);
    });

    it('should select from array elements with a guard on the full input', () => {
      type Item = { value: number };
      const input: Item[] = [{ value: 1 }, { value: 2 }, { value: 3 }];

      const result = match(input)
        .with(
          P.array({ value: P.select('values') }),
          (items) => items.every((item) => item.value > 0),
          ({ values }) => values.reduce((a, b) => a + b, 0)
        )
        .otherwise(() => -1);

      expect(result).toBe(6);
    });

    it('should fall through to otherwise when guard fails', () => {
      type Item = { value: number };
      const input: Item[] = [{ value: 1 }, { value: -1 }];

      const result = match(input)
        .with(
          P.array({ value: P.select('values') }),
          (items) => items.every((item) => item.value > 0),
          ({ values }) => values.reduce((a, b) => a + b, 0)
        )
        .otherwise(() => -1);

      expect(result).toBe(-1);
    });
  });

  describe('P.select() + P.union()', () => {
    it('should select a value matched by a union pattern', () => {
      type Input = { type: 'a'; value: number } | { type: 'b'; value: string };

      const result = match<Input>({ type: 'a', value: 42 })
        .with(
          { type: P.union('a', 'b'), value: P.select() },
          (value) => value
        )
        .otherwise(() => null);

      type t = Expect<Equal<typeof result, number | string | null>>;
      expect(result).toBe(42);
    });
  });

  describe('P.not() + P.select() via P.intersection()', () => {
    it('should match and select a value not equal to a literal', () => {
      const result = match<number>(5)
        .with(P.intersection(P.not(0), P.select()), (n) => `not zero: ${n}`)
        .otherwise(() => 'is zero');

      expect(result).toBe('not zero: 5');
    });

    it('should fall through when P.not() does not match', () => {
      const result = match<number>(0)
        .with(P.intersection(P.not(0), P.select()), (n) => `not zero: ${n}`)
        .otherwise(() => 'is zero');

      expect(result).toBe('is zero');
    });

    it('note: multiple patterns per .with() are OR conditions', () => {
      // P.not(0) OR P.select() — P.select() matches everything, so this always matches
      const result = match<number>(0)
        .with(P.not(0), P.select(), (n) => `matched: ${n}`)
        .otherwise(() => 'fallback');

      expect(result).toBe('matched: 0'); // 0 matches because P.select() is always true
    });
  });

  describe('nested P.select() + guard', () => {
    it('should select from nested objects with a top-level guard', () => {
      type Order = {
        user: { id: number; name: string };
        total: number;
      };

      const input: Order = { user: { id: 1, name: 'Alice' }, total: 200 };

      const result = match(input)
        .with(
          { user: { name: P.select('name') }, total: P.select('total') },
          (order) => order.total > 100,
          ({ name, total }) => `${name}: $${total}`
        )
        .otherwise(() => 'no match');

      expect(result).toBe('Alice: $200');
    });

    it('should not match when nested guard fails', () => {
      type Order = { user: { name: string }; total: number };
      const result = match<Order>({ user: { name: 'Bob' }, total: 50 })
        .with(
          { user: { name: P.select('name') }, total: P.select('total') },
          (order) => order.total > 100,
          ({ name, total }) => `${name}: $${total}`
        )
        .otherwise(() => 'no match');

      expect(result).toBe('no match');
    });
  });
});
