import { isMatching } from '.';
import * as symbols from './symbols';
import {
  ListPatternSelection,
  NoneSelection,
  RecordSelection,
  Selections,
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
  p extends unknown extends input
    ? UnknownPattern
    : Pattern<Exclude<input, undefined>>
>(
  pattern: p
): GuardPattern<
  input,
  Cast<InvertPattern<p> | undefined, input>,
  RecordSelection<OptionalSelections<Selections<input, p>>>
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
): GuardPattern<input, InvertPattern<p[]>, ListPatternSelection<p>> => {
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
): GuardPattern<input, output, NoneSelection> => ({
  [symbols.PatternKind]: symbols.Guard,
  [symbols.Guard]: predicate,
  [symbols.Selector]: () => ({}),
});

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

type AnyConstructor = new (...args: any[]) => any;

function isInstanceOf<T extends AnyConstructor>(classConstructor: T) {
  return (val: unknown): val is InstanceType<T> =>
    val instanceof classConstructor;
}
export const instanceOf = <T extends AnyConstructor>(classConstructor: T) =>
  when<unknown, InstanceType<T>>(isInstanceOf(classConstructor));

function isUnknown<T>(x: T | unknown): x is unknown {
  return true;
}

function isNumber<T>(x: T | number): x is number {
  return typeof x === 'number';
}

function numberIsNaN<T>(x: T | number) {
  return Number.isNaN(x);
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

/**
 * ### Catch All wildcard
 * `__` is wildcard pattern, matching **any value**.
 * @example
 *  match(value)
 *   .with(__, () => 'will always match')
 */
export const __ = when(isUnknown);

/**
 * ### String wildcard
 * `P.string` is wildcard pattern matching any **string**.
 * @example
 *  match(value)
 *   .with(P.string, () => 'will match on strings only')
 */

export const string = when(isString);

/**
 * ### Number wildcard
 * `P.number` is wildcard pattern matching any **number**.
 * @example
 *  match(value)
 *   .with(P.number, () => 'will match on numbers only')
 */
export const number = when(isNumber);

/**
 * ### NaN wildcard
 * `P.NaN` is wildcard pattern matching **NaN**
 * @example
 *  match(value)
 *   .with(P.NaN, () => 'will match on NaN')
 */
export const NaN = when(numberIsNaN);

/**
 * ### Boolean wildcard
 * `P.boolean` is wildcard pattern matching any **boolean**.
 * @example
 *   .with(P.boolean, () => 'will match on booleans only')
 */
export const boolean = when(isBoolean);

/**
 * ### Nullish wildcard
 * `P.nullish` is wildcard pattern matching **null** or **undefined**.
 * @example
 *   .with(P.nullish, () => 'will match on null or undefined only')
 */
export const nullish = when(isNullish);
