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

export const when = <a, b extends a = a>(
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
 * ### match
 * Entry point to create pattern matching code branches. It returns an
 * empty Match case.
 */
export const match = <a, b = Unset>(value: a): Match<a, b, []> =>
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
    select: (value: a) => any[];
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
    return entry.handler(...entry.select(value), value);
  };

  return {
    with(...args: any[]) {
      const { patterns, predicates } = args.slice(0, -1).reduce<{
        patterns: Pattern<a>[];
        predicates: ((value: a) => unknown)[];
      }>(
        (acc, arg) => {
          if (typeof arg === 'function') {
            acc.predicates.push(arg);
          } else {
            acc.patterns.push(arg);
          }
          return acc;
        },
        { patterns: [], predicates: [] }
      );
      const handler = args[args.length - 1];

      const doesMatch = (value: a) =>
        Boolean(
          patterns.some((pattern) => matchPattern(pattern, value)) &&
            predicates.every((predicate) => predicate(value as any))
        );

      return builder(value, [
        ...cases,
        {
          test: doesMatch,
          handler,
          select: (value) =>
            patterns.length === 1 ? selectWithPattern(patterns[0], value) : [],
        },
      ]);
    },

    when: <p extends (value: a) => unknown, c>(
      predicate: p,
      handler: (value: GuardValue<p>) => PickReturnValue<b, c>
    ) =>
      builder<a, PickReturnValue<b, c>>(value, [
        ...cases,
        {
          test: predicate,
          handler,
          select: () => [],
        },
      ]),

    otherwise: <c>(
      handler: () => PickReturnValue<b, c>
    ): PickReturnValue<b, c> =>
      builder<a, PickReturnValue<b, c>>(value, [
        ...cases,
        {
          test: (value: a) =>
            matchPattern<a, Pattern<a>>(__ as Pattern<a>, value),
          handler,
          select: () => [],
        },
      ]).exhaustive(),

    exhaustive: () => run(),

    run,
  };
};

const isObject = (value: unknown): value is Object =>
  Boolean(value && typeof value === 'object');

const isArray = (value: unknown): value is any[] => Array.isArray(value);

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
  if (isListPattern(pattern))
    return isArray(value)
      ? value.every((v) => matchPattern(pattern[0], v))
      : false;

  if (typeof pattern !== typeof value) return false;

  if (isArray(pattern)) {
    return isArray(value) && pattern.length === value.length
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

    const patternValues = [...pattern.values()];
    const allValues = [...value.values()];
    return patternValues.length === 0
      ? allValues.length === 0
      : patternValues.length === 1
      ? patternValues.every((subPattern) =>
          Object.values(__).includes(subPattern)
            ? matchPattern([subPattern], allValues)
            : value.has(subPattern)
        )
      : patternValues.every((subPattern) => value.has(subPattern));
  }

  if (isObject(pattern)) {
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
  const selections = [];
  if (positional.kind === 'some') selections.push(positional.value);
  if (Object.keys(kwargs).length) selections.push(kwargs);
  return selections;
};

type Option<T> = { kind: 'some'; value: T } | { kind: 'none' };

const selectPositionalWithPattern = <a, p extends Pattern<a>>(
  pattern: p,
  value: a
): Option<unknown> => {
  if (isAnonymousSelectPattern(pattern)) return { kind: 'some', value };

  if (isListPattern(pattern) && isArray(value))
    return value
      .map((v) => selectPositionalWithPattern(pattern[0], v))
      .filter(
        (selection): selection is { kind: 'some'; value: unknown } =>
          selection.kind === 'some'
      )
      .reduce<Option<unknown[]>>(
        (acc, selection) => {
          return acc.kind === 'none'
            ? { kind: 'some', value: [selection.value] }
            : { kind: 'some', value: acc.value.concat([selection.value]) };
        },
        { kind: 'none' }
      );

  if (isArray(pattern) && isArray(value))
    return pattern.length <= value.length
      ? pattern.reduce<Option<unknown>>(
          (acc, subPattern, i) => {
            if (acc.kind === 'some') return acc;
            return selectPositionalWithPattern(subPattern, value[i]);
          },
          { kind: 'none' }
        )
      : { kind: 'none' };

  if (isObject(pattern) && isObject(value))
    return Object.keys(pattern).reduce<Option<unknown>>(
      (acc, k: string) => {
        if (acc.kind === 'some') return acc;
        // @ts-ignore
        return selectPositionalWithPattern(pattern[k], value[k]);
      },
      { kind: 'none' }
    );

  return { kind: 'none' };
};

const selectKwargsWithPattern = <a, p extends Pattern<a>>(
  pattern: p,
  value: a
): Record<string, unknown> => {
  if (isNamedSelectPattern(pattern))
    return { [pattern['@ts-pattern/__key']]: value };

  if (isListPattern(pattern) && isArray(value))
    return value
      .map((v) => selectKwargsWithPattern(pattern[0], v))
      .reduce<Record<string, unknown[]>>((acc, selections) => {
        return Object.keys(selections).reduce((acc, key) => {
          acc[key] = (acc[key] || []).concat([selections[key]]);
          return acc;
        }, acc);
      }, {});

  if (isArray(pattern) && isArray(value))
    return pattern.length <= value.length
      ? pattern.reduce(
          (acc, subPattern, i) =>
            Object.assign(acc, selectKwargsWithPattern(subPattern, value[i])),
          {}
        )
      : {};

  if (isObject(pattern) && isObject(value))
    return Object.keys(pattern).reduce(
      (acc, k: string) =>
        // @ts-ignore
        Object.assign(acc, selectKwargsWithPattern(pattern[k], value[k])),
      {}
    );

  return {};
};
