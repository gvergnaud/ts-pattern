import { match, __, when, not, select, Pattern } from '../src';

// the never type can be assigned to anything. This type prevent that
type NotNever<a> = a extends never ? never : true;

type Option<a> = { kind: 'none' } | { kind: 'some'; value: a };

type Blog = {
  id: number;
  title: string;
};

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; error: Error };

type Event =
  | { type: 'fetch' }
  | { type: 'success'; data: string; requestTime?: number }
  | { type: 'error'; error: Error }
  | { type: 'cancel' };

describe('types', () => {
  type Input = [State, Event];

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
    type Input = { type: string } | string;

    match<Input>({ type: 'hello' })
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
        when<Input>((x) => true),
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
      .with({ type: not(when<string>((x) => true)) }, (x) => {
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
  });

  it('a union of object or primitive should be matched with a correct type inference', () => {
    type Input = { type: string } | string;

    match<Input>({ type: 'hello' })
      .with({ type: __ }, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: { type: string } = x;
        return 'ok';
      })
      .run();
  });
});

describe('match', () => {
  describe('Numbers', () => {
    it('Should match exact numbers', () => {
      const res = match(1)
        .with(1, (v) => {
          const notNever: NotNever<typeof v> = true;
          const inferenceCheck: 1 = v;
          return v * 2;
        })
        .with(2, (v) => {
          const notNever: NotNever<typeof v> = true;
          const inferenceCheck: 2 = v;
          return v * v;
        })
        .otherwise(() => -1)
        .run();

      const inferenceCheck: [NotNever<typeof res>, number] = [true, res];

      expect(res).toEqual(2);
    });
  });

  describe('Records ({})', () => {
    it('Should match records', () => {
      type Vector1 = { x: number };
      type Vector2 = { x: number; y: number };
      type Vector3 = {
        x: number;
        y: number;
        z: number;
      };
      type Vector = Vector1 | Vector2 | Vector3;

      const vector: Vector = { x: 1 };

      expect(
        match<Vector, string>(vector)
          .with({ x: 1, y: 1, z: 1 }, (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: Vector3 = x;
            return 'vector3';
          })
          .with({ x: 2, y: 1 }, (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: Vector2 = x;
            return 'vector2';
          })
          .with({ x: 1 }, (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: Vector1 = x;
            return 'vector1';
          })
          .otherwise(() => 'no match')
          .run()
      ).toEqual('vector1');
    });
  });

  describe('Unions (a | b)', () => {
    it('should match discriminated unions', () => {
      const val: Option<string> = {
        kind: 'some',
        value: 'hello',
      };

      const res = match(val as Option<string>)
        .with({ kind: 'some' }, (o) => {
          const notNever: NotNever<typeof o> = true;
          const inferenceCheck: { kind: 'some'; value: string } = o;
          return o.value;
        })
        .with({ kind: 'none' }, () => 'no value')
        .run();

      const inferenceCheck: [NotNever<typeof res>, string] = [true, res];

      expect(res).toEqual('hello');
    });

    it('should discriminate union types correctly 2', () => {
      type Post = {
        type: 'post';
        id: number;
        content: { body: string };
      };
      type Video = { type: 'video'; id: number; content: { src: string } };
      type Image = { type: 'image'; id: number; content: { src: number } };

      type Input = Post | Video | Image;

      const res = match<Input>({
        type: 'post',
        id: 2,
        content: { body: 'yo' },
      })
        .with({ type: 'post', content: __ }, (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: Post = x;
          return 1;
        })
        .with({ type: 'post', id: 7 }, (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: Post = x;
          return 1;
        })
        .with({ type: 'video', content: { src: __.string } }, (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: Video = x;
          return 2;
        })
        .with({ type: 'image' }, (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: Image = x;
          return 3;
        })
        .run();

      expect(res).toEqual(1);
    });
  });

  describe('List ([a])', () => {
    it('should match list patterns', () => {
      let httpResult = {
        id: 20,
        title: 'hellooo',
      };
      const res = match<any, Option<Blog[]>>([httpResult])
        .with([], (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: never[] = x;
          return { kind: 'some', value: [{ id: 0, title: 'LOlol' }] };
        })
        .with([{ id: __.number, title: __.string }], (blogs) => {
          const notNever: NotNever<typeof blogs> = true;
          const inferenceCheck: { id: number; title: string }[] = blogs;
          return {
            kind: 'some',
            value: blogs,
          };
        })
        .with(20, (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: number = x;
          return { kind: 'none' };
        })
        .otherwise(() => ({ kind: 'none' }))
        .run();

      expect(res).toEqual({ kind: 'some', value: [httpResult] });
    });
  });

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
          const notNever: NotNever<typeof value> = true;
          const inferenceCheck: ['+', number, number] = value;
          const [, x, y] = value;
          return x + y;
        })
        .with(['*', __.number, __.number], (value) => {
          const notNever: NotNever<typeof value> = true;
          const inferenceCheck: ['*', number, number] = value;
          const [, x, y] = value;
          return x * y;
        })
        .with(['-', __.number], (value) => {
          const notNever: NotNever<typeof value> = true;
          const inferenceCheck: ['-', number] = value;
          const [, x] = value;
          return -x;
        })
        .run();
      const res2 = match<Input, number>(['-', 2])
        .with(['+', __, __], (value) => {
          const notNever: NotNever<typeof value> = true;
          const inferenceCheck: ['+', number, number] = value;
          const [, x, y] = value;
          return x + y;
        })
        .with(['*', __, __], (value) => {
          const notNever: NotNever<typeof value> = true;
          const inferenceCheck: ['*', number, number] = value;
          const [, x, y] = value;
          return x * y;
        })
        .with(['-', __], (value) => {
          const notNever: NotNever<typeof value> = true;
          const inferenceCheck: ['-', number] = value;
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
                const notNever: NotNever<typeof x> = true;
                const inferenceCheck: [string, number] = x;
                return `perfect match`;
              })
              .with(['hello', __], (x) => {
                const notNever: NotNever<typeof x> = true;
                const inferenceCheck: [string, number] = x;
                return `string match`;
              })
              .with([__, 20], (x) => {
                const notNever: NotNever<typeof x> = true;
                const inferenceCheck: [string, number] = x;
                return `number match`;
              })
              .with([__.string, __.number], (x) => {
                const notNever: NotNever<typeof x> = true;
                const inferenceCheck: [string, number] = x;
                return `not matching`;
              })
              .with([__, __], (x) => {
                const notNever: NotNever<typeof x> = true;
                const inferenceCheck: [string, number] = x;
                return `can't happen`;
              })
              .with(__, (x) => {
                const notNever: NotNever<typeof x> = true;
                const inferenceCheck: [string, number] = x;
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
          .with([__, { type: 'fetch' }], () => ({
            status: 'loading',
          }))
          .with(
            [{ status: 'loading' }, { type: 'success' }],
            ([, { data }]) => ({
              status: 'success',
              data,
            })
          )
          .with(
            [{ status: 'loading' }, { type: 'error' }],
            ([, { error }]) => ({
              status: 'error',
              error,
            })
          )
          .with([{ status: 'loading' }, { type: 'cancel' }], () => initState)
          .otherwise(() => state)
          .run();

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

  describe('Map', () => {
    it('should match Map patterns', () => {
      const usersMap = new Map([
        ['gab', { name: 'gabriel' }],
        ['angégé', { name: 'angéline' }],
      ]);

      const userPattern = { name: __.string };

      const res = match<Map<string, { name: string }>>(usersMap)
        .with(
          new Map([
            ['angégé', userPattern],
            ['gab', userPattern],
          ]),
          (map) => ({
            name: map.get('angégé')!.name + ' ' + map.get('gab')!.name,
          })
        )
        .with(new Map([['angégé', userPattern]]), (map) => map.get('angégé')!)
        .with(new Map([['gab', userPattern]]), (map) => map.get('gab')!)
        .with(__, () => ({ name: 'unknown' }))
        .run();

      const inferenceCheck: [NotNever<typeof res>, { name: string }] = [
        true,
        res,
      ];

      expect(res).toEqual({ name: 'angéline gabriel' });
    });
  });

  describe('Set', () => {
    it('should match Set patterns', () => {
      const containsGabAndYo = (set: Set<string | number>) =>
        match<Set<string | number>, [boolean, boolean]>(set)
          .with(new Set(['gab', 'yo']), (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: Set<string> = x;
            return [true, true];
          })
          .with(new Set(['gab']), (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: Set<string> = x;
            return [true, false];
          })
          .with(new Set(['yo']), (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: Set<string> = x;
            return [false, true];
          })
          .with(__, (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: Set<string | number> = x;
            return [false, false];
          })
          .run();

      expect(containsGabAndYo(new Set(['gab', 'yo', 'hello']))).toEqual([
        true,
        true,
      ]);
      expect(containsGabAndYo(new Set(['gab', 'hello']))).toEqual([
        true,
        false,
      ]);
      expect(containsGabAndYo(new Set(['yo', 'hello']))).toEqual([false, true]);
      expect(containsGabAndYo(new Set(['hello']))).toEqual([false, false]);
      expect(containsGabAndYo(new Set([]))).toEqual([false, false]);
      expect(containsGabAndYo(new Set([2]))).toEqual([false, false]);
      expect(containsGabAndYo(new Set([__.number]))).toEqual([false, false]);
      expect(containsGabAndYo(new Set([__.string]))).toEqual([false, false]);
    });
  });

  describe('wildcards', () => {
    it('should match String wildcards', () => {
      const res = match<string | number | boolean>('')
        .with(__.string, (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: string = x;
          return true;
        })
        .otherwise(() => false)
        .run();

      expect(res).toEqual(true);
    });

    it('should match Number wildcards', () => {
      const res = match<string | number | boolean>(2)
        .with(__.number, (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: number = x;
          return true;
        })
        .otherwise(() => false)
        .run();

      expect(res).toEqual(true);
    });

    it('should match Boolean wildcards', () => {
      const res = match<string | number | boolean>(true)
        .with(__.boolean, (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: boolean = x;
          return true;
        })
        .otherwise(() => false)
        .run();

      expect(res).toEqual(true);
    });

    it('should match String, Number and Boolean wildcards', () => {
      // Will be { id: number, title: string } | { errorMessage: string }
      let httpResult = {
        id: 20,
        title: 'hellooo',
      }; /* API logic. */

      const res = match<any, Blog | Error>(httpResult)
        .with({ id: __.number, title: __.string }, (r) => ({
          id: r.id,
          title: r.title,
        }))
        .with({ errorMessage: __.string }, (r) => new Error(r.errorMessage))
        .otherwise(() => new Error('Client parse error'))
        .run();

      expect(res).toEqual({
        id: 20,
        title: 'hellooo',
      });
    });

    it('should infer correctly negated String wildcards', () => {
      const res = match<string | number | boolean>('')
        .with(not(__.string), (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: number | boolean = x;
          return true;
        })
        .otherwise(() => false)
        .run();

      expect(res).toEqual(false);
    });

    it('should infer correctly negated Number wildcards', () => {
      const res = match<string | number | boolean>(2)
        .with(not(__.number), (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: string | boolean = x;
          return true;
        })
        .otherwise(() => false)
        .run();

      expect(res).toEqual(false);
    });

    it('should infer correctly negated Boolean wildcards', () => {
      const res = match<string | number | boolean>(true)
        .with(not(__.boolean), (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: string | number = x;
          return true;
        })
        .otherwise(() => false)
        .run();

      expect(res).toEqual(false);
    });
  });

  describe('catch all', () => {
    const allValueTypes = [
      undefined,
      null,
      Symbol(2),
      2,
      'string',
      true,
      () => {},
      {},
      [],
      new Map(),
      new Set(),
    ];

    allValueTypes.forEach((value) => {
      it(`should match ${typeof value} values`, () => {
        expect(
          match(value)
            .with(__, () => 'yes')
            .run()
        ).toEqual('yes');
      });
    });
  });

  describe('deeply nested objects', () => {
    it('should work with 4 levels of object nesting', () => {
      type Post = {
        type: 'post';
        id: number;
        content: { body: string; video: Video };
      };
      type Video = { type: 'video'; id: number; content: { src: string } };

      const res = match<Post>({
        type: 'post',
        id: 2,
        content: {
          body: 'yo',
          video: { type: 'video', content: { src: '' }, id: 2 },
        },
      })
        .with(
          { type: 'post', content: { video: { id: 2, content: { src: '' } } } },
          (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: Post = x;
            return 1;
          }
        )
        .run();

      const inferenceCheck: number = res;

      expect(res).toEqual(1);
    });
  });

  describe('optional properties', () => {
    it('matching on optional properties should work', () => {
      type Post = {
        type: 'post';
        id?: number;
        body: string;
      };

      const res = match<Post>({
        type: 'post',
        id: 2,
        body: 'az',
      })
        .with({ type: 'post', id: 2 as const }, (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: Post & { id: 2 } = x;
          return 100;
        })
        .with({ type: 'post', id: __.number }, (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: Post = x;
          return 10;
        })
        .with({ type: 'post' }, (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: Post = x;
          // id is still nullable
          x.id = undefined;
          return 1;
        })
        .run();

      expect(res).toEqual(100);
    });
  });

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
            .when(
              (x) => x > 10 && x < 50,
              () => true
            )
            .otherwise(() => false)
            .run()
        ).toEqual(expected);
      });
    });

    it('should narrow down the value type based on type guard', () => {
      let n = 20;
      const res = match(n)
        .when(
          (x): x is 13 => x === 13,
          (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: 13 = x;
            return true;
          }
        )
        .otherwise(() => false)
        .run();

      const notNever: NotNever<typeof res> = true;
      const inferenceCheck: boolean = res;
    });
  });

  describe('withWhen', () => {
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
            .withWhen(
              { status: 'success' },
              (x) => x.data.length > 3,
              (x) => {
                const notNever: NotNever<typeof x> = true;
                const inferenceCheck: { status: 'success'; data: string } = x;
                return true;
              }
            )
            .otherwise(() => false)
            .run()
        ).toEqual(expected);
      });
    });
  });

  describe('pattern containing a when close', () => {
    it('type of value in predicate should be infered', () => {
      type Vec3 = { x: number; y: number; z: number };
      const vec: Vec3 = { x: 20, y: 4, z: 2 };

      const get = (vec: Vec3): boolean =>
        match(vec)
          .with(
            {
              x: when((x): x is 20 => {
                const notNever: NotNever<typeof x> = true;
                const inferenceCheck: number = x;
                return x === 20;
              }),
              y: __.number,
            },
            (vec) => {
              const notNever: NotNever<typeof vec> = true;
              const inferenceCheck: Vec3 = vec;
              return vec.y > 2;
            }
          )
          .with(
            when(() => true),
            (x) => {
              const notNever: NotNever<typeof vec> = true;
              const inferenceCheck: Vec3 = vec;
              return false;
            }
          )
          .run();

      expect(get(vec)).toEqual(true);
      expect(get({ x: 2, y: 1, z: 0 })).toEqual(false);
    });
  });

  describe('pattern containing a not close', () => {
    it('should work at the top level', () => {
      const get = (x: unknown): string =>
        match(x)
          .with(not(__.number), (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: unknown = x;
            return 'not a number';
          })
          .with(not(__.string), (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: unknown = x;
            return 'not a string';
          })
          .run();

      expect(get(20)).toEqual('not a string');
      expect(get('hello')).toEqual('not a number');
    });

    it('should work in a nested structure', () => {
      type DS = { x: string | number; y: string | number };
      const get = (x: DS) =>
        match(x)
          .with({ y: __.number, x: not(__.string) }, (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: { x: number; y: number } = x;
            return 'yes';
          })
          .with(__, () => 'no')
          .run();

      expect(get({ x: 2, y: 2 })).toEqual('yes');
      expect(get({ y: 2, x: 'hello' })).toEqual('no');
    });

    it('should discriminate union types correctly', () => {
      const one = 'one';
      const two = 'two';

      const get = (x: 'one' | 'two') =>
        match(x)
          .with(not(one), (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: 'two' = x;
            return 'not 1';
          })
          .with(not(two), (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: 'one' = x;
            return 'not 2';
          })
          .run();

      expect(get('two')).toEqual('not 1');
      expect(get('one')).toEqual('not 2');
    });

    it('should discriminate union types correctly', () => {
      type Input =
        | {
            type: 'success';
          }
        | { type: 'error' };

      const get = (x: Input) =>
        match(x)
          .with({ type: not('success') }, (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: { type: 'error' } = x;
            return 'error';
          })
          .with({ type: not('error') }, (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: { type: 'success' } = x;
            return 'success';
          })
          .run();

      expect(get({ type: 'error' })).toEqual('error');
      expect(get({ type: 'success' })).toEqual('success');
    });
  });
});

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
    // FIXME: We have got an issue with arrays. selections shouldn't
    // work on array pattern, because we cant select multiple values.
    expect(
      match<string[], string>(['you', 'hello'])
        .with([select('x')], (_, { x }) => {
          const inferenceCheck: [NotNever<typeof x>, string] = [true, x];
          return x;
        })
        .run()
    ).toEqual('hello');
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
