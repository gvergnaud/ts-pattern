import type {
  Cast,
  ValueOf,
  UnionToIntersection,
  UnionToTuple,
} from './helpers';

type IsUnion<a> = [a] extends [UnionToIntersection<a>] ? false : true;

type ContainsUnion<a> = IsUnion<a> extends true
  ? true
  : a extends object
  ? false extends ValueOf<{ [k in keyof a]: ContainsUnion<a[k]> }>
    ? false
    : true
  : false;

type NeverKeys<o> = ValueOf<
  {
    [k in keyof o]: [o[k]] extends [never] ? k : never;
  }
>;

type RemoveNeverKeys<o> = Omit<o, NeverKeys<o>>;

type ExcludeUnion<a> = IsUnion<a> extends true
  ? never
  : a extends object
  ? RemoveNeverKeys<{ [k in keyof a]: ExcludeUnion<a[k]> }>
  : a;

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
type FindUnions<a, path extends PropertyKey[] = []> = ContainsUnion<
  a
> extends true
  ? IsUnion<a> extends true
    ? [a, path]
    : a extends object
    ? Values<
        {
          [k in keyof a]: FindUnions<a[k], [...path, k]>;
        }
      >
    : never
  : never;

type t1 = FindUnions<{ a: '1' | '2'; b: '3' | '4'; c: '5' | '6' }>;

// Distribute :: [a | b, path][] -> Union<[a, path][]>
type Distribute<unions extends any[]> = unions extends [
  [infer union, infer path],
  ...(infer tail)
]
  ? union extends any
    ? [[union, path], ...Distribute<tail>]
    : never
  : [];

// All permutation of [value, path] tuples
type td1 = Distribute<t1>;

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

type t3 = Update<{ test: 20 }, string, ['hello', 0, 'cool']>;

export type DistributeUnions<a> = BuildMany<a, Distribute<FindUnions<a>>>;

type tinput = { a: '1' | '2'; b: '3' | '4'; c: '5' | '6' };

type t13 = Distribute<FindUnions<tinput>>;
type t121 = BuildOne<{}, t13[0]>;
type t123 = BuildOne<{}, t13[1]>;
type t124 = BuildOne<{}, t13[2]>;
type t122 = BuildMany<{}, t13>;
type t12 = DistributeUnions<tinput>;
type t14 = Exclude<t12, { a: '1' }>;

const t12: t12 = { a: '1', b: '3', c: '6' };
const t13: Exclude<t12, { b: '1' }> = {
  a: '1',
  b: '3',
  c: '6',
};

export type Option<a> = { kind: 'none' } | { kind: 'some'; value: a };

type Input =
  | { x: 'a'; value: Option<string> }
  | { x: 'b'; value: Option<number> };

type Input2 = ['a', Option<string>] | ['b', Option<number>];

type Y = IsUnion<Input>;
type X = DistributeUnions<Input>;
type Z = Exclude<DistributeUnions<Input>, { x: 'a'; value: { kind: 'none' } }>;

const x: X = { x: 'a', value: { kind: 'none' } };
const z: Z = { x: 'a', value: { kind: 'none' } };
