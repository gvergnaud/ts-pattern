import * as P from './patterns';
import * as symbols from './symbols';
import { SelectionType } from './types/FindSelected';
import { Pattern, Matchable, MatcherType } from './types/Pattern';

// @internal
export const isObject = (value: unknown): value is Object =>
  Boolean(value && typeof value === 'object');

//   @internal
export const isMatchable = (
  x: unknown
): x is Matchable<unknown, unknown, MatcherType, SelectionType> => {
  const pattern = x as Matchable<unknown, unknown, MatcherType, SelectionType>;
  return pattern && !!pattern[symbols.matcher];
};

// @internal
export const isOptionalPattern = (
  x: unknown
): x is Matchable<unknown, unknown, 'optional', SelectionType> => {
  return isMatchable(x) && x[symbols.matcher]().matcherType === 'optional';
};

// tells us if the value matches a given pattern.
// @internal
export const matchPattern = (
  pattern: Pattern<any>,
  value: any,
  select: (key: string, value: unknown) => void
): boolean => {
  if (isObject(pattern)) {
    if (isMatchable(pattern)) {
      const matcher = pattern[symbols.matcher]();
      const { matched, selections = {} } = matcher.match(value);
      if (matched)
        Object.keys(selections).forEach((key) => select(key, selections[key]));
      return matched;
    }

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

  return Object.is(value, pattern);
};
