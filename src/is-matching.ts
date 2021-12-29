import { Pattern } from './types/Pattern';
import { MatchedValue } from './types/Match';
import * as P from './patterns';
import { matchPattern } from './helpers';

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
