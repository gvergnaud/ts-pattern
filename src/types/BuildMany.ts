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
  ? BuildOne<UpdateDeep<data, value, path>, tail>
  : data;

// Update :: a -> PropertyKey[] -> b
export type GetDeep<data, path> = path extends readonly [
  infer head,
  ...infer tail
]
  ? data extends readonly [any, ...any]
    ? head extends number
      ? GetDeep<data[head], tail>
      : never
    : data extends readonly (infer a)[]
    ? GetDeep<a, tail>
    : data extends Set<infer a>
    ? GetDeep<a, tail>
    : data extends Map<infer k, infer v>
    ? GetDeep<v, tail>
    : head extends keyof data
    ? GetDeep<data[head], tail>
    : data
  : data;

// UpdateDeep :: a -> b -> PropertyKey[] -> a
export type UpdateDeep<data, value, path> = path extends readonly [
  infer head,
  ...infer tail
]
  ? data extends readonly [any, ...any]
    ? head extends number
      ? UpdateAt<data, Iterator<head>, UpdateDeep<data[head], value, tail>>
      : never
    : data extends readonly (infer a)[]
    ? UpdateDeep<a, value, tail>[]
    : data extends Set<infer a>
    ? Set<UpdateDeep<a, value, tail>>
    : data extends Map<infer k, infer v>
    ? Map<k, UpdateDeep<v, value, tail>>
    : head extends keyof data
    ? Compute<
        { [k in Exclude<keyof data, head>]: data[k] } & {
          [k in head]: UpdateDeep<data[k], value, tail>;
        }
      >
    : data
  : value;
