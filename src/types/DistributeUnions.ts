import { BuildMany } from './BuildMany';
import type {
  IsAny,
  Cast,
  Values,
  Flatten,
  IsUnion,
  IsPlainObject,
  Length,
  UnionToTuple,
  TupleKey,
} from './helpers';
import { IsMatching } from './IsMatching';

/**
 * DistributeMatchingUnions takes two arguments:
 * - a data structure of type `a` containing unions
 * - a pattern `p`, matching this data structure
 * and turns it into a union of all possible
 * combination of each unions contained in `a` that matches `p`.
 *
 * It does this in 3 main steps:
 *  - 1. Find all unions contained in the data structure, that matches `p`
 *    with `FindUnions<a, p>`. It returns a tree of [union, path] pairs.
 *  - 2. this tree is passed to the `Distribute` type level function,
 *    Which turns it into a union of list of `[singleValue, path]` pairs.
 *    Each list correspond to one of the possible combination of the unions
 *    found in `a`.
 *  - 3. build a data structure with the same shape as `a` for each combination
 *    and return the union of these data structures.
 *
 * @example
 * type t1 = DistributeMatchingUnions<['a' | 'b', 1 | 2], ['a', 1]>;
 * // => ['a', 1] | ['a', 2] | ['b', 1] | ['b', 2]
 *
 * type t2 = DistributeMatchingUnions<['a' | 'b', 1 | 2], ['a', unknown]>;
 * // => ['a', 1 | 2] | ['b', 1 | 2]
 */
export type DistributeMatchingUnions<a, p> = IsAny<a> extends true
  ? any
  : BuildMany<a, Distribute<FindUnionsMany<a, p>>>;

// FindUnionsMany :: a -> Union<a> -> PropertyKey[] -> UnionConfig[]
export type FindUnionsMany<a, p, path extends PropertyKey[] = []> = IsMatching<
  a,
  p
> extends true
  ? FindUnions<a, p, path>
  : [];

/**
 * The reason we don't look further down the tree with lists,
 * Set and Maps is that they can be heterogeneous,
 * so matching on a A[] for a in input of (A|B)[]
 * doesn't rule anything out. You can still have
 * a (A|B)[] afterward. The same logic goes for Set and Maps.
 *
 * Kinds are types of types.
 *
 * kind UnionConfig = {
 *  cases: Union<{
 *    value: b,
 *    subUnions: UnionConfig[]
 *  }>,
 *  path: string[]
 * }
 * FindUnions :: Pattern a p => a -> p -> UnionConfig[]
 */
export type FindUnions<
  a,
  p,
  path extends PropertyKey[] = []
> = unknown extends p
  ? []
  : IsAny<p> extends true
  ? [] // Don't try to find unions after 5 levels
  : Length<path> extends 5
  ? []
  : IsUnion<a> extends true
  ? [
      {
        cases: a extends any
          ? {
              value: a;
              subUnions: FindUnionsMany<a, p, path>;
            }
          : never;
        path: path;
      }
    ]
  : a extends readonly [any, ...any[]]
  ? [FilterTuples<p>] extends [infer tuplePatterns]
    ? Flatten<
        Values<{
          [k in TupleKey & keyof tuplePatterns]: a extends any
            ? tuplePatterns extends any
              ? k extends keyof a
                ? FindUnions<a[k], tuplePatterns[k], [...path, k]>
                : never
              : never
            : never;
        }>
      >
    : []
  : IsPlainObject<a> extends true
  ? [FilterPlainObjects<p>] extends [infer plainObjectPatterns]
    ? Flatten<
        Values<{
          [k in AllKeys<plainObjectPatterns>]: a extends any
            ? plainObjectPatterns extends any
              ? k extends keyof a
                ? FindUnions<a[k], plainObjectPatterns[k], [...path, k]>
                : never
              : never
            : never;
        }>
      >
    : []
  : [];

export type FilterTuples<a> = a extends readonly [any, ...any[]] ? a : never;
export type FilterPlainObjects<a> = a extends object
  ? IsPlainObject<a> extends true
    ? a
    : never
  : never;
export type AllKeys<a> = a extends any ? keyof a : never;

// Distribute :: UnionConfig[] -> Union<[a, path][]>
export type Distribute<unions extends any[]> = unions extends [
  { cases: infer cases; path: infer path },
  ...infer tail
]
  ? cases extends { value: infer value; subUnions: infer subUnions }
    ? [
        [value, path],
        ...Distribute<Cast<subUnions, any[]>>,
        ...Distribute<tail>
      ]
    : never
  : [];
