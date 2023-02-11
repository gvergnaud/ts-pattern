import { match, P } from '../src';
import { InvertPattern } from '../src/types/InvertPattern';
import { Equal, Expect } from '../src/types/helpers';

describe('variadic tuples ([a, ...b[]])', () => {
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
        type t = Expect<Equal<typeof xs, [42, ...number[]]>>;
        return [];
      })
      .otherwise(() => {
        return [];
      });

    match(xs)
      .with([42, ...P.array(P.number), '!' as const], (xs) => {
        type t = Expect<Equal<typeof xs, [42, ...number[], '!']>>;
        return [];
      })
      .otherwise(() => {
        return [];
      });

    match(xs)
      .with([1, 2, ...P.array(P.number)], (xs) => {
        type t = Expect<Equal<typeof xs, [1, 2, ...number[]]>>;
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
        type t = Expect<Equal<typeof xs, [42, ...number[]]>>;
        return [];
      })
      .otherwise(() => []);

    match(xs)
      .with([42, ...P.array(P.number), 7], (xs) => {
        type t = Expect<Equal<typeof xs, [42, ...number[], 7]>>;
        return [];
      })
      .otherwise(() => []);

    match(xs)
      .with([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...P.array(P.number), 7], (xs) => {
        type t = Expect<
          Equal<typeof xs, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...number[], 7]>
        >;
        return [];
      })
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
                ...number[],
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10
              ]
            >
          >;
          return [];
        }
      )
      .otherwise(() => []);

    match(xs)
      .with([1, 2, ...P.array(P.number)], (xs) => {
        type t = Expect<Equal<typeof xs, [1, 2, ...number[]]>>;
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
      [P.select('a', 1), P.select('b', 2), ...P.array(P.select('c', P.number))],
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

  describe('exhaustiveness checking', () => {
    it('1 catch-all wildcards', () => {
      const xs: (string | number)[] = [1, 2, 3, 'a', 'b', 'c'];

      match(xs)
        .with([P.any, ...P.array()], (xs) => {
          return 'branch 1';
        })
        // @ts-expect-error: empty list case missing
        .exhaustive();

      const res = match(xs)
        .with([P.any, ...P.array()], (xs) => {
          return 'branch 1';
        })
        .with([], (xs) => {
          return 'branch 2';
        })
        .exhaustive();

      type t = Expect<Equal<typeof res, 'branch 1' | 'branch 2'>>;
    });

    it('2 catch-all wildcards', () => {
      const xs: (string | number)[] = [1, 2, 3, 'a', 'b', 'c'];

      match(xs)
        .with([P.any, P.any, ...P.array()], (xs) => {
          return 'branch 1';
        })
        // @ts-expect-error: empty list case missing
        .exhaustive();

      match(xs)
        .with([P.any, P.any, ...P.array()], (xs) => {
          return 'branch 1';
        })
        .with([P.any, ...P.array()], (xs) => {
          return 'branch 1';
        })
        // @ts-expect-error: empty list case missing
        .exhaustive();

      const res = match(xs)
        .with([P.any, P.any, ...P.array()], (xs) => {
          return 'branch 1';
        })
        .with([P.any, ...P.array()], (xs) => {
          return 'branch 1';
        })
        .with([], (xs) => {
          return 'branch 2';
        })
        .exhaustive();

      type t = Expect<Equal<typeof res, 'branch 1' | 'branch 2'>>;
    });
  });
});
