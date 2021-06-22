import type {
  Pattern,
  AnonymousSelectPattern,
  NamedSelectPattern,
  GuardPattern,
  NotPattern,
  GuardValue,
  GuardFunction,
} from './types/Pattern';

import type { Unset, PickReturnValue, Match } from './types/Match';

import { __, PatternType } from './PatternType';

export const when = <a, b extends a = never>(
  predicate: GuardFunction<a, b>
): GuardPattern<a, b> => ({
  '@ts-pattern/__patternKind': PatternType.Guard,
  '@ts-pattern/__when': predicate,
});

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

      const patterns: Pattern<a>[] = [];
      const predicates: ((value: a) => unknown)[] = [];
      for (let i = 0; i < args.length - 1; i++) {
        const arg = args[i];
        if (typeof arg === 'function') {
          predicates.push(arg);
        } else {
          patterns.push(arg);
        }
      }

      let selected: Record<string, unknown> = {};

      const doesMatch = (value: a) =>
        Boolean(
          patterns.some((pattern) =>
            matchPattern(pattern, value, (key, value) => {
              selected[key] = value;
            })
          ) && predicates.every((predicate) => predicate(value as any))
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

const isGuardPattern = (x: unknown): x is GuardPattern<unknown> => {
  const pattern = x as GuardPattern<unknown>;
  return (
    pattern &&
    pattern['@ts-pattern/__patternKind'] === PatternType.Guard &&
    typeof pattern['@ts-pattern/__when'] === 'function'
  );
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
  if (isObject(pattern)) {
    if (pattern === __) return true;

    if (isNamedSelectPattern(pattern)) {
      select(pattern['@ts-pattern/__key'], value);
      return true;
    }

    if (isAnonymousSelectPattern(pattern)) {
      select(ANONYMOUS_SELECT_KEY, value);
      return true;
    }

    if (isGuardPattern(pattern))
      return Boolean(pattern['@ts-pattern/__when'](value));

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
        return Object.values(__).includes(subPattern)
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

  if (typeof pattern === 'string') {
    if (pattern === __.string) return typeof value === 'string';
    if (pattern === __.boolean) return typeof value === 'boolean';
    if (pattern === __.number) {
      return typeof value === 'number' && !Number.isNaN(value);
    }
    if (pattern === __.unit) {
      return value === undefined || value === null;
    }
  }

  return value === pattern;
};
