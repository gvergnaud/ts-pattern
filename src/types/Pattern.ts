export enum PatternType {
  String = '@match/string',
  Number = '@match/number',
  Boolean = '@match/boolean',
  Guard = '@match/guard',
  Not = '@match/not',
  Select = '@match/select',
}

export type Primitives =
  | number
  | boolean
  | string
  | undefined
  | null
  | symbol
  | bigint;

/**
 * GuardValue returns the value guarded by a type guard function.
 */
export type GuardValue<F> = F extends (value: any) => value is infer b
  ? b
  : F extends (value: infer a) => unknown
  ? a
  : never;

export type GuardFunction<a, b extends a> =
  | ((value: a) => value is b)
  | ((value: a) => boolean);

export type GuardPattern<a, b extends a = a> = {
  __patternKind: PatternType.Guard;
  __when: GuardFunction<a, b>;
};

export type NotPattern<a> = {
  __patternKind: PatternType.Not;
  __pattern: Pattern<a>;
};

export type SelectPattern<k extends string> = {
  __patternKind: PatternType.Select;
  __key: k;
};

type SpecialPattern<a> = a extends number
  ? typeof __.number | typeof __
  : a extends string
  ? typeof __.string | typeof __
  : a extends boolean
  ? typeof __.boolean | typeof __
  : typeof __;

/**
 * ### Pattern
 * Patterns can be any (nested) javascript value.
 * They can also be "wildcards", using type constructors
 */
export type Pattern<a> =
  | SelectPattern<string>
  | GuardPattern<a>
  | NotPattern<a | any>
  | SpecialPattern<a>
  | (a extends Primitives
      ? a
      : a extends [infer b, infer c, infer d, infer e, infer f]
      ? [Pattern<b>, Pattern<c>, Pattern<d>, Pattern<e>, Pattern<f>]
      : a extends [infer b, infer c, infer d, infer e]
      ? [Pattern<b>, Pattern<c>, Pattern<d>, Pattern<e>]
      : a extends [infer b, infer c, infer d]
      ? [Pattern<b>, Pattern<c>, Pattern<d>]
      : a extends [infer b, infer c]
      ? [Pattern<b>, Pattern<c>]
      : a extends (infer b)[]
      ? Pattern<b>[]
      : a extends Map<infer k, infer v>
      ? Map<k, Pattern<v>>
      : a extends Set<infer v>
      ? Set<Pattern<v>>
      : a extends object
      ? { [k in keyof a]?: Pattern<a[k]> }
      : a);

export const when = <a, b extends a = a>(
  predicate: GuardFunction<a, b>
): GuardPattern<a, b> => ({
  __patternKind: PatternType.Guard,
  __when: predicate,
});

export const not = <a>(pattern: Pattern<a>): NotPattern<a> => ({
  __patternKind: PatternType.Not,
  __pattern: pattern,
});

export const select = <k extends string>(key: k): SelectPattern<k> => ({
  __patternKind: PatternType.Select,
  __key: key,
});

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
