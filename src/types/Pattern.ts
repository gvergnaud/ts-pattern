import type { PatternType } from '../PatternType';
import { Primitives, IsPlainObject } from './helpers';

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

// Using internal tags here to dissuade people from using them inside there patterns.
// Theses properties should be used by ts-pattern's internals only.
export type GuardPattern<a, b extends a = never> = {
  /** @internal This property should only be used by ts-pattern's internals. */
  '@ts-pattern/__patternKind': PatternType.Guard;
  /** @internal This property should only be used by ts-pattern's internals. */
  '@ts-pattern/__when': GuardFunction<a, b>;
};

export type NotPattern<a> = {
  /** @internal This property should only be used by ts-pattern's internals. */
  '@ts-pattern/__patternKind': PatternType.Not;
  /** @internal This property should only be used by ts-pattern's internals. */
  '@ts-pattern/__pattern': Pattern<a>;
};

export type AnonymousSelectPattern = {
  /** @internal This property should only be used by ts-pattern's internals. */
  '@ts-pattern/__patternKind': PatternType.AnonymousSelect;
};

export type NamedSelectPattern<k extends string> = {
  /** @internal This property should only be used by ts-pattern's internals. */
  '@ts-pattern/__patternKind': PatternType.NamedSelect;
  /** @internal This property should only be used by ts-pattern's internals. */
  '@ts-pattern/__key': k;
};

/**
 * ### Pattern
 * Patterns can be any (nested) javascript value.
 * They can also be a "wildcards", like `__`.
 */
export type Pattern<a> =
  | AnonymousSelectPattern
  | NamedSelectPattern<string>
  | GuardPattern<a, a>
  | NotPattern<a | any>
  | (a extends Primitives
      ? a
      : a extends readonly (infer i)[]
      ? a extends readonly [infer a1, infer a2, infer a3, infer a4, infer a5]
        ? readonly [
            Pattern<a1>,
            Pattern<a2>,
            Pattern<a3>,
            Pattern<a4>,
            Pattern<a5>
          ]
        : a extends readonly [infer a1, infer a2, infer a3, infer a4]
        ? readonly [Pattern<a1>, Pattern<a2>, Pattern<a3>, Pattern<a4>]
        : a extends readonly [infer a1, infer a2, infer a3]
        ? readonly [Pattern<a1>, Pattern<a2>, Pattern<a3>]
        : a extends readonly [infer a1, infer a2]
        ? readonly [Pattern<a1>, Pattern<a2>]
        :
            | readonly []
            | readonly [Pattern<i>]
            | readonly [Pattern<i>, Pattern<i>]
            | readonly [Pattern<i>, Pattern<i>, Pattern<i>]
            | readonly [Pattern<i>, Pattern<i>, Pattern<i>, Pattern<i>]
            | readonly [
                Pattern<i>,
                Pattern<i>,
                Pattern<i>,
                Pattern<i>,
                Pattern<i>
              ]
      : a extends Map<infer k, infer v>
      ? Map<k, Pattern<v>>
      : a extends Set<infer v>
      ? Set<Pattern<v>>
      : IsPlainObject<a> extends true
      ? { readonly [k in keyof a]?: Pattern<a[k]> }
      : a);
