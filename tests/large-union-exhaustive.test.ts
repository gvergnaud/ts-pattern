/**
 * Tests for exhaustiveness checking and runtime correctness with large unions.
 * Covers gaps not in large-exhaustive.test.ts or exhaustive-match.test.ts:
 * - Runtime matching of all members of a large string union (BigUnion)
 * - P.union() batching to cover multiple members at once
 * - P._ as the final catch-all completing exhaustiveness
 * - Large discriminated object unions (10+ variants)
 * - Cross-product: two fields each with a multi-member union
 * - Mixed-type large unions (string | number | boolean | null)
 */
import { match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';
import { BigUnion } from './types-catalog/utils';

// ─── helpers ────────────────────────────────────────────────────────────────

const ALL_BIG_UNION_VALUES: BigUnion[] = [
  'a','b','c','d','e','f','g','h','i','j','k','l','m',
  'n','o','p','q','r','s','t','u','v','w','x','y','z',
];

// ─── tests ───────────────────────────────────────────────────────────────────

describe('large union exhaustiveness', () => {
  describe('BigUnion (26 string literals) runtime matching', () => {
    it('should match every member individually and return the correct value', () => {
      const fn = (v: BigUnion): string =>
        match(v)
          .with('a', () => 'A').with('b', () => 'B').with('c', () => 'C')
          .with('d', () => 'D').with('e', () => 'E').with('f', () => 'F')
          .with('g', () => 'G').with('h', () => 'H').with('i', () => 'I')
          .with('j', () => 'J').with('k', () => 'K').with('l', () => 'L')
          .with('m', () => 'M').with('n', () => 'N').with('o', () => 'O')
          .with('p', () => 'P').with('q', () => 'Q').with('r', () => 'R')
          .with('s', () => 'S').with('t', () => 'T').with('u', () => 'U')
          .with('v', () => 'V').with('w', () => 'W').with('x', () => 'X')
          .with('y', () => 'Y').with('z', () => 'Z')
          .exhaustive();

      ALL_BIG_UNION_VALUES.forEach((v) => {
        expect(fn(v)).toBe(v.toUpperCase());
      });
    });

    it('should not be exhaustive when one member is missing', () => {
      // TypeScript enforces this at compile time — verify runtime throws too
      expect(() =>
        match('z' as BigUnion)
          .with('a', () => 1).with('b', () => 1).with('c', () => 1)
          .with('d', () => 1).with('e', () => 1).with('f', () => 1)
          .with('g', () => 1).with('h', () => 1).with('i', () => 1)
          .with('j', () => 1).with('k', () => 1).with('l', () => 1)
          .with('m', () => 1).with('n', () => 1).with('o', () => 1)
          .with('p', () => 1).with('q', () => 1).with('r', () => 1)
          .with('s', () => 1).with('t', () => 1).with('u', () => 1)
          .with('v', () => 1).with('w', () => 1).with('x', () => 1)
          .with('y', () => 1)
          // @ts-expect-error 'z' is missing
          .exhaustive()
      ).toThrow();
    });
  });

  describe('P.union() batching large unions', () => {
    it('should cover all 26 members using P.union() groups', () => {
      const fn = (v: BigUnion): string =>
        match(v)
          .with(P.union('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'), () => 'a-i')
          .with(P.union('j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r'), () => 'j-r')
          .with(P.union('s', 't', 'u', 'v', 'w', 'x', 'y', 'z'), () => 's-z')
          .exhaustive();

      expect(fn('a')).toBe('a-i');
      expect(fn('j')).toBe('j-r');
      expect(fn('z')).toBe('s-z');
      ALL_BIG_UNION_VALUES.forEach((v) =>
        expect(typeof fn(v)).toBe('string')
      );
    });

    it('should not be exhaustive when a P.union() group is missing', () => {
      expect(() =>
        match('z' as BigUnion)
          .with(P.union('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'), () => 'a-i')
          .with(P.union('j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r'), () => 'j-r')
          // @ts-expect-error 's'-'z' group missing
          .exhaustive()
      ).toThrow();
    });
  });

  describe('P._ as final catch-all completing exhaustiveness', () => {
    it('P._ after partial coverage should be exhaustive', () => {
      const fn = (v: BigUnion): string =>
        match(v)
          .with('a', () => 'vowel a')
          .with('e', () => 'vowel e')
          .with('i', () => 'vowel i')
          .with('o', () => 'vowel o')
          .with('u', () => 'vowel u')
          .with(P._, () => 'consonant')
          .exhaustive();

      expect(fn('a')).toBe('vowel a');
      expect(fn('e')).toBe('vowel e');
      expect(fn('b')).toBe('consonant');
      expect(fn('z')).toBe('consonant');
    });

    it('P.string after partial coverage should be exhaustive for string unions', () => {
      const fn = (v: BigUnion): string =>
        match(v)
          .with('a', () => 'starts with a')
          .with(P.string, (v) => `other: ${v}`)
          .exhaustive();

      expect(fn('a')).toBe('starts with a');
      expect(fn('z')).toBe('other: z');
    });
  });

  describe('large discriminated object union (10 variants)', () => {
    type Action =
      | { type: 'init' }
      | { type: 'start'; payload: string }
      | { type: 'stop' }
      | { type: 'pause' }
      | { type: 'resume' }
      | { type: 'reset'; hard: boolean }
      | { type: 'error'; message: string }
      | { type: 'warn'; message: string }
      | { type: 'info'; message: string }
      | { type: 'done'; result: number };

    const reduce = (action: Action): string =>
      match(action)
        .with({ type: 'init' }, () => 'initialized')
        .with({ type: 'start' }, ({ payload }) => `started: ${payload}`)
        .with({ type: 'stop' }, () => 'stopped')
        .with({ type: 'pause' }, () => 'paused')
        .with({ type: 'resume' }, () => 'resumed')
        .with({ type: 'reset', hard: true }, () => 'hard reset')
        .with({ type: 'reset', hard: false }, () => 'soft reset')
        .with({ type: 'error' }, ({ message }) => `error: ${message}`)
        .with({ type: 'warn' }, ({ message }) => `warn: ${message}`)
        .with({ type: 'info' }, ({ message }) => `info: ${message}`)
        .with({ type: 'done' }, ({ result }) => `done: ${result}`)
        .exhaustive();

    it('should match each variant correctly', () => {
      expect(reduce({ type: 'init' })).toBe('initialized');
      expect(reduce({ type: 'start', payload: 'job1' })).toBe('started: job1');
      expect(reduce({ type: 'stop' })).toBe('stopped');
      expect(reduce({ type: 'reset', hard: true })).toBe('hard reset');
      expect(reduce({ type: 'reset', hard: false })).toBe('soft reset');
      expect(reduce({ type: 'error', message: 'oops' })).toBe('error: oops');
      expect(reduce({ type: 'done', result: 42 })).toBe('done: 42');
    });

    it('should not be exhaustive when a variant is missing', () => {
      expect(() =>
        match({ type: 'done', result: 0 } as Action)
          .with({ type: 'init' }, () => '')
          .with({ type: 'start' }, () => '')
          .with({ type: 'stop' }, () => '')
          .with({ type: 'pause' }, () => '')
          .with({ type: 'resume' }, () => '')
          .with({ type: 'reset' }, () => '')
          .with({ type: 'error' }, () => '')
          .with({ type: 'warn' }, () => '')
          .with({ type: 'info' }, () => '')
          // @ts-expect-error 'done' is missing
          .exhaustive()
      ).toThrow();
    });
  });

  describe('cross-product: two fields each with a multi-member union', () => {
    type Color = 'red' | 'green' | 'blue';
    type Size = 'sm' | 'md' | 'lg';

    it('should correctly match specific combinations', () => {
      const fn = (color: Color, size: Size): string =>
        match({ color, size })
          .with({ color: 'red', size: 'sm' }, () => 'small red')
          .with({ color: 'red', size: 'md' }, () => 'medium red')
          .with({ color: 'red', size: 'lg' }, () => 'large red')
          .with({ color: 'green' }, () => 'any green')
          .with({ color: 'blue' }, () => 'any blue')
          .exhaustive();

      expect(fn('red', 'sm')).toBe('small red');
      expect(fn('red', 'md')).toBe('medium red');
      expect(fn('red', 'lg')).toBe('large red');
      expect(fn('green', 'sm')).toBe('any green');
      expect(fn('blue', 'lg')).toBe('any blue');
    });

    it('should not be exhaustive when a combination is missing', () => {
      expect(() =>
        match({ color: 'blue', size: 'sm' } as { color: Color; size: Size })
          .with({ color: 'red' }, () => 'red')
          .with({ color: 'green' }, () => 'green')
          // @ts-expect-error blue is missing
          .exhaustive()
      ).toThrow();
    });
  });

  describe('mixed-type large union (string | number | boolean | null | object)', () => {
    type Mixed =
      | string
      | number
      | boolean
      | null
      | { kind: 'a' }
      | { kind: 'b' }
      | { kind: 'c' };

    it('should be exhaustive when all branches are covered', () => {
      const fn = (v: Mixed): string =>
        match(v)
          .with(P.string, (s) => `str:${s}`)
          .with(P.number, (n) => `num:${n}`)
          .with(P.boolean, (b) => `bool:${b}`)
          .with(null, () => 'null')
          .with({ kind: 'a' }, () => 'a')
          .with({ kind: 'b' }, () => 'b')
          .with({ kind: 'c' }, () => 'c')
          .exhaustive();

      expect(fn('hello')).toBe('str:hello');
      expect(fn(42)).toBe('num:42');
      expect(fn(true)).toBe('bool:true');
      expect(fn(null)).toBe('null');
      expect(fn({ kind: 'a' })).toBe('a');
    });

    it('should not be exhaustive when a type branch is missing', () => {
      expect(() =>
        match({ kind: 'c' } as Mixed)
          .with(P.string, () => '')
          .with(P.number, () => '')
          .with(P.boolean, () => '')
          .with(null, () => '')
          .with({ kind: 'a' }, () => '')
          .with({ kind: 'b' }, () => '')
          // @ts-expect-error { kind: 'c' } is missing
          .exhaustive()
      ).toThrow();
    });
  });
});
