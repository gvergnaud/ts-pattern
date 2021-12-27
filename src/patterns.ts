import {
  matchPattern,
  isObject,
  isOptionalPattern,
  isSelectPattern,
} from './helpers';
import * as symbols from './symbols';
import {
  ListPatternSelection,
  NoneSelection,
  OptionalPatternSelection,
} from './types/FindSelected';
import { Cast } from './types/helpers';
import { InvertPattern } from './types/InvertPattern';
import {
  AnonymousSelectPattern,
  GuardFunction,
  GuardPattern,
  SelectPattern,
  NotPattern,
  Pattern,
  UnknownPattern,
} from './types/Pattern';

const selectWithUndefined = (
  pattern: Pattern<any>,
  select: (key: string, value: any) => void
): void => {
  if (isObject(pattern)) {
    if (isSelectPattern(pattern))
      return select(pattern[symbols.Select], undefined);
    if (isOptionalPattern(pattern)) {
      const selected = pattern[symbols.Selector](undefined);
      Object.entries(selected).forEach(([k, v]) => select(k, v));
    }
    if (Array.isArray(pattern))
      return pattern.forEach((p) => selectWithUndefined(p, select));
    return Object.values(pattern).forEach((p) =>
      selectWithUndefined(p, select)
    );
  }
};

export const optional = <
  input,
  p extends unknown extends input ? UnknownPattern : Pattern<input>
>(
  pattern: p
): GuardPattern<
  input,
  InvertPattern<p> | undefined,
  OptionalPatternSelection<p>,
  true
> => {
  let selected: Record<string, unknown[]> = {};
  const selector = (key: string, value: any) => {
    selected[key] = value;
  };

  return {
    [symbols.PatternKind]: symbols.Guard,
    [symbols.Guard]: (
      value: input
    ): value is Cast<InvertPattern<p> | undefined, input> => {
      selected = {};

      if (value === undefined) {
        selectWithUndefined(pattern, selector);
        return true;
      }

      return matchPattern(pattern as Pattern<input>, value, selector);
    },
    // TODO: implement this to select on the sub pattern with the value or undefined
    [symbols.Selector]: () => selected,
    [symbols.IsOptional]: true,
  };
};

type Elem<xs> = xs extends Array<infer x> ? x : unknown;

export const array = <
  input,
  p extends unknown extends input ? UnknownPattern : Pattern<Elem<input>>
>(
  pattern: p
): GuardPattern<input, InvertPattern<p[]>, ListPatternSelection<p>, false> => {
  let selected: Record<string, unknown[]> = {};

  const selector = (key: string, value: unknown) => {
    selected[key] = (selected[key] || []).concat([value]);
  };

  return {
    [symbols.PatternKind]: symbols.Guard,
    [symbols.Guard]: (
      value: input
    ): value is Cast<InvertPattern<p[]>, input> => {
      selected = {};
      return (
        Array.isArray(value) &&
        value.every((v) => matchPattern(pattern, v, selector))
      );
    },
    [symbols.Selector]: () => selected,
    [symbols.IsOptional]: false,
  };
};

export const not = <
  input,
  p extends unknown extends input ? UnknownPattern : Pattern<input>
>(
  pattern: p
): NotPattern<input, InvertPattern<p>> => ({
  [symbols.PatternKind]: symbols.Not,
  [symbols.Not]: (input: input) => pattern as InvertPattern<p>,
});

export const when = <input, output extends input = never>(
  predicate: GuardFunction<input, output>
): GuardPattern<input, output, NoneSelection, false> => ({
  [symbols.PatternKind]: symbols.Guard,
  [symbols.Guard]: predicate,
  [symbols.Selector]: () => ({}),
  [symbols.IsOptional]: false,
});

// TODO check if we could infer the type using the same technique
// as for guards, and infer it without needing the input type
// in FindSelected
export function select(): AnonymousSelectPattern;
export function select<k extends string>(key: k): SelectPattern<k>;
export function select<k extends string>(
  key?: k
): AnonymousSelectPattern | SelectPattern<k> {
  return key === undefined
    ? {
        [symbols.PatternKind]: symbols.Select,
        [symbols.Select]: symbols.AnonymousSelectKey,
      }
    : {
        [symbols.PatternKind]: symbols.Select,
        [symbols.Select]: key,
      };
}

function isUnknown<T>(x: T | unknown): x is unknown {
  return true;
}

function isNumber<T>(x: T | number): x is number {
  return typeof x === 'number';
}

function isString<T>(x: T | string): x is string {
  return typeof x === 'string';
}

function isBoolean<T>(x: T | boolean): x is boolean {
  return typeof x === 'boolean';
}

function isNullish<T>(x: T | null | undefined): x is null | undefined {
  return x === null || x === undefined;
}

type AnyConstructor = new (...args: any[]) => any;

function isInstanceOf<T extends AnyConstructor>(classConstructor: T) {
  return (val: unknown): val is InstanceType<T> =>
    val instanceof classConstructor;
}

/**
 * ### Catch All wildcard
 * `__` is a wildcard pattern, matching **any value**.
 * @example
 *  match(value)
 *   .with(__, () => 'will always match')
 */
export const __ = when(isUnknown);

/**
 * ### String wildcard
 * `P.string` is a wildcard pattern matching any **string**.
 * @example
 *  match(value)
 *   .with(P.string, () => 'will match on strings only')
 */

export const string = when(isString);

/**
 * ### Number wildcard
 * `P.number` is a wildcard pattern matching any **number**.
 * @example
 *  match(value)
 *   .with(P.number, () => 'will match on numbers only')
 */
export const number = when(isNumber);

/**
 * ### Boolean wildcard
 * `P.boolean` is a wildcard pattern matching any **boolean**.
 * @example
 *   .with(P.boolean, () => 'will match on booleans only')
 */
export const boolean = when(isBoolean);

/**
 * ### Nullish wildcard
 * `P.nullish` is a wildcard pattern matching **null** or **undefined**.
 * @example
 *   .with(P.nullish, () => 'will match on null or undefined only')
 */
export const nullish = when(isNullish);

/**
 * ### instanceOf
 * `P.instanceOf(SomeClass)` is a pattern matching instances of a given class.
 * @example
 *   .with(P.instanceOf(SomeClass), () => 'will match on SomeClass instances')
 */
export const instanceOf = <T extends AnyConstructor>(classConstructor: T) =>
  when<unknown, InstanceType<T>>(isInstanceOf(classConstructor));

/**
 * ### infer
 * `P.infer<typeof somePattern>` will return the type of the value
 * matched by this pattern
 * @example
 * const userPattern = { name: P.string }
 * type User = P.infer<typeof userPattern>
 */
export type infer<p extends Pattern<any>> = InvertPattern<p>;
