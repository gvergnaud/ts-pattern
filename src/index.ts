import type {
  Pattern,
  AnonymousSelectPattern,
  NamedSelectPattern,
  GuardPattern,
  NotPattern,
  GuardValue,
  OptionalPattern,
  OrPattern,
  AndPattern,
  ListPattern,
} from './types/Pattern';

import type {
  Unset,
  PickReturnValue,
  Match,
  MatchedValue,
} from './types/Match';

import * as symbols from './symbols';
import {
  when,
  not,
  optional,
  select,
  instanceOf,
  ANONYMOUS_SELECT_KEY,
} from './guards';
import { __ } from './wildcards';
import { InvertPattern } from './types/InvertPattern';

/**
 * # Pattern matching
 **/

export { Pattern, __, when, not, optional, select, instanceOf };

/**
 * #### match
 *
 * Entry point to create a pattern matching expression.
 *
 * It returns a `Match` builder, on which you can chain
 * several `.with(pattern, handler)` clauses.
 */
export const match = <i, o = Unset>(value: i): Match<i, o> =>
  builder(value, []) as any;

/**
 * ### builder
 * This is the implementation of our pattern matching, using the
 * builder pattern.
 */
const builder = <i, o>(
  value: i,
  cases: {
    test: (value: i) => unknown;
    select: (value: i) => any;
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

      const patterns: Pattern<i>[] = [];
      const predicates: ((value: i) => unknown)[] = [];
      for (let i = 0; i < args.length - 1; i++) {
        const arg = args[i];
        if (typeof arg === 'function') {
          predicates.push(arg);
        } else {
          patterns.push(arg);
        }
      }

      let selected: Record<string, unknown> = {};

      const doesMatch = (value: i) =>
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
                ? ANONYMOUS_SELECT_KEY in selected
                  ? selected[ANONYMOUS_SELECT_KEY]
                  : selected
                : value,
          },
        ])
      );
    },

    when: <p extends (value: i) => unknown, c>(
      predicate: p,
      handler: (value: GuardValue<p>) => PickReturnValue<o, c>
    ) =>
      builder<i, PickReturnValue<o, c>>(
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
      handler: (value: i) => PickReturnValue<o, c>
    ): PickReturnValue<o, c> =>
      builder<i, PickReturnValue<o, c>>(
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
  return pattern && pattern[symbols.PatternKind] === symbols.Guard;
};

const isNotPattern = (x: unknown): x is NotPattern<unknown> => {
  const pattern = x as NotPattern<unknown>;
  return isObject(pattern) && '$not' in pattern;
};

const isOptionalPattern = (x: unknown): x is OptionalPattern<unknown> => {
  const pattern = x as OptionalPattern<unknown>;
  return isObject(pattern) && '$optional' in pattern;
};

const isOrPattern = (x: unknown): x is OrPattern<unknown> => {
  const pattern = x as OrPattern<unknown>;
  return isObject(pattern) && '$or' in pattern;
};

const isAndPattern = (x: unknown): x is AndPattern<unknown> => {
  const pattern = x as AndPattern<unknown>;
  return isObject(pattern) && '$and' in pattern;
};

const isListPattern = (x: unknown): x is ListPattern<unknown> => {
  const pattern = x as ListPattern<unknown>;
  return isObject(pattern) && '$list' in pattern;
};

const isNamedSelectPattern = (x: unknown): x is NamedSelectPattern<string> => {
  const pattern = x as NamedSelectPattern<string>;
  return pattern && pattern[symbols.PatternKind] === symbols.NamedSelect;
};

const isAnonymousSelectPattern = (x: unknown): x is AnonymousSelectPattern => {
  const pattern = x as AnonymousSelectPattern;
  return pattern && pattern[symbols.PatternKind] === symbols.AnonymousSelect;
};

const selectWithUndefined = (
  pattern: Pattern<unknown>,
  select: (key: string, value: unknown) => void
): void => {
  if (isObject(pattern)) {
    if (isNamedSelectPattern(pattern))
      return select(pattern[symbols.NamedSelect], undefined);
    if (isAnonymousSelectPattern(pattern))
      return select(ANONYMOUS_SELECT_KEY, undefined);
    if (isOptionalPattern(pattern))
      return selectWithUndefined(pattern.$optional, select);
    if (isAndPattern(pattern))
      return pattern.$and.forEach((subpattern) =>
        selectWithUndefined(subpattern, select)
      );
    if (isOrPattern(pattern))
      return pattern.$or.forEach((subpattern) =>
        selectWithUndefined(subpattern, select)
      );
    if (isListPattern(pattern))
      return selectWithUndefined(pattern.$list, select);
    if (Array.isArray(pattern))
      return pattern.forEach((p) => selectWithUndefined(p, select));
    return Object.values(pattern).forEach((p) =>
      selectWithUndefined(p, select)
    );
  }
};

// tells us if the value matches a given pattern.
const matchPattern = <i, p extends Pattern<i>>(
  pattern: p,
  value: i,
  select: (key: string, value: unknown) => void
): boolean => {
  if (isObject(pattern)) {
    if (isGuardPattern(pattern)) return Boolean(pattern[symbols.Guard](value));

    if (isNamedSelectPattern(pattern)) {
      select(pattern[symbols.NamedSelect], value);
      return true;
    }

    if (isAnonymousSelectPattern(pattern)) {
      select(ANONYMOUS_SELECT_KEY, value);
      return true;
    }

    if (isNotPattern(pattern))
      return !matchPattern(pattern.$not as Pattern<i>, value, select);

    if (isOptionalPattern(pattern)) {
      if (value === undefined) {
        selectWithUndefined(pattern.$optional, select);
        return true;
      }

      return matchPattern(pattern.$optional as Pattern<i>, value, select);
    }

    if (isOrPattern(pattern)) {
      return pattern.$or.some((subpattern) =>
        matchPattern(subpattern as Pattern<i>, value, select)
      );
    }

    if (isAndPattern(pattern)) {
      return pattern.$and.every((subpattern) =>
        matchPattern(subpattern as Pattern<i>, value, select)
      );
    }

    if (!isObject(value)) return false;

    if (isListPattern(pattern)) {
      if (!Array.isArray(value)) return false;

      const selected: Record<string, unknown[]> = {};

      const listSelect = (key: string, value: unknown) => {
        selected[key] = (selected[key] || []).concat([value]);
      };

      const doesMatch = value.every((v) =>
        matchPattern(pattern.$list, v, listSelect)
      );

      if (doesMatch) {
        Object.keys(selected).forEach((key) => select(key, selected[key]));
      }

      return doesMatch;
    }

    if (Array.isArray(pattern)) {
      if (!Array.isArray(value)) return false;

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

    return Object.keys(pattern).every((k: string): boolean => {
      // @ts-ignore
      const subPattern = pattern[k];

      return (
        (k in value || isOptionalPattern(subPattern)) &&
        matchPattern(
          subPattern,
          // @ts-ignore
          value[k],
          select
        )
      );
    });
  }

  return value === pattern;
};

/**
 * Helper function taking a pattern and returning a **type guard** function telling
 * us whether or not a value matches the pattern.
 *
 * @param pattern the Pattern the value should match
 * @returns a function taking the value and returning whether or not it matches the pattern.
 */
export function isMatching<p extends Pattern<any>>(
  pattern: p
): (value: any) => value is MatchedValue<any, InvertPattern<p>>;
/**
 * **type guard** function taking a pattern and a value and returning a boolean telling
 * us whether or not the value matches the pattern.
 *
 * @param pattern the Pattern the value should match
 * @param value
 * @returns a boolean telling whether or not the value matches the pattern.
 */
export function isMatching<p extends Pattern<any>>(
  pattern: p,
  value: any
): value is MatchedValue<any, InvertPattern<p>>;
export function isMatching<p extends Pattern<any>>(
  ...args: [pattern: p, value?: any]
): boolean | ((vale: any) => boolean) {
  if (args.length === 1) {
    const [pattern] = args;
    return (value: any): value is MatchedValue<any, InvertPattern<p>> =>
      matchPattern(pattern, value, () => {});
  }
  if (args.length === 2) {
    const [pattern, value] = args;
    return matchPattern(pattern, value, () => {});
  }

  throw new Error(
    `isMatching wasn't given enough arguments: expected 1 or 2, received ${args.length}.`
  );
}
