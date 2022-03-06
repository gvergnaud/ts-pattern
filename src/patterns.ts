import { matchPattern, getSelectionKeys, flatMap } from './internals/helpers';
import * as symbols from './internals/symbols';
import { None } from './types/FindSelected';
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
  AnonymousSelectP,
  Matchable,
  GuardExcludeP,
} from './types/Pattern';

/**
 * ### Optional pattern
 * `P.optional(subpattern)` takes a sub pattern and returns a pattern which matches if the
 * key is undefined or if it is defined and the sub pattern matches its value.
 * @example
 *  match(value)
 *   .with({ greeting: P.optional('Hello') }, () => 'will match { greeting?: "Hello" }')
 */
export function optional<
  input,
  p extends unknown extends input ? UnknownPattern : Pattern<input>
>(pattern: p): OptionalP<input, p> {
  return {
    [symbols.matcher]() {
      return {
        match: <I extends input>(value: I) => {
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
}

type Elem<xs> = xs extends Array<infer x> ? x : never;

/**
 * ### Array pattern
 * `P.array(subpattern)` takes a sub pattern and returns a pattern, which matches
 * arrays if all their elements match the sub pattern.
 * @example
 *  match(value)
 *   .with({ users: P.array({ name: P.string }) }, () => 'will match { name: string }[]')
 */
export function array<
  input,
  p extends unknown extends input ? UnknownPattern : Pattern<Elem<input>>
>(pattern: p): ArrayP<input, p> {
  return {
    [symbols.matcher]() {
      return {
        match: <I extends input>(value: I) => {
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
}

/**
 * ### Intersection pattern
 * `P.intersection(...patterns)` returns a pattern which matches
 * only if **every** patterns provided in parameter match the input.
 * @example
 *  match(value)
 *   .with(
 *     {
 *       user: P.intersection(
 *         { firstname: P.string },
 *         { lastname: P.string },
 *         { age: P.when(age => age > 21) }
 *       )
 *     },
 *     ({ user }) => 'will match { firstname: string, lastname: string, age: number } if age > 21'
 *   )
 */
export function intersection<
  input,
  ps extends unknown extends input
    ? [UnknownPattern, ...UnknownPattern[]]
    : [Pattern<input>, ...Pattern<input>[]]
>(...patterns: ps): AndP<input, ps> {
  return {
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
        flatMap(patterns as UnknownPattern[], getSelectionKeys),
      matcherType: 'and',
    }),
  };
}

/**
 * ### Union pattern
 * `P.union(...patterns)` returns a pattern which matches
 * if **at least one** of the patterns provided in parameter match the input.
 * @example
 *  match(value)
 *   .with(
 *     {
 *       type: P.union('a', 'b', 'c')
 *     },
 *     ({ user }) => 'will match { type: "a" | "b" | "c" }'
 *   )
 */
export function union<
  input,
  ps extends unknown extends input
    ? [UnknownPattern, ...UnknownPattern[]]
    : [Pattern<input>, ...Pattern<input>[]]
>(...patterns: ps): OrP<input, ps> {
  return {
    [symbols.matcher]: () => ({
      match: <I extends input>(value: I) => {
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
        flatMap(patterns as UnknownPattern[], getSelectionKeys),
      matcherType: 'or',
    }),
  };
}

/**
 * ### Not pattern
 * `P.not(pattern)` returns a pattern which matches if the sub pattern
 * doesn't match.
 * @example
 *  match<{ a: string | number }>(value)
 *   .with({ a: P.not(P.string) }, (x) => 'will match { a: number }'
 *   )
 */
export function not<
  input,
  p extends unknown extends input ? UnknownPattern : Pattern<input> | undefined
>(pattern: p): NotP<input, p> {
  return {
    [symbols.matcher]: () => ({
      match: <I extends input>(value: I) => ({
        matched: !matchPattern(pattern, value, () => {}),
      }),
      getSelectionKeys: () => [],
      matcherType: 'not',
    }),
  };
}

/**
 * ### When pattern
 * `P.when((value) => boolean)` returns a pattern which matches
 * if the predicate returns true for the current input.
 * @example
 *  match<{ age: number }>(value)
 *   .with({ age: P.when(age => age > 21) }, (x) => 'will match if value.age > 21'
 *   )
 */
export function when<input, p extends (value: input) => unknown>(
  predicate: p
): GuardP<
  input,
  p extends (value: any) => value is infer narrowed ? narrowed : never
>;
export function when<input, narrowed extends input, excluded>(
  predicate: (input: input) => input is narrowed
): GuardExcludeP<input, narrowed, excluded>;
export function when<input, p extends (value: input) => unknown>(
  predicate: p
): GuardP<
  input,
  p extends (value: any) => value is infer narrowed ? narrowed : never
> {
  return {
    [symbols.matcher]: () => ({
      match: <I extends input>(value: I) => ({
        matched: Boolean(predicate(value)),
      }),
    }),
  };
}

/**
 * ### Select pattern
 * `P.select()` is a pattern which will always match,
 * and will inject the selected piece of input in the handler function.
 * @example
 *  match<{ age: number }>(value)
 *   .with({ age: P.select() }, (age) => 'age: number'
 *   )
 */
export function select(): AnonymousSelectP;
export function select<
  input,
  patternOrKey extends
    | string
    | (unknown extends input ? UnknownPattern : Pattern<input>)
>(
  patternOrKey: patternOrKey
): patternOrKey extends string
  ? SelectP<patternOrKey>
  : SelectP<symbols.anonymousSelectKey, input, patternOrKey>;
export function select<
  input,
  p extends unknown extends input ? UnknownPattern : Pattern<input>,
  k extends string
>(key: k, pattern: p): SelectP<k, input, p>;
export function select(
  ...args: [keyOrPattern?: unknown | string, pattern?: unknown]
): SelectP<string> {
  const key: string | undefined =
    typeof args[0] === 'string' ? args[0] : undefined;
  const pattern: unknown =
    args.length === 2
      ? args[1]
      : typeof args[0] === 'string'
      ? undefined
      : args[0];
  return {
    [symbols.matcher]() {
      return {
        match: (value) => {
          let selections: Record<string, unknown> = {
            [key ?? symbols.anonymousSelectKey]: value,
          };
          const selector = (key: string, value: any) => {
            selections[key] = value;
          };
          return {
            matched:
              pattern === undefined
                ? true
                : matchPattern(pattern, value, selector),
            selections: selections,
          };
        },
        getSelectionKeys: () =>
          [key ?? symbols.anonymousSelectKey].concat(
            pattern === undefined ? [] : getSelectionKeys(pattern)
          ),
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
export function instanceOf<T extends AnyConstructor>(
  classConstructor: T
): GuardP<unknown, InstanceType<T>> {
  return when(isInstanceOf(classConstructor));
}
/**
 * ### infer
 * `P.infer<typeof somePattern>` will return the type of the value
 * matched by this pattern
 * @example
 * const userPattern = { name: P.string }
 * type User = P.infer<typeof userPattern>
 */
export type infer<p extends Pattern<any>> = InvertPattern<p>;

/**
 * ### typed
 * `P.typed<SomeType>()` is a way to set the input type this
 * pattern should match.
 *
 * It returns all utility functions to create patterns,
 * Like `array`, `union`, `intersection`, etc.
 */
export function typed<input>(): {
  array<p extends Pattern<Elem<input>>>(pattern: p): ArrayP<input, p>;

  optional<p extends Pattern<input>>(pattern: p): OptionalP<input, p>;

  intersection<ps extends [Pattern<input>, ...Pattern<input>[]]>(
    ...patterns: ps
  ): AndP<input, ps>;

  union<ps extends [Pattern<input>, ...Pattern<input>[]]>(
    ...patterns: ps
  ): OrP<input, ps>;

  not<p extends Pattern<input>>(pattern: p): NotP<input, p>;

  when<narrowed extends input = never>(
    predicate: GuardFunction<input, narrowed>
  ): GuardP<input, narrowed>;

  select<pattern extends Pattern<input>>(
    pattern: pattern
  ): SelectP<symbols.anonymousSelectKey, input, pattern>;
  select<p extends Pattern<input>, k extends string>(
    key: k,
    pattern: p
  ): SelectP<k, input, p>;
} {
  return {
    array: array as any,
    optional: optional as any,
    intersection: intersection as any,
    union: union as any,
    not: not as any,
    select: select as any,
    when: when as any,
  };
}
