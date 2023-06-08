import { Expect, Equal } from '../src/types/helpers';
import { match, P, Pattern } from '../src';
import { Option, State } from './types-catalog/utils';

describe('when', () => {
  it('should work for simple cases', () => {
    const values = [
      { value: 1, expected: false },
      { value: -2, expected: false },
      { value: 3, expected: false },
      { value: 100, expected: false },
      { value: 20, expected: true },
      { value: 39, expected: true },
    ];

    values.forEach(({ value, expected }) => {
      expect(
        match(value)
          .with(
            P.typed<number>().when((x) => x > 10 && x < 50),
            () => true
          )
          .otherwise(() => false)
      ).toEqual(expected);
    });
  });

  it('should narrow down the value type based on type guard', () => {
    let n = 20;
    const res = match(n)
      .with(
        P.when((x): x is 13 => x === 13),
        (x) => {
          type t = Expect<Equal<typeof x, 13>>;
          return true;
        }
      )
      .otherwise(() => false);

    type t = Expect<Equal<typeof res, boolean>>;
  });

  it('should be able to correcly narrow a generic types', () => {
    const map = <A, B>(option: Option<A>, mapper: (value: A) => B): Option<B> =>
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
        .run();

    const input = { kind: 'some' as const, value: 20 };
    const expectedOutput = { kind: 'some' as const, value: `number is 20` };

    const res = map(input, (x) => `number is ${x}`);

    type t = Expect<Equal<typeof res, Option<string>>>;

    expect(res).toEqual(expectedOutput);
  });

  it('should correctly infer the input type, even when used in another function pattern', () => {
    const f = (x: { a: number[] }) =>
      match(x)
        .with(
          {
            a: P.array(
              P.when((x) => {
                type t = Expect<Equal<typeof x, number>>;
                return true;
              })
            ),
          },
          () => 'true'
        )
        .otherwise(() => 'false');
  });

  it('should accept other values  than booleans in output', () => {
    const f = (x: { a: number[] }) =>
      match(x)
        .with(
          {
            a: P.when(() => {
              return 'anything truthy';
            }),
          },
          () => 'true'
        )
        .otherwise(() => 'false');

    expect(f({ a: [] })).toEqual('true');
  });

  describe('`with` with `when` clauses', () => {
    it('should work for simple cases', () => {
      const values: { value: State; expected: boolean }[] = [
        { value: { status: 'success', data: 'yo' }, expected: false },
        { value: { status: 'success', data: 'coucou' }, expected: true },
        { value: { status: 'idle' }, expected: false },
        { value: { status: 'loading' }, expected: false },
      ];

      values.forEach(({ value, expected }) => {
        expect(
          match(value)
            .with(
              { status: 'success' },
              (x) => x.data.length > 3,
              (x) => {
                type t = Expect<
                  Equal<typeof x, { status: 'success'; data: string }>
                >;
                return true;
              }
            )
            .with(
              { status: 'success', data: P.select('data') },
              (x) => x.data.length > 3 && x.data.length < 10,
              (x) => {
                type t = Expect<Equal<typeof x, { data: string }>>;
                return true;
              }
            )
            .with(
              { status: 'success', data: P.select('data') },
              (x) =>
                x.data.length > 3 && x.data.length < 10 && x.data.length % 2,
              (x) => {
                type t = Expect<Equal<typeof x, { data: string }>>;
                return true;
              }
            )
            .otherwise(() => false)
        ).toEqual(expected);
      });
    });

    it('type should be refined in each guard clause', () => {
      const values: { value: number | string; expected: string }[] = [
        { value: -1, expected: 'x: number' },
        { value: 2, expected: '2' },
        { value: 5, expected: '2 < x < 10' },
        { value: 100, expected: 'x: number' },
        { value: '100', expected: '2 < x.length < 10' },
        { value: 'Gabriel Vergnaud', expected: 'x: string' },
      ];

      values.forEach(({ value, expected }) => {
        const res = match(value)
          .with(
            P.any,
            (x): x is 2 => x === 2,
            (x) => {
              type t = Expect<Equal<typeof x, 2>>;
              return '2';
            }
          )
          .with(
            P.string,
            (x) => x.length > 2 && x.length < 10,
            () => '2 < x.length < 10'
          )
          .with(
            P.number,
            (x) => x > 2 && x < 10,
            () => '2 < x < 10'
          )
          .with(
            P.any,
            (x): x is number => typeof x === 'number',
            (x) => {
              type t = Expect<Equal<typeof x, number>>;
              return 'x: number';
            }
          )
          .with(P.string, () => 'x: string')
          .exhaustive();

        expect(res).toEqual(expected);
      });
    });
  });

  it('should narrow the type of the input based on the pattern', () => {
    type Option<T> = { type: 'some'; value: T } | { type: 'none' };

    const optionalFizzBuzz = (
      optionalNumber: Option<{
        opt?: 'x' | 'y';
        list: {
          test: 'a' | 'b';
          sublist: ('z' | 'w')[];
          prop: string;
          maybe?: string | number;
        }[];
        coords: { x: 'left' | 'right'; y: 'top' | 'bottom' };
      }>
    ) =>
      match(optionalNumber)
        .with(
          {
            type: 'some',
            value: {
              list: P.array({
                test: 'a',
                sublist: ['w'],
                maybe: P.optional(P.string),
                prop: P.when((x) => {
                  type t = Expect<Equal<typeof x, string>>;
                  return true;
                }),
              }),
              opt: P.optional('x'),
            },
          },
          (x) => {
            type t = Expect<
              Equal<
                typeof x,
                {
                  type: 'some';
                  value: {
                    opt?: 'x' | undefined;
                    list: {
                      test: 'a';
                      sublist: ['w'];
                      prop: string;
                      maybe?: string | undefined;
                    }[];
                    coords: {
                      x: 'left' | 'right';
                      y: 'top' | 'bottom';
                    };
                  };
                }
              >
            >;
            return 'ok';
          }
        )
        .with(
          {
            type: 'some',
            value: {
              coords: P.not({ x: 'left' }),
            },
          },
          (x) => {
            type t = Expect<
              Equal<
                (typeof x)['value']['coords'],
                {
                  y: 'top' | 'bottom';
                  x: 'right';
                }
              >
            >;

            return 'ok';
          }
        )
        .with(
          {
            type: 'some',
            value: {
              list: P.array({ test: 'a', prop: P.select() }),
            },
          },
          (x) => {
            type t = Expect<Equal<typeof x, string[]>>;
          }
        )
        .with({ type: 'none' }, () => null)
        .with({ type: 'some' }, () => 'ok')
        .exhaustive();
  });

  it('should narrow the type of the input based on the pattern', () => {
    const optionalFizzBuzz = (optionalNumber: Option<number>) =>
      match(optionalNumber)
        // You can add up to 3 guard functions after your
        // pattern. They must all return true for the
        // handler to be executed.
        .with(
          { kind: 'some' },
          // `someNumber` is inferred to be a { kind: "some"; value: number }
          // based on the pattern provided as first argument.
          (someNumber) =>
            someNumber.value % 5 === 0 && someNumber.value % 3 === 0,
          () => 'fizzbuzz'
        )
        .with(
          {
            kind: 'some',
          },
          // you can also use destructuring
          ({ value }) => value % 5 === 0,
          () => 'buzz'
        )

        // Or you can use a `when` pattern, to apply your guard to
        // a subset of your input.
        .with(
          {
            kind: 'some',
            value: Pattern.when((value) => value % 3 === 0),
          },
          () => 'fizz'
        )
        // for all other numbers, just convert them to a string.
        .with({ kind: 'some' }, ({ value }) => value.toString())
        // if it's a none, return "nope"
        .with({ kind: 'none' }, () => 'nope')
        .exhaustive();
  });

  it('should be possible to hard code type parameters to P.when', () => {
    const regex = <input>(expr: RegExp) =>
      P.when<
        input | string, // input
        string, // narrowed value
        never // types excluded
      >((x): x is string => typeof x === 'string' && expr.test(x));

    type Input = string | { prop: string | number };

    expect(
      match<Input>('Hello')
        .with(regex(/^H/), () => true)
        .with({ prop: regex(/^H/) }, (x) => {
          type t = Expect<Equal<typeof x, { prop: string }>>;
          return true;
        })
        // @ts-expect-error
        .exhaustive()
    ).toBe(true);
  });

  it('should be possible to do some manipulations on the input type', () => {
    const notString = <input>() =>
      P.when<
        input | string, // input
        Exclude<input, string>, // narrowed value
        never // types excluded
      >((x): x is Exclude<input, string> => typeof x !== 'string');

    type Input = { prop: string | number };

    expect(
      match<Input>({ prop: 20 })
        .with({ prop: notString() }, (x) => {
          type t = Expect<Equal<typeof x, { prop: number }>>;
          return true;
        })
        // @ts-expect-error
        .exhaustive()
    ).toBe(true);
  });

  it('issue #153: P.when should preserve undefined.', () => {
    type Data = { digit: number };

    type Input = {
      data: Data | undefined;
    };

    const input: Input = { data: undefined };

    const result = match(input)
      .with(
        {
          data: P.when((data) => {
            type t = Expect<Equal<typeof data, Data | undefined>>;
            return data ? data.digit > 5 : 0;
          }),
        },
        () => 'digit is more than 5'
      )
      .otherwise(() => 'digit is less than 5');

    expect(result).toBe('digit is less than 5');
  });
});
