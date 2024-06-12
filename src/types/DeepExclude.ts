import { GetDeep, SetDeep } from './BuildMany';
import { DistributeMatchingUnions, FindUnionsMany } from './DistributeUnions';

export type DeepExclude<a, b> = FindUnionsMany<a, b> extends [
  {
    path: infer path;
    cases: { value: infer union; subUnions: [] };
  }
]
  ? Exclude<union, GetDeep<b, path>> extends infer narrowed
    ? [narrowed] extends [never]
      ? never
      : SetDeep<a, narrowed, path>
    : never
  : Exclude<DistributeMatchingUnions<a, b>, b>;
