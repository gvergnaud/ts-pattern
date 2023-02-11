import { Expect, Equal } from '../src/types/helpers';
import { match, P } from '../src';

describe('Set', () => {
  it('should match Set patterns', () => {
    const containsGabAndYo = (set: Set<string | number>) =>
      match<Set<string | number>, [boolean, boolean]>(set)
        .with(P.set('gab'), (x) => {
          type t = Expect<Equal<typeof x, Set<'gab'>>>;
          return [true, false];
        })
        .with(P.set('yo'), (x) => {
          type t = Expect<Equal<typeof x, Set<'yo'>>>;
          return [false, true];
        })
        .with(P.set(P.union('gab', 'yo')), (x) => {
          type t = Expect<Equal<typeof x, Set<'gab' | 'yo'>>>;
          return [true, true];
        })
        .with(P._, (x) => {
          type t = Expect<Equal<typeof x, Set<string | number>>>;
          return [false, false];
        })
        .run();

    expect(containsGabAndYo(new Set(['gab', 'yo']))).toEqual([true, true]);
    expect(containsGabAndYo(new Set(['gab']))).toEqual([true, false]);
    expect(containsGabAndYo(new Set(['yo']))).toEqual([false, true]);
    expect(containsGabAndYo(new Set(['hello']))).toEqual([false, false]);
    expect(containsGabAndYo(new Set([2]))).toEqual([false, false]);
  });

  it("should match any set if P.set isn't given any arguments", () => {
    const someSet = new Set([1, 2, 3]);

    const res = match(someSet)
      .with(P.set(), () => true)
      .exhaustive();

    type t = Expect<Equal<typeof res, boolean>>;

    expect(res).toEqual(true);
  });
});
