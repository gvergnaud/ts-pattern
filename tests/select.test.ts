import { Expect, Equal } from '../src/types/helpers';
import { match, P } from '../src';
import { State, Event } from './utils';
import {
  MixedNamedAndAnonymousSelectError,
  SeveralAnonymousSelectError,
} from '../src/types/FindSelected';

describe('select', () => {
  it('should work with tuples', () => {
    expect(
      match<[string, number], number>(['get', 2])
        .with(['get', P.select('y')], ({ y }) => {
          type t = Expect<Equal<typeof y, number>>;
          return y;
        })
        .run()
    ).toEqual(2);
  });

  it('should work with array', () => {
    expect(
      match<string[], string[]>(['you', 'hello'])
        .with([P.select('first')], ({ first }, xs) => {
          type t = Expect<Equal<typeof xs, string[]>>;
          type t2 = Expect<Equal<typeof first, string>>;
          return [first];
        })
        .with(P.array(P.select('texts')), ({ texts }, xs) => {
          type t = Expect<Equal<typeof xs, string[]>>;
          type t2 = Expect<Equal<typeof texts, string[]>>;
          return texts;
        })
        .run()
    ).toEqual(['you', 'hello']);

    expect(
      match<{ text: string }[], string[]>([{ text: 'you' }, { text: 'hello' }])
        .with(P.array({ text: P.select('texts') }), ({ texts }, xs) => {
          type t = Expect<Equal<typeof xs, { text: string }[]>>;
          type t2 = Expect<Equal<typeof texts, string[]>>;
          return texts;
        })
        .run()
    ).toEqual(['you', 'hello']);

    expect(
      match<{ text: { content: string } }[], string[]>([
        { text: { content: 'you' } },
        { text: { content: 'hello' } },
      ])
        .with(
          P.array({ text: { content: P.select('texts') } }),
          ({ texts }, xs) => {
            type t = Expect<Equal<typeof texts, string[]>>;
            return texts;
          }
        )
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
          {
            status: 'success',
            data: P.select('data'),
            other: P.select('other'),
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
      match<string, string>('hello')
        .with(P.select('x'), ({ x }) => {
          type t = Expect<Equal<typeof x, string>>;
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
              data: P.select('data'),
              requestTime: P.select('time'),
            },
          ],
          ({ data, time }) => {
            type t = Expect<Equal<typeof time, number | undefined>>;

            return {
              status: 'success',
              data,
            };
          }
        )
        .with(
          [{ status: 'loading' }, { type: 'success', data: P.select('data') }],
          ({ data }) => ({
            status: 'success',
            data,
          })
        )
        .with(
          [{ status: 'loading' }, { type: 'error', error: P.select('error') }],
          ({ error }) => ({
            status: 'error',
            error,
          })
        )
        .with([{ status: 'loading' }, { type: 'cancel' }], () => initState)
        .with([{ status: P.not('loading') }, { type: 'fetch' }], () => ({
          status: 'loading',
        }))
        .with([P.select('state'), P.select('event')], ({ state, event }) => {
          type t = Expect<Equal<typeof state, State>>;
          type t2 = Expect<Equal<typeof event, Event>>;
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

  it('should support nesting of several arrays', () => {
    type Input = [{ name: string }, { post: { title: string }[] }][];
    expect(
      match<Input>([
        [
          { name: 'Gabriel' },
          { post: [{ title: 'Hello World' }, { title: "what's up" }] },
        ],
        [{ name: 'Alice' }, { post: [{ title: 'Hola' }, { title: 'coucou' }] }],
      ])
        .with([], (x) => {
          type t = Expect<Equal<typeof x, []>>;
          return 'empty';
        })
        .with(
          P.array([
            { name: P.select('names') },
            { post: P.array({ title: P.select('titles') }) },
          ]),
          ({ names, titles }) => {
            type t = Expect<Equal<typeof names, string[]>>;
            type t2 = Expect<Equal<typeof titles, string[][]>>;

            return (
              names.join(' and ') +
              ' have written ' +
              titles.map((t) => t.map((t) => `"${t}"`).join(', ')).join(', ')
            );
          }
        )
        .exhaustive()
    ).toEqual(
      `Gabriel and Alice have written "Hello World", "what's up", "Hola", "coucou"`
    );
  });

  it('Anonymous selections should support nesting of several arrays', () => {
    type Input = [{ name: string }, { post: { title: string }[] }][];
    expect(
      match<Input>([
        [
          { name: 'Gabriel' },
          { post: [{ title: 'Hello World' }, { title: "what's up" }] },
        ],
        [{ name: 'Alice' }, { post: [{ title: 'Hola' }, { title: 'coucou' }] }],
      ])
        .with([], (x) => {
          type t = Expect<Equal<typeof x, []>>;
          return 'empty';
        })
        .with(
          P.array([P.__, { post: P.array({ title: P.select() }) }]),
          (titles) => {
            type t1 = Expect<Equal<typeof titles, string[][]>>;
            return titles
              .map((t) => t.map((t) => `"${t}"`).join(', '))
              .join(', ');
          }
        )
        .exhaustive()
    ).toEqual(`"Hello World", "what's up", "Hola", "coucou"`);
  });

  it('should infer the selection to an error when using several anonymous selection', () => {
    match({ type: 'point', x: 2, y: 3 })
      .with({ type: 'point', x: P.select(), y: P.select() }, (x) => {
        type t = Expect<Equal<typeof x, SeveralAnonymousSelectError>>;
        return 'ok';
      })
      .run();
  });

  it('should infer the selection to an error when using mixed named and unnamed selections', () => {
    match({ type: 'point', x: 2, y: 3 })
      .with({ type: 'point', x: P.select(), y: P.select('y') }, (x) => {
        type t = Expect<Equal<typeof x, MixedNamedAndAnonymousSelectError>>;
        return 'ok';
      })
      .run();
  });

  describe('P.select with subpattern', () => {
    type Input =
      | {
          type: 'a';
          value:
            | { type: 'img'; src: string }
            | { type: 'text'; content: string; length: number };
        }
      | {
          type: 'b';
          value:
            | { type: 'user'; username: string }
            | { type: 'org'; orgId: number };
        };

    it('should support only selecting if the value matches a subpattern', () => {
      const f = (input: Input) =>
        match(input)
          .with({ type: 'a', value: P.select({ type: 'img' }) }, (x) => {
            type t = Expect<Equal<typeof x, { type: 'img'; src: string }>>;
            return x.src;
          })
          .with(
            { type: 'a', value: P.select('text', { type: 'text' }) },
            (x) => {
              type t = Expect<
                Equal<
                  typeof x,
                  { text: { type: 'text'; content: string; length: number } }
                >
              >;
              return x.text.content;
            }
          )
          .with({ type: 'b', value: P.select({ type: 'user' }) }, (x) => {
            type t = Expect<
              Equal<typeof x, { type: 'user'; username: string }>
            >;
            return x.username;
          })
          .with({ type: 'b', value: P.select('org', { type: 'org' }) }, (x) => {
            type t = Expect<
              Equal<typeof x, { org: { type: 'org'; orgId: number } }>
            >;
            return x.org.orgId;
          })
          .exhaustive();

      expect(f({ type: 'a', value: { type: 'img', src: 'Hello' } })).toEqual(
        'Hello'
      );

      expect(
        f({
          type: 'a',
          value: { type: 'text', length: 2, content: 'some text' },
        })
      ).toEqual('some text');

      expect(
        f({ type: 'b', value: { type: 'user', username: 'Gabriel' } })
      ).toEqual('Gabriel');

      expect(
        f({
          type: 'b',
          value: { type: 'org', orgId: 2 },
        })
      ).toEqual(2);
    });

    it('should be possible to nest named selections', () => {
      const f = (input: Input) =>
        match(input)
          .with(
            {
              type: 'a',
              value: P.select('text', {
                type: 'text',
                content: P.select('content'),
                length: P.select('length'),
              }),
            },
            ({ text, content, length }) => {
              type t1 = Expect<
                Equal<
                  typeof text,
                  { type: 'text'; content: string; length: number }
                >
              >;
              type t2 = Expect<Equal<typeof content, string>>;
              type t3 = Expect<Equal<typeof length, number>>;
              return [text, length, content];
            }
          )
          .otherwise(() => null);

      expect(
        f({ type: 'a', value: { type: 'text', length: 2, content: 'yo' } })
      ).toEqual([{ type: 'text', length: 2, content: 'yo' }, 2, 'yo']);

      expect(f({ type: 'a', value: { type: 'img', src: 'yo' } })).toEqual(null);
    });
  });
});
