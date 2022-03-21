import { match, P, __ } from '../src';
import { Equal, Expect } from '../src/types/helpers';
import {
  Option,
  some,
  none,
  BigUnion,
  State,
  Event,
} from './types-catalog/utils';

describe('exhaustive()', () => {
  describe('should exclude matched patterns from subsequent `.with()` clauses', () => {
    it('string literals', () => {
      type Input = 'a' | 'b' | 'c';
      const input = 'b' as Input;

      match(input)
        .with('b', (x) => {
          type t = Expect<Equal<typeof x, 'b'>>;
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
          type t = Expect<Equal<typeof x, 'a'>>;
          return 1;
        })
        .with('b', (x) => {
          type t = Expect<Equal<typeof x, 'b'>>;
          return 2;
        })
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with('a', (x) => {
          type t = Expect<Equal<typeof x, 'a'>>;
          return 1;
        })
        .with('b', (x) => {
          type t = Expect<Equal<typeof x, 'b'>>;
          return 2;
        })
        .with('c', (x) => {
          type t = Expect<Equal<typeof x, 'c'>>;
          return 2;
        })
        .exhaustive();
    });

    it('number literals', () => {
      type Input = 1 | 2 | 3;
      const input = 2 as Input;

      match(input)
        .with(2, (x) => {
          type t = Expect<Equal<typeof x, 2>>;
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
          type t = Expect<Equal<typeof x, 1>>;
          return 1;
        })
        .with(2, (x) => {
          type t = Expect<Equal<typeof x, 2>>;
          return 2;
        })
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with(1, (x) => {
          type t = Expect<Equal<typeof x, 1>>;
          return 1;
        })
        .with(2, (x) => {
          type t = Expect<Equal<typeof x, 2>>;
          return 2;
        })
        .with(3, (x) => {
          type t = Expect<Equal<typeof x, 3>>;
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
      type letter =
        | 'a'
        | 'b'
        | 'c'
        | 'd'
        | 'e'
        | 'f'
        | 'g'
        | 'h'
        | 'i'
        | 'j'
        | 'k'
        | 'l'
        | 'm'
        | 'n'
        | 'o'
        | 'p'
        | 'q'
        | 'r'
        | 's'
        | 't'
        | 'u'
        | 'v'
        | 'w'
        | 'x'
        | 'y'
        | 'z';

      type Input =
        | { type: 1; data: number }
        | { type: 'two'; data: string }
        | { type: 3; data: boolean }
        | { type: 4 }
        | (letter extends any ? { type: letter } : never);

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
        .with({ type: 1, data: P.select() }, (data) => {
          type t = Expect<Equal<typeof data, number>>;
          return 1;
        })
        .with({ type: 'two', data: P.select() }, (data) => data.length)
        .with({ type: 3, data: true }, ({ data }) => {
          type t = Expect<Equal<typeof data, true>>;
          return 3;
        })
        .with({ type: 3, data: P.any }, ({ data }) => {
          type t = Expect<Equal<typeof data, boolean>>;
          return 3;
        })
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
        .with({ type: 'q' }, () => 0)
        .with({ type: 'r' }, () => 0)
        .with({ type: 's' }, () => 0)
        .with({ type: 't' }, () => 0)
        .with({ type: 'u' }, () => 0)
        .with({ type: 'v' }, () => 0)
        .with({ type: 'w' }, () => 0)
        .with({ type: 'x' }, () => 0)
        .with({ type: 'y' }, () => 0)
        .with({ type: 'z' }, () => 0)
        .exhaustive();

      match<Option<number>>({ kind: 'some', value: 3 })
        .with({ kind: 'some' }, ({ value }) => value)
        .with({ kind: 'none' }, () => 0)
        .exhaustive();

      match<Option<number>>({ kind: 'some', value: 3 })
        .with({ kind: 'some', value: 3 }, ({ value }): number => value)
        .with({ kind: 'none' }, () => 0)
        // @ts-expect-error: missing {kind: 'some', value: number}
        .exhaustive();

      match<Option<number>>({ kind: 'some', value: 3 })
        .with({ kind: 'some', value: 3 }, ({ value }): number => value)
        .with({ kind: 'some', value: P.number }, ({ value }): number => value)
        .with({ kind: 'none' }, () => 0)
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
        .with(P.number, () => 'something else')
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
        .with({ type: 'b', items: P.array({ data: P.string }) }, (x) => [])
        .exhaustive();

      match(input)
        .with({ type: 'a', items: P.array(__) }, (x) => x.items)
        .with({ type: 'b', items: P.array({ data: P.string }) }, (x) => [])
        .exhaustive();

      match<Input>(input)
        .with({ type: 'a', items: P.array({ some: __ }) }, (x) => x.items)
        .with({ type: 'b', items: P.array({ data: P.string }) }, (x) => [])
        // @ts-expect-error
        .exhaustive();
    });

    it('should support __ in a readonly tuple', () => {
      const f = (n: number, state: State) => {
        const x = match([n, state] as const)
          .with(
            [1, { status: 'success', data: P.select() }],
            ([_, { data }]) => data.startsWith('coucou'),
            (data) => data.replace('coucou', 'bonjour')
          )
          .with([2, __], () => "It's a twoooo")
          .with([__, { status: 'error' }], () => 'Oups')
          .with([__, { status: 'idle' }], () => '')
          .with([__, { status: 'loading' }], () => '')
          .with([__, { status: 'success' }], () => '')
          .exhaustive();
      };
    });

    it('should work with Sets', () => {
      type Input = Set<string> | Set<number>;
      const input = new Set(['']) as Input;

      match(input)
        .with(new Set([P.string]), (x) => x)
        // @ts-expect-error
        .exhaustive();

      match(input)
        .with(new Set([P.string]), (x) => x)
        .with(new Set([P.number]), (x) => new Set([]))
        .exhaustive();
    });

    it('should work with Sets', () => {
      type Input = Set<string> | Set<number>;
      const input = new Set(['']) as Input;

      expect(
        match(input)
          .with(new Set([P.string]), (x) => x)
          // @ts-expect-error
          .exhaustive()
      ).toEqual(input);

      expect(
        match(input)
          .with(new Set([P.string]), (x) => 1)
          .with(new Set([P.number]), (x) => 2)
          .exhaustive()
      ).toEqual(1);
    });

    it('should work with Maps', () => {
      type Input = Map<string, 1 | 2 | 3>;
      const input = new Map([['hello', 1]]) as Input;

      expect(
        match(input)
          .with(new Map([['hello' as const, P.number]]), (x) => x)
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
        .with({ a: P.not(1) }, () => 'a != 1')
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
          .with(__, (x, y) => some(xs[xs.length - 1]))
          .exhaustive();

      expect(last([1, 2, 3])).toEqual(some(3));
    });

    it('should work with generics in type guards', () => {
      const map = <A, B>(
        option: Option<A>,
        mapper: (value: A) => B
      ): Option<B> =>
        match<Option<A>, Option<B>>(option)
          .when(
            (option): option is { kind: 'some'; value: A } =>
              option.kind === 'some',
            (option) => ({
              kind: 'some',
              value: mapper(option.value),
            })
          )
          .when(
            (option): option is { kind: 'none' } => option.kind === 'none',
            (option) => option
          )
          .otherwise(() => ({ kind: 'none' }));

      const res = map(
        { kind: 'some' as const, value: 20 },
        (x) => `number is ${x}`
      );

      type t = Expect<Equal<typeof res, Option<string>>>;

      expect(res).toEqual({ kind: 'some' as const, value: `number is 20` });
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
          .with(P.array(__), (x) => {
            type t = Expect<
              Equal<typeof x, 'hello'[] | ('hello' | Option<string>)[]>
            >;
            return `("hello" | Option<string>)[] | "hello"[]`;
          })
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

    it('should correctly exclude cases if when pattern contains a type guard', () => {
      match<{ x: 1 | 2 | 3 }>({ x: 2 })
        .with({ x: P.when((x): x is 1 => x === 1) }, (x) => {
          type t = Expect<Equal<typeof x, { x: 1 }>>;
          return '';
        })
        .with({ x: P.when((x): x is 2 => x === 2) }, (x) => {
          type t = Expect<Equal<typeof x, { x: 2 }>>;
          return '';
        })
        .with({ x: P.when((x): x is 3 => x === 3) }, (x) => {
          type t = Expect<Equal<typeof x, { x: 3 }>>;
          return '';
        })
        .exhaustive();
    });

    it('should correctly exclude cases if .when is a type guard', () => {
      match<Option<string>, Option<number>>({ kind: 'none' })
        .when(
          (option): option is { kind: 'some'; value: string } =>
            option.kind === 'some',
          (option) => ({
            kind: 'some',
            value: option.value.length,
          })
        )
        .when(
          (option): option is { kind: 'none' } => option.kind === 'none',
          (option) => option
        )
        .exhaustive();
    });

    it('should correctly exclude cases if the pattern is a literal type', () => {
      const input = { kind: 'none' } as Option<string>;
      match(input)
        .with({ kind: 'some', value: 'hello' }, (option) => '')
        .with({ kind: 'none' }, (option) => '')
        // @ts-expect-error: handled { kind: 'some', value: string }
        .exhaustive();

      match(input)
        .with({ kind: 'some', value: 'hello' }, (option) => '')
        .with({ kind: 'none' }, (option) => '')
        .with({ kind: 'some' }, (option) => '')
        .exhaustive();
    });

    it('should not exclude cases if the pattern is a literal type and the value is not', () => {
      match({ x: 2 })
        .with({ x: 2 }, ({ x }) => {
          type t = Expect<Equal<typeof x, number>>;
          return '';
        })
        // @ts-expect-error
        .exhaustive();

      match<1 | 2 | 3>(2)
        .with(2, (x) => {
          type t = Expect<Equal<typeof x, 2>>;
          return '';
        })
        // @ts-expect-error
        .exhaustive();

      match<1 | 2 | 3>(2)
        .with(1, (x) => {
          type t = Expect<Equal<typeof x, 1>>;
          return '';
        })
        .with(2, (x) => {
          type t = Expect<Equal<typeof x, 2>>;
          return '';
        })
        .with(3, (x) => {
          type t = Expect<Equal<typeof x, 3>>;
          return '';
        })
        .exhaustive();
    });
  });

  it('real world example', () => {
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

    const isNumber = (x: unknown): x is number => typeof x === 'number';

    match<Input>({ type: 'text', text: 'Hello', author: { name: 'Gabriel' } })
      .with(
        {
          type: 'text',
          text: P.select('text'),
          author: { name: P.select('authorName') },
        },
        ({ text, authorName }) => `${text} from ${authorName}`
      )
      .with({ type: 'video', duration: P.when((x) => x > 10) }, () => '')
      .with(
        {
          type: 'video',
          duration: P.when(isNumber),
        },
        () => ''
      )
      .with({ type: 'movie', duration: 10 }, () => '')
      .with(
        {
          type: 'movie',
          duration: 10,
          author: P.select('author'),
          title: P.select('title'),
        },
        ({ author, title }) => ''
      )
      .with({ type: 'picture' }, () => '')
      .with({ type: 'movie', duration: P.when(isNumber) }, () => '')
      .exhaustive();
  });

  it('reducer example', () => {
    const initState: State = {
      status: 'idle',
    };

    const reducer = (state: State, event: Event): State =>
      match<[State, Event], State>([state, event])
        .with(
          [{ status: 'loading' }, { type: 'success', data: P.select() }],
          (data) => ({ status: 'success', data })
        )
        .with(
          [{ status: 'loading' }, { type: 'error', error: P.select() }],
          (error) => ({ status: 'error', error })
        )
        .with([{ status: 'loading' }, { type: 'cancel' }], () => initState)

        .with([{ status: P.not('loading') }, { type: 'fetch' }], (value) => ({
          status: 'loading',
        }))
        .with(__, () => state)
        .exhaustive();
  });

  it('select should always match', () => {
    type Input = { type: 3; data: number };

    const input = { type: 3, data: 2 } as Input;

    match<Input>(input)
      .with({ type: 3, data: P.select() }, (data) => {
        type t = Expect<Equal<typeof data, number>>;
        return 3;
      })
      .exhaustive();

    type Input2 = { type: 3; data: true } | 2;
    match<Input2>(2)
      .with({ type: 3, data: P.select() }, (data) => {
        type t = Expect<Equal<typeof data, true>>;
        return 3;
      })
      .with(2, () => 2)
      .exhaustive();
  });

  describe('Exhaustive match and `not` patterns', () => {
    it('should work with a single not pattern', () => {
      const reducer1 = (state: State, event: Event): State =>
        match<[State, Event], State>([state, event])
          .with([{ status: P.not('loading') }, __], (x) => state)
          .with([{ status: 'loading' }, { type: 'fetch' }], () => state)
          // @ts-expect-error
          .exhaustive();

      const reducer3 = (state: State, event: Event): State =>
        match<[State, Event], State>([state, event])
          .with([{ status: P.not('loading') }, __], (x) => state)
          .with([{ status: 'loading' }, __], () => state)
          .exhaustive();
    });

    it('should work with several not patterns', () => {
      const reducer = (state: State, event: Event): State =>
        match<[State, Event], State>([state, event])
          .with(
            [{ status: P.not('loading') }, { type: P.not('fetch') }],
            (x) => state
          )
          .with([{ status: 'loading' }, { type: __ }], () => state)
          .with([{ status: __ }, { type: 'fetch' }], () => state)
          .exhaustive();

      const f = (input: readonly [1 | 2 | 3, 1 | 2 | 3, 1 | 2 | 3]) =>
        match(input)
          .with([P.not(1), P.not(1), P.not(1)], (x) => 'ok')
          .with([1, __, __], () => 'ok')
          .with([__, 1, __], () => 'ok')
          .with([__, __, 1], () => 'ok')
          .exhaustive();

      const range = [1, 2, 3] as const;
      const flatMap = <A, B>(
        xs: readonly A[],
        f: (x: A) => readonly B[]
      ): B[] => xs.reduce<B[]>((acc, x) => acc.concat(f(x)), []);

      const allPossibleCases = flatMap(range, (x) =>
        flatMap(range, (y) => flatMap(range, (z) => [[x, y, z]] as const))
      );

      allPossibleCases.forEach((x) => expect(f(x)).toBe('ok'));

      const f2 = (input: [1 | 2 | 3, 1 | 2 | 3, 1 | 2 | 3]) =>
        match(input)
          .with([P.not(1), P.not(1), P.not(1)], (x) => 'ok')
          .with([1, __, __], () => 'ok')
          .with([__, 1, __], () => 'ok')
          // @ts-expect-error : NonExhaustiveError<[3, 3, 1] | [3, 2, 1] | [2, 3, 1] | [2, 2, 1]>
          .exhaustive();
    });

    it('should work with not patterns and lists', () => {
      const f = (input: (1 | 2 | 3)[]) =>
        match(input)
          .with([P.not(1)], (x) => 'ok')
          .with([1], (x) => 'ok')
          // @ts-expect-error: NonExhaustiveError<(1 | 2 | 3)[]>, because lists can be heterogenous
          .exhaustive();
    });
  });

  describe('exhaustive and any', () => {
    const f = (input: { t: 'a'; x: any } | { t: 'b' }) =>
      match(input)
        .with({ t: 'a' }, (x) => {
          type t = Expect<Equal<typeof x, { t: 'a'; x: any }>>;
          return 'ok';
        })
        .with({ t: 'b' }, (x) => 'ok')
        .exhaustive();

    const f2 = (input: { t: 'a'; x: any } | { t: 'b' }) =>
      match(input)
        .with({ t: 'a', x: 'hello' }, (x) => 'ok')
        .with({ t: 'b' }, (x) => 'ok')
        // @ts-expect-error
        .exhaustive();

    const f3 = (input: { t: 'a'; x: any } | { t: 'b' }) =>
      match(input)
        .with({ t: 'a', x: __ }, (x) => 'ok')
        .with({ t: 'b' }, (x) => 'ok')
        .exhaustive();
  });

  describe('issue #44', () => {
    it("shouldn't exclude cases if the pattern contains unknown keys", () => {
      type Person = {
        sex: 'a' | 'b';
        age: 'c' | 'd';
      };

      function withTypo(person: Person) {
        return (
          match(person)
            //   this pattern contains an addition unknown key
            .with({ sex: 'b', oopsThisIsATypo: 'c' }, (x) => {
              // The unknown key should be added to the object type
              type t = Expect<
                Equal<
                  typeof x,
                  {
                    age: 'c' | 'd';
                    sex: 'b';
                    oopsThisIsATypo: string;
                  }
                >
              >;
              return 1;
            })
            // those are correct
            .with({ sex: 'b', age: 'd' }, () => 2)
            .with({ sex: 'a', age: 'c' }, () => 3)
            .with({ sex: 'a', age: 'd' }, () => 4)
            // this pattern shouldn't be considered exhaustive
            // @ts-expect-error
            .exhaustive()
        );
      }

      function withoutTypo(person: Person) {
        return (
          match(person)
            .with({ sex: 'b', age: 'c' }, (x) => 1)
            .with({ sex: 'b', age: 'd' }, () => 2)
            .with({ sex: 'a', age: 'c' }, () => 3)
            .with({ sex: 'a', age: 'd' }, () => 4)
            // this should be ok
            .exhaustive()
        );
      }

      expect(() => withTypo({ sex: 'b', age: 'c' })).toThrow();
      expect(withoutTypo({ sex: 'b', age: 'c' })).toBe(1);
    });
  });
});
