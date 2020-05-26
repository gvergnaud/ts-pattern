import { match, __, when, not, Pattern } from '../src';

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
  | { type: 'success'; data: string }
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
      const inferenceCheck: Input = x;
      return true;
    });

    const pattern3: Pattern<Input> = [
      when((state) => {
        const inferenceCheck: State = state;
        return !!state;
      }),
      when((event) => {
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
        const inferenceCheck: string = x;
        return true;
      }),
    };

    const pattern8: Pattern<[{ x: string }]> = [
      {
        x: when((x) => {
          const inferenceCheck: string = x;
          return true;
        }),
      },
    ];

    const pattern9: Pattern<[{ x: string }, { y: number }]> = [
      {
        x: when((x) => {
          const inferenceCheck: string = x;
          return true;
        }),
      },
      {
        y: when((y) => {
          const inferenceCheck: number = y;
          return true;
        }),
      },
    ];

    const pattern10: Pattern<string | number> = when((x) => {
      const inferenceCheck: string | number = x;
      return true;
    });
  });
});

describe('match', () => {
  describe('Numbers', () => {
    it('Should match exact numbers', () => {
      expect(
        match<number, number>(1)
          .with(1, (v) => {
            const inferenceCheck: 1 = v;
            return v * 2;
          })
          .with(2, (v) => {
            const inferenceCheck: 2 = v;
            return v * v;
          })
          .otherwise(() => -1)
          .run()
      ).toEqual(2);
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
            const inferenceCheck: Vector3 = x;
            return 'vector3';
          })
          .with({ x: 2, y: 1 }, (x) => {
            const inferenceCheck: Vector2 = x;
            return 'vector2';
          })
          .with({ x: 1 }, (x) => {
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

      expect(
        match<Option<string>, string>(val)
          .with({ kind: 'some' }, (o) => {
            const inferenceCheck: { kind: 'some'; value: string } = o;
            return o.value;
          })
          .run()
      ).toEqual('hello');
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
          const inferenceCheck: never[] = x;
          return { kind: 'some', value: [{ id: 0, title: 'LOlol' }] };
        })
        .with([{ id: __.number, title: __.string }], (blogs) => {
          const inferenceCheck: { id: number; title: string }[] = blogs;
          return {
            kind: 'some',
            value: blogs,
          };
        })
        .with(20, (x) => {
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
        match<number[], number>(xs)
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
                const inferenceCheck: [string, number] = x;
                return `perfect match`;
              })
              .with(['hello', __], (x) => {
                const inferenceCheck: [string, number] = x;
                return `string match`;
              })
              .with([__, 20], (x) => {
                const inferenceCheck: [string, number] = x;
                return `number match`;
              })
              .with([__.string, __.number], (x) => {
                const inferenceCheck: [string, number] = x;
                return `not matching`;
              })
              .with([__, __], (x) => {
                const inferenceCheck: [string, number] = x;
                return `can't happen`;
              })
              .with(__, (x) => {
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

      const res = match<Map<string, { name: string }>, { name: string }>(
        usersMap
      )
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

      expect(res).toEqual({ name: 'angéline gabriel' });
    });
  });

  describe('Set', () => {
    it('should match Set patterns', () => {
      const containsGabAndYo = (set: Set<string | number>) =>
        match<Set<string | number>, [boolean, boolean]>(set)
          .with(new Set(['gab', 'yo']), (x) => {
            const inferenceCheck: Set<string> = x;
            return [true, true];
          })
          .with(new Set(['gab']), (x) => {
            const inferenceCheck: Set<string> = x;
            return [true, false];
          })
          .with(new Set(['yo']), (x) => {
            const inferenceCheck: Set<string> = x;
            return [false, true];
          })
          .with(__, (x) => {
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
      const res = match<number, boolean>(n)
        .when(
          (x): x is 13 => x === 13,
          (x) => {
            const inferenceCheck: 13 = x;
            return true;
          }
        )
        .otherwise(() => false)
        .run();

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

      const get = (vec: Vec3) =>
        match<Vec3, boolean>(vec)
          .with(
            {
              x: when((x): x is 20 => {
                const inferenceCheck: number = x;
                return x === 20;
              }),
              y: __.number,
            },
            (vec) => {
              const inferenceCheck: Vec3 = vec;
              return vec.y > 2;
            }
          )
          .with(
            when(() => true),
            (x) => {
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
      const get = (x: unknown) =>
        match<unknown, string>(x)
          .with(not(__.number), (x) => {
            const inferenceCheck: unknown = x;
            return 'not a number';
          })
          .with(not(__.string), (x) => {
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
        match<DS, string>(x)
          .with({ y: __.number, x: not(__.string) }, (x) => {
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
        match<'one' | 'two', string>(x)
          .with(not(one), (x) => {
            const inferenceCheck: 'two' = x;
            return 'not 1';
          })
          .with(not(two), (x) => {
            const inferenceCheck: 'one' = x;
            return 'not 2';
          })
          .run();

      expect(get('two')).toEqual('not 1');
      expect(get('one')).toEqual('not 2');
    });

    it('type of value in predicate should be infered', () => {});
  });
});
