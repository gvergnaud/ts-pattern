import { DistributeMatchingUnions } from './DistributeUnions';
import { Primitives } from './helpers';

/**
 * If `b` only contains primitive types, then `DeepExclude<a, b>`
 * is equivalent to `Exclude<a, b>`: a primitive can only exclude
 * top-level members of the `a` union, and distributing unions
 * nested inside objects or tuples can never surface new excludable
 * cases. Since `Exclude` is much cheaper than `DistributeMatchingUnions`,
 * this fast path makes exhaustiveness checking of large enum and
 * literal unions considerably faster.
 */
export type DeepExclude<a, b> = [b] extends [Primitives]
  ? Exclude<a, b>
  : Exclude<DistributeMatchingUnions<a, b>, b>;
