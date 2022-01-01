import { matchPattern, getSelectionKeys, flatMap } from './helpers';
import * as symbols from './symbols';
import { GuardFunction } from './types/helpers';
import { InvertPattern } from './types/InvertPattern';
import {
  Pattern,
  UnknownPattern,
  OptionalP,
  ArrayP,
  AndP,
  OrP,
  NotP,
  GuardP,
  SelectP,
} from './types/Pattern';

export const optional = <
  input,
  p extends unknown extends input ? UnknownPattern : Pattern<input>
>(
  pattern: p
): OptionalP<input, p> => {
  return {
    [symbols.matcher]() {
      return {
        match: (value: input) => {
          let selections: Record<string, unknown[]> = {};
          const selector = (key: string, value: any) => {
            selections[key] = value;
          };
          if (value === undefined) {
            getSelectionKeys(pattern).forEach((key) =>
              selector(key, undefined)
            );
            return { matched: true, selections };
          }
          const matched = matchPattern(pattern, value, selector);
          return { matched, selections };
        },
        getSelectionKeys: () => getSelectionKeys(pattern),
        matcherType: 'optional',
      };
    },
  };
};

type Elem<xs> = xs extends Array<infer x> ? x : unknown;

export const array = <
  input,
  p extends unknown extends input ? UnknownPattern : Pattern<Elem<input>>
>(
  pattern: p
): ArrayP<input, p> => {
  return {
    [symbols.matcher]() {
      return {
        match: (value: input) => {
          if (!Array.isArray(value)) return { matched: false };
          let selections: Record<string, unknown[]> = {};

          const selector = (key: string, value: unknown) => {
            selections[key] = (selections[key] || []).concat([value]);
          };
          const matched = value.every((v) =>
            matchPattern(pattern, v, selector)
          );

          return { matched, selections };
        },
        getSelectionKeys: () => getSelectionKeys(pattern),
      };
    },
  };
};

export const intersection = <
  input,
  ps extends unknown extends input
    ? [UnknownPattern, ...UnknownPattern[]]
    : [Pattern<input>, ...Pattern<input>[]]
>(
  ...patterns: ps
): AndP<input, ps> => ({
  [symbols.matcher]: () => ({
    match: (value) => {
      let selections: Record<string, unknown[]> = {};
      const selector = (key: string, value: any) => {
        selections[key] = value;
      };
      const matched = (patterns as UnknownPattern[]).every((p) =>
        matchPattern(p, value, selector)
      );
      return { matched, selections };
    },
    getSelectionKeys: () =>
      (patterns as UnknownPattern[]).reduce<string[]>(
        (acc, p) => acc.concat(getSelectionKeys(p)),
        []
      ),
    matcherType: 'and',
  }),
});

export const union = <
  input,
  ps extends unknown extends input
    ? [UnknownPattern, ...UnknownPattern[]]
    : [Pattern<input>, ...Pattern<input>[]]
>(
  ...patterns: ps
): OrP<input, ps> => ({
  [symbols.matcher]: () => ({
    match: (value) => {
      let selections: Record<string, unknown[]> = {};
      const selector = (key: string, value: any) => {
        selections[key] = value;
      };
      flatMap(patterns as UnknownPattern[], getSelectionKeys).forEach((key) =>
        selector(key, undefined)
      );
      const matched = (patterns as UnknownPattern[]).some((p) =>
        matchPattern(p, value, selector)
      );
      return { matched, selections };
    },
    getSelectionKeys: () =>
      (patterns as UnknownPattern[]).reduce<string[]>(
        (acc, p) => acc.concat(getSelectionKeys(p)),
        []
      ),
    matcherType: 'or',
  }),
});

export const not = <
  input,
  p extends unknown extends input ? UnknownPattern : Pattern<input>
>(
  pattern: p
): NotP<input, p> => ({
  [symbols.matcher]: () => ({
    match: (value) => ({ matched: !matchPattern(pattern, value, () => {}) }),
    getSelectionKeys: () => [],
    matcherType: 'not',
  }),
});

export const when = <input, narrowed extends input = never>(
  predicate: GuardFunction<input, narrowed>
): GuardP<input, narrowed> => ({
  [symbols.matcher]: () => ({
    match: (value) => ({ matched: predicate(value) }),
  }),
});

export function select(): SelectP<symbols.anonymousSelectKey>;
export function select<k extends string>(key: k): SelectP<k>;
export function select<k extends string>(
  key?: k
): SelectP<k | symbols.anonymousSelectKey> {
  return {
    [symbols.matcher]() {
      return {
        match: (value) => ({
          matched: true,
          selections: { [key ?? symbols.anonymousSelectKey]: value },
        }),
        getSelectionKeys: () => [key ?? symbols.anonymousSelectKey],
      };
    },
  };
}

function isUnknown(x: unknown): x is unknown {
  return true;
}

function isNumber<T>(x: T | number): x is number {
  return typeof x === 'number';
}

function isString<T>(x: T | string): x is string {
  return typeof x === 'string';
}

function isBoolean<T>(x: T | boolean): x is boolean {
  return typeof x === 'boolean';
}

function isBigInt<T>(x: T | bigint): x is bigint {
  return typeof x === 'bigint';
}

function isSymbol<T>(x: T | symbol): x is symbol {
  return typeof x === 'symbol';
}

function isNullish<T>(x: T | null | undefined): x is null | undefined {
  return x === null || x === undefined;
}

type AnyConstructor = new (...args: any[]) => any;

function isInstanceOf<T extends AnyConstructor>(classConstructor: T) {
  return (val: unknown): val is InstanceType<T> =>
    val instanceof classConstructor;
}

/**
 * ### Catch All wildcard
 * `__` is a wildcard pattern, matching **any value**.
 * @example
 *  match(value)
 *   .with(__, () => 'will always match')
 */
export const __ = when(isUnknown);

/**
 * ### String wildcard
 * `P.string` is a wildcard pattern matching any **string**.
 * @example
 *  match(value)
 *   .with(P.string, () => 'will match on strings only')
 */

export const string = when(isString);

/**
 * ### Number wildcard
 * `P.number` is a wildcard pattern matching any **number**.
 * @example
 *  match(value)
 *   .with(P.number, () => 'will match on numbers only')
 */
export const number = when(isNumber);

/**
 * ### Boolean wildcard
 * `P.boolean` is a wildcard pattern matching any **boolean**.
 * @example
 *   .with(P.boolean, () => 'will match on booleans only')
 */
export const boolean = when(isBoolean);

/**
 * ### BigInt wildcard
 * `P.bigint` is a wildcard pattern matching any **bigint**.
 * @example
 *   .with(P.bigint, () => 'will match on bigints only')
 */
export const bigint = when(isBigInt);

/**
 * ### Symbol wildcard
 * `P.symbol` is a wildcard pattern matching any **symbol**.
 * @example
 *   .with(P.symbol, () => 'will match on symbols only')
 */
export const symbol = when(isSymbol);

/**
 * ### Nullish wildcard
 * `P.nullish` is a wildcard pattern matching **null** or **undefined**.
 * @example
 *   .with(P.nullish, () => 'will match on null or undefined only')
 */
export const nullish = when(isNullish);

/**
 * ### instanceOf
 * `P.instanceOf(SomeClass)` is a pattern matching instances of a given class.
 * @example
 *   .with(P.instanceOf(SomeClass), () => 'will match on SomeClass instances')
 */
export const instanceOf = <T extends AnyConstructor>(classConstructor: T) =>
  when<unknown, InstanceType<T>>(isInstanceOf(classConstructor));

/**
 * ### infer
 * `P.infer<typeof somePattern>` will return the type of the value
 * matched by this pattern
 * @example
 * const userPattern = { name: P.string }
 * type User = P.infer<typeof userPattern>
 */
export type infer<p extends Pattern<any>> = InvertPattern<p>;
