import { Compute, Iterator, UpdateAt } from './helpers';

// BuildMany :: DataStructure -> Union<[value, path][]> -> Union<DataStructure>
export type BuildMany<data, xs extends readonly any[]> = xs extends any
  ? BuildOne<data, xs>
  : never;

// BuildOne :: DataStructure
// -> [value, path][]
// -> DataStructure
type BuildOne<data, xs extends readonly any[]> = xs extends [
  [infer value, infer path],
  ...infer tail
]
  ? BuildOne<Update<data, value, Extract<path, readonly PropertyKey[]>>, tail>
  : data;

type SafeGet<data, k extends PropertyKey, def> = k extends keyof data
  ? data[k]
  : def;

// Update :: a -> b -> PropertyKey[] -> a
type Update<
  data,
  value,
  path extends readonly PropertyKey[]
> = path extends readonly [infer head, ...infer tail]
  ? data extends readonly [any, ...any]
    ? head extends number
      ? UpdateAt<
          data,
          Iterator<head>,
          Update<data[head], value, Extract<tail, readonly PropertyKey[]>>
        >
      : never
    : data extends readonly (infer a)[]
    ? Update<a, value, Extract<tail, readonly PropertyKey[]>>[]
    : data extends Set<infer a>
    ? Set<Update<a, value, Extract<tail, readonly PropertyKey[]>>>
    : data extends Map<infer k, infer v>
    ? Map<k, Update<v, value, Extract<tail, readonly PropertyKey[]>>>
    : Compute<
        Omit<data, Extract<head, PropertyKey>> & {
          [k in Extract<head, PropertyKey>]: Update<
            SafeGet<data, k, {}>,
            value,
            Extract<tail, readonly PropertyKey[]>
          >;
        }
      >
  : value;
