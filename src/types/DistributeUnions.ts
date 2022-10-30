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
export type DistributeMatchingUnions<a, b> = IsAny<a> extends true
  ? any
  : BuildMany<a, Distribute<FindUnionsMany<a, b>>>;

// FindUnionsMany :: a -> Union<a> -> PropertyKey[] -> UnionConfig[]
export type FindUnionsMany<
  a,
  b,
  path extends PropertyKey[] = []
> = UnionToTuple<
  (
    b extends any
      ? IsMatching<a, b> extends true
        ? FindUnions<a, b, path>
        : []
      : never
  ) extends (infer T)[]
    ? T
    : never
>;

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
  b,
  path extends PropertyKey[] = []
> = unknown extends b
  ? []
  : IsAny<b> extends true
  ? [] // Don't try to find unions after 5 levels
  : Length<path> extends 5
  ? []
  : IsUnion<a> extends true
  ? [
      {
        cases: a extends any
          ? {
              value: a;
              subUnions: FindUnionsMany<a, b, path>;
            }
          : never;
        path: path;
      }
    ]
  : [a, b] extends [readonly any[], readonly any[]]
  ? [a, b] extends [
      readonly [infer a1, infer a2, infer a3, infer a4, infer a5],
      readonly [infer b1, infer b2, infer b3, infer b4, infer b5]
    ]
    ? [
        ...FindUnions<a1, b1, [...path, 0]>,
        ...FindUnions<a2, b2, [...path, 1]>,
        ...FindUnions<a3, b3, [...path, 2]>,
        ...FindUnions<a4, b4, [...path, 3]>,
        ...FindUnions<a5, b5, [...path, 4]>
      ]
    : [a, b] extends [
        readonly [infer a1, infer a2, infer a3, infer a4],
        readonly [infer b1, infer b2, infer b3, infer b4]
      ]
    ? [
        ...FindUnions<a1, b1, [...path, 0]>,
        ...FindUnions<a2, b2, [...path, 1]>,
        ...FindUnions<a3, b3, [...path, 2]>,
        ...FindUnions<a4, b4, [...path, 3]>
      ]
    : [a, b] extends [
        readonly [infer a1, infer a2, infer a3],
        readonly [infer b1, infer b2, infer b3]
      ]
    ? [
        ...FindUnions<a1, b1, [...path, 0]>,
        ...FindUnions<a2, b2, [...path, 1]>,
        ...FindUnions<a3, b3, [...path, 2]>
      ]
    : [a, b] extends [
        readonly [infer a1, infer a2],
        readonly [infer b1, infer b2]
      ]
    ? [...FindUnions<a1, b1, [...path, 0]>, ...FindUnions<a2, b2, [...path, 1]>]
    : [a, b] extends [readonly [infer a1], readonly [infer b1]]
    ? FindUnions<a1, b1, [...path, 0]>
    : []
  : a extends Set<any>
  ? []
  : a extends Map<any, any>
  ? []
  : [IsPlainObject<a>, IsPlainObject<b>] extends [true, true]
  ? Flatten<
      Values<{
        [k in keyof a & keyof b]: FindUnions<a[k], b[k], [...path, k]>;
      }>
    >
  : [];

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
