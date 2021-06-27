import { when } from './guards';

function isUnknown(x: unknown): x is unknown {
  return true;
}

function isNumber(x: unknown): x is number {
  return typeof x === 'number' && !Number.isNaN(x);
}

function isString(x: unknown): x is string {
  return typeof x === 'string';
}

function isBoolean(x: unknown): x is boolean {
  return typeof x === 'boolean';
}

function isEmpty(x: unknown): x is null | undefined {
  return x === null || x === undefined;
}

const unknownGuard = when(isUnknown);
const stringGuard = when(isString);
const numberGuard = when(isNumber);
const booleanGuard = when(isBoolean);
const emptyGuard = when(isEmpty);

/**
 * ### Catch All wildcard
 * `__` is wildcard pattern, matching **any value**.
 *
 * `__.string` is wildcard pattern matching any **string**.
 *
 * `__.number` is wildcard pattern matching any **number**.
 *
 * `__.boolean` is wildcard pattern matching any **boolean**.
 * @example
 *  match(value)
 *   .with(__, () => 'will always match')
 *   .with(__.string, () => 'will match on strings only')
 *   .with(__.number, () => 'will match on numbers only')
 *   .with(__.boolean, () => 'will match on booleans only')
 */
export const __ = Object.assign(unknownGuard, {
  string: stringGuard,
  number: numberGuard,
  boolean: booleanGuard,
  empty: emptyGuard,
});
