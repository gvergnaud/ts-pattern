import { Expect, Equal } from '../src/types/helpers';
import { match, __, P } from '../src';
import { State, Event } from './types-catalog/utils';

describe('types', () => {
  type Input = [State, Event];

  it('wildcard patterns should typecheck', () => {
    let pattern: P.Pattern<Input>;
    pattern = __;
    pattern = [__, __];
    pattern = [{ status: 'success', data: '' }, __];
    pattern = [{ status: 'success', data: P.string }, __];
    pattern = [{ status: 'success', data: __ }, __];
    pattern = [{ status: 'error', error: new Error() }, __];
    pattern = [{ status: 'idle' }, __];
    pattern = [__, { type: 'fetch' }];
    pattern = [__, { type: __ }];
    pattern = [{ status: 'idle' }, { type: 'fetch' }];
    pattern = [{ status: __ }, { type: __ }];
  });

  it('guard patterns should typecheck', () => {
    const pattern1: P.Pattern<Input> = P.when(() => true);
    const pattern2: P.Pattern<Input> = P.when((x) => {
      type t = Expect<Equal<typeof x, Input>>;
      return true;
    });

    const pattern3: P.Pattern<Input> = [
      P.when((state) => {
        type t = Expect<Equal<typeof state, State>>;
        return !!state;
      }),
      P.when((event) => {
        type t = Expect<Equal<typeof event, Event>>;
        return !!event;
      }),
    ];

    const pattern3_1: P.Pattern<Input> = [
      __,
      { type: P.when((t: Event['type']) => true) },
    ];

    const pattern4: P.Pattern<Input> = [
      {
        status: 'success',
        data: P.when((d) => {
          type t = Expect<Equal<typeof d, string>>;
          return true;
        }),
      },
      __,
    ];

    const pattern4_1: P.Pattern<Input> = [{ status: 'error', data: '' }, __];

    const pattern5: P.Pattern<Input> = [
      __,
      { type: P.when((t: Event['type']) => true) },
    ];

    const isFetch = (type: string): type is 'fetch' => type === 'fetch';

    const pattern6: P.Pattern<Input> = [__, { type: P.when(isFetch) }];

    const pattern7: P.Pattern<{ x: string }> = {
      x: P.when((x) => {
        type t = Expect<Equal<typeof x, string>>;
        return true;
      }),
    };

    const pattern8: P.Pattern<[{ x: string }]> = [
      {
        x: P.when((x) => {
          type t = Expect<Equal<typeof x, string>>;
          return true;
        }),
      },
    ];

    const pattern9: P.Pattern<[{ x: string }, { y: number }]> = [
      {
        x: P.when((x) => {
          type t = Expect<Equal<typeof x, string>>;
          return true;
        }),
      },
      {
        y: P.when((y) => {
          type t = Expect<Equal<typeof y, number>>;
          return true;
        }),
      },
    ];

    const pattern10: P.Pattern<string | number> = P.when((x) => {
      type t = Expect<Equal<typeof x, string | number>>;
      return true;
    });
  });

  it('should infer values correctly in handler', () => {
    type Input = { type: string; hello?: { yo: number } } | string;

    const res = match<Input>({ type: 'hello' })
      .with(__, (x) => {
        type t = Expect<Equal<typeof x, Input>>;
        return 'ok';
      })
      .with(P.string, (x) => {
        type t = Expect<Equal<typeof x, string>>;
        return 'ok';
      })
      .with(
        P.when((x) => true),
        (x) => {
          type t = Expect<Equal<typeof x, Input>>;
          return 'ok';
        }
      )
      .with(
        P.typed<Input>().when((x) => {
          type t = Expect<Equal<typeof x, Input>>;
          return true;
        }),
        (x) => {
          type t = Expect<Equal<typeof x, Input>>;
          return 'ok';
        }
      )
      .with(P.not('hello' as const), (x) => {
        type t = Expect<Equal<typeof x, Input>>;
        return 'ok';
      })
      .with(P.not(P.string), (x) => {
        type t = Expect<
          Equal<
            typeof x,
            {
              type: string;
              hello?: {
                yo: number;
              };
            }
          >
        >;
        return 'ok';
      })
      .with(P.not(P.when((x) => true)), (x) => {
        type t = Expect<Equal<typeof x, Input>>;
        return 'ok';
      })
      .with({ type: __ }, (x) => {
        type t = Expect<
          Equal<
            typeof x,
            {
              type: string;
              hello?: {
                yo: number;
              };
            }
          >
        >;
        return 'ok';
      })
      .with({ type: P.string }, (x) => {
        type t = Expect<
          Equal<typeof x, { type: string; hello?: { yo: number } | undefined }>
        >;
        return 'ok';
      })
      .with({ type: P.when((x) => true) }, (x) => {
        type t = Expect<
          Equal<typeof x, { type: string; hello?: { yo: number } | undefined }>
        >;
        return 'ok';
      })
      .with({ type: P.not('hello' as 'hello') }, (x) => {
        type t = Expect<
          Equal<
            typeof x,
            {
              type: string;
              hello:
                | {
                    yo: number;
                  }
                | undefined;
            }
          >
        >;
        return 'ok';
      })
      .with({ type: P.not(P.string) }, (x) => {
        type t = Expect<Equal<typeof x, Input>>;
        return 'ok';
      })
      .with({ type: P.not(P.when((x) => true)) }, (x) => {
        type t = Expect<Equal<typeof x, Input>>;
        return 'ok';
      })
      .with(P.not({ type: P.when((x) => true) }), (x) => {
        type t = Expect<Equal<typeof x, string>>;
        return 'ok';
      })
      .with(P.not({ type: P.string }), (x) => {
        type t = Expect<Equal<typeof x, string>>;
        return 'ok';
      })
      .run();

    const inferenceCheck: string = res;
  });

  it('a union of object or primitive should be matched with a correct type inference', () => {
    type Input =
      | string
      | number
      | boolean
      | { type: string }
      | string[]
      | [number, number];

    match<Input>({ type: 'hello' })
      .with({ type: __ }, (x) => {
        type t = Expect<Equal<typeof x, { type: string }>>;
        return 'ok';
      })
      .with(P.string, (x) => {
        type t = Expect<Equal<typeof x, string>>;
        return 'ok';
      })
      .with(P.number, (x) => {
        type t = Expect<Equal<typeof x, number>>;
        return 'ok';
      })
      .with(P.boolean, (x) => {
        type t = Expect<Equal<typeof x, boolean>>;
        return 'ok';
      })
      .with({ type: P.string }, (x) => {
        type t = Expect<Equal<typeof x, { type: string }>>;
        return 'ok';
      })
      .with([P.string], (x) => {
        type t = Expect<Equal<typeof x, [string]>>;
        return 'ok';
      })
      .with([P.number, P.number], (x) => {
        type t = Expect<Equal<typeof x, [number, number]>>;
        return 'ok';
      })
      .run();
  });

  describe('Unknown Input', () => {
    const users: unknown = [{ name: 'Gabriel', postCount: 20 }];

    const typedUsers = match(users)
      .with([{ name: P.string, postCount: P.number }], (users) => users)
      .otherwise(() => []);

    // type of `typedUsers` is { name: string, postCount: number }[]

    expect(
      typedUsers
        .map((user) => `<p>${user.name} has ${user.postCount} posts.</p>`)
        .join('')
    ).toEqual(`<p>Gabriel has 20 posts.</p>`);
  });

  it("should enforce all branches return the right typeP. when it's set", () => {
    match<number, number>(2)
      //  @ts-expect-error
      .with(2, () => 'string')
      //  @ts-expect-error
      .otherwise(() => '?');
  });

  it('issue #73: should enforce the handler as the right type', () => {
    const f = (x: number) => x.toLocaleString();
    const g = (x: string) => x.toUpperCase();
    expect(() =>
      match(false)
        // @ts-expect-error
        .with(true, f)
        // @ts-expect-error
        .with(false, g)
        // @ts-expect-error
        .with(true, (n: string) => '')
        .exhaustive()
    ).toThrow();
  });
});
