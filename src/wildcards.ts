import { when } from './guards';
import * as symbols from './symbols';

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

const unknownGuard = when(isUnknown);
const stringGuard = when(isString);
const numberGuard = when(isNumber);
const NaNGuard = when(numberIsNaN);
const booleanGuard = when(isBoolean);
const nullishGuard = when(isNullish);

/**
 * ### Catch All wildcard
 * `__` is wildcard pattern, matching **any value**.
 *
 * `__.string` is wildcard pattern matching any **string**.
 *
 * `__.number` is wildcard pattern matching any **number**.
 *
 * `__.NaN` is wildcard pattern matching **NaN**
 *
 * `__.boolean` is wildcard pattern matching any **boolean**.
 *
 * `__.nullish` is wildcard pattern matching **null** or **undefined**.
 * @example
 *  match(value)
 *   .with(__, () => 'will always match')
 *   .with(__.string, () => 'will match on strings only')
 *   .with(__.number, () => 'will match on numbers only')
 *   .with(__.NaN, () => 'will match on NaN')
 *   .with(__.boolean, () => 'will match on booleans only')
 *   .with(__.nullish, () => 'will match on null or undefined only')
 */
export const __ = Object.assign(unknownGuard, {
  string: stringGuard,
  number: numberGuard,
  NaN: NaNGuard,
  boolean: booleanGuard,
  nullish: nullishGuard,
  not: symbols.not,
  list: symbols.list,
  optional: symbols.optional,
  or: symbols.or,
  and: symbols.and,
} as const);
