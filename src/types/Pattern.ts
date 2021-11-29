import type * as symbols from '../symbols';
import { Primitives, IsPlainObject } from './helpers';

/**
 * GuardValue returns the value guarded by a type guard function.
 */
export type GuardValue<F> = F extends (value: any) => value is infer b
  ? b
  : F extends (value: infer a) => unknown
  ? a
  : never;

export type GuardFunction<input, output extends input = never> =
  | ((value: input) => value is output)
  | ((value: input) => boolean);

// Using internal tags here to dissuade people from using them inside patterns.
// Theses properties should be used by ts-pattern's internals only.
// Unfortunately they must be publically visible to work at compile time
export type GuardPattern<input, output extends input = never> = {
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.PatternKind]: symbols.Guard;
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.Guard]: GuardFunction<input, output>;
};

export type NotPattern<a> = readonly [symbols.not, Pattern<a>];

export type OptionalPattern<a> = readonly [symbols.optional, Pattern<a>];

export type AndPattern<a> = readonly [symbols.and, Pattern<a>, ...Pattern<a>[]];

export type OrPattern<a> = readonly [symbols.or, Pattern<a>, ...Pattern<a>[]];

export type ListPattern<a> = readonly [symbols.list, Pattern<a>];

export type AnonymousSelectPattern = {
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.PatternKind]: symbols.AnonymousSelect;
};

export type NamedSelectPattern<k extends string> = {
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.PatternKind]: symbols.NamedSelect;
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.NamedSelect]: k;
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
  | OptionalPattern<a>
  | AndPattern<a>
  | OrPattern<a>
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
        : a extends readonly [infer a1]
        ? readonly [Pattern<a1>]
        :
            | ListPattern<i>
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
      : a extends object
      ? a extends any
        ? {
            readonly [k in keyof a]?: Pattern<NonNullable<a[k]>>;
          }
        : never
      : a);
