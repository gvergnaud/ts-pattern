import { Expect, Equal } from '../src/types/helpers';
import { match, __, selectOr, not } from '../src';
import { State, Event } from './utils';
import {
  MixedNamedAndAnonymousSelectError,
  SeveralAnonymousSelectError,
} from '../src/types/FindSelected';

describe('select', () => {
  it('should work with array', () => {
    expect(
      match<unknown, string[]>([undefined, undefined])
        .with([selectOr('hello', 'texts')], ({ texts }, xs) => {
          type t = Expect<Equal<typeof xs, string[]>>;
          type t2 = Expect<Equal<typeof texts, string[]>>;
          return texts;
        })
        .run()
    ).toEqual(['hello', 'hello']);

    expect(
      match<unknown, string[]>([])
        .with([selectOr('hello', 'texts')], ({ texts }, xs) => {
          type t = Expect<Equal<typeof xs, string[]>>;
          type t2 = Expect<Equal<typeof texts, string[]>>;
          return texts;
        })
        .run()
    ).toEqual(undefined);

    expect(
      match<unknown, string[]>([{}, {}])
        .with([{ text: selectOr('hello', 'texts') }], ({ texts }, xs) => {
          type t = Expect<Equal<typeof xs, { text: string }[]>>;
          type t2 = Expect<Equal<typeof texts, string[]>>;
          return texts;
        })
        .run()
    ).toEqual(['hello', 'hello']);

    expect(
      match<unknown, string[]>([{}, {}])
        .with(
          [{ text: { content: selectOr('hello', 'texts') } }],
          ({ texts }, xs) => {
            type t = Expect<Equal<typeof texts, string[]>>;
            return texts;
          }
        )
        .run()
    ).toEqual(['hello', 'hello']);
  });

  it('should work with objects', () => {
    expect(
      match<unknown, string>({ status: 'success' })
        .with(
          {
            status: 'success',
            data: selectOr('some data', 'data'),
            other: selectOr(20, 'other'),
          },
          ({ data, other }) => {
            type t = Expect<Equal<typeof data, string>>;
            type t2 = Expect<Equal<typeof other, number>>;
            return data + other.toString();
          }
        )
        .run()
    ).toEqual('some data20');
  });

  it('should work with primitive types', () => {
    expect(
      match<unknown, string>(undefined)
        .with(selectOr('hello', 'x'), ({ x }) => {
          type t = Expect<Equal<typeof x, string>>;
          return x;
        })
        .run()
    ).toEqual('hello');
  });

  it('should work with complex structures', () => {
    const initState: State = {
      status: 'idle',
    } as State;

    const reducer = (state: State, event: Event): State =>
      match<unknown, State>([state, event])
        .with(
          [
            { status: 'loading' },
            {
              type: 'success',
              data: selectOr('default data', 'data'),
              requestTime: selectOr(0, 'time'),
            },
          ] as const,
          ({ data, time }) => {
            type t = Expect<Equal<typeof time, number>>;

            return {
              status: 'success',
              data,
            };
          }
        )
        .with(
          [
            { status: 'loading' },
            { type: 'success', data: selectOr('default data', 'data') },
          ] as const,
          ({ data }) => ({
            status: 'success',
            data,
          })
        )
        .with(
          [
            { status: 'loading' },
            {
              type: 'error',
              error: selectOr(new Error('default error'), 'error'),
            },
          ] as const,
          ({ error }) => ({
            status: 'error',
            error,
          })
        )
        .with(
          [{ status: 'loading' }, { type: 'cancel' }] as const,
          () => initState
        )
        .with([{ status: not('loading') }, { type: 'fetch' }] as const, () => ({
          status: 'loading',
        }))
        .with(
          [
            selectOr(initState, 'state'),
            selectOr({ type: 'cancel' } as Event, 'event'),
          ] as const,
          ({ state, event }) => {
            type t = Expect<Equal<typeof state, State>>;
            type t2 = Expect<Equal<typeof event, Event>>;
            return state;
          }
        )
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

  it('should infer the selection to an error when using several anonymous selection', () => {
    match({ type: 'point' })
      .with({ type: 'point', x: selectOr(2), y: selectOr(3) }, (x) => {
        type t = Expect<Equal<typeof x, SeveralAnonymousSelectError>>;
        return 'ok';
      })
      .run();
  });

  it('should infer the selection to an error when using mixed named and unnamed selections', () => {
    match({ type: 'point' })
      .with({ type: 'point', x: selectOr(2), y: selectOr(3, 'y') }, (x) => {
        type t = Expect<Equal<typeof x, MixedNamedAndAnonymousSelectError>>;
        return 'ok';
      })
      .run();
  });
});
