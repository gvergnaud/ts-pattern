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
 * This builder pattern is neat because we can have complexe type checking
 * for each of the methods adding new behavior to our pattern matching.
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

      const doesMatch = (value: a) =>
        Boolean(
          patterns.some((pattern) => matchPattern(pattern, value)) &&
            predicates.every((predicate) => predicate(value as any))
        );

      return builder(
        value,
        cases.concat([
          {
            test: doesMatch,
            handler,
            select: (value) =>
              patterns.length === 1
                ? selectWithPattern(patterns[0], value)
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
      ).exhaustive(),

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

const isListPattern = (x: unknown): x is [Pattern<unknown>] => {
  return Array.isArray(x) && x.length === 1;
};

// tells us if the value matches a given pattern.
const matchPattern = <a, p extends Pattern<a>>(
  pattern: p,
  value: a
): boolean => {
  if (
    pattern === __ ||
    isNamedSelectPattern(pattern) ||
    isAnonymousSelectPattern(pattern)
  )
    return true;

  if (pattern === __.string) return typeof value === 'string';
  if (pattern === __.boolean) return typeof value === 'boolean';
  if (pattern === __.number) {
    return typeof value === 'number' && !Number.isNaN(value);
  }
  if (isGuardPattern(pattern))
    return Boolean(pattern['@ts-pattern/__when'](value));
  if (isNotPattern(pattern))
    return !matchPattern(pattern['@ts-pattern/__pattern'] as Pattern<a>, value);

  if (typeof pattern !== typeof value) return false;

  if (isObject(pattern)) {
    if (isListPattern(pattern))
      return Array.isArray(value)
        ? value.every((v) => matchPattern(pattern[0], v))
        : false;

    if (Array.isArray(pattern)) {
      return Array.isArray(value) && pattern.length === value.length
        ? pattern.every((subPattern, i) => matchPattern(subPattern, value[i]))
        : false;
    }

    if (pattern instanceof Map) {
      if (!(value instanceof Map)) return false;
      return [...pattern.keys()].every((key) =>
        matchPattern(pattern.get(key), value.get(key))
      );
    }

    if (pattern instanceof Set) {
      if (!(value instanceof Set)) return false;

      if (pattern.size === 0) return value.size === 0;

      if (pattern.size === 1) {
        const [subPattern] = [...pattern.values()];
        return Object.values(__).includes(subPattern)
          ? matchPattern([subPattern], [...value.values()])
          : value.has(subPattern);
      }

      return [...pattern.values()].every((subPattern) => value.has(subPattern));
    }

    if (!isObject(value)) return false;

    return Object.keys(pattern).every((k: string): boolean =>
      // @ts-ignore
      matchPattern(pattern[k], value[k])
    );
  }

  return value === pattern;
};

const selectWithPattern = <a, p extends Pattern<a>>(pattern: p, value: a) => {
  const positional = selectPositionalWithPattern(pattern, value);
  const kwargs = selectKwargsWithPattern(pattern, value);

  return positional.kind === 'some'
    ? positional.value
    : Object.keys(kwargs).length
    ? kwargs
    : value;
};

type Option<T> = { kind: 'some'; value: T } | { kind: 'none' };
const none: Option<never> = { kind: 'none' };

const selectPositionalWithPattern = <a, p extends Pattern<a>>(
  pattern: p,
  value: a
): Option<unknown> => {
  if (isAnonymousSelectPattern(pattern)) return { kind: 'some', value };

  if (isObject(pattern) && isObject(value)) {
    if (Array.isArray(value)) {
      if (isListPattern(pattern)) {
        return value.reduce<Option<unknown[]>>((acc, item) => {
          const selection = selectPositionalWithPattern(pattern[0], item);
          return selection.kind === 'none'
            ? acc
            : acc.kind === 'none'
            ? { kind: 'some', value: [selection.value] }
            : { kind: 'some', value: acc.value.concat([selection.value]) };
        }, none);
      }

      if (Array.isArray(pattern)) {
        return pattern.length <= value.length
          ? pattern.reduce<Option<unknown>>((acc, subPattern, i) => {
              if (acc.kind === 'some') return acc;
              return selectPositionalWithPattern(subPattern, value[i]);
            }, none)
          : none;
      }
    }

    return Object.keys(pattern).reduce<Option<unknown>>((acc, k: string) => {
      if (acc.kind === 'some') return acc;
      // @ts-ignore
      return selectPositionalWithPattern(pattern[k], value[k]);
    }, none);
  }

  return none;
};

const selectKwargsWithPattern = <a, p extends Pattern<a>>(
  pattern: p,
  value: a
): Record<string, unknown> => {
  if (isNamedSelectPattern(pattern))
    return { [pattern['@ts-pattern/__key']]: value };

  if (isObject(pattern) && isObject(value)) {
    if (Array.isArray(value)) {
      if (isListPattern(pattern)) {
        return value.reduce<Record<string, unknown[]>>((acc, item) => {
          const selections = selectKwargsWithPattern(pattern[0], item);
          return Object.keys(selections).reduce((acc, key) => {
            acc[key] = (acc[key] || []).concat([selections[key]]);
            return acc;
          }, acc);
        }, {});
      }

      if (Array.isArray(pattern)) {
        return pattern.length <= value.length
          ? pattern.reduce(
              (acc, subPattern, i) =>
                Object.assign(
                  acc,
                  selectKwargsWithPattern(subPattern, value[i])
                ),
              {}
            )
          : {};
      }
    }

    return Object.keys(pattern).reduce(
      (acc, k: string) =>
        // @ts-ignore
        Object.assign(acc, selectKwargsWithPattern(pattern[k], value[k])),
      {}
    );
  }

  return {};
};
