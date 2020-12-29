import type { Cast, ValueOf, UnionToTuple, Flatten, IsUnion } from './helpers';

type Values<a extends object> = UnionToTuple<ValueOf<a>>;

/**
 * TODO: Doesn't work with unions containing unions yet,
 * like { a: 'a' | 'b' } | string
 * should return string | {a: 'a'} | {a: 'b'}
 * Also it only works for object types for now.
 * it should support:
 * - literals
 * - primitive types
 * - tuples
 * - arrays
 * - maps
 * - sets
 */
export type FindUnions<a, path extends PropertyKey[] = []> = IsUnion<
  a
> extends true
  ? [[a, path]]
  : a extends object
  ? Flatten<
      Values<
        {
          [k in keyof a]: FindUnions<a[k], [...path, k]>;
        }
      >
    >
  : [];

// Distribute :: [a | b, path][] -> Union<[a, path][]>
export type Distribute<unions extends any[]> = unions extends [
  [infer union, infer path],
  ...(infer tail)
]
  ? union extends any
    ? [[union, path], ...Distribute<tail>]
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
// currently it only works with objects
type Update<data, V, path extends PropertyKey[]> = path extends [
  infer head,
  ...(infer tail)
]
  ? data &
      {
        [k in Cast<head, PropertyKey>]: Update<
          SafeGet<data, k, {}>,
          V,
          Cast<tail, PropertyKey[]>
        >;
      }
  : V;

export type DistributeUnions<a> = BuildMany<a, Distribute<FindUnions<a>>>;
