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

export type MatchableType = 'not' | 'optional' | 'regular';

// We use a separate MatcherProtocol type that preserves
// the type level information (selections and excluded) used
// only for inference.
export type MatcherProtocol<
  input,
  narrowed,
  // Type of what this pattern selected from the input
  matchableType extends MatchableType = 'regular',
  selections extends SelectionType = NoneSelection,
  // Type to exclude from the input union because
  // it has been fully matched by this pattern
  excluded = narrowed
> = {
  predicate: (value: input) => boolean;
  selector: (v: input) => Record<string, any>;
  getSelectionKeys?: () => string[];
  matchableType?: matchableType;
};

export type Matchable<
  input,
  narrowed,
  // Type of what this pattern selected from the input
  matchableType extends MatchableType = 'regular',
  selections extends SelectionType = NoneSelection,
  // Type to exclude from the input union because
  // it has been fully matched by this pattern
  excluded = narrowed
> = {
  [symbols.matcher](): MatcherProtocol<
    input,
    narrowed,
    matchableType,
    selections,
    excluded
  >;
};

type AnyMatchable = Matchable<unknown, unknown, any, any>;

export type ToExclude<a> = {
  [symbols.toExclude]: a;
};

export type UnknownPattern =
  | [Pattern<unknown>, ...Pattern<unknown>[]]
  | { [k: string]: Pattern<unknown> }
  | Set<Pattern<unknown>>
  | Map<unknown, Pattern<unknown>>
  | Primitives
  | AnyMatchable;

/**
 * ### Pattern
 * Patterns can be any (nested) javascript value.
 * They can also be a "wildcards", like `__`.
 */
export type Pattern<a> =
  | Matchable<a, unknown, any, any>
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
