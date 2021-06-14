import type {
  Pattern,
  AnonymousSelectPattern,
  NamedSelectPattern,
  NotPattern,
  GuardValue,
  GuardFunction,
} from './types/Pattern';

import type {
  Unset,
  PickReturnValue,
  Match,
  MatchedValue,
} from './types/Match';

import { __, PatternType } from './PatternType';
import { InvertPattern } from './types/InvertPattern';

export const not = <a>(pattern: Pattern<a>): NotPattern<a> => ({
  '@ts-pattern/__patternKind': PatternType.Not,
  '@ts-pattern/__pattern': pattern,
});

const ANONYMOUS_SELECT_KEY = '@ts-pattern/__anonymous-select-key';

export function select(): AnonymousSelectPattern;
export function select<k extends string>(key: k): NamedSelectPattern<k>;
export function select<k extends string>(
  key?: k
): AnonymousSelectPattern | NamedSelectPattern<k> {
  return key === undefined
    ? {
        '@ts-pattern/__patternKind': PatternType.AnonymousSelect,
      }
    : {
        '@ts-pattern/__patternKind': PatternType.NamedSelect,
        '@ts-pattern/__key': key,
      };
}

/**
 * # Pattern matching
 **/

export { Pattern, __ };

/**
 * #### match
 *
 * Entry point to create a pattern matching expression.
 *
 * It returns a `Match` builder, on which you can chain
 * several `.with(pattern, handler)` clauses.
 */
export const match = <a, b = Unset>(value: a): Match<a, b> =>
  builder(value, []) as any;

/**
 * ### builder
 * This is the implementation of our pattern matching, using the
 * builder pattern.
 */
const builder = <a, b>(
  value: a,
  cases: {
    test: (value: a) => unknown;
    select: (value: a) => any;
    handler: (...args: any) => any;
  }[]
) => {
  const run = () => {
    const entry = cases.find(({ test }) => test(value));
    if (!entry) {
      let displayedValue;
      try {
        displayedValue = JSON.stringify(value);
      } catch (e) {
        displayedValue = value;
      }
      throw new Error(
        `Pattern matching error: no pattern matches value ${displayedValue}`
      );
    }
    return entry.handler(entry.select(value), value);
  };

  return {
    with(...args: any[]) {
      const handler = args[args.length - 1];

      const hasPredicate = args.length === 3 && typeof args[1] === 'function';

      const predicate: (value: a) => unknown = hasPredicate
        ? args[1]
        : () => true;

      const patterns: Pattern<a>[] = hasPredicate
        ? [args[0]]
        : args.slice(0, -1);

      let selected: Record<string, unknown> = {};

      const doesMatch = (value: a) =>
        Boolean(
          patterns.some((pattern) =>
            matchPattern(pattern, value, (key, value) => {
              selected[key] = value;
            })
          ) && predicate(value as any)
        );

      return builder(
        value,
        cases.concat([
          {
            test: doesMatch,
            handler,
            select: (value) =>
              Object.keys(selected).length
                ? selected[ANONYMOUS_SELECT_KEY] !== undefined
                  ? selected[ANONYMOUS_SELECT_KEY]
                  : selected
                : value,
          },
        ])
      );
    },

    when: <p extends (value: a) => unknown, c>(
      predicate: p,
      handler: (value: GuardValue<p>) => PickReturnValue<b, c>
    ) =>
      builder<a, PickReturnValue<b, c>>(
        value,
        cases.concat([
          {
            test: predicate,
            handler,
            select: (value) => value,
          },
        ])
      ),

    otherwise: <c>(
      handler: () => PickReturnValue<b, c>
    ): PickReturnValue<b, c> =>
      builder<a, PickReturnValue<b, c>>(
        value,
        cases.concat([
          {
            test: () => true,
            handler,
            select: (value) => value,
          },
        ])
      ).run(),

    exhaustive: () => run(),

    run,
  };
};

const isObject = (value: unknown): value is Object =>
  Boolean(value && typeof value === 'object');

const isGuardFunction = (
  value: unknown
): value is GuardFunction<unknown, unknown> => {
  return Boolean(value && typeof value === 'function');
};

const isNotPattern = (x: unknown): x is NotPattern<unknown> => {
  const pattern = x as NotPattern<unknown>;
  return pattern && pattern['@ts-pattern/__patternKind'] === PatternType.Not;
};

const isNamedSelectPattern = (x: unknown): x is NamedSelectPattern<string> => {
  const pattern = x as NamedSelectPattern<string>;
  return (
    pattern && pattern['@ts-pattern/__patternKind'] === PatternType.NamedSelect
  );
};

const isAnonymousSelectPattern = (x: unknown): x is AnonymousSelectPattern => {
  const pattern = x as AnonymousSelectPattern;
  return (
    pattern &&
    pattern['@ts-pattern/__patternKind'] === PatternType.AnonymousSelect
  );
};

// tells us if the value matches a given pattern.
const matchPattern = <a, p extends Pattern<a>>(
  pattern: p,
  value: a,
  select: (key: string, value: unknown) => void
): boolean => {
  if (isGuardFunction(pattern)) return Boolean(pattern(value));

  if (pattern === __) return true;

  if (isObject(pattern)) {
    if (isNamedSelectPattern(pattern)) {
      select(pattern['@ts-pattern/__key'], value);
      return true;
    }

    if (isAnonymousSelectPattern(pattern)) {
      select(ANONYMOUS_SELECT_KEY, value);
      return true;
    }

    if (isNotPattern(pattern))
      return !matchPattern(
        pattern['@ts-pattern/__pattern'] as Pattern<a>,
        value,
        select
      );

    if (!isObject(value)) return false;

    if (Array.isArray(pattern)) {
      if (!Array.isArray(value)) return false;

      // List pattern
      if (pattern.length === 1) {
        const selected: Record<string, unknown[]> = {};

        const listSelect = (key: string, value: unknown) => {
          selected[key] = (selected[key] || []).concat([value]);
        };

        const doesMatch = value.every((v) =>
          matchPattern(pattern[0], v, listSelect)
        );

        if (doesMatch) {
          Object.keys(selected).forEach((key) => select(key, selected[key]));
        }

        return doesMatch;
      }

      // Tuple pattern
      return pattern.length === value.length
        ? pattern.every((subPattern, i) =>
            matchPattern(subPattern, value[i], select)
          )
        : false;
    }

    if (pattern instanceof Map) {
      if (!(value instanceof Map)) return false;
      return [...pattern.keys()].every((key) =>
        matchPattern(pattern.get(key), value.get(key), select)
      );
    }

    if (pattern instanceof Set) {
      if (!(value instanceof Set)) return false;

      if (pattern.size === 0) return value.size === 0;

      if (pattern.size === 1) {
        const [subPattern] = [...pattern.values()];
        return subPattern === __ || typeof subPattern === 'function'
          ? matchPattern([subPattern], [...value.values()], select)
          : value.has(subPattern);
      }

      return [...pattern.values()].every((subPattern) => value.has(subPattern));
    }

    return Object.keys(pattern).every((k: string): boolean =>
      matchPattern(
        // @ts-ignore
        pattern[k],
        // @ts-ignore
        value[k],
        select
      )
    );
  }

  return value === pattern;
};

export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !Number.isNaN(value);

export const isString = (value: unknown): value is string =>
  typeof value === 'string';

export const isBoolean = (value: unknown): value is boolean =>
  typeof value === 'boolean';

export const nullable = (x: unknown): x is null | undefined =>
  x === null || x === undefined;

type AnyConstructor = new (...args: any[]) => any;

export function instanceOf<T extends AnyConstructor>(classConstructor: T) {
  return (val: unknown): val is InstanceType<T> =>
    val instanceof classConstructor;
}

export const isMatching = <p extends Pattern<any>>(pattern: p) => (
  value: any
): value is MatchedValue<any, InvertPattern<p>> =>
  matchPattern(pattern, value, () => {});
