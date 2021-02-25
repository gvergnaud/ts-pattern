import { DistributeMatchingUnions } from './DistributeUnions';
import { UnionToTuple } from './helpers';

export type DeepExclude<a, b> = Exclude<DistributeMatchingUnions<a, b>, b>;

export type ReduceDeepExclude<a, xs> = xs extends [infer head, ...infer tail]
  ? ReduceDeepExclude<DeepExclude<a, head>, tail>
  : a;

export type DeepExcludeMany<a, b> = ReduceDeepExclude<a, UnionToTuple<b>>;
