export enum PatternType {
  String = '@match/string',
  Number = '@match/number',
  Boolean = '@match/boolean',
  Guard = '@match/guard',
  Not = '@match/not',
  Select = '@match/select',
  OneOf = '@match/one-of',
}

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
export const __ = {
  string: PatternType.String,
  number: PatternType.Number,
  boolean: PatternType.Boolean,
} as const;
