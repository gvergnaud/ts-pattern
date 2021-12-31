import type * as symbols from '../symbols';
import {
  Primitives,
  Compute,
  Cast,
  IsPlainObject,
  IsUnion,
  ValueOf,
} from './helpers';
import { NoneSelection, SelectionType } from './FindSelected';

export type MatcherType = 'not' | 'optional' | 'or' | 'and' | 'regular';

// We use a separate MatcherProtocol type that preserves
// the type level information (selections and excluded) used
// only for inference.
export type MatcherProtocol<
  input,
  narrowed,
  // Type of what this pattern selected from the input
  matcherType extends MatcherType = 'regular',
  selections extends SelectionType = NoneSelection,
  // Type to exclude from the input union because
  // it has been fully matched by this pattern
  excluded = narrowed
> = {
  match: (value: input) => MatchResult;
  getSelectionKeys?: () => string[];
  matcherType?: matcherType;
};

export type MatchResult = {
  matched: boolean;
  selections?: Record<string, any>;
};

export interface Matchable<
  input,
  narrowed,
  // Type of what this pattern selected from the input
  matcherType extends MatcherType = 'regular',
  selections extends SelectionType = NoneSelection,
  // Type to exclude from the input union because
  // it has been fully matched by this pattern
  excluded = narrowed
> {
  [symbols.matcher](): MatcherProtocol<
    input,
    narrowed,
    matcherType,
    selections,
    excluded
  >;
}

type AnyMatchable = Matchable<unknown, unknown, any, any>;

export interface ToExclude<a> {
  [symbols.toExclude]: a;
}

export type UnknownPattern =
  | readonly [Pattern<unknown>, ...Pattern<unknown>[]]
  | { readonly [k: string]: Pattern<unknown> }
  | Set<Pattern<unknown>>
  | Map<unknown, Pattern<unknown>>
  | Primitives
  | AnyMatchable;

/*
  using (Compute<a>) to avoid the distribution of `a`
  if it is a union type, and let people pass subpatterns
  that match several branches in the union at once.
*/
type Keys<a> = keyof Compute<a> extends infer shared
  ? {
      shared: shared;
      others: ValueOf<{ [k in keyof a]: k extends shared ? never : k }>;
    }
  : never;

type HasObjects<a> = true extends (a extends object ? IsPlainObject<a> : false)
  ? true
  : false;

type FilterObjects<a> = a extends object
  ? IsPlainObject<a> extends true
    ? a
    : never
  : never;

type ExcludeObjects<a> = a extends object
  ? IsPlainObject<a> extends true
    ? never
    : a
  : a;

type PartitionObjects<a> = {
  objects: FilterObjects<a>;
  others: ExcludeObjects<a>;
};

type StructuralPattern<a> =
  // If all branches are objects, then we match
  // on properties that all objects have (usually the discriminants).
  [IsUnion<a>, HasObjects<a>] extends [true, true]
    ? PartitionObjects<a> extends {
        objects: infer objects;
        others: infer othersValues;
      }
      ?
          | (Keys<objects> extends {
              shared: infer sharedKeys;
              others: infer otherKeys;
            }
              ? Compute<
                  {
                    readonly [k in sharedKeys & keyof objects]?: Pattern<
                      objects[k]
                    >;
                  } &
                    {
                      readonly [k in Cast<
                        otherKeys,
                        string
                      >]?: objects extends any
                        ? k extends keyof objects
                          ? Pattern<objects[k]>
                          : never
                        : never;
                    }
                >
              : never)
          | ([othersValues] extends [never]
              ? never
              : othersValues extends any
              ? // No Matchable here because it's already handled by the
                // the one at the current level
                StructuralPattern<othersValues>
              : never)
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
    : a;

/**
 * ### Pattern
 * Patterns can be any (nested) javascript value.
 * They can also be a "wildcards", like `__`.
 */
export type Pattern<a> = Matchable<a, unknown, any, any> | StructuralPattern<a>;
