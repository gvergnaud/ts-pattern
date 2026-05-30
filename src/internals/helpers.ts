/**
 * @module
 * @private
 * @internal
 */

import * as symbols from './symbols';
import { SelectionType } from '../types/FindSelected';
import { Pattern, Matcher, MatcherType, AnyMatcher } from '../types/Pattern';
import type { StandardSchemaV1 } from '../types/standard-schema/standard-schema-v1';

const STANDARD_SCHEMA_KEY = '~standard';

const isPromise = (value: unknown): value is Promise<unknown> =>
  typeof (value as any)?.then === 'function';

// @internal
export const isObject = (value: unknown): value is Object =>
  Boolean(value && typeof value === 'object');

//   @internal
export const isMatcher = (
  x: unknown
): x is Matcher<unknown, unknown, MatcherType, SelectionType> => {
  const pattern = x as Matcher<unknown, unknown, MatcherType, SelectionType>;
  return pattern && !!pattern[symbols.matcher];
};

const isStandardSchema = (
  value: unknown
): value is StandardSchemaV1<any, any> => {
  if (!isObject(value)) return false;
  const standard = (value as Record<string | symbol, unknown>)[
    STANDARD_SCHEMA_KEY
  ];
  if (!isObject(standard)) return false;
  const { version, vendor, validate } = standard as StandardSchemaV1.Props;
  return (
    version === 1 &&
    typeof vendor === 'string' &&
    typeof validate === 'function'
  );
};

// @internal
const isOptionalPattern = (
  x: unknown
): x is Matcher<unknown, unknown, 'optional', SelectionType> => {
  return isMatcher(x) && x[symbols.matcher]().matcherType === 'optional';
};

// tells us if the value matches a given pattern.
// @internal
export const matchPattern = (
  pattern: any,
  value: any,
  select: (key: string, value: unknown) => void
): boolean => {
  if (isMatcher(pattern)) {
    const matcher = pattern[symbols.matcher]();
    const { matched, selections } = matcher.match(value);
    if (matched && selections) {
      Object.keys(selections).forEach((key) => select(key, selections[key]));
    }
    return matched;
  }

  if (isStandardSchema(pattern)) {
    const result = pattern[STANDARD_SCHEMA_KEY].validate(value);
    if (isPromise(result)) {
      throw new Error(
        'Async Standard Schema validation is not supported by ts-pattern.'
      );
    }
    return !Array.isArray(result.issues);
  }

  if (isObject(pattern)) {
    if (!isObject(value)) return false;

    // Tuple pattern
    if (Array.isArray(pattern)) {
      if (!Array.isArray(value)) return false;
      let startPatterns = [];
      let endPatterns = [];
      let variadicPatterns: AnyMatcher[] = [];

      for (const i of pattern.keys()) {
        const subpattern = pattern[i];
        if (isMatcher(subpattern) && subpattern[symbols.isVariadic]) {
          variadicPatterns.push(subpattern);
        } else if (variadicPatterns.length) {
          endPatterns.push(subpattern);
        } else {
          startPatterns.push(subpattern);
        }
      }

      if (variadicPatterns.length) {
        if (variadicPatterns.length > 1) {
          throw new Error(
            `Pattern error: Using \`...P.array(...)\` several times in a single pattern is not allowed.`
          );
        }

        if (value.length < startPatterns.length + endPatterns.length) {
          return false;
        }

        const startValues = value.slice(0, startPatterns.length);
        const endValues =
          endPatterns.length === 0 ? [] : value.slice(-endPatterns.length);
        const middleValues = value.slice(
          startPatterns.length,
          endPatterns.length === 0 ? Infinity : -endPatterns.length
        );

        return (
          startPatterns.every((subPattern, i) =>
            matchPattern(subPattern, startValues[i], select)
          ) &&
          endPatterns.every((subPattern, i) =>
            matchPattern(subPattern, endValues[i], select)
          ) &&
          (variadicPatterns.length === 0
            ? true
            : matchPattern(variadicPatterns[0], middleValues, select))
        );
      }

      return pattern.length === value.length
        ? pattern.every((subPattern, i) =>
            matchPattern(subPattern, value[i], select)
          )
        : false;
    }

    return Reflect.ownKeys(pattern).every((k): boolean => {
      const subPattern = pattern[k];

      return (
        (k in value || isOptionalPattern(subPattern)) &&
        matchPattern(subPattern, value[k], select)
      );
    });
  }

  return Object.is(value, pattern);
};

// @internal
export const getSelectionKeys = (pattern: any): string[] => {
  if (isObject(pattern)) {
    if (isMatcher(pattern)) {
      return pattern[symbols.matcher]().getSelectionKeys?.() ?? [];
    }
    if (Array.isArray(pattern)) return flatMap(pattern, getSelectionKeys);
    return flatMap(Object.values(pattern), getSelectionKeys);
  }
  return [];
};

// @internal
export const flatMap = <a, b>(
  xs: readonly a[],
  f: (v: a) => readonly b[]
): b[] => xs.reduce<b[]>((acc, x) => acc.concat(f(x)), []);
