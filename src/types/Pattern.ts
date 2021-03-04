import type { __, PatternType } from '../PatternType';
import { IsPlainObject } from './helpers';

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

/**
 * Using @deprecated here to dissuade people from using them inside there patterns.
 * Theses properties should be used by ts-pattern's internals only.
 */

export type GuardPattern<a, b extends a = never> = {
  /** @deprecated This property should only be used by ts-pattern's internals. */
  '@ts-pattern/__patternKind': PatternType.Guard;
  /** @deprecated This property should only be used by ts-pattern's internals. */
  '@ts-pattern/__when': GuardFunction<a, b>;
};

export type NotPattern<a> = {
  /** @deprecated This property should only be used by ts-pattern's internals. */
  '@ts-pattern/__patternKind': PatternType.Not;
  /** @deprecated This property should only be used by ts-pattern's internals. */
  '@ts-pattern/__pattern': Pattern<a>;
};

export type AnonymousSelectPattern = {
  /** @deprecated This property should only be used by ts-pattern's internals. */
  '@ts-pattern/__patternKind': PatternType.AnonymousSelect;
};

export type NamedSelectPattern<k extends string> = {
  /** @deprecated This property should only be used by ts-pattern's internals. */
  '@ts-pattern/__patternKind': PatternType.NamedSelect;
  /** @deprecated This property should only be used by ts-pattern's internals. */
  '@ts-pattern/__key': k;
};

type WildCardPattern<a> = a extends number
  ? typeof __.number
  : a extends string
  ? typeof __.string
  : a extends boolean
  ? typeof __.boolean
  : never;

/**
 * ### Pattern
 * Patterns can be any (nested) javascript value.
 * They can also be "wildcards", using type constructors
 */
export type Pattern<a> =
  | typeof __
  | NamedSelectPattern<string>
  | AnonymousSelectPattern
  | GuardPattern<a>
  | NotPattern<a | any>
  | WildCardPattern<a>
  | (a extends Primitives
      ? a
      : a extends (infer b)[]
      ? a extends [infer b, infer c, infer d, infer e, infer f]
        ? readonly [Pattern<b>, Pattern<c>, Pattern<d>, Pattern<e>, Pattern<f>]
        : a extends [infer b, infer c, infer d, infer e]
        ? readonly [Pattern<b>, Pattern<c>, Pattern<d>, Pattern<e>]
        : a extends [infer b, infer c, infer d]
        ? readonly [Pattern<b>, Pattern<c>, Pattern<d>]
        : a extends [infer b, infer c]
        ? readonly [Pattern<b>, Pattern<c>]
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
      : IsPlainObject<a> extends true
      ? { readonly [k in keyof a]?: Pattern<a[k]> }
      : a);
