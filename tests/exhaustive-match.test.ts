import { match, not, when, __ } from '../src';
import { DeepExclude } from '../src/types/DeepExclude';
import { DistributeMatchingUnions } from '../src/types/DistributeUnions';
import { InvertNotPattern } from '../src/types/InvertPattern';
import { NotPattern } from '../src/types/Pattern';
import { Option, some, none } from './utils';

describe('exhaustive()', () => {
  it('should forbid using guard function, in pattern or as extra args', () => {
    match<Option<number>>({ kind: 'some', value: 3 })
      .exhaustive()
      .with(
        {
          kind: 'some',
          // @ts-expect-error
          value: when((x) => x > 2),
        },
        () => true
      )
      .run();

    match<Option<number>>({ kind: 'some', value: 3 })
      .exhaustive()
      .with(
        { kind: 'some' },
        ({ value }) => value > 2,
        // @ts-expect-error
        () => true
      )
      // @ts-expect-error
      .run();
  });

  describe('should exclude matched patterns from subsequent `.with()` clauses', () => {
    it('string literals', () => {
      type Input = 'a' | 'b' | 'c';
      const input = 'b' as Input;

      match(input)
        .exhaustive()
        .with('b', (x) => {
          const check: 'b' = x;
          return 1;
        })
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with('a', (x) => 1)
        .with('b', (x) => 1)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with('a', (x) => {
          const check: 'a' = x;
          return 1;
        })
        .with('b', (x) => {
          const check: 'b' = x;
          return 2;
        })
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with('a', (x) => {
          const check: 'a' = x;
          return 1;
        })
        .with('b', (x) => {
          const check: 'b' = x;
          return 2;
        })
        .with('c', (x) => {
          const check: 'c' = x;
          return 2;
        })
        .run();
    });

    it('number literals', () => {
      type Input = 1 | 2 | 3;
      const input = 2 as Input;

      match(input)
        .exhaustive()
        .with(2, (x) => {
          const check: 2 = x;
          return 2;
        })
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with(1, (x) => 1)
        .with(2, () => 3)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with(1, (x) => {
          const check: 1 = x;
          return 1;
        })
        .with(2, (x) => {
          const check: 2 = x;
          return 2;
        })
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with(1, (x) => {
          const check: 1 = x;
          return 1;
        })
        .with(2, (x) => {
          const check: 2 = x;
          return 2;
        })
        .with(3, (x) => {
          const check: 3 = x;
          return 2;
        })
        .run();
    });

    it('boolean literals', () => {
      type Input =
        | [true, true]
        | [false, true]
        | [false, false]
        | [true, false];
      const input = [true, true] as Input;

      match(input)
        .exhaustive()
        .with([true, true], () => true)
        .with([false, true], () => false)
        .with([true, false], () => false)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with([true, true], () => true)
        .with([false, true], () => false)
        .with([true, false], () => false)
        .with([false, false], () => false)
        .run();
    });

    it('boolean literals', () => {
      type Input = [boolean, boolean];
      const input = [true, true] as Input;

      match(input)
        .exhaustive()
        .with([true, true], () => true)
        .with([false, true], () => false)
        .with([true, false], () => false)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with([true, true], () => true)
        .with([false, true], () => false)
        .with([true, false], () => false)
        .with([false, false], () => false)
        .run();
    });

    it('union of objects', () => {
      type Input =
        | { type: 1; data: number }
        | { type: 'two'; data: string }
        | { type: 3; data: boolean }
        | { type: 4 }
        | { type: 'a' }
        | { type: 'b' }
        | { type: 'c' }
        | { type: 'd' }
        | { type: 'e' }
        | { type: 'f' }
        | { type: 'g' }
        | { type: 'h' }
        | { type: 'i' }
        | { type: 'j' }
        | { type: 'k' }
        | { type: 'l' }
        | { type: 'm' }
        | { type: 'n' }
        | { type: 'o' }
        | { type: 'p' };
      const input = { type: 1, data: 2 } as Input;

      match(input)
        .exhaustive()
        .with({ type: 1 }, (x) => 1)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with({ type: 1 }, (x) => 1)
        .with({ type: 'two' }, (x) => 2)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with({ type: 1 }, (x) => 1)
        .with({ type: 'two' }, ({ data }) => data.length)
        .with({ type: 3 }, () => 3)
        .with({ type: 4 }, () => 3)
        .with({ type: 'a' }, () => 0)
        .with({ type: 'b' }, () => 0)
        .with({ type: 'c' }, () => 0)
        .with({ type: 'd' }, () => 0)
        .with({ type: 'e' }, () => 0)
        .with({ type: 'f' }, () => 0)
        .with({ type: 'g' }, () => 0)
        .with({ type: 'h' }, () => 0)
        .with({ type: 'i' }, () => 0)
        .with({ type: 'j' }, () => 0)
        .with({ type: 'k' }, () => 0)
        .with({ type: 'l' }, () => 0)
        .with({ type: 'm' }, () => 0)
        .with({ type: 'n' }, () => 0)
        .with({ type: 'o' }, () => 0)
        .with({ type: 'p' }, () => 0)
        .run();

      match<Option<number>>({ kind: 'some', value: 3 })
        .exhaustive()
        .with({ kind: 'some' }, ({ value }) => value)
        .with({ kind: 'none' }, () => 0)
        .run();
    });

    it('union of tuples', () => {
      type Input = [1, number] | ['two', string] | [3, boolean];
      const input = [1, 3] as Input;

      match(input)
        .exhaustive()
        .with([1, __], (x) => 1)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with([1, __], (x) => 1)
        .with(['two', __], (x) => 2)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with([1, __], (x) => 1)
        .with(['two', __], ([_, data]) => data.length)
        .with([3, __], () => 3)
        .run();

      match(input)
        .exhaustive()
        .with([1, __], (x) => 1)
        .with(['two', 'Hey'], ([_, data]) => data.length)
        .with(['two', __], ([_, data]) => data.length)
        .with([3, __], () => 3)
        .run();
    });

    it('deeply nested 1', () => {
      type Input =
        | [1, Option<number>]
        | ['two', Option<string>]
        | [3, Option<boolean>];
      const input = [1, { kind: 'some', value: 3 }] as Input;

      match(input)
        .exhaustive()
        .with([1, { kind: 'some' }], (x) => 1)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with([1, __], (x) => 1)
        .with(['two', __], (x) => 2)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with([1, __], (x) => 1)
        .with(['two', { kind: 'some' }], ([_, { value }]) => value.length)
        .with([3, __], () => 3)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with(['two', { kind: 'some' }], ([_, { value }]) => value.length)
        .with(['two', { kind: 'none' }], () => 4)
        .with([1, __], () => 3)
        .with([3, __], () => 3)
        .run();
    });

    it('deeply nested 2', () => {
      type Input = ['two', Option<string>];
      const input = ['two', { kind: 'some', value: 'hello' }] as Input;

      match(input)
        .exhaustive()
        .with(['two', { kind: 'some' }], ([_, { value }]) => value.length)
        .with(['two', { kind: 'none' }], () => 4)
        .run();
    });

    it('should work with non-unions', () => {
      match<number>(2)
        .exhaustive()
        .with(2, () => 'two')
        .with(3, () => 'three')
        // @ts-expect-error
        .run();

      match<number>(2)
        .exhaustive()
        .with(2, () => 'two')
        .with(3, () => 'three')
        .with(__.number, () => 'something else')
        .run();

      match<string>('Hello')
        .exhaustive()
        .with('Hello', () => 'english')
        .with('Bonjour', () => 'french')
        // @ts-expect-error
        .run();

      match<string>('Hello')
        .exhaustive()
        .with('Hello', () => 'english')
        .with('Bonjour', () => 'french')
        .with(__, (c) => 'something else')
        .run();
    });

    it('should work with object properties union', () => {
      type Input = { value: 'a' | 'b' };
      const input = { value: 'a' } as Input;

      match(input)
        .exhaustive()
        .with({ value: 'a' }, (x) => 1)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with({ value: __ }, (x) => 1)
        .run();

      match(input)
        .exhaustive()
        .with({ value: 'a' }, (x) => 1)
        .with({ value: 'b' }, (x) => 1)
        .run();
    });

    it('should work with lists', () => {
      type Input =
        | {
            type: 'a';
            items: ({ some: string; data: number } | string)[];
          }
        | {
            type: 'b';
            items: { other: boolean; data: string }[];
          };

      const input = {
        type: 'a',
        items: [{ some: 'hello', data: 42 }],
      } as Input;

      match(input)
        .exhaustive()
        .with({ type: 'a' }, (x) => x.items)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with({ type: 'a' }, (x) => x.items)
        .with({ type: 'b', items: [{ data: __.string }] }, (x) => [])
        .run();

      match(input)
        .exhaustive()
        .with({ type: 'a', items: [__] }, (x) => x.items)
        .with({ type: 'b', items: [{ data: __.string }] }, (x) => [])
        .run();

      match<Input>(input)
        .exhaustive()
        .with({ type: 'a', items: [{ some: __ }] }, (x) => x.items)
        .with({ type: 'b', items: [{ data: __.string }] }, (x) => [])
        // @ts-expect-error
        .run();
    });

    it('should work with Sets', () => {
      type Input = Set<string> | Set<number>;
      const input = new Set(['']) as Input;

      match(input)
        .exhaustive()
        .with(new Set([__.string]), (x) => x)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with(new Set([__.string]), (x) => x)
        .with(new Set([__.number]), (x) => new Set([]))
        .run();
    });

    it('should work with Sets', () => {
      type Input = Set<string> | Set<number>;
      const input = new Set(['']) as Input;

      expect(
        match(input)
          .exhaustive()
          .with(new Set([__.string]), (x) => x)
          // @ts-expect-error
          .run()
      ).toEqual(input);

      expect(
        match(input)
          .exhaustive()
          .with(new Set([__.string]), (x) => 1)
          .with(new Set([__.number]), (x) => 2)
          .run()
      ).toEqual(1);
    });

    it('should work with Maps', () => {
      type Input = Map<string, 1 | 2 | 3>;
      const input = new Map([['hello', 1]]) as Input;

      expect(
        match(input)
          .exhaustive()
          .with(new Map([['hello' as const, __.number]]), (x) => x)
          // @ts-expect-error
          .run()
      ).toEqual(input);

      expect(
        match(input)
          .exhaustive()
          .with(new Map([['hello', 1 as const]]), (x) => x)
          // @ts-expect-error
          .run()
      ).toEqual(input);

      expect(
        match(input)
          .exhaustive()
          .with(new Map([['hello', 1 as const]]), (x) => x)
          // @ts-expect-error
          .run()
      ).toEqual(input);

      match(input)
        .exhaustive()
        .with(__, (x) => x)
        .run();
    });

    it('should work with structures with a lot of unions', () => {
      type X = 1 | 2 | 3 | 4 | 5 | 6 | 7;
      // This structures has 7 ** 3 = 343 possibilities
      match<{
        a: X;
        b: X;
        c: X;
        d: X;
        e: X;
        f: X;
        g: X;
        h: X;
        i: X;
      }>({ a: 1, b: 1, c: 1, d: 1, e: 1, f: 1, g: 1, h: 1, i: 1 })
        .exhaustive()
        .with({ a: 1 }, () => 'a = 1')
        .with({ c: 1 }, () => 'c = 1')
        .with({ b: 1 }, () => 'otherwise')
        .with({ b: 2 }, () => 'b = 2')
        .with({ b: 3 }, () => 'otherwise')
        .with({ b: 4 }, () => 'otherwise')
        .with({ b: 5 }, () => 'otherwise')
        .with({ b: 6 }, () => 'otherwise')
        .with({ b: 7 }, () => 'otherwise')
        .run();

      match<{
        a: X;
        b: X;
        c: X;
      }>({ a: 1, b: 1, c: 1 })
        .exhaustive()
        .with({ a: not(1) }, () => 'a != 1')
        .with({ a: 1 }, () => 'a != 1')
        .run();
    });

    it('should work with generics', () => {
      const last = <a>(xs: a[]) =>
        match<a[], Option<a>>(xs)
          .exhaustive()
          .with([], () => none)
          .with(__, (xs) => some(xs[xs.length - 1]))
          .run();

      expect(last([1, 2, 3])).toEqual(some(3));
    });

    it('should work with inputs of varying shapes', () => {
      type Input = { type: 'test' } | ['hello', Option<string>] | 'hello'[];
      type Output = ['hello', Option<string>];
      const input = { type: 'test' } as Input;

      const output = match(input)
        .exhaustive()
        .with(
          ['hello', { kind: 'some' }],
          (x): Output => {
            return x;
          }
        )
        .with(['hello'], (x) => {
          return ['hello', none];
        })
        .with({ type: __ }, () => ['hello', none])
        .with([__], () => ['hello', none])
        .run();
    });
  });
});
