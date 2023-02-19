import { match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('variadic tuples ([a, ...b[]])', () => {
  describe('runtime', () => {
    describe('match', () => {
      it('[any ...any] pattern should match any non-empty array', () => {
        const f = (xs: unknown[]) =>
          match(xs)
            .with([P.any, ...P.array()], () => 'non empty')
            .otherwise(() => 'empty');

        expect(f([1])).toBe('non empty');
        expect(f([1, 2])).toBe('non empty');
        expect(f([1, 2, 3])).toBe('non empty');
        expect(f(['1', '2', '3', '4'])).toBe('non empty');
      });

      it('[...any, any] pattern should match any non-empty array', () => {
        const f = (xs: unknown[]) =>
          match(xs)
            .with([...P.array(), P.any], () => 'non empty')
            .otherwise(() => 'empty');

        expect(f([1])).toBe('non empty');
        expect(f([1, 2])).toBe('non empty');
        expect(f([1, 2, 3])).toBe('non empty');
        expect(f(['1', '2', '3', '4'])).toBe('non empty');
      });

      it('[any, ...any, any] patterns should match arrays with at least 2 elements', () => {
        const f = (xs: unknown[]) =>
          match(xs)
            .with([P.any, ...P.array(), P.any], () => '>= 2')
            .otherwise(() => '< 2');

        expect(f([1])).toBe('< 2');
        expect(f([1, 2])).toBe('>= 2');
        expect(f([1, 2, 3])).toBe('>= 2');
        expect(f(['1', '2', '3', '4'])).toBe('>= 2');
      });

      it('[number, ...string[]]', () => {
        const f = (xs: unknown[]) =>
          match(xs)
            .with([P.number, ...P.array(P.string)], () => 'match')
            .otherwise(() => "doesn't match");

        expect(f([1])).toBe('match');
        expect(f([1, 2])).toBe("doesn't match");
        expect(f([1, 2, 3])).toBe("doesn't match");
        expect(f([1, '2'])).toBe('match');
        expect(f([1, '2', '3', '4'])).toBe('match');
      });

      it('[number, ...any, string]', () => {
        const f = (xs: unknown[]) =>
          match(xs)
            .with([P.number, ...P.array(), P.string], () => 'match')
            .otherwise(() => "doesn't match");

        expect(f([1])).toBe("doesn't match");
        expect(f([1, 2])).toBe("doesn't match");
        expect(f([1, '2'])).toBe('match');
        expect(f([1, 2, 3, '4'])).toBe('match');
        expect(f([1, '1', '2', '3', '4'])).toBe('match');
      });

      it('[1, 2, 3, ...number[]]', () => {
        const f = (xs: unknown[]) =>
          match(xs)
            .with([1, 2, 3, ...P.array(P.number)], () => 'match')
            .otherwise(() => "doesn't match");

        expect(f([1, 2, 3])).toBe('match');
        expect(f([1, 2, 3, 4, 5, 6])).toBe('match');
        expect(f([1])).toBe("doesn't match");
        expect(f([1, 2])).toBe("doesn't match");
        expect(f([1, 3, 2])).toBe("doesn't match");
        expect(f([1, 2, 3, 4, '5'])).toBe("doesn't match");
        expect(f([1, 2, 3, '4', 5])).toBe("doesn't match");
        expect(f([1, 2, 3, 4, '5', 6])).toBe("doesn't match");
      });

      it('[...number[], 1, 2, 3]', () => {
        const f = (xs: unknown[]) =>
          match(xs)
            .with([...P.array(P.number), 1, 2, 3], () => 'match')
            .otherwise(() => "doesn't match");

        expect(f([1, 2, 3])).toBe('match');
        expect(f([4, 5, 6, 1, 2, 3])).toBe('match');
        expect(f([1])).toBe("doesn't match");
        expect(f([1, 2])).toBe("doesn't match");
        expect(f([1, 3, 2])).toBe("doesn't match");
        expect(f([1, 2, 3, 4, 5])).toBe("doesn't match");
        expect(f(['4', 5, 1, 2, 3])).toBe("doesn't match");
        expect(f([4, '5', 1, 2, 3])).toBe("doesn't match");
        expect(f([4, '5', 6, 1, 2, 3])).toBe("doesn't match");
      });

      it('[number, number ...boolean[], string, symbol]', () => {
        const f = (xs: unknown[]) =>
          match(xs)
            .with(
              [P.number, P.number, ...P.array(P.boolean), P.string, P.symbol],
              () => 'match'
            )
            .otherwise(() => "doesn't match");

        expect(f([1, 2, true, 'hello', 'yo'])).toBe("doesn't match");
        //                              ^ ❌
        expect(f([1, 2, true, 3, Symbol('yo')])).toBe("doesn't match");
        //                    ^ ❌
        expect(f([1, 2, 'true', 'str', Symbol('yo')])).toBe("doesn't match");
        //                ^ ❌
        expect(f([1, '2', true, 'str', Symbol('yo')])).toBe("doesn't match");
        //            ^ ❌
        expect(f(['1', 2, true, 'str', Symbol('yo')])).toBe("doesn't match");
        //         ^ ❌
        expect(f([1, 2, true, 'str', Symbol('yo')])).toBe('match');
        //       ^ ✅
        expect(f([1, 2, true, false, true, 'str', Symbol('yo')])).toBe('match');
        //       ^ ✅

        expect(f([1, 2, true, 'false', true, 'str', Symbol('yo')])).toBe(
          //                    ^ ❌
          "doesn't match"
        );
      });
    });

    describe('select', () => {
      it('[1, sel, 2, ...number[]]', () => {
        const f = (xs: unknown[]) =>
          match(xs)
            .with(
              [1, P.select(P.number), 2, ...P.array(P.number)],
              (sel) => sel
            )
            .otherwise(() => 'no');

        expect(f([1, 42, 2, 3])).toEqual(42);
      });

      it('[1, 2, ...sel(number)[]]', () => {
        const f = (xs: unknown[]) =>
          match(xs)
            .with([1, 2, ...P.array(P.select(P.number))], (sel) => sel)
            .otherwise(() => 'no');

        expect(f([1, 2, 3, 4])).toEqual([3, 4]);
      });

      it('[...sel(number)[], 1, 2]', () => {
        const f = (xs: unknown[]) =>
          match(xs)
            .with([...P.array(P.select(P.number)), 1, 2], (sel) => sel)
            .otherwise(() => 'no');

        expect(f([3, 4, 1, 2])).toEqual([3, 4]);
      });

      it('[sel(a), ...sel(b), sel(c)]', () => {
        const f = (xs: unknown[]) =>
          match(xs)
            .with(
              [
                P.select('a', P.number),
                ...P.array(P.select('b', P.number)),
                P.select('c', P.string),
              ],
              (sel) => sel
            )
            .otherwise(() => 'no');

        expect(f([42, 1, 2, 3, '!'])).toEqual({ a: 42, b: [1, 2, 3], c: '!' });
      });
    });
  });

  describe('types', () => {
    it('unknown input', () => {
      const xs: unknown[] = [1, 2, 3, 'a', 'b', 'c'];

      match(xs)
        .with([P.any, ...P.array()], (xs) => {
          type t = Expect<Equal<typeof xs, [unknown, ...unknown[]]>>;
          return [];
        })
        .otherwise(() => {
          return [];
        });

      match(xs)
        .with([...P.array(), 7], (xs) => {
          type t = Expect<Equal<typeof xs, [...unknown[], number]>>;
          return [];
        })
        .otherwise(() => {
          return [];
        });

      match(xs)
        .with([42, ...P.array(P.number)], (xs) => {
          type t = Expect<Equal<typeof xs, [number, ...number[]]>>;
          return [];
        })
        .otherwise(() => {
          return [];
        });

      match(xs)
        .with([42, ...P.array(P.number), '!' as const], (xs) => {
          type t = Expect<Equal<typeof xs, [number, ...number[], '!']>>;
          return [];
        })
        .otherwise(() => {
          return [];
        });

      match(xs)
        .with([1, 2, ...P.array(P.number)], (xs) => {
          type t = Expect<Equal<typeof xs, [number, number, ...number[]]>>;
          return [];
        })
        .otherwise(() => {
          return [];
        });

      match(xs)
        .with([...P.array(P.string), 'a', 'b'], (xs) => {
          type t = Expect<Equal<typeof xs, [...string[], 'a', 'b']>>;
          return [];
        })
        .otherwise(() => {
          return [];
        });
    });

    it('known input', () => {
      const xs: (string | number)[] = [1, 2, 3, 'a', 'b', 'c'];

      match(xs)
        .with([P.any, ...P.array()], (xs) => {
          type t = Expect<
            Equal<typeof xs, [string | number, ...(string | number)[]]>
          >;
          return [];
        })
        .otherwise(() => []);

      match(xs)
        .with([...P.array(), 7], (xs) => {
          type t = Expect<Equal<typeof xs, [...(string | number)[], 7]>>;
          return [];
        })
        .otherwise(() => []);

      match(xs)
        .with([42, ...P.array(P.number)], (xs) => {
          type t = Expect<Equal<typeof xs, [number, ...number[]]>>;
          return [];
        })
        .otherwise(() => []);

      match(xs)
        .with([42, ...P.array(P.number), 7], (xs) => {
          type t = Expect<Equal<typeof xs, [number, ...number[], 7]>>;
          return [];
        })
        .otherwise(() => []);

      match(xs)
        .with(
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...P.array(P.number), 7],
          (xs) => {
            type t = Expect<
              Equal<
                typeof xs,
                [
                  number,
                  number,
                  number,
                  number,
                  number,
                  number,
                  number,
                  number,
                  number,
                  number,
                  ...number[],
                  number
                ]
              >
            >;
            return [];
          }
        )
        .otherwise(() => []);

      match(xs)
        .with([...P.array(P.number), 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (xs) => {
          type t = Expect<
            Equal<typeof xs, [...number[], 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]>
          >;
          return [];
        })
        .otherwise(() => []);

      match(xs)
        .with(
          [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            ...P.array(P.number),
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
          ],
          (xs) => {
            type t = Expect<
              Equal<
                typeof xs,
                [
                  number,
                  number,
                  number,
                  number,
                  number,
                  number,
                  number,
                  number,
                  number,
                  number,
                  ...number[],
                  number,
                  number,
                  number,
                  number,
                  number,
                  number,
                  number,
                  number,
                  number,
                  number
                ]
              >
            >;
            return [];
          }
        )
        .otherwise(() => []);

      match(xs)
        .with([1, 2, ...P.array(P.number)], (xs) => {
          type t = Expect<Equal<typeof xs, [number, number, ...number[]]>>;
          return [];
        })
        .otherwise(() => []);

      match(xs)
        .with([...P.array(P.string), 'a', 'b'], (xs) => {
          type t = Expect<Equal<typeof xs, [...string[], 'a', 'b']>>;
          return [];
        })
        .otherwise(() => []);
    });

    it('select', () => {
      const xs: (string | number)[] = [1, 2, 3, 'a', 'b', 'c'];

      match(xs)
        .with([P.select(), ...P.array()], (xs) => {
          type t = Expect<Equal<typeof xs, string | number>>;
          return [];
        })
        .otherwise(() => []);

      match(xs)
        .with([...P.array(P.select()), 7], (xs) => {
          type t = Expect<Equal<typeof xs, (string | number)[]>>;
          return [];
        })
        .otherwise(() => []);

      match(xs)
        .with([42, ...P.array(P.select(P.number))], (xs) => {
          type t = Expect<Equal<typeof xs, number[]>>;
          return [];
        })
        .otherwise(() => []);

      match(xs)
        .with(
          [P.select('head', 42), ...P.array(P.select('tail', P.number))],
          (xs) => {
            type t = Expect<Equal<typeof xs, { tail: number[]; head: 42 }>>;
            return [];
          }
        )
        .otherwise(() => []);

      match(xs)
        .with([1, 2, ...P.array(P.select(P.number))], (xs) => {
          type t = Expect<Equal<typeof xs, number[]>>;
          return [];
        })
        .otherwise(() => []);

      match(xs).with(
        [
          P.select('a', 1),
          P.select('b', 2),
          ...P.array(P.select('c', P.number)),
        ],
        (xs) => {
          type t = Expect<Equal<typeof xs, { c: number[]; a: 1; b: 2 }>>;
          return [];
        }
      );
      match(xs)
        .with([1, P.select(2), ...P.array(P.number)], (xs) => {
          type t = Expect<Equal<typeof xs, 2>>;
          return [];
        })
        .otherwise(() => []);

      match(xs)
        .with([...P.array(P.select(P.string)), 'a'], (xs) => {
          type t = Expect<Equal<typeof xs, string[]>>;
          return [];
        })
        .otherwise(() => []);

      match(xs).with(
        [...P.array(P.select('inits', P.string)), P.select('last', 'a')],
        (xs) => {
          type t = Expect<Equal<typeof xs, { inits: string[]; last: 'a' }>>;
          return [];
        }
      );
      match(xs)
        .with([...P.array(P.string), P.select()], (xs) => {
          type t = Expect<Equal<typeof xs, string | number>>;
          return [];
        })
        .otherwise(() => []);

      match(xs)
        .with([...P.array(P.select(P.string)), 'a', 'b'], (xs) => {
          type t = Expect<Equal<typeof xs, string[]>>;
          return [];
        })
        .otherwise(() => []);

      match(xs)
        .with([...P.array(P.string), P.select(2), 'b'], (xs) => {
          type t = Expect<Equal<typeof xs, 2>>;
          return [];
        })
        .otherwise(() => []);

      match(xs)
        .with(
          [
            ...P.array(P.select('a', P.string)),
            P.select('b', 2),
            P.select('c', 'b'),
          ],
          (xs) => {
            type t = Expect<Equal<typeof xs, { a: string[]; b: 2; c: 'b' }>>;
            return [];
          }
        )
        .otherwise(() => []);

      match(xs)
        .with([42, ...P.array(P.select(P.number)), '!'], (xs) => {
          type t = Expect<Equal<typeof xs, number[]>>;
          return [];
        })
        .otherwise(() => []);

      match(xs)
        .with(
          [
            P.select('a', 42),
            ...P.array(P.select('b', P.number)),
            P.select('c', '!'),
          ],
          (xs) => {
            type t = Expect<Equal<typeof xs, { b: number[]; a: 42; c: '!' }>>;
            return [];
          }
        )
        .otherwise(() => []);
    });
  });

  describe('exhaustiveness checking', () => {
    it('1 catch-all wildcards', () => {
      const xs: (string | number)[] = [1, 2, 3, 'a', 'b', 'c'];

      const throws = () =>
        match([])
          .with([P.any, ...P.array()], (xs) => {
            return 'branch 1' as const;
          })
          // @ts-expect-error: empty list case missing
          .exhaustive();

      expect(() => throws()).toThrow();

      const res = match(xs)
        .with([P.any, ...P.array()], (xs) => {
          return 'branch 1' as const;
        })
        .with([], (xs) => {
          return 'branch 2' as const;
        })
        .exhaustive();

      type t = Expect<Equal<typeof res, 'branch 1' | 'branch 2'>>;

      expect(res).toBe('branch 1');
    });

    it('2 catch-all wildcards', () => {
      const xs: (string | number)[] = [1, 2, 3, 'a', 'b', 'c'];

      match(xs)
        .with([P.any, P.any, ...P.array()], (xs) => {
          return 'branch 1' as const;
        })
        // @ts-expect-error: empty list case missing
        .exhaustive();

      match(xs)
        .with([P.any, P.any, ...P.array()], (xs) => {
          return 'branch 1' as const;
        })
        .with([P.any, ...P.array()], (xs) => {
          return 'branch 2' as const;
        })
        // @ts-expect-error: empty list case missing
        .exhaustive();

      const res = match(xs)
        .with([P.any, P.any, ...P.array()], (xs) => {
          return 'branch 1' as const;
        })
        .with([P.any, ...P.array()], (xs) => {
          return 'branch 2' as const;
        })
        .with([], (xs) => {
          return 'branch 3' as const;
        })
        .exhaustive();

      type t = Expect<Equal<typeof res, 'branch 1' | 'branch 2' | 'branch 3'>>;

      expect(res).toBe('branch 1');
    });
  });
});
