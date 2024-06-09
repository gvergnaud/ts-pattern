import type { DistributeMatchingUnions } from "./DistributeUnions.ts";

export type DeepExclude<a, b> = Exclude<DistributeMatchingUnions<a, b>, b>;
