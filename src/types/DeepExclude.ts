import { DistributeExclusionUnions } from './DistributeExclusionUnions';
import { DistributeMatchingUnions } from './DistributeUnions';

export type DeepExclude<a, b> = Exclude<
  DistributeMatchingUnions<a, b>,
  b extends any ? DistributeExclusionUnions<b> : never
>;
