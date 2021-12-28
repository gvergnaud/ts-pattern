import * as P from './patterns';
import * as symbols from './symbols';
import {
  Pattern,
  MatchablePattern,
  NotPattern,
  SelectPattern,
} from './types/Pattern';

// @internal
export const isObject = (value: unknown): value is Object =>
  Boolean(value && typeof value === 'object');

//   @internal
export const isMatchablePattern = (
  x: unknown
): x is MatchablePattern<unknown, unknown, any> => {
  const pattern = x as MatchablePattern<unknown, unknown, any>;
  return pattern && !!pattern[symbols.Matchable];
};

// @internal
export const isNotPattern = (x: unknown): x is NotPattern<unknown, unknown> => {
  const pattern = x as NotPattern<unknown, unknown>;
  return pattern && pattern[symbols.PatternKind] === symbols.Not;
};

// @internal
export const isSelectPattern = (x: unknown): x is SelectPattern<string> => {
  const pattern = x as SelectPattern<string>;
  return pattern && pattern[symbols.PatternKind] === symbols.Select;
};

// @internal
export const isOptionalPattern = (
  x: unknown
): x is MatchablePattern<unknown, unknown, any, true> => {
  return isMatchablePattern(x) && x[symbols.Matchable]().isOptional;
};

// tells us if the value matches a given pattern.
// @internal
export const matchPattern = <i, p extends Pattern<i>>(
  pattern: p,
  value: i,
  select: (key: string, value: unknown) => void
): boolean => {
  if (isObject(pattern)) {
    if (isMatchablePattern(pattern)) {
      const matchable = pattern[symbols.Matchable]();
      const doesMatch = Boolean(matchable.predicate(value));
      const selected = matchable.selector(value);
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
