import type {
  Cast,
  ValueOf,
  UnionToTuple,
  Flatten,
  IsUnion,
  ExcludeUnion,
  Slice,
  Drop,
  Iterator,
  Next,
} from './helpers';

export type Values<a extends object> = UnionToTuple<ValueOf<a>>;

/**
 * TODO: it only works for object types for now.
 * it should support:
 * - [x] literals
 * - [x] primitive types
 * - [x] tuples
 * - [x] objects
 * - [ ] lists
 * - [ ] maps
 * - [ ] sets
 *
 * // Kinds are types of types.
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
export type FindUnions<a, path extends PropertyKey[] = []> = IsUnion<
  a
> extends true
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
  : a extends [infer a1, infer a2, infer a3, infer a4, infer a5]
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
  : a extends object
  ? Flatten<
      Values<
        {
          [k in keyof a]: FindUnions<a[k], [...path, k]>;
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

// data :: DataStructure
// union ::  Union<[value, path][]>
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

// TODO:
// Update should work with every supported data structure,
// currently with
// - object
// - tuples
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
    : data extends any[]
    ? Update<data[0], value, Cast<tail, PropertyKey[]>>[]
    : data &
        {
          [k in Cast<head, PropertyKey>]: Update<
            SafeGet<data, k, {}>,
            value,
            Cast<tail, PropertyKey[]>
          >;
        }
  : value;

export type DistributeUnions<a> = BuildMany<a, Distribute<FindUnions<a>>>;
