import { GetDeep, UpdateDeep } from './BuildMany';
import { DistributeMatchingUnions, FindUnionsMany } from './DistributeUnions';

export type DeepExclude<a, b> = FindUnionsMany<a, b> extends [
  { path: infer path; cases: { value: infer union; subUnions: [] } }
]
  ? ExcludePath<a, b, path, union>
  : Exclude<DistributeMatchingUnions<a, b>, b>;

type ExcludePath<
  a,
  b,
  path,
  union = GetDeep<a, path>,
  excluded = GetDeep<b, path>,
  value = Exclude<union, excluded>
> = [value] extends [never] ? never : UpdateDeep<a, value, path>;

type test1 = FindUnionsMany<{ a: 1 | 2 }, { a: 1 }>; // =>
type test2 = FindUnionsMany<
  // ^?
  { a: { b: { c: { d: 1 | 2 } } } },
  { a: { b: { c: { d: 1 } } } }
>;
type test3 = FindUnionsMany<
  // ^?
  { a: { b: { a: 'a' | 'b' } | { a: 'a' | 'd' } } },
  { a: { b: { a: 'a' } } }
>;
type test4 = FindUnionsMany<
  // ^?
  { a: { b: { a: 'a' | 'b' } } } | { a: { b: { a: 'a' | 'd' } } },
  { a: { b: { a: 'a' } } }
>;
type test5 = FindUnionsMany<
  // ^?
  { a: { b: { a: 'a' } } } | { a: { b: { a: 'b' } } },
  { a: { b: { a: 'a' } } }
>;
type test6 = FindUnionsMany<number[], [number, ...number[]]>; // =>

type exclude1 = ExcludePath<{ a: 1 | 2 }, { a: 1 }, ['a']>; // =>
type exclude2 = ExcludePath<
  // ^?
  { a: { b: { c: { d: 1 | 2 } } } },
  { a: { b: { c: { d: 1 } } } },
  ['a', 'b', 'c', 'd']
>;
type exclude3 = ExcludePath<
  // ^?
  { a: { b: { a: 'a' | 'b' } | { a: 'a' | 'd' } } },
  { a: { b: { a: 'a' } } },
  ['a', 'b', 'a']
>;
type exclude4 = ExcludePath<
  // ^?
  number[],
  [number, ...number[]],
  []
>;
