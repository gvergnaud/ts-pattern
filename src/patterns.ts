import { isMatching } from '.';
import * as symbols from './symbols';
import {
  ListPatternSelection,
  NoneSelection,
  OptionalPatternSelection,
  SelectionsRecord,
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

type OptionalSelections<sels extends SelectionsRecord> = {
  [k in keyof sels]: [sels[k][0] | undefined, sels[k][1]];
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
> => ({
  [symbols.PatternKind]: symbols.Guard,
  [symbols.Guard]: (
    value: input
  ): value is Cast<InvertPattern<p> | undefined, input> =>
    value === undefined || isMatching(pattern, value),
  [symbols.Selector]: () => ({}),
});

type Elem<xs> = xs extends Array<infer x> ? x : unknown;

export const listOf = <
  input,
  p extends unknown extends input ? UnknownPattern : Pattern<Elem<input>>
>(
  pattern: p
): GuardPattern<input, InvertPattern<p[]>, ListPatternSelection<p>, false> => {
  let selected: Record<string, unknown[]> = {};

  const listSelector = (key: string, value: unknown) => {
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
        value.every((v) => isMatching(pattern, v, listSelector))
      );
    },
    [symbols.Selector]: () => {
      // remove reference to selected
      let copy = selected;
      selected = {};
      return copy;
    },
  };
};

export const not = <
  input,
  p extends unknown extends input ? UnknownPattern : Pattern<input>
>(
  pattern: p
): NotPattern<input, InvertPattern<p>> => ({
  [symbols.PatternKind]: symbols.Not,
  // Maybe try to make this a function taking input to improve the pattern inference
  [symbols.Not]: (input: input) => pattern as InvertPattern<p>,
});

export const when = <input, output extends input = never>(
  predicate: GuardFunction<input, output>
): GuardPattern<input, output, NoneSelection, false> => ({
  [symbols.PatternKind]: symbols.Guard,
  [symbols.Guard]: predicate,
  [symbols.Selector]: () => ({}),
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
