export enum PatternType {
  Guard = '@ts-pattern/guard',
  Not = '@ts-pattern/not',
  NamedSelect = '@ts-pattern/named-select',
  AnonymousSelect = '@ts-pattern/anonymous-select',
}

/**
 * ### Catch All wildcard
 * `__` is wildcard pattern, matching **any value**.
 * @example
 *  match(value)
 *   .with(__, () => 'will always match')
 *   .exhaustive()
 */

export const __ = '@ts-pattern/__' as __;

export type __ = '@ts-pattern/__' & { __brand: 'catchall' };
