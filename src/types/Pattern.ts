import type { __, PatternType } from '../PatternType';

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

type WildCardPattern<a> = a extends number
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
  | WildCardPattern<a>
  | (a extends Primitives
      ? a
      : a extends (infer b)[]
      ? a extends [infer b, infer c, infer d, infer e, infer f]
        ? [Pattern<b>, Pattern<c>, Pattern<d>, Pattern<e>, Pattern<f>]
        : a extends [infer b, infer c, infer d, infer e]
        ? [Pattern<b>, Pattern<c>, Pattern<d>, Pattern<e>]
        : a extends [infer b, infer c, infer d]
        ? [Pattern<b>, Pattern<c>, Pattern<d>]
        : a extends [infer b, infer c]
        ? [Pattern<b>, Pattern<c>]
        :
            | []
            | [Pattern<b>]
            | [Pattern<b>, Pattern<b>]
            | [Pattern<b>, Pattern<b>, Pattern<b>]
            | [Pattern<b>, Pattern<b>, Pattern<b>, Pattern<b>]
            | [Pattern<b>, Pattern<b>, Pattern<b>, Pattern<b>, Pattern<b>]
      : a extends Map<infer k, infer v>
      ? Map<k, Pattern<v>>
      : a extends Set<infer v>
      ? Set<Pattern<v>>
      : a extends object
      ? { [k in keyof a]?: Pattern<a[k]> }
      : a);

/**
 * ### ExhaustivePattern
 * Just like the Pattern type, excluding when clauses.
 */
export type ExhaustivePattern<a> =
  | SelectPattern<string>
  | NotPattern<a | any>
  | WildCardPattern<a>
  | (a extends Primitives
      ? a
      : a extends (infer b)[]
      ? a extends [infer b, infer c, infer d, infer e, infer f]
        ? [
            ExhaustivePattern<b>,
            ExhaustivePattern<c>,
            ExhaustivePattern<d>,
            ExhaustivePattern<e>,
            ExhaustivePattern<f>
          ]
        : a extends [infer b, infer c, infer d, infer e]
        ? [
            ExhaustivePattern<b>,
            ExhaustivePattern<c>,
            ExhaustivePattern<d>,
            ExhaustivePattern<e>
          ]
        : a extends [infer b, infer c, infer d]
        ? [ExhaustivePattern<b>, ExhaustivePattern<c>, ExhaustivePattern<d>]
        : a extends [infer b, infer c]
        ? [ExhaustivePattern<b>, ExhaustivePattern<c>]
        :
            | []
            | [ExhaustivePattern<b>]
            | [ExhaustivePattern<b>, ExhaustivePattern<b>]
            | [ExhaustivePattern<b>, ExhaustivePattern<b>, ExhaustivePattern<b>]
            | [
                ExhaustivePattern<b>,
                ExhaustivePattern<b>,
                ExhaustivePattern<b>,
                ExhaustivePattern<b>
              ]
            | [
                ExhaustivePattern<b>,
                ExhaustivePattern<b>,
                ExhaustivePattern<b>,
                ExhaustivePattern<b>,
                ExhaustivePattern<b>
              ]
      : a extends Map<infer k, infer v>
      ? Map<k, ExhaustivePattern<v>>
      : a extends Set<infer v>
      ? Set<ExhaustivePattern<v>>
      : a extends object
      ? { [k in keyof a]?: ExhaustivePattern<a[k]> }
      : a);
