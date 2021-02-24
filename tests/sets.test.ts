import { Expect, Equal } from '../src/types/helpers';
import { match, __ } from '../src';

describe('Set', () => {
  it('should match Set patterns', () => {
    const containsGabAndYo = (set: Set<string | number>) =>
      match<Set<string | number>, [boolean, boolean]>(set)
        .with(new Set(['gab', 'yo']), (x) => {
          type t = Expect<Equal<typeof x, Set<string>>>;
          return [true, true];
        })
        .with(new Set(['gab']), (x) => {
          type t = Expect<Equal<typeof x, Set<string>>>;
          return [true, false];
        })
        .with(new Set(['yo']), (x) => {
          type t = Expect<Equal<typeof x, Set<string>>>;
          return [false, true];
        })
        .with(__, (x) => {
          type t = Expect<Equal<typeof x, Set<string | number>>>;
          return [false, false];
        })
        .run();

    expect(containsGabAndYo(new Set(['gab', 'yo', 'hello']))).toEqual([
      true,
      true,
    ]);
    expect(containsGabAndYo(new Set(['gab', 'hello']))).toEqual([true, false]);
    expect(containsGabAndYo(new Set(['yo', 'hello']))).toEqual([false, true]);
    expect(containsGabAndYo(new Set(['hello']))).toEqual([false, false]);
    expect(containsGabAndYo(new Set([]))).toEqual([false, false]);
    expect(containsGabAndYo(new Set([2]))).toEqual([false, false]);
  });
});
