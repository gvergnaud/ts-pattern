import type * as symbols from '../symbols';
import { Primitives, Compute, Cast, IsPlainObject, IsUnion } from './helpers';
import { NoneSelection, SelectionType } from './FindSelected';

/**
 * GuardValue returns the value guarded by a type guard function.
 */
export type GuardValue<F> = F extends (value: any) => value is infer b
  ? b
  : F extends (value: infer a) => unknown
  ? a
  : never;

export type GuardFunction<input, narrowed> =
  | ((value: input) => value is Cast<narrowed, input>)
  | ((value: input) => boolean);

export type MatchablePattern<
  input,
  narrowed,
  // Type of what this pattern selected from the input
  selections extends SelectionType = NoneSelection,
  isOptional extends boolean = false,
  // Type to exclude from the input union because
  // it has been fully matched by this pattern
  excluded = narrowed
> = {
  [symbols.Matchable](): {
    predicate: GuardFunction<input, narrowed>;
    selector: (v: any) => Record<string, any>;
    getSelectionKeys?: () => string[];
    isOptional: isOptional;
  };
};

export type NotPattern<a, b> = {
  [symbols.PatternKind]: symbols.Not;
  [symbols.Not]: (value: a) => b;
};

export type ToExclude<a> = {
  [symbols.PatternKind]: symbols.ToExclude;
  [symbols.ToExclude]: a;
};

export type AnonymousSelectPattern = SelectPattern<symbols.AnonymousSelectKey>;

export type SelectPattern<k extends string> = {
  [symbols.PatternKind]: symbols.Select;
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
  | MatchablePattern<unknown, unknown, any, boolean>;

/**
 * ### Pattern
 * Patterns can be any (nested) javascript value.
 * They can also be a "wildcards", like `__`.
 */
export type Pattern<a> =
  | NotPattern<a, unknown>
  | SelectPattern<string>
  | MatchablePattern<a, a, any, boolean>
  // If all branches are objects, then we match
  // on properties that all objects have (usually the discriminants).
  | ([IsUnion<a>, IsPlainObject<a>] extends [true, true]
      ? /*
        using (Compute<a>) to avoid the distribution of `a`
        if it is a union type, and let people pass subpatterns
        that match several branches in the union at once.
      */
        keyof Compute<a> extends infer commonkeys
        ? Compute<
            {
              readonly [k in commonkeys & keyof a]?: Pattern<a[k]>;
            } &
              (a extends object
                ? {
                    readonly [k in Exclude<keyof a, commonkeys>]?: Pattern<
                      a[k]
                    >;
                  }
                : never)
          >
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
