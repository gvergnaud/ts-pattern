import { match, P } from '../src';

describe('variadic tuples ([a, ...b[]])', () => {
  it('', () => {
    const xs: unknown[] = [1, 2, 3, 'a', 'b', 'c'];

    match(xs)
      .with([P.any, ...P.array()], (xs) => [])
      .with([...P.array(), 7], (xs) => [])
      .with([42 as const, ...P.array(P.number)], (xs) => [])
      .with([42, ...P.array(P.number), '!'] as const, (xs) => [])
      .otherwise(() => []);
  });
});
