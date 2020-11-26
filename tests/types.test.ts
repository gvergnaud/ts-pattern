import { match, __, when, not, Pattern } from '../src';
import { State, Event, NotNever } from './utils';

describe('types', () => {
  type Input = [State, Event];

  it ('Can force exhaustive pattern', () => {
    const v = 'dt' as 'dt' | 'num' | 'nil';
    const matcher = match(v)
      .with('dt', () => 1)
      .with('num', () => 2);

    // @ts-expect-error
    matcher.exhaustive().run();

    matcher
      .with('nil', () => 3)
      .exhaustive()
      .run();
  });

  it('wildcard patterns should typecheck', () => {
    let pattern: Pattern<Input>;
    pattern = __;
    pattern = [__, __];
    pattern = [{ status: 'success', data: '' }, __];
    pattern = [{ status: 'success', data: __.string }, __];
    pattern = [{ status: 'success', data: __ }, __];
    pattern = [{ status: 'error', error: new Error() }, __];
    pattern = [{ status: 'idle' }, __];
    pattern = [__, { type: 'fetch' }];
    pattern = [__, { type: __ }];
    pattern = [{ status: 'idle' }, { type: 'fetch' }];
    pattern = [{ status: __ }, { type: __ }];
  });

  it('guard patterns should typecheck', () => {
    const pattern1: Pattern<Input> = when(() => true);
    const pattern2: Pattern<Input> = when((x) => {
      const notNever: NotNever<typeof x> = true;
      const inferenceCheck: Input = x;
      return true;
    });

    const pattern3: Pattern<Input> = [
      when((state) => {
        const notNever: NotNever<typeof state> = true;
        const inferenceCheck: State = state;
        return !!state;
      }),
      when((event) => {
        const notNever: NotNever<typeof event> = true;
        const inferenceCheck: Event = event;
        return !!event;
      }),
    ];

    const pattern3_1: Pattern<Input> = [
      __,
      { type: when((t: Event['type']) => true) },
    ];

    const pattern4: Pattern<Input> = [
      {
        status: 'success',
        data: when((d) => {
          const notNever: NotNever<typeof d> = true;
          const inferenceCheck: string = d;
          return true;
        }),
      },
      __,
    ];

    const pattern4_1: Pattern<Input> = [{ status: 'error', data: '' }, __];

    const pattern5: Pattern<Input> = [
      __,
      { type: when((t: Event['type']) => true) },
    ];

    const isFetch = (type: string): type is 'fetch' => type === 'fetch';

    const pattern6: Pattern<Input> = [__, { type: when(isFetch) }];

    const pattern7: Pattern<{ x: string }> = {
      x: when((x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: string = x;
        return true;
      }),
    };

    const pattern8: Pattern<[{ x: string }]> = [
      {
        x: when((x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: string = x;
          return true;
        }),
      },
    ];

    const pattern9: Pattern<[{ x: string }, { y: number }]> = [
      {
        x: when((x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: string = x;
          return true;
        }),
      },
      {
        y: when((y) => {
          const notNever: NotNever<typeof y> = true;
          const inferenceCheck: number = y;
          return true;
        }),
      },
    ];

    const pattern10: Pattern<string | number> = when((x) => {
      const notNever: NotNever<typeof x> = true;
      const inferenceCheck: string | number = x;
      return true;
    });
  });

  it('should infer values correctly in handler', () => {
    type Input = { type: string; hello?: { yo: number } } | string;

    const res = match<Input>({ type: 'hello' })
      .with(__, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: Input = x;
        return 'ok';
      })
      .with(__.string, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: string = x;
        return 'ok';
      })
      .with(
        when((x) => true),
        (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: Input = x;
          return 'ok';
        }
      )
      .with(
        when<Input>((x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: Input = x;
          return true;
        }),
        (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: Input = x;
          return 'ok';
        }
      )
      .with(not('hello'), (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: Input = x;
        return 'ok';
      })
      .with(not(__.string), (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: { type: string } = x;
        return 'ok';
      })
      .with(not(when((x) => true)), (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: Input = x;
        return 'ok';
      })
      .with({ type: __ }, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: { type: string } = x;
        return 'ok';
      })
      .with({ type: __.string }, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: { type: string } = x;
        return 'ok';
      })
      .with({ type: when((x) => true) }, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: { type: string } = x;
        return 'ok';
      })
      .with({ type: not('hello' as 'hello') }, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: { type: string } = x;
        return 'ok';
      })
      .with({ type: not(__.string) }, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: Input = x;
        return 'ok';
      })
      .with({ type: not(when((x) => true)) }, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: Input = x;
        return 'ok';
      })
      .with(not({ type: when((x: string) => true) }), (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: Input = x;
        return 'ok';
      })
      .with(not({ type: __.string }), (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: string = x;
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
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: { type: string } = x;
        return 'ok';
      })
      .with(__.string, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: string = x;
        return 'ok';
      })
      .with(__.number, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: number = x;
        return 'ok';
      })
      .with(__.boolean, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: boolean = x;
        return 'ok';
      })
      .with({ type: __.string }, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: { type: string } = x;
        return 'ok';
      })
      .with([__.string], (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: string[] = x;
        return 'ok';
      })
      .with([__.number, __.number], (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: [number, number] = x;
        return 'ok';
      })
      .run();
  });

  describe('Unknown Input', () => {
    const users: unknown = [{ name: 'Gabriel', postCount: 20 }];

    const typedUsers = match(users)
      .with([{ name: __.string, postCount: __.number }], (users) => users)
      .otherwise(() => []);

    // type of `typedUsers` is { name: string, postCount: number }[]

    expect(
      typedUsers
        .map((user) => `<p>${user.name} has ${user.postCount} posts.</p>`)
        .join('')
    ).toEqual(`<p>Gabriel has 20 posts.</p>`);
  });
});
