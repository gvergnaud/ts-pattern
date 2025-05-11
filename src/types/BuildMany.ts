import { Iterator, IsOptionalKeysOf, UpdateAt, ValueOf } from './helpers';

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
  ? BuildOne<SetDeep<data, value, path>, tail>
  : data;

// SetDeep :: a -> b -> PropertyKey[] -> a
export type SetDeep<data, value, path> = path extends readonly [
  infer head,
  ...infer tail
]
  ? data extends readonly any[]
    ? data extends readonly [any, ...any]
      ? head extends number
        ? UpdateAt<data, Iterator<head>, SetDeep<data[head], value, tail>>
        : never
      : SetDeep<ValueOf<data>, value, tail>[]
    : data extends Set<infer a>
    ? Set<SetDeep<a, value, tail>>
    : data extends Map<infer k, infer v>
    ? Map<k, SetDeep<v, value, tail>>
    : head extends keyof data
    ? // if we intentionally set undefined on an optional key, we should keep
      // the optional modifier, otherwise it will exclude the `undefined` type from
      // our `value` type.
      [IsOptionalKeysOf<data, head>, tail, undefined] extends [true, [], value]
      ? { [k in keyof data]: k extends head ? value : data[k] }
      : {
          [k in keyof data]-?: k extends head
            ? SetDeep<data[head], value, tail>
            : data[k];
        }
    : data
  : value;
