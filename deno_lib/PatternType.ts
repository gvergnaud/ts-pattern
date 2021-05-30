export enum PatternType {
  String = '@ts-pattern/string',
  Number = '@ts-pattern/number',
  Boolean = '@ts-pattern/boolean',
  Guard = '@ts-pattern/guard',
  Not = '@ts-pattern/not',
  NamedSelect = '@ts-pattern/named-select',
  AnonymousSelect = '@ts-pattern/anonymous-select',
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
