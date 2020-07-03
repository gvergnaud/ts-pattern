import { match, __, select, not } from '../src';
import { State, Event, NotNever } from './utils';

describe('select', () => {
  it('should work with tuples', () => {
    expect(
      match<[string, number], number>(['get', 2])
        .with(['get', select('y')], (_, { y }) => {
          const inferenceCheck: [NotNever<typeof y>, number] = [true, y];
          return y;
        })
        .run()
    ).toEqual(2);
  });

  it('should work with array', () => {
    expect(
      match<string[], string[]>(['you', 'hello'])
        .with([select('texts')], (xs, { texts }) => {
          const inferenceCheck2: [NotNever<typeof xs>, string[]] = [true, xs];
          const inferenceCheck: [NotNever<typeof texts>, string[]] = [
            true,
            texts,
          ];
          return texts;
        })
        .run()
    ).toEqual(['you', 'hello']);

    expect(
      match<{ text: string }[], string[]>([{ text: 'you' }, { text: 'hello' }])
        .with([{ text: select('texts') }], (xs, { texts }) => {
          const inferenceCheck2: [NotNever<typeof xs>, { text: string }[]] = [
            true,
            xs,
          ];
          const inferenceCheck: [NotNever<typeof texts>, string[]] = [
            true,
            texts,
          ];
          return texts;
        })
        .run()
    ).toEqual(['you', 'hello']);

    expect(
      match<{ text: { content: string } }[], string[]>([
        { text: { content: 'you' } },
        { text: { content: 'hello' } },
      ])
        .with([{ text: { content: select('texts') } }], (xs, { texts }) => {
          const inferenceCheck: [NotNever<typeof texts>, string[]] = [
            true,
            texts,
          ];
          return texts;
        })
        .run()
    ).toEqual(['you', 'hello']);
  });

  it('should work with objects', () => {
    expect(
      match<State & { other: number }, string>({
        status: 'success',
        data: 'some data',
        other: 20,
      })
        .with(
          { status: 'success', data: select('data'), other: select('other') },
          (_, { data, other }) => {
            const inferenceCheck: [NotNever<typeof data>, string] = [
              true,
              data,
            ];
            const inferenceCheck2: [NotNever<typeof other>, number] = [
              true,
              other,
            ];
            return data + other.toString();
          }
        )
        .run()
    ).toEqual('some data20');
  });

  it('should work with primitive types', () => {
    expect(
      match<string, string>('hello')
        .with(select('x'), (_, { x }) => {
          const inferenceCheck: [NotNever<typeof x>, string] = [true, x];
          return x;
        })
        .run()
    ).toEqual('hello');
  });

  it('should work with complex structures', () => {
    const initState: State = {
      status: 'idle',
    };

    const reducer = (state: State, event: Event): State =>
      match<[State, Event], State>([state, event])
        .with(
          [
            { status: 'loading' },
            {
              type: 'success',
              data: select('data'),
              requestTime: select('time'),
            },
          ],
          (_, { data, time }) => {
            const inferenceCheck: [
              NotNever<typeof time>,
              number | undefined
            ] = [true, time];

            return {
              status: 'success',
              data,
            };
          }
        )
        .with(
          [{ status: 'loading' }, { type: 'success', data: select('data') }],
          (_, { data }) => ({
            status: 'success',
            data,
          })
        )
        .with(
          [{ status: 'loading' }, { type: 'error', error: select('error') }],
          (_, { error }) => ({
            status: 'error',
            error,
          })
        )
        .with([{ status: 'loading' }, { type: 'cancel' }], () => initState)
        .with([{ status: not('loading') }, { type: 'fetch' }], () => ({
          status: 'loading',
        }))
        .with([select('state'), select('event')], (_, { state, event }) => {
          const inferenceCheck: [NotNever<typeof state>, State] = [true, state];
          const inferenceCheck2: [NotNever<typeof event>, Event] = [
            true,
            event,
          ];
          return state;
        })
        .run();

    expect(reducer(initState, { type: 'cancel' })).toEqual(initState);

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
});
