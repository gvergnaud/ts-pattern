import { match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('variadic tuples ([a, ...b[]])', () => {
  it('unknown input', () => {
    const xs: unknown[] = [1, 2, 3, 'a', 'b', 'c'];

    match(xs)
      .with([P.any, ...P.array()], (xs) => {
        type t = Expect<Equal<typeof xs, [unknown, ...unknown[]]>>;
        return [];
      })
      .with([...P.array(), 7], (xs) => {
        type t = Expect<Equal<typeof xs, [...unknown[], number]>>;
        return [];
      })
      .with([42 as const, ...P.array(P.number)], (xs) => {
        type t = Expect<Equal<typeof xs, [42, ...number[]]>>;
        return [];
      })
      .with([42, ...P.array(P.number), '!'] as const, (xs) => {
        type t = Expect<Equal<typeof xs, [42, ...number[], '!']>>;
        return [];
      })
      .with([1, 2, ...P.array(P.number)] as const, (xs) => {
        type t = Expect<Equal<typeof xs, [1, 2, ...number[]]>>;
        return [];
      })
      .with([...P.array(P.string), 'a', 'b'] as const, (xs) => {
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
      .with([...P.array(), 7 as const], (xs) => {
        type t = Expect<Equal<typeof xs, [...(string | number)[], 7]>>;
        return [];
      })
      .with([42 as const, ...P.array(P.number)], (xs) => {
        type t = Expect<Equal<typeof xs, [42, ...number[]]>>;
        return [];
      })
      .with([42, ...P.array(P.number), 7] as const, (xs) => {
        type t = Expect<Equal<typeof xs, [42, ...number[], 7]>>;
        return [];
      })
      .with([1, 2, ...P.array(P.number)] as const, (xs) => {
        type t = Expect<Equal<typeof xs, [1, 2, ...number[]]>>;
        return [];
      })
      .with([...P.array(P.string), 'a', 'b'] as const, (xs) => {
        type t = Expect<Equal<typeof xs, [...string[], 'a', 'b']>>;
        return [];
      })
      .otherwise(() => {
        return [];
      });
  });

  it('select', () => {
    const xs: (string | number)[] = [1, 2, 3, 'a', 'b', 'c'];

    match(xs)
      .with([P.select(), ...P.array()], (xs) => {
        type t = Expect<Equal<typeof xs, string | number>>;
        return [];
      })
      .with([...P.array(P.select()), 7], (xs) => {
        type t = Expect<Equal<typeof xs, (string | number)[]>>;
        return [];
      })
      .with([42 as const, ...P.array(P.select(P.number))], (xs) => {
        type t = Expect<Equal<typeof xs, number[]>>;
        return [];
      })
      .with([42, ...P.array(P.select(P.number)), '!'] as const, (xs) => {
        type t = Expect<Equal<typeof xs, number[]>>;
        return [];
      })
      .with([1, 2, ...P.array(P.select(P.number))] as const, (xs) => {
        type t = Expect<Equal<typeof xs, number[]>>;
        return [];
      })
      .with([...P.array(P.select(P.string)), 'a', 'b'] as const, (xs) => {
        type t = Expect<Equal<typeof xs, string[]>>;
        return [];
      })
      .with([1, P.select(2), ...P.array(P.number)] as const, (xs) => {
        type t = Expect<Equal<typeof xs, 2>>;
        return [];
      })
      .with([...P.array(P.string), P.select(2), 'b'] as const, (xs) => {
        type t = Expect<Equal<typeof xs, 2>>;
        return [];
      })
      .otherwise(() => []);
  });

  describe('exhaustiveness checking', () => {
    it('catch-all wildcards', () => {
      const xs: (string | number)[] = [1, 2, 3, 'a', 'b', 'c'];

      match(xs)
        .with([P.any, ...P.array()], (xs) => {
          return 'branch 1' as const;
        })
        // @ts-expect-error: empty list case missing
        .exhaustive();

      const res = match(xs)
        .with([P.any, ...P.array()], (xs) => {
          return 'branch 1' as const;
        })
        .with([], (xs) => {
          return 'branch 2' as const;
        })
        .exhaustive();

      type t = Expect<Equal<typeof res, 'branch 1' | 'branch 2'>>;
    });
  });
});
