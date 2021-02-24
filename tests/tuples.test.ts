import { Expect, Equal } from '../src/types/helpers';
import { match, __ } from '../src';
import { State, Event } from './utils';

describe('tuple ([a, b])', () => {
  it('should match tuple patterns', () => {
    const sum = (xs: number[]): number =>
      match(xs)
        .with([], () => 0)
        .with([__.number, __.number], ([x, y]) => x + y)
        .with([__.number, __.number, __.number], ([x, y, z]) => x + y + z)
        .with(
          [__.number, __.number, __.number, __.number],
          ([x, y, z, w]) => x + y + z + w
        )
        .run();

    expect(sum([2, 3, 2, 4])).toEqual(11);
  });

  it('should discriminate correctly union of tuples', () => {
    type Input =
      | ['+', number, number]
      | ['*', number, number]
      | ['-', number]
      | ['++', number];

    const res = match<Input, number>(['-', 2])
      .with(['+', __.number, __.number], (value) => {
        type t = Expect<Equal<typeof value, ['+', number, number]>>;
        const [, x, y] = value;
        return x + y;
      })
      .with(['*', __.number, __.number], (value) => {
        type t = Expect<Equal<typeof value, ['*', number, number]>>;
        const [, x, y] = value;
        return x * y;
      })
      .with(['-', __.number], (value) => {
        type t = Expect<Equal<typeof value, ['-', number]>>;
        const [, x] = value;
        return -x;
      })
      .run();

    const res2 = match<Input, number>(['-', 2])
      .with(['+', __, __], (value) => {
        type t = Expect<Equal<typeof value, ['+', number, number]>>;
        const [, x, y] = value;
        return x + y;
      })
      .with(['*', __, __], (value) => {
        type t = Expect<Equal<typeof value, ['*', number, number]>>;
        const [, x, y] = value;
        return x * y;
      })
      .with(['-', __], (value) => {
        type t = Expect<Equal<typeof value, ['-', number]>>;
        const [, x] = value;
        return -x;
      })
      .run();

    expect(res).toEqual(-2);
    expect(res2).toEqual(-2);
  });

  describe('should match heterogenous tuple patterns', () => {
    const tuples: { tuple: [string, number]; expected: string }[] = [
      { tuple: ['coucou', 20], expected: 'number match' },
      { tuple: ['hello', 20], expected: 'perfect match' },
      { tuple: ['hello', 21], expected: 'string match' },
      { tuple: ['azeaze', 17], expected: 'not matching' },
    ];

    tuples.forEach(({ tuple, expected }) => {
      it(`should work with ${tuple}`, () => {
        expect(
          match<[string, number], string>(tuple)
            .with(['hello', 20], (x) => {
              type t = Expect<Equal<typeof x, [string, number]>>;
              return `perfect match`;
            })
            .with(['hello', __], (x) => {
              type t = Expect<Equal<typeof x, [string, number]>>;
              return `string match`;
            })
            .with([__, 20], (x) => {
              type t = Expect<Equal<typeof x, [string, number]>>;
              return `number match`;
            })
            .with([__.string, __.number], (x) => {
              type t = Expect<Equal<typeof x, [string, number]>>;
              return `not matching`;
            })
            .with([__, __], (x) => {
              type t = Expect<Equal<typeof x, [string, number]>>;
              return `can't happen`;
            })
            .with(__, (x) => {
              type t = Expect<Equal<typeof x, [string, number]>>;
              return `can't happen`;
            })
            .run()
        ).toEqual(expected);
      });
    });
  });

  it('should work with tuple of records', () => {
    const initState: State = {
      status: 'idle',
    };

    const reducer = (state: State, event: Event): State =>
      match<[State, Event], State>([state, event])
        .with([__, { type: 'fetch' }], (x) => {
          type t = Expect<Equal<typeof x, [State, { type: 'fetch' }]>>;

          return {
            status: 'loading',
          };
        })

        .with([{ status: 'loading' }, { type: 'success' }], (x) => {
          type t = Expect<
            Equal<
              typeof x,
              [
                { status: 'loading' },
                { type: 'success'; data: string; requestTime?: number }
              ]
            >
          >;

          return {
            status: 'success',
            data: x[1].data,
          };
        })

        .with([{ status: 'loading' }, { type: 'error' }], (x) => {
          type t = Expect<
            Equal<
              typeof x,
              [{ status: 'loading' }, { type: 'error'; error: Error }]
            >
          >;

          return {
            status: 'error',
            error: x[1].error,
          };
        })

        .with([{ status: 'loading' }, { type: 'cancel' }], (x) => {
          type t = Expect<
            Equal<typeof x, [{ status: 'loading' }, { type: 'cancel' }]>
          >;

          return initState;
        })

        .otherwise(() => state);

    expect(reducer(initState, { type: 'fetch' })).toEqual({
      status: 'loading',
    });

    expect(
      reducer({ status: 'loading' }, { type: 'success', data: 'yo' })
    ).toEqual({
      status: 'success',
      data: 'yo',
    });

    expect(reducer({ status: 'loading' }, { type: 'cancel' })).toEqual({
      status: 'idle',
    });
  });

  it('should work with as const', () => {
    type State = { type: 'a' } | { type: 'b' };
    type Event = { type: 'c' } | { type: 'd' };
    const state = { type: 'a' } as State;
    const event = { type: 'c' } as Event;

    const output = match([state, event] as const)
      .with([{ type: 'a' }, { type: 'c' }], () => 'a + c')
      .otherwise(() => 'no');

    expect(output).toEqual('a + c');
  });
});
