import { MatchedValue, Pattern, UnknownProperties } from './types/Pattern';
import * as P from './patterns';
import { matchPattern } from './internals/helpers';
import { WithDefault } from './types/helpers';

/**
 * This constraint allows using additional properties
 * in object patterns. See "should allow targetting unknown properties"
 * unit test in `is-matching.test.ts`.
 */
type PatternConstraint<T> = T extends readonly any[]
  ? P.Pattern<T>
  : T extends object
  ? P.Pattern<T> & UnknownProperties
  : P.Pattern<T>;

/**
 * `isMatching` takes pattern and returns a **type guard** function, cheching if a value matches this pattern.
 *
 * [Read  documentation for `isMatching` on GitHub](https://github.com/gvergnaud/ts-pattern#ismatching)
 *
 * @example
 *  const hasName = isMatching({ name: P.string })
 *
 *  declare let input: unknown
 *
 *  if (hasName(input)) {
 *    // `input` inferred as { name: string }
 *    return input.name
 *  }
 */
export function isMatching<const p extends Pattern<unknown>>(
  pattern: p
): (value: unknown) => value is P.infer<p>;
/**
 * `isMatching` takes pattern and a value and checks if the value matches this pattern.
 *
 * [Read  documentation for `isMatching` on GitHub](https://github.com/gvergnaud/ts-pattern#ismatching)
 *
 * @example
 *  declare let input: unknown
 *
 *  if (isMatching({ name: P.string }, input)) {
 *    // `input` inferred as { name: string }
 *    return input.name
 *  }
 */
export function isMatching<const T, const P extends PatternConstraint<T>>(
  pattern: P,
  value: T
): value is T & WithDefault<P.narrow<T, P>, P.infer<P>>;

export function isMatching<const p extends Pattern<any>>(
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
