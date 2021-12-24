import { Expect, Equal } from '../src/types/helpers';
import { match, __, when, select, P } from '../src';
import { Option, State } from './utils';

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
            when((x: number) => x > 10 && x < 50),
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
        when((x): x is 13 => x === 13),
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
              { status: 'success', data: select('data') },
              (x) => x.data.length > 3 && x.data.length < 10,
              (x) => {
                type t = Expect<Equal<typeof x, { data: string }>>;
                return true;
              }
            )
            .with(
              { status: 'success', data: select('data') },
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
            __,
            (x): x is 2 => x === 2,
            (x) => {
              const inferenceCheck: 2 = x;
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
            __,
            (x): x is number => typeof x === 'number',
            (x) => {
              const inferenceCheck: number = x;
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

    const optionalFizzBuzz = (optionalNumber: Option<{ test: 'a' | 'b' }>) =>
      match(optionalNumber)
        .with(
          {
            type: 'some',
            value: P.when2({ test: 'b' }),
          },
          (x) => x
        )
        .with({ type: 'some' }, (someNumber) => () => 'fizzbuzz')
        .with({ type: 'none' }, () => '')
        .exhaustive();
  });

  it('should narrow the type of the input based on the pattern', () => {
    type Option<T> = { type: 'some'; value: T } | { type: 'none' };

    const optionalFizzBuzz = (optionalNumber: Option<number>) =>
      match(optionalNumber)
        // You can add up to 3 guard functions after your
        // pattern. They must all return true for the
        // handler to be executed.
        .with(
          { type: 'some' },
          // `someNumber` is infered to be a { type: "some"; value: number }
          // based on the pattern provided as first argument.
          (someNumber) =>
            someNumber.value % 5 === 0 && someNumber.value % 3 === 0,
          () => 'fizzbuzz'
        )
        .with(
          {
            type: 'some',
          },
          // you can also use destructuring
          ({ value }) => value % 5 === 0,
          () => 'buzz'
        )

        // Or you can use a `when` pattern, to apply your guard to
        // a subset of your input.
        .with(
          {
            type: 'some',
            value: when((value) => value % 3 === 0),
          },
          () => 'fizz'
        )
        // for all other numbers, just convert them to a string.
        .with({ type: 'some' }, ({ value }) => value.toString())
        // if it's a none, return "nope"
        .with({ type: 'none' }, () => 'nope')
        .run();
  });
});
