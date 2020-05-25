import { match, __, Pattern } from '../src';

type Option<a> = { kind: 'none' } | { kind: 'some'; value: a };

type Blog = {
  id: number;
  title: string;
};

type State =
  | { status: 'idle'; data?: undefined; error?: undefined }
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'success'; data: string; error?: undefined }
  | { status: 'error'; data?: undefined; error: Error };

type Event =
  | { type: 'fetch' }
  | { type: 'success'; data: string }
  | { type: 'error'; error: Error }
  | { type: 'cancel' };

describe('types', () => {
  it('Pattern type should typecheck', () => {
    type Input = [State, Event];

    let pattern: Pattern<Input>;
    pattern = __;
    pattern = [__, __];
    pattern = [{ status: 'success', data: '' }, __];
    pattern = [{ status: 'success', data: __ }, __];
    pattern = [{ status: 'error', error: new Error() }, __];
    pattern = [{ status: 'idle' }, __];
    pattern = [__, { type: 'fetch' }];
    pattern = [__, { type: __ }];
    pattern = [{ status: 'idle' }, { type: 'fetch' }];
    pattern = [{ status: __ }, { type: __ }];
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
        .with([{ id: Number, title: String }], (blogs) => {
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
          .with([Number, Number], ([x, y]) => x + y)
          .with([Number, Number, Number], ([x, y, z]) => x + y + z)
          .with(
            [Number, Number, Number, Number],
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
              .with([String, Number], (x) => {
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

      const userPattern = { name: String };

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
        .with({ id: Number, title: String }, (r) => ({
          id: r.id,
          title: r.title,
        }))
        .with({ errorMessage: String }, (r) => new Error(r.errorMessage))
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
              () => true
            )
            .otherwise(() => false)
            .run()
        ).toEqual(expected);
      });
    });
  });
});
