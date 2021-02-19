import { DistributeMatchingUnions } from './DistributeUnions';

export type DeepExclude<i, p> = Exclude<DistributeMatchingUnions<i, p>, p>;
