import { match, P } from '../src';
import { Option } from './types-catalog/utils';
import { Expect, Equal } from '../src/types/helpers';
import { TryDeepExcludeOne } from '../src/types/DeepExclude';

describe('Multiple patterns', () => {
  it('should match if one of the patterns matches', () => {
    const testFn = (input: Option<number>) =>
      match(input)
        .with(
          { kind: 'some', value: 2 as const },
          { kind: 'some', value: 3 as const },
          { kind: 'some', value: 4 as const },
          (x) => {
            type t = Expect<
              Equal<
                typeof x,
                | { kind: 'some'; value: 2 }
                | { kind: 'some'; value: 3 }
                | { kind: 'some'; value: 4 }
              >
            >;
            return true;
          }
        )
        .with({ kind: 'none' }, { kind: 'some' }, (x) => {
          type t = Expect<
            Equal<typeof x, { kind: 'some'; value: number } | { kind: 'none' }>
          >;
          return false;
        })
        .run();

    const cases = [
      { input: { kind: 'some', value: 3 }, expected: true },
      { input: { kind: 'some', value: 2 }, expected: true },
      { input: { kind: 'some', value: 4 }, expected: true },
      { input: { kind: 'some', value: 5 }, expected: false },
      { input: { kind: 'some', value: -5 }, expected: false },
    ] as const;

    cases.forEach(({ input, expected }) => {
      expect(testFn(input)).toBe(expected);
    });
  });

  it('exhaustive patterns should match if one of the patterns matches', () => {
    const testFn = (input: Option<number>) =>
      match(input)
        .with(
          { kind: 'some', value: 2 as const },
          { kind: 'some', value: 3 as const },
          { kind: 'some', value: 4 as const },
          (x) => {
            type t = Expect<
              Equal<
                typeof x,
                | { kind: 'some'; value: 2 }
                | { kind: 'some'; value: 3 }
                | { kind: 'some'; value: 4 }
              >
            >;
            return true;
          }
        )
        .with({ kind: 'none' }, { kind: 'some' }, (x) => {
          type t = Expect<
            Equal<typeof x, { kind: 'some'; value: number } | { kind: 'none' }>
          >;
          return false;
        })
        .exhaustive();

    const cases = [
      { input: { kind: 'some', value: 3 }, expected: true },
      { input: { kind: 'some', value: 2 }, expected: true },
      { input: { kind: 'some', value: 4 }, expected: true },
      { input: { kind: 'some', value: 5 }, expected: false },
      { input: { kind: 'some', value: -5 }, expected: false },
    ] as const;

    cases.forEach(({ input, expected }) => {
      expect(testFn(input)).toBe(expected);
    });
  });

  it("no patterns shouldn't typecheck", () => {
    const input = { kind: 'none' } as Option<number>;
    match(input)
      // @ts-expect-error: Argument of type '() => false' is not assignable to parameter of type 'ExhaustivePattern<Option<number>>'
      .with(() => false);
  });

  it('should work with literal types', () => {
    type Country = 'France' | 'Germany' | 'Spain' | 'USA';

    match<Country>('France')
      .with('France', 'Germany', 'Spain', () => 'Europe')
      .with('USA', () => 'America')
      .exhaustive();

    match<Country>('Germany')
      .with('Germany', 'Spain', () => 'Europe')
      .with('USA', () => 'America')
      // @ts-expect-error: 'France' is missing
      .exhaustive();
  });

  it('should work with nullables', () => {
    match<null | undefined>(null)
      .with(null, undefined, (x) => 'Nullable')
      .exhaustive();
  });

  it('should work with objects', () => {
    match<{ a: string; b: number } | [1, 2]>({ a: '', b: 2 })
      .with({ a: P.string }, (x) => 'obj')
      .with([1, 2], (x) => 'tuple')
      .exhaustive();

    match<{ a: string; b: number } | [1, 2]>({ a: '', b: 2 })
      .with({ a: P.string }, [1, 2], (x) => 'obj')
      .exhaustive();
  });

  it('should work with all types of input', () => {
    type Input =
      | null
      | undefined
      | number
      | string
      | boolean
      | { a: string; b: number }
      | [boolean, number]
      | Map<string, { x: number }>
      | Set<number>;

    const nonExhaustive = (input: Input) =>
      match<Input>(input)
        .with(null, undefined, (x) => {
          type t = Expect<Equal<typeof x, null | undefined>>;
          return 'Nullable';
        })
        .with(P.boolean, P.number, P.string, (x) => {
          type t = Expect<Equal<typeof x, boolean | number | string>>;
          return 'primitive';
        })
        .with(
          { a: P.string },
          [true, 2],
          P.map('key', P._),
          P.set(P.number),
          (x) => {
            type t = Expect<
              Equal<
                typeof x,
                | { a: string; b: number }
                | [true, 2]
                | Map<'key', { x: number }>
                | Set<number>
              >
            >;

            return 'Object';
          }
        )
        .with([false, 2], (x) => {
          type t = Expect<Equal<typeof x, [false, 2]>>;
          return '[false, 2]';
        })
        .with([false, P.number], (x) => {
          type t = Expect<Equal<typeof x, [false, number]>>;
          return '[false, number]';
        })
        .with([true, P.number], (x) => {
          type t = Expect<Equal<typeof x, [true, number]>>;
          return '[true, number]';
        })
        .run();

    const exhaustive = (input: Input) =>
      match<Input>(input)
        .with(null, undefined, (x) => 'Nullable')
        .with(P.boolean, P.number, P.string, (x) => 'primitive')
        .with(
          { a: P.string },
          [true, 2],
          P.map(P.string, P._),
          P.set(P.number),
          (x) => 'Object'
        )
        .with([false, 2], (x) => '[false, 2]')
        // TODO fix
        .with([false, P.number], (x) => '[false, number]')
        .with([true, P.number], (x) => '[true, number]')
        .exhaustive();

    type T = TryDeepExcludeOne<[boolean, number], readonly [false, 2]>;
    //   ^?

    const cases: { input: Input; expected: string }[] = [
      { input: null, expected: 'Nullable' },
      { input: undefined, expected: 'Nullable' },
      { input: true, expected: 'primitive' },
      { input: 2, expected: 'primitive' },
      { input: 'string', expected: 'primitive' },
      { input: { a: 'hello', b: 2 }, expected: 'Object' },
      { input: [true, 2], expected: 'Object' },
      { input: new Map([['key', { x: 2 }]]), expected: 'Object' },
      { input: new Set([2]), expected: 'Object' },
      { input: [false, 2], expected: '[false, 2]' },
      { input: [false, 3], expected: '[false, number]' },
    ];

    cases.forEach(({ input, expected }) => {
      expect(nonExhaustive(input)).toEqual(expected);
      expect(exhaustive(input)).toEqual(expected);
    });
  });

  it("when 2 returned values don't match, the error should be at the second returned value", () => {
    const f = (input: { t: 'a'; x: any } | { t: 'b' }) =>
      match<typeof input, string>(input)
        .with({ t: 'a', x: 'hello' }, { t: 'a' }, (x) => 'ok')
        // @ts-expect-error
        .with({ t: 'b' }, (x) => 2)
        .run();
  });

  it('issue #74: inference must work on every pattern in the list', () => {
    match<{ a: number[] }>({ a: [1, 2, 3, 4] })
      .with(
        {
          a: P.when((arr) => {
            type t = Expect<Equal<typeof arr, number[]>>;
            return arr.length === 4;
          }),
        },
        {
          a: P.when((arr) => {
            type t = Expect<Equal<typeof arr, number[]>>;
            return arr.length === 4;
          }),
        },
        {
          a: P.when((arr) => {
            type t = Expect<Equal<typeof arr, number[]>>;
            return arr.length === 4;
          }),
        },
        ({ a }) => {}
      )
      .with({ a: P.array(P.number) }, () => {})
      .exhaustive();
  });
});
