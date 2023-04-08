import { matchPattern, getSelectionKeys, flatMap } from './internals/helpers';
import * as symbols from './internals/symbols';
import { matcher } from './internals/symbols';
import { Fn, GuardFunction } from './types/helpers';
import { InvertPattern } from './types/InvertPattern';
import {
  Pattern,
  UnknownPattern,
  OptionalP,
  ArrayP,
  MapP,
  SetP,
  AndP,
  OrP,
  NotP,
  GuardP,
  SelectP,
  AnonymousSelectP,
  GuardExcludeP,
  CustomP,
} from './types/Pattern';

export { Pattern };

export { matcher };

/**
 * `P.infer<typeof somePattern>` will return the type of the value
 * matched by this pattern.
 *
 * [Read documentation for `P.infer` on GitHub](https://github.com/gvergnaud/ts-pattern#Pinfer)
 *
 * @example
 * const userPattern = { name: P.string }
 * type User = P.infer<typeof userPattern>
 */
export type infer<p extends Pattern<any>> = InvertPattern<p, unknown>;

/**
 * `P.optional(subpattern)` takes a sub pattern and returns a pattern which matches if the
 * key is undefined or if it is defined and the sub pattern matches its value.
 *
 * [Read documentation for `P.optional` on GitHub](https://github.com/gvergnaud/ts-pattern#Poptional-patterns)

* @example
 *  match(value)
 *   .with({ greeting: P.optional('Hello') }, () => 'will match { greeting?: "Hello" }')
 */
export function optional<
  input,
  const p extends unknown extends input ? UnknownPattern : Pattern<input>
>(pattern: p): OptionalP<input, p> {
  return {
    [matcher]() {
      return {
        match: <I>(value: I | input) => {
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

type UnwrapArray<xs> = xs extends readonly (infer x)[] ? x : never;

type UnwrapSet<xs> = xs extends Set<infer x> ? x : never;

type UnwrapMapKey<xs> = xs extends Map<infer k, any> ? k : never;

type UnwrapMapValue<xs> = xs extends Map<any, infer v> ? v : never;

type WithDefault<a, b> = [a] extends [never] ? b : a;

/**
 * `P.array(subpattern)` takes a sub pattern and returns a pattern, which matches
 * arrays if all their elements match the sub pattern.
 *
 * [Read documentation for `P.array` on GitHub](https://github.com/gvergnaud/ts-pattern#Parray-patterns)
 *
 * @example
 *  match(value)
 *   .with({ users: P.array({ name: P.string }) }, () => 'will match { name: string }[]')
 */
export function array<input>(): ArrayP<input, unknown> &
  Iterable<ArrayP<input, unknown>>;
export function array<
  input,
  const p extends Pattern<WithDefault<UnwrapArray<input>, unknown>>
>(pattern: p): ArrayP<input, p> & Iterable<ArrayP<input, p>>;
export function array<
  input,
  const p extends Pattern<WithDefault<UnwrapArray<input>, unknown>>
>(...args: [pattern?: p]): ArrayP<input, p> & Iterable<ArrayP<input, p>> {
  return {
    [matcher]() {
      return {
        match: <I>(value: I | input) => {
          if (!Array.isArray(value)) return { matched: false };

          if (args.length === 0) return { matched: true };

          const pattern = args[0];
          let selections: Record<string, unknown[]> = {};

          if (value.length === 0) {
            getSelectionKeys(pattern).forEach((key) => {
              selections[key] = [];
            });
            return { matched: true, selections };
          }

          const selector = (key: string, value: unknown) => {
            selections[key] = (selections[key] || []).concat([value]);
          };

          const matched = value.every((v) =>
            matchPattern(pattern, v, selector)
          );

          return { matched, selections };
        },
        getSelectionKeys: () =>
          args.length === 0 ? [] : getSelectionKeys(args[0]),
      };
    },
    *[Symbol.iterator]() {
      yield Object.assign(args.length === 0 ? array() : array(args[0]), {
        [symbols.isVariadic]: true,
      });
    },
  };
}

/**
 * `P.set(subpattern)` takes a sub pattern and returns a pattern that matches
 * sets if all their elements match the sub pattern.
 *
 * [Read `P.set` documentation on GitHub](https://github.com/gvergnaud/ts-pattern#Pset-patterns)
 *
 * @example
 *  match(value)
 *   .with({ users: P.set(P.string) }, () => 'will match Set<string>')
 */
export function set<input>(): SetP<input, unknown>;
export function set<
  input,
  const p extends Pattern<WithDefault<UnwrapSet<input>, unknown>>
>(pattern: p): SetP<input, p>;
export function set<
  input,
  const p extends Pattern<WithDefault<UnwrapSet<input>, unknown>>
>(...args: [pattern?: p]): SetP<input, p> {
  return {
    [matcher]() {
      return {
        match: <I>(value: I | input) => {
          if (!(value instanceof Set)) return { matched: false };

          let selections: Record<string, unknown[]> = {};

          if (value.size === 0) {
            return { matched: true, selections };
          }

          if (args.length === 0) return { matched: true };

          const selector = (key: string, value: unknown) => {
            selections[key] = (selections[key] || []).concat([value]);
          };

          const pattern = args[0];

          const matched = setEvery(value, (v) =>
            matchPattern(pattern, v, selector)
          );

          return { matched, selections };
        },
        getSelectionKeys: () =>
          args.length === 0 ? [] : getSelectionKeys(args[0]),
      };
    },
  };
}

const setEvery = <T>(set: Set<T>, predicate: (value: T) => boolean) => {
  for (const value of set) {
    if (predicate(value)) continue;
    return false;
  }
  return true;
};

/**
 * `P.set(subpattern)` takes a sub pattern and returns a pattern that matches
 * sets if all their elements match the sub pattern.
 *
 * [Read `P.set` documentation on GitHub](https://github.com/gvergnaud/ts-pattern#Pset-patterns)
 *
 * @example
 *  match(value)
 *   .with({ users: P.set(P.string) }, () => 'will match Set<string>')
 */
export function map<input>(): MapP<input, unknown, unknown>;
export function map<
  input,
  const pkey extends Pattern<WithDefault<UnwrapMapKey<input>, unknown>>,
  const pvalue extends Pattern<WithDefault<UnwrapMapValue<input>, unknown>>
>(patternKey: pkey, patternValue: pvalue): MapP<input, pkey, pvalue>;
export function map<
  input,
  const pkey extends Pattern<WithDefault<UnwrapMapKey<input>, unknown>>,
  const pvalue extends Pattern<WithDefault<UnwrapMapValue<input>, unknown>>
>(
  ...args: [patternKey?: pkey, patternValue?: pvalue]
): MapP<input, pkey, pvalue> {
  return {
    [matcher]() {
      return {
        match: <I>(value: I | input) => {
          if (!(value instanceof Map)) return { matched: false };

          let selections: Record<string, unknown[]> = {};

          if (value.size === 0) {
            return { matched: true, selections };
          }

          const selector = (key: string, value: unknown) => {
            selections[key] = (selections[key] || []).concat([value]);
          };

          if (args.length === 0) return { matched: true };
          if (args.length === 1) {
            throw new Error(
              `\`P.map\` wasn\'t given enough arguments. Expected (key, value), received ${args[0]?.toString()}`
            );
          }
          const [patternKey, patternValue] = args;

          const matched = mapEvery(value, (v, k) => {
            const keyMatch = matchPattern(patternKey, k, selector);
            const valueMatch = matchPattern(patternValue, v, selector);
            return keyMatch && valueMatch;
          });

          return { matched, selections };
        },
        getSelectionKeys: () =>
          args.length === 0
            ? []
            : [...getSelectionKeys(args[0]), ...getSelectionKeys(args[1])],
      };
    },
  };
}

const mapEvery = <K, T>(
  map: Map<K, T>,
  predicate: (value: T, key: K) => boolean
) => {
  for (const [key, value] of map.entries()) {
    if (predicate(value, key)) continue;
    return false;
  }
  return true;
};

/**
 * `P.intersection(...patterns)` returns a pattern which matches
 * only if **every** patterns provided in parameter match the input.
 *
 * [Read documentation for `P.intersection` on GitHub](https://github.com/gvergnaud/ts-pattern#Pintersection-patterns)
 *
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
  const ps extends readonly [Pattern<input>, ...Pattern<input>[]]
>(...patterns: ps): AndP<input, ps> {
  return {
    [matcher]: () => ({
      match: (value) => {
        let selections: Record<string, unknown[]> = {};
        const selector = (key: string, value: any) => {
          selections[key] = value;
        };
        const matched = (patterns as readonly UnknownPattern[]).every((p) =>
          matchPattern(p, value, selector)
        );
        return { matched, selections };
      },
      getSelectionKeys: () =>
        flatMap(patterns as readonly UnknownPattern[], getSelectionKeys),
      matcherType: 'and',
    }),
  };
}

/**
 * `P.union(...patterns)` returns a pattern which matches
 * if **at least one** of the patterns provided in parameter match the input.
 *
 * [Read documentation for `P.union` on GitHub](https://github.com/gvergnaud/ts-pattern#Punion-patterns)
 *
 * @example
 *  match(value)
 *   .with(
 *     { type: P.union('a', 'b', 'c') },
 *     ({ user }) => 'will match { type: "a" | "b" | "c" }'
 *   )
 */
export function union<
  input,
  const ps extends readonly [Pattern<input>, ...Pattern<input>[]]
>(...patterns: ps): OrP<input, ps> {
  return {
    [matcher]: () => ({
      match: <I>(value: I | input) => {
        let selections: Record<string, unknown[]> = {};
        const selector = (key: string, value: any) => {
          selections[key] = value;
        };
        flatMap(
          patterns as readonly UnknownPattern[],
          getSelectionKeys
        ).forEach((key) => selector(key, undefined));
        const matched = (patterns as readonly UnknownPattern[]).some((p) =>
          matchPattern(p, value, selector)
        );
        return { matched, selections };
      },
      getSelectionKeys: () =>
        flatMap(patterns as readonly UnknownPattern[], getSelectionKeys),
      matcherType: 'or',
    }),
  };
}

/**
 * `P.not(pattern)` returns a pattern which matches if the sub pattern
 * doesn't match.
 *
 * [Read documentation for `P.not` on GitHub](https://github.com/gvergnaud/ts-pattern#Pnot-patterns)
 *
 * @example
 *  match<{ a: string | number }>(value)
 *   .with({ a: P.not(P.string) }, (x) => 'will match { a: number }'
 *   )
 */

export function not<input, const p extends Pattern<input> | UnknownPattern>(
  pattern: p
): NotP<input, p> {
  return {
    [matcher]: () => ({
      match: <I>(value: I | input) => ({
        matched: !matchPattern(pattern, value, () => {}),
      }),
      getSelectionKeys: () => [],
      matcherType: 'not',
    }),
  };
}

/**
 * `P.when((value) => boolean)` returns a pattern which matches
 * if the predicate returns true for the current input.
 *
 * [Read documentation for `P.when` on GitHub](https://github.com/gvergnaud/ts-pattern#Pwhen-patterns)
 *
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
    [matcher]: () => ({
      match: <I>(value: I | input) => ({
        matched: Boolean(predicate(value as input)),
      }),
    }),
  };
}

/**
 * `P.select()` is a pattern which will always match,
 * and will inject the selected piece of input in the handler function.
 *
 * [Read documentation for `P.select` on GitHub](https://github.com/gvergnaud/ts-pattern#Pselect-patterns)
 *
 * @example
 *  match<{ age: number }>(value)
 *   .with({ age: P.select() }, (age) => 'age: number'
 *   )
 */
export function select(): AnonymousSelectP;
export function select<
  input,
  const patternOrKey extends
    | string
    | (unknown extends input ? UnknownPattern : Pattern<input>)
>(
  patternOrKey: patternOrKey
): patternOrKey extends string
  ? SelectP<patternOrKey>
  : SelectP<symbols.anonymousSelectKey, input, patternOrKey>;
export function select<
  input,
  const p extends unknown extends input ? UnknownPattern : Pattern<input>,
  const k extends string
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
    [matcher]() {
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

type AnyConstructor = abstract new (...args: any[]) => any;

function isInstanceOf<T extends AnyConstructor>(classConstructor: T) {
  return (val: unknown): val is InstanceType<T> =>
    val instanceof classConstructor;
}

/**
 * `P.any` is a wildcard pattern, matching **any value**.
 *
 * [Read documentation for `P.any` on GitHub](https://github.com/gvergnaud/ts-pattern#P_-wildcard)
 *
 * @example
 *  match(value)
 *   .with(P.any, () => 'will always match')
 */
export const any = when(isUnknown);

/**
 * `P._` is a wildcard pattern, matching **any value**.
 * It's an alias to `P.any`.
 *
 * [Read documentation for `P._` on GitHub](https://github.com/gvergnaud/ts-pattern#P_-wildcard)
 *
 * @example
 *  match(value)
 *   .with(P._, () => 'will always match')
 */
export const _ = any;

/**
 * `P.string` is a wildcard pattern matching any **string**.
 *
 * [Read documentation for `P.string` on GitHub](https://github.com/gvergnaud/ts-pattern#Pstring-wildcard)
 *
 * @example
 *  match(value)
 *   .with(P.string, () => 'will match on strings')
 */

export const string = when(isString);

/**
 * `P.number` is a wildcard pattern matching any **number**.
 *
 * [Read documentation for `P.number` on GitHub](https://github.com/gvergnaud/ts-pattern#Pnumber-wildcard)
 *
 * @example
 *  match(value)
 *   .with(P.number, () => 'will match on numbers')
 */
export const number = when(isNumber);

/**
 * `P.boolean` is a wildcard pattern matching any **boolean**.
 *
 * [Read documentation for `P.boolean` on GitHub](https://github.com/gvergnaud/ts-pattern#boolean-wildcard)
 *
 * @example
 *   .with(P.boolean, () => 'will match on booleans')
 */
export const boolean = when(isBoolean);

/**
 * `P.bigint` is a wildcard pattern matching any **bigint**.
 *
 * [Read documentation for `P.bigint` on GitHub](https://github.com/gvergnaud/ts-pattern#bigint-wildcard)
 *
 * @example
 *   .with(P.bigint, () => 'will match on bigints')
 */
export const bigint = when(isBigInt);

/**
 * `P.symbol` is a wildcard pattern matching any **symbol**.
 *
 * [Read documentation for `P.symbol` on GitHub](https://github.com/gvergnaud/ts-pattern#symbol-wildcard)
 *
 * @example
 *   .with(P.symbol, () => 'will match on symbols')
 */
export const symbol = when(isSymbol);

/**
 * `P.nullish` is a wildcard pattern matching **null** or **undefined**.
 *
 * [Read documentation for `P.nullish` on GitHub](https://github.com/gvergnaud/ts-pattern#nullish-wildcard)
 *
 * @example
 *   .with(P.nullish, () => 'will match on null or undefined')
 */
export const nullish = when(isNullish);

/**
 * `P.instanceOf(SomeClass)` is a pattern matching instances of a given class.
 *
 * [Read documentation for `P.instanceOf` on GitHub](https://github.com/gvergnaud/ts-pattern#Pinstanceof-patterns)
 *
 *  @example
 *   .with(P.instanceOf(SomeClass), () => 'will match on SomeClass instances')
 */
export function instanceOf<T extends AnyConstructor>(
  classConstructor: T
): GuardP<unknown, InstanceType<T>> {
  return when(isInstanceOf(classConstructor));
}

/**
 * `P.typed<SomeType>()` is a way to set the input type this
 * pattern should match on.
 *
 * It returns all utility functions to create patterns,
 * Like `array`, `union`, `intersection`, etc.
 *
 * [Read documentation for `P.typed` on GitHub](https://github.com/gvergnaud/ts-pattern#Ptyped)
 *
 * @example
 *  .with(
 *    P.typed<string | number[]>().array(P.string),
 *    (arrayOfString) => arrayOfString.join(', ')
 *  )
 */
export function typed<input>(): {
  array<const p extends Pattern<UnwrapArray<input>>>(
    pattern: p
  ): ArrayP<input, p>;

  optional<const p extends Pattern<input>>(pattern: p): OptionalP<input, p>;

  intersection<const ps extends readonly [Pattern<input>, ...Pattern<input>[]]>(
    ...patterns: ps
  ): AndP<input, ps>;

  union<const ps extends readonly [Pattern<input>, ...Pattern<input>[]]>(
    ...patterns: ps
  ): OrP<input, ps>;

  not<const p extends Pattern<input>>(pattern: p): NotP<input, p>;

  when<const narrowed extends input = never>(
    predicate: GuardFunction<input, narrowed>
  ): GuardP<input, narrowed>;

  select<const pattern extends Pattern<input>>(
    pattern: pattern
  ): SelectP<symbols.anonymousSelectKey, input, pattern>;
  select<const p extends Pattern<input>, const k extends string>(
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


export type Matchable<fns extends { select: Fn, narrow: Fn }, input = unknown> =
  CustomP<input, never, fns>;

export type Matcher<fns extends { select: Fn, narrow: Fn }, input = unknown> =
  ReturnType<CustomP<input, never, fns>[matcher]>;
