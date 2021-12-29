import { matchPattern, isObject, isMatchable } from './helpers';
import * as symbols from './symbols';
import {
  ListPatternSelection,
  OptionalPatternSelection,
  Select,
} from './types/FindSelected';
import { Cast } from './types/helpers';
import { InvertPattern } from './types/InvertPattern';
import {
  GuardFunction,
  Matchable,
  Pattern,
  UnknownPattern,
} from './types/Pattern';

const getSelectionKeys = (pattern: Pattern<any>): string[] => {
  if (isObject(pattern)) {
    if (isMatchable(pattern)) {
      return pattern[symbols.matcher]().getSelectionKeys?.() ?? [];
    }
    if (Array.isArray(pattern))
      return pattern.reduce<string[]>(
        (acc, p) => acc.concat(getSelectionKeys(p)),
        []
      );
    return Object.values(pattern).reduce<string[]>(
      (acc, p) => acc.concat(getSelectionKeys(p)),
      []
    );
  }
  return [];
};

export const optional = <
  input,
  p extends unknown extends input ? UnknownPattern : Pattern<input>
>(
  pattern: p
): Matchable<
  input,
  InvertPattern<p> | undefined,
  'optional',
  OptionalPatternSelection<p>
> => {
  return {
    [symbols.matcher]() {
      let selected: Record<string, unknown[]> = {};
      const selector = (key: string, value: any) => {
        selected[key] = value;
      };

      return {
        predicate: (
          value: input
        ): value is Cast<InvertPattern<p> | undefined, input> => {
          if (value === undefined) {
            getSelectionKeys(pattern).forEach((key) =>
              selector(key, undefined)
            );
            return true;
          }
          return matchPattern(pattern as Pattern<input>, value, selector);
        },
        selector: () => selected,
        getSelectionKeys: () => getSelectionKeys(pattern),
        matchableType: 'optional',
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
): Matchable<input, InvertPattern<p[]>, 'regular', ListPatternSelection<p>> => {
  return {
    [symbols.matcher]() {
      let selected: Record<string, unknown[]> = {};

      const selector = (key: string, value: unknown) => {
        selected[key] = (selected[key] || []).concat([value]);
      };

      return {
        predicate: (value: input): value is Cast<InvertPattern<p[]>, input> => {
          return (
            Array.isArray(value) &&
            value.every((v) => matchPattern(pattern, v, selector))
          );
        },
        selector: () => selected,
        getSelectionKeys: () => getSelectionKeys(pattern),
      };
    },
  };
};

// export const every = <
//   input,
//   ps extends unknown extends input
//     ? [UnknownPattern, ...UnknownPattern[]]
//     : [Pattern<input>, ...Pattern<input>[]]
// >(
//   ...patterns: ps
// ): // TODO
// Matchable<input, InvertPattern<ps>> => ({
//   [symbols.matcher]: () => ({
//     predicate: (value) =>
//       (patterns as UnknownPattern[]).every((p) =>
//         matchPattern(p, value, () => {})
//       ),
//     selector: () => ({}),
//     getSelectionKeys: () => [],
//   }),
// });

// export const oneOf = <
//   input,
//   ps extends unknown extends input
//     ? [UnknownPattern, ...UnknownPattern[]]
//     : [Pattern<input>, ...Pattern<input>[]]
// >(
//   ...patterns: ps
// ): // TODO
// Matchable<input, InvertPattern<ps>> => ({
//   [symbols.matcher]: () => ({
//     predicate: (value) =>
//       (patterns as UnknownPattern[]).some((p) =>
//         matchPattern(p, value, () => {})
//       ),
//     selector: () => ({}),
//     getSelectionKeys: () => [],
//   }),
// });

export const not = <
  input,
  p extends unknown extends input ? UnknownPattern : Pattern<input>
>(
  pattern: p
): Matchable<input, InvertPattern<p>, 'not'> => ({
  [symbols.matcher]: () => ({
    predicate: (value) => !matchPattern(pattern, value, () => {}),
    selector: () => ({}),
    getSelectionKeys: () => [],
    matchableType: 'not',
  }),
});

export const when = <input, narrowed extends input = never>(
  predicate: GuardFunction<input, narrowed>
): Matchable<input, narrowed> => ({
  [symbols.matcher]: () => ({
    predicate,
    selector: () => ({}),
  }),
});

// TODO check if we could infer the type using the same technique
// as for guards, and infer it without needing the input type
// in FindSelected
export function select(): Matchable<
  unknown,
  never,
  'regular',
  Select<symbols.anonymousSelectKey>,
  unknown
>;
export function select<k extends string>(
  key: k
): Matchable<unknown, never, 'regular', Select<k>, unknown>;
export function select<k extends string>(
  key?: k
): Matchable<unknown, never, 'regular', Select<k>, unknown> {
  return key === undefined
    ? {
        [symbols.matcher]() {
          return {
            predicate: () => true,
            selector: (value) => ({ [symbols.anonymousSelectKey]: value }),
            getSelectionKeys: () => [symbols.anonymousSelectKey],
          };
        },
      }
    : {
        [symbols.matcher]() {
          return {
            predicate: () => true,
            selector: (value) => ({ [key]: value }),
            getSelectionKeys: () => [key],
          };
        },
      };
}

function isUnknown<T>(x: T | unknown): x is unknown {
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
