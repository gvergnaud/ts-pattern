import * as Pattern from './patterns';

export { match } from './match';
export { isMatching } from './is-matching';
export { Pattern, Pattern as P };

/**
 * ### Catch All wildcard
 * `__` is a wildcard pattern, matching **any value**.
 * @example
 *  match(value)
 *   .with(__, () => 'will always match')
 */
export const __ = Pattern.any;
