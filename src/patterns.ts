import { isMatching } from '.';
import * as symbols from './symbols';
import { Cast } from './types/helpers';
import { InvertPattern } from './types/InvertPattern';
import {
  AnonymousSelectPattern,
  GuardFunction,
  GuardPattern,
  SelectPattern,
  NotPattern,
  Pattern,
  MatchProtocolPattern,
  GuardValue,
} from './types/Pattern';

export const when2 = <input, p extends Pattern<input>>(
  pattern: p,
  getPattern?: (value: input) => p,
  select?: (x: InvertPattern<p>) => void
): GuardPattern<input, InvertPattern<p>> => ({
  [symbols.PatternKind]: symbols.Guard,
  [symbols.Guard]: (value: input): value is InvertPattern<p> =>
    isMatching(getPattern(value), value),
});

export const when = <input, output extends input = never>(
  predicate: GuardFunction<input, output>
): GuardPattern<input, output> => ({
  [symbols.PatternKind]: symbols.Guard,
  [symbols.Guard]: predicate,
});

type GetSelection<s> = s extends (value: any) => { value: infer value }
  ? value
  : never;

type GetKey<s> = s extends (value: any) => { key: infer k } ? k : never;

type GuardInput<s> = s extends (value: infer v) => unknown ? v : never;
type GuardNarrowed<s> = s extends (value: any) => value is infer n ? n : never;

export function pattern<
  p extends GuardFunction<any, any>,
  s extends (value: GuardValue<p>) => { key: string; value: any }
>(
  predicate: p,
  selector: s
): MatchProtocolPattern<
  GetKey<s>,
  GuardInput<p>,
  Cast<GuardNarrowed<p>, GuardInput<p>>,
  GetSelection<s>,
  false
>;
export function pattern<
  p extends GuardFunction<any, any>,
  s extends (value: GuardValue<p>) => { key: string; value: any },
  isExhaustive extends boolean
>(
  predicate: p,
  selector: s,
  isExhaustive: isExhaustive
): MatchProtocolPattern<
  GetKey<s>,
  GuardInput<p>,
  Cast<GuardNarrowed<p>, GuardInput<p>>,
  GetSelection<s>,
  isExhaustive
>;
export function pattern<
  p extends GuardFunction<any, any>,
  s extends (value: GuardValue<p>) => { key: string; value: any }
>(
  predicate: p,
  selector: s,
  isExhaustive?: boolean
): MatchProtocolPattern<
  GetKey<s>,
  GuardInput<p>,
  Cast<GuardNarrowed<p>, GuardInput<p>>,
  GetSelection<s>,
  boolean
> {
  return {
    [symbols.PatternKind]: symbols.MatchProtocol,
    [symbols.MatchProtocol]: { predicate, selector, isExhaustive },
  };
}

export const not = <a>(pattern: Pattern<a>): NotPattern<a> => ({
  [symbols.PatternKind]: symbols.Not,
  [symbols.Not]: pattern,
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
  when(isInstanceOf(classConstructor));

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
