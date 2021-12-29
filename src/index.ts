import type { Pattern, GuardValue } from './types/Pattern';

import type {
  Unset,
  PickReturnValue,
  Match,
  MatchedValue,
} from './types/Match';

import * as symbols from './symbols';
import { matchPattern } from './helpers';
import * as P from './patterns';

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
                ? symbols.anonymousSelectKey in selected
                  ? selected[symbols.anonymousSelectKey]
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

/**
 * Helper function taking a pattern and returning a **type guard** function telling
 * us whether or not a value matches the pattern.
 *
 * @param pattern the Pattern the value should match
 * @returns a function taking the value and returning whether or not it matches the pattern.
 */
export function isMatching<p extends Pattern<any>>(
  pattern: p
): (value: any) => value is MatchedValue<any, P.infer<p>>;
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
): value is MatchedValue<any, P.infer<p>>;

export function isMatching<p extends Pattern<any>>(
  ...args: [pattern: p, value?: any]
): boolean | ((vale: any) => boolean) {
  if (args.length === 1) {
    const [pattern] = args;
    return (value: any): value is MatchedValue<any, P.infer<p>> =>
      matchPattern(pattern, value, () => {});
  }
  if (args.length === 2) {
    const [pattern, value] = args;
    return matchPattern(pattern, value, () => {});
  }

  throw new Error(
    `isMatching wasn't given the right number of arguments: expected 1 or 2, received ${args.length}.`
  );
}
