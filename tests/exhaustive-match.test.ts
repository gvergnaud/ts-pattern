import { match, not, Pattern, select, when, __ } from '../src';
import { Option, some, none, BigUnion } from './utils';

describe('exhaustive()', () => {
  describe('should exclude matched patterns from subsequent `.with()` clauses', () => {
    it('string literals', () => {
      type Input = 'a' | 'b' | 'c';
      const input = 'b' as Input;

      match(input)
        .with('b', (x) => {
          const check: 'b' = x;
          return 1;
        })
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with('a', (x) => 1)
        .with('b', (x) => 1)
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with('a', (x) => {
          const check: 'a' = x;
          return 1;
        })
        .with('b', (x) => {
          const check: 'b' = x;
          return 2;
        })
        // @ts-expect-error
        .exhaustive();

      match(input)
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
        .exhaustive();
    });

    it('number literals', () => {
      type Input = 1 | 2 | 3;
      const input = 2 as Input;

      match(input)
        .with(2, (x) => {
          const check: 2 = x;
          return 2;
        })
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with(1, (x) => 1)
        .with(2, () => 3)
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with(1, (x) => {
          const check: 1 = x;
          return 1;
        })
        .with(2, (x) => {
          const check: 2 = x;
          return 2;
        })
        // @ts-expect-error
        .exhaustive();

      match(input)
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
        .exhaustive();
    });

    it('boolean literals', () => {
      type Input =
        | [true, true]
        | [false, true]
        | [false, false]
        | [true, false];
      const input = [true, true] as Input;

      match(input)
        .with([true, true], () => true)
        .with([false, true], () => false)
        .with([true, false], () => false)
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with([true, true], () => true)
        .with([false, true], () => false)
        .with([true, false], () => false)
        .with([false, false], () => false)
        .exhaustive();
    });

    it('boolean literals', () => {
      type Input = [boolean, boolean];
      const input = [true, true] as Input;

      match(input)
        .with([true, true], () => true)
        .with([false, true], () => false)
        .with([true, false], () => false)
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with([true, true], () => true)
        .with([false, true], () => false)
        .with([true, false], () => false)
        .with([false, false], () => false)
        .exhaustive();
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
        .with({ type: 1 }, (x) => 1)
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with({ type: 1 }, (x) => 1)
        .with({ type: 'two' }, (x) => 2)
        // @ts-expect-error
        .exhaustive();

      match(input)
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
        .exhaustive();

      match<Option<number>>({ kind: 'some', value: 3 })
        .with({ kind: 'some' }, ({ value }) => value)
        .with({ kind: 'none' }, () => 0)
        .exhaustive();

      match<Option<number>>({ kind: 'some', value: 3 })
        .with({ kind: 'some', value: 3 as const }, ({ value }): number => value)
        .with({ kind: 'none' }, () => 0)
        // @ts-expect-error: missing {kind: 'some', value: number}
        .exhaustive();
    });

    it('union of tuples', () => {
      type Input = [1, number] | ['two', string] | [3, boolean];
      const input = [1, 3] as Input;

      match(input)
        .with([1, __], (x) => 1)
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with([1, __], (x) => 1)
        .with(['two', __], (x) => 2)
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with([1, __], (x) => 1)
        .with(['two', __], ([_, data]) => data.length)
        .with([3, __], () => 3)
        .exhaustive();

      match(input)
        .with([1, __], (x) => 1)
        .with(['two', 'Hey'], ([_, data]) => data.length)
        .with(['two', __], ([_, data]) => data.length)
        .with([3, __], () => 3)
        .exhaustive();
    });

    it('deeply nested 1', () => {
      type Input =
        | [1, Option<number>]
        | ['two', Option<string>]
        | [3, Option<boolean>];
      const input = [1, { kind: 'some', value: 3 }] as Input;

      match(input)
        .with([1, { kind: 'some' }], (x) => 1)
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with([1, __], (x) => 1)
        .with(['two', __], (x) => 2)
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with([1, __], (x) => 1)
        .with(['two', { kind: 'some' }], ([_, { value }]) => value.length)
        .with([3, __], () => 3)
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with(['two', { kind: 'some' }], ([_, { value }]) => value.length)
        .with(['two', { kind: 'none' }], () => 4)
        .with([1, __], () => 3)
        .with([3, __], () => 3)
        .exhaustive();
    });

    it('deeply nested 2', () => {
      type Input = ['two', Option<string>];
      const input = ['two', { kind: 'some', value: 'hello' }] as Input;

      match(input)
        .with(['two', { kind: 'some' }], ([_, { value }]) => value.length)
        .with(['two', { kind: 'none' }], () => 4)
        .exhaustive();
    });

    it('should work with non-unions', () => {
      match<number>(2)
        .with(2, () => 'two')
        .with(3, () => 'three')
        // @ts-expect-error
        .exhaustive();

      match<number>(2)
        .with(2, () => 'two')
        .with(3, () => 'three')
        .with(__.number, () => 'something else')
        .exhaustive();

      match<string>('Hello')
        .with('Hello', () => 'english')
        .with('Bonjour', () => 'french')
        // @ts-expect-error
        .exhaustive();

      match<string>('Hello')
        .with('Hello', () => 'english')
        .with('Bonjour', () => 'french')
        .with(__, (c) => 'something else')
        .exhaustive();
    });

    it('should work with object properties union', () => {
      type Input = { value: 'a' | 'b' };
      const input = { value: 'a' } as Input;

      match(input)
        .with({ value: 'a' }, (x) => 1)
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with({ value: __ }, (x) => 1)
        .exhaustive();

      match(input)
        .with({ value: 'a' }, (x) => 1)
        .with({ value: 'b' }, (x) => 1)
        .exhaustive();
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
        .with({ type: 'a' }, (x) => x.items)
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with({ type: 'a' }, (x) => x.items)
        .with({ type: 'b', items: [{ data: __.string }] }, (x) => [])
        .exhaustive();

      match(input)
        .with({ type: 'a', items: [__] }, (x) => x.items)
        .with({ type: 'b', items: [{ data: __.string }] }, (x) => [])
        .exhaustive();

      match<Input>(input)
        .with({ type: 'a', items: [{ some: __ }] }, (x) => x.items)
        .with({ type: 'b', items: [{ data: __.string }] }, (x) => [])
        // @ts-expect-error
        .exhaustive();
    });

    it('should work with Sets', () => {
      type Input = Set<string> | Set<number>;
      const input = new Set(['']) as Input;

      match(input)
        .with(new Set([__.string]), (x) => x)
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with(new Set([__.string]), (x) => x)
        .with(new Set([__.number]), (x) => new Set([]))
        .exhaustive();
    });

    it('should work with Sets', () => {
      type Input = Set<string> | Set<number>;
      const input = new Set(['']) as Input;

      expect(
        match(input)
          .with(new Set([__.string]), (x) => x)
          // @ts-expect-error
          .exhaustive()
      ).toEqual(input);

      expect(
        match(input)
          .with(new Set([__.string]), (x) => 1)
          .with(new Set([__.number]), (x) => 2)
          .exhaustive()
      ).toEqual(1);
    });

    it('should work with Maps', () => {
      type Input = Map<string, 1 | 2 | 3>;
      const input = new Map([['hello', 1]]) as Input;

      expect(
        match(input)
          .with(new Map([['hello' as const, __.number]]), (x) => x)
          // @ts-expect-error
          .exhaustive()
      ).toEqual(input);

      expect(
        match(input)
          .with(new Map([['hello' as const, 1 as const]]), (x) => x)
          // @ts-expect-error
          .exhaustive()
      ).toEqual(input);

      expect(
        match(input)
          .with(new Map([['hello', 1 as const]]), (x) => x)
          // @ts-expect-error
          .exhaustive()
      ).toEqual(input);

      match(input)
        .with(__, (x) => x)
        .exhaustive();
    });

    it('should work with structures with a lot of unions', () => {
      type X = 1 | 2 | 3 | 4 | 5 | 6 | 7;
      // This structures has 7 ** 9 = 40353607 possibilities
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
        .with({ b: 1 }, () => 'otherwise')
        .with({ b: 2 }, () => 'b = 2')
        .with({ b: 3 }, () => 'otherwise')
        .with({ b: 4 }, () => 'otherwise')
        .with({ b: 5 }, () => 'otherwise')
        .with({ b: 6 }, () => 'otherwise')
        .with({ b: 7 }, () => 'otherwise')
        .exhaustive();

      match<{
        a: X;
        b: X;
        c: X;
      }>({ a: 1, b: 1, c: 1 })
        .with({ a: not(1) }, () => 'a != 1')
        .with({ a: 1 }, () => 'a != 1')
        .exhaustive();

      match<{
        a: BigUnion;
        b: BigUnion;
      }>({ a: 'a', b: 'b' })
        .with({ a: 'a' }, () => 0)
        .with({ a: 'b' }, () => 0)
        .with({ a: 'c' }, (x) => 0)
        .with({ a: 'd' }, () => 0)
        .with({ a: 'e' }, (x) => 0)
        .with({ a: 'f', b: __ }, (x) => 0)
        .with({ a: __ }, (x) => 0)
        .exhaustive();
    });

    it('should work with generics', () => {
      const last = <a>(xs: a[]) =>
        match<a[], Option<a>>(xs)
          .with([], () => none)
          .with(__, (xs) => some(xs[xs.length - 1]))
          .exhaustive();

      expect(last([1, 2, 3])).toEqual(some(3));
    });

    it('should work with inputs of varying shapes', () => {
      type Input = { type: 'test' } | ['hello', Option<string>] | 'hello'[];
      const input = { type: 'test' } as Input;

      expect(
        match(input)
          .with(['hello', { kind: 'some' }], ([, { value }]) => {
            return value;
          })
          .with(['hello'], ([str]) => {
            return str;
          })
          .with({ type: __ }, (x) => x.type)
          .with([__], (x) => `("hello" | Option<string>)[] | "hello"[]`)
          .exhaustive()
      ).toEqual('test');
    });

    it('should infer literals as literal types', () => {
      type Input = { type: 'video'; duration: number };

      match<Input>({ type: 'video', duration: 10 })
        .with({ type: 'video', duration: 10 }, (x) => '')
        // @ts-expect-error
        .exhaustive();

      let n: number = 10;
      match<number>(n)
        .with(10, (x) => '')
        // @ts-expect-error
        .exhaustive();
    });
  });

  it('v3', () => {
    type Input =
      | { type: 'text'; text: string; author: { name: string } }
      | { type: 'video'; duration: number; src: string }
      | {
          type: 'movie';
          duration: number;
          author: { name: string };
          src: string;
          title: string;
        }
      | { type: 'picture'; src: string };

    match<Input>({ type: 'text', text: 'Hello', author: { name: 'Gabriel' } })
      .with(
        {
          type: 'text',
          text: select,
          author: { name: select.as('authorName') },
        },
        (text, { authorName }) => `${text} from ${authorName}`
      )
      // if when isn't a type guard, this pattern is ignored, we don't exclude
      .with({ type: 'video', duration: when((x) => x > 10) }, () => '')
      // this catches every number
      .with(
        {
          type: 'video',
          duration: when((x): x is number => typeof x === 'number'),
        },
        () => ''
      )
      // if a property is a literal but the input type for this property
      // is not a literal type, ignore this pattern because we can't narrow the type
      .with({ type: 'movie', duration: 10 }, () => '')
      // with `as const` we can narrow the type, so this pattern isn't ignored
      .with({ type: 'movie', duration: 10 as const }, () => '')

      //  Selection API:
      // I think this is a the best options: number literals for arguments position, and strings for kwargs
      .with(
        { type: 'movie', duration: 10, author: select(0), title: select(1) },
        (author, title) => ''
      )
      // by default, select the first arg
      .with(
        { type: 'video', duration: when((x) => x > 10), title: select },
        (title) => ''
      )
      .with({ type: 'picture' }, () => '')
      // This is a type error, because `type picture` has already been handled
      .with({ type: 'picture' }, () => '')
      // this replaces run()
      .exhaustive();
  });
});
