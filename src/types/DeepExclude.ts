import { DistributeMatchingUnions } from './DistributeUnions';
import { InvertNotPattern } from './InvertPattern';

export type DeepExclude<i, p> = Exclude<
  DistributeMatchingUnions<i, p>,
  InvertNotPattern<p, i>
>;
