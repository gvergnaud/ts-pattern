import { match, __ } from '../src';
import { NotNever } from './utils';

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
    expect(containsGabAndYo(new Set(['gab', 'hello']))).toEqual([true, false]);
    expect(containsGabAndYo(new Set(['yo', 'hello']))).toEqual([false, true]);
    expect(containsGabAndYo(new Set(['hello']))).toEqual([false, false]);
    expect(containsGabAndYo(new Set([]))).toEqual([false, false]);
    expect(containsGabAndYo(new Set([2]))).toEqual([false, false]);
  });
});
