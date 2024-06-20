import { GetDeep, SetDeep } from './BuildMany';
import { DistributeMatchingUnions, FindUnionsMany } from './DistributeUnions';

export type DeepExclude<a, b> =
  // If a single union is found
  FindUnionsMany<a, b> extends [
    { path: infer path; cases: infer cases & { subUnions: [] } }
  ]
    ? Exclude<
        GetDeep<cases, ['value']>,
        GetDeep<b, path>
      > extends infer narrowed
      ? [narrowed] extends [never]
        ? never
        : SetDeep<a, narrowed, path>
      : never
    : Exclude<DistributeMatchingUnions<a, b>, b>;
