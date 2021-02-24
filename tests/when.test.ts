import { Expect, Equal } from '../src/types/helpers';
import { match, __, when, select } from '../src';
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
              (x) => x.data.length > 3,
              (x) => x.data.length < 10,
              (x) => {
                type t = Expect<
                  Equal<typeof x, { status: 'success'; data: string }>
                >;
                return true;
              }
            )
            .with(
              { status: 'success', data: select('data') },
              (x) => x.data.length > 3,
              (x) => x.data.length < 10,
              (x) => x.data.length % 2,
              (x) => {
                type t = Expect<
                  Equal<typeof x, { status: 'success'; data: string }>
                >;
                return true;
              }
            )
            .otherwise(() => false)
        ).toEqual(expected);
      });
    });

    it('type should be refined in each guard clause', () => {
      const values: { value: number | string; expected: boolean }[] = [
        { value: -1, expected: false },
        { value: 2, expected: true },
        { value: 20, expected: false },
        { value: 100, expected: false },
      ];

      values.forEach(({ value, expected }) => {
        const res = match(value)
          .with(
            __,
            (x): x is number => {
              const inferenceCheck: string | number = x;
              return typeof x === 'number';
            },
            (x): x is 2 => {
              const inferenceCheck: number = x;
              return x === 2;
            },
            (x) => {
              const inferenceCheck: 2 = x;
              return true;
            }
          )
          .with(
            __.string,
            (x) => x.length > 2,
            (x) => x.length < 10,
            (x) => true
          )
          .otherwise(() => false);

        expect(res).toEqual(expected);
      });
    });
  });
});
