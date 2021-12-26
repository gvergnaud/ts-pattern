import type {
  Pattern,
  AnonymousSelectPattern,
  SelectPattern,
  GuardPattern,
  NotPattern,
  GuardValue,
} from './types/Pattern';

import type {
  Unset,
  PickReturnValue,
  Match,
  MatchedValue,
} from './types/Match';

import * as symbols from './symbols';
import * as P from './patterns';
import { InvertPattern } from './types/InvertPattern';

export { select, when, not, instanceOf, __ } from './patterns';
export { Pattern, P };

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
                ? symbols.AnonymousSelectKey in selected
                  ? selected[symbols.AnonymousSelectKey]
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

const isGuardPattern = (
  x: unknown
): x is GuardPattern<unknown, unknown, any> => {
  const pattern = x as GuardPattern<unknown, unknown, any>;
  return pattern && pattern[symbols.PatternKind] === symbols.Guard;
};

const isNotPattern = (x: unknown): x is NotPattern<unknown, unknown> => {
  const pattern = x as NotPattern<unknown, unknown>;
  return pattern && pattern[symbols.PatternKind] === symbols.Not;
};

const isSelectPattern = (x: unknown): x is SelectPattern<string> => {
  const pattern = x as SelectPattern<string>;
  return pattern && pattern[symbols.PatternKind] === symbols.Select;
};

// tells us if the value matches a given pattern.
const matchPattern = <i, p extends Pattern<i>>(
  pattern: p,
  value: i,
  select: (key: string, value: unknown) => void
): boolean => {
  if (isObject(pattern)) {
    if (isGuardPattern(pattern)) {
      const doesMatch = Boolean(pattern[symbols.Guard](value));
      const selected = pattern[symbols.Selector](value);
      Object.keys(selected).forEach((key) => select(key, selected[key]));
      return doesMatch;
    }

    if (isSelectPattern(pattern)) {
      select(pattern[symbols.Select], value);
      return true;
    }

    if (isNotPattern(pattern))
      return !matchPattern(
        pattern[symbols.Not](value) as Pattern<i>,
        value,
        select
      );

    if (!isObject(value)) return false;

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
        return Object.values(P).includes(subPattern)
          ? matchPattern([subPattern], [...value.values()], select)
          : value.has(subPattern);
      }

      return [...pattern.values()].every((subPattern) => value.has(subPattern));
    }

    return Object.keys(pattern).every(
      (k: string): boolean =>
        k in value &&
        matchPattern(
          // @ts-ignore
          pattern[k],
          // @ts-ignore
          value[k],
          select
        )
    );
  }

  return Object.is(value, pattern);
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

/**
 * @internal
 */
export function isMatching<p extends Pattern<any>>(
  pattern: p,
  value: any,
  selector: (key: string, value: unknown) => void
): value is MatchedValue<any, InvertPattern<p>>;
export function isMatching<p extends Pattern<any>>(
  ...args: [
    pattern: p,
    value?: any,
    selector?: (key: string, value: unknown) => void
  ]
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

  if (args.length === 3) {
    const [pattern, value, selector] = args;
    return matchPattern(pattern, value, selector ?? (() => {}));
  }

  throw new Error(
    `isMatching wasn't given the right number of arguments: expected 1 or 2, received ${args.length}.`
  );
}
