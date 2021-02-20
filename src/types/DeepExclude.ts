import { DistributeMatchingUnions } from './DistributeUnions';

export type DeepExclude<a, b> = Exclude<DistributeMatchingUnions<a, b>, b>;
