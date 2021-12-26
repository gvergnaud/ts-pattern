import type * as symbols from '../symbols';
import { Primitives, Compute, Cast, IsPlainObject } from './helpers';
import { NoneSelection, SelectionType } from './FindSelected';

/**
 * GuardValue returns the value guarded by a type guard function.
 */
export type GuardValue<F> = F extends (value: any) => value is infer b
  ? b
  : F extends (value: infer a) => unknown
  ? a
  : never;

export type GuardFunction<input, output> =
  | ((value: input) => value is Cast<output, input>)
  | ((value: input) => boolean);

// Using internal tags here to dissuade people from using them inside patterns.
// Theses properties should be used by ts-pattern's internals only.
// Unfortunately they must be publically visible to work at compile time
export type GuardPattern<
  input,
  output,
  selections extends SelectionType = NoneSelection
> = {
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.PatternKind]: symbols.Guard;
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.Guard]: GuardFunction<input, output>;
  [symbols.Selector]: (v: any) => Record<string, any>;
};

export type NotPattern<a, b> = {
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.PatternKind]: symbols.Not;
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.Not]: (value: a) => b;
};

export type ToExclude<a> = {
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.PatternKind]: symbols.ToExclude;
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.ToExclude]: a;
};

export type AnonymousSelectPattern = SelectPattern<symbols.AnonymousSelectKey>;

export type SelectPattern<k extends string> = {
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.PatternKind]: symbols.Select;
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.Select]: k;
};

export type UnknownPattern =
  | [Pattern<unknown>, ...Pattern<unknown>[]]
  | { [k: string]: Pattern<unknown> }
  | Set<Pattern<unknown>>
  | Map<unknown, Pattern<unknown>>
  | Primitives
  | NotPattern<unknown, unknown>
  | SelectPattern<string>
  | GuardPattern<unknown, unknown, any>;

/**
 * ### Pattern
 * Patterns can be any (nested) javascript value.
 * They can also be a "wildcards", like `__`.
 */
export type Pattern<a> =
  | NotPattern<unknown, unknown>
  | SelectPattern<string>
  | GuardPattern<a, a, any>
  // If all branches are objects, then we match
  // on properties that all objects have (usually the discriminants).
  | (IsPlainObject<a> extends true
      ? /*
        using (Compute<a>) to avoid the distribution of `a`
        if it is a union type, and let people pass subpatterns
        that match several branches in the union at once.
      */
        keyof Compute<a> extends infer commonkeys
        ? {
            readonly [k in Cast<commonkeys, string>]?: k extends keyof a
              ? // TODO comment on why we need to put a NotPattern here
                Pattern<a[k]> | NotPattern<a[k], a[k]>
              : never;
          } &
            (a extends object
              ? { readonly [k in Exclude<keyof a, commonkeys>]?: Pattern<a[k]> }
              : {})
        : never
      : a extends Primitives
      ? a
      : unknown extends a
      ? UnknownPattern
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
      ? { readonly [k in keyof a]?: Pattern<a[k]> }
      : a);
