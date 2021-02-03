import type {
  IsAny,
  Cast,
  Values,
  Flatten,
  IsUnion,
  Slice,
  Drop,
  Iterator,
  Next,
  IsPlainObject,
  Length,
} from './helpers';

/**
 * DistributeUnions takes a data structure of type `a`
 * containing unions and turns it into a union of all possible
 * combination of each unions.
 *
 * For instance `DistributeUnions<['a' | 'b', 1 | 2]>` will
 * evaluate to `['a', 1] | ['a', 2] | ['b', 1] | ['b', 2]`.
 *
 * It does this in 3 main steps:
 *  - 1. Find all unions contained in the data structure
 *    with `FindUnions<a>`, which returns a tree of [union, path] pairs.
 *  - 2. this tree is passed to the `Distribute` type level function,
 *    Which turns it into a union of list of `[singleValue, path]` pairs.
 *    Each list correspond to one of the possible combination of the unions
 *    found in `a`.
 *  - 3. build a data structure with the same shape as `a` for each combination
 *    and return the union of these data structures.
 */
export type DistributeUnions<a> = IsAny<a> extends true
  ? any
  : BuildMany<a, Distribute<FindUnions<a>>>;

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
 * FindUnions :: a -> UnionConfig[]
 */
export type FindUnions<a, path extends PropertyKey[] = []> =
  // Don't try to find unions after 3 levels
  Length<path> extends 3
    ? []
    : IsUnion<a> extends true
    ? [
        {
          cases: a extends any
            ? {
                value: a;
                subUnions: FindUnions<a, path>;
              }
            : never;
          path: path;
        }
      ]
    : a extends any[]
    ? a extends [infer a1, infer a2, infer a3, infer a4, infer a5]
      ? [
          ...FindUnions<a1, [...path, 0]>,
          ...FindUnions<a2, [...path, 1]>,
          ...FindUnions<a3, [...path, 2]>,
          ...FindUnions<a4, [...path, 3]>,
          ...FindUnions<a5, [...path, 4]>
        ]
      : a extends [infer a1, infer a2, infer a3, infer a4]
      ? [
          ...FindUnions<a1, [...path, 0]>,
          ...FindUnions<a2, [...path, 1]>,
          ...FindUnions<a3, [...path, 2]>,
          ...FindUnions<a4, [...path, 3]>
        ]
      : a extends [infer a1, infer a2, infer a3]
      ? [
          ...FindUnions<a1, [...path, 0]>,
          ...FindUnions<a2, [...path, 1]>,
          ...FindUnions<a3, [...path, 2]>
        ]
      : a extends [infer a1, infer a2]
      ? [...FindUnions<a1, [...path, 0]>, ...FindUnions<a2, [...path, 1]>]
      : []
    : a extends Set<any>
    ? []
    : a extends Map<any, any>
    ? []
    : IsPlainObject<a> extends true
    ? Flatten<
        Values<
          {
            // we use Required to remove the optional property modifier (?:).
            // Optional properties aren't considered as union types to avoid
            // generating a huge union.
            [k in keyof Required<a>]: FindUnions<
              NonNullable<a[k]>,
              [...path, k]
            >;
          }
        >
      >
    : [];

// Distribute :: UnionConfig[] -> Union<[a, path][]>
export type Distribute<unions extends any[]> = unions extends [
  { cases: infer cases; path: infer path },
  ...(infer tail)
]
  ? cases extends { value: infer value; subUnions: infer subUnions }
    ? [
        [value, path],
        ...Distribute<Cast<subUnions, any[]>>,
        ...Distribute<tail>
      ]
    : never
  : [];

// BuildMany :: DataStructure -> Union<[value, path][]> -> Union<DataStructure>
type BuildMany<data, xs extends any[]> = xs extends any
  ? BuildOne<data, xs>
  : never;

// BuildOne :: DataStructure
// -> [value, path][]
// -> DataStructure
type BuildOne<data, xs extends any[]> = xs extends [
  [infer value, infer path],
  ...(infer tail)
]
  ? BuildOne<Update<data, value, Cast<path, PropertyKey[]>>, tail>
  : data;

type SafeGet<data, k extends PropertyKey, def> = k extends keyof data
  ? data[k]
  : def;

// Update :: a -> b -> PropertyKey[] -> a
type Update<data, value, path extends PropertyKey[]> = path extends [
  infer head,
  ...(infer tail)
]
  ? data extends [any, ...any]
    ? head extends number
      ? [
          ...Slice<data, Iterator<head>>,
          Update<data[head], value, Cast<tail, PropertyKey[]>>,
          ...Drop<data, Next<Iterator<head>>>
        ]
      : never
    : data extends (infer a)[]
    ? Update<a, value, Cast<tail, PropertyKey[]>>[]
    : data extends Set<infer a>
    ? Set<Update<a, value, Cast<tail, PropertyKey[]>>>
    : data extends Map<infer k, infer v>
    ? Map<k, Update<v, value, Cast<tail, PropertyKey[]>>>
    : data &
        {
          [k in Cast<head, PropertyKey>]: Update<
            SafeGet<data, k, {}>,
            value,
            Cast<tail, PropertyKey[]>
          >;
        }
  : value;
