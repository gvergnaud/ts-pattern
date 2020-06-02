import { PatternType, __ } from './Pattern';
import { ExcludeIfContainsNever, LeastUpperBound } from './helpers';

export type ExtractPreciseValue<a, b> = ExcludeIfContainsNever<
  b extends []
    ? []
    : b extends typeof __
    ? a
    : b extends { valueKind: PatternType.Not; value: infer b1 }
    ? Exclude<a, b1>
    : [a, b] extends [
        // a can be a union of a quintupple and other values,
        // that's why we add `infer otherBranches` at the end
        (
          | [infer a1, infer a2, infer a3, infer a4, infer a5]
          | infer otherBranches
        ),
        [infer b1, infer b2, infer b3, infer b4, infer b5]
      ] // quintupple
    ? [
        ExtractPreciseValue<a1, b1>,
        ExtractPreciseValue<a2, b2>,
        ExtractPreciseValue<a3, b3>,
        ExtractPreciseValue<a4, b4>,
        ExtractPreciseValue<a5, b5>
      ]
    : [a, b] extends [
        [infer a1, infer a2, infer a3, infer a4] | infer otherBranches,
        [infer b1, infer b2, infer b3, infer b4]
      ] // qua4rupple
    ? [
        ExtractPreciseValue<a1, b1>,
        ExtractPreciseValue<a2, b2>,
        ExtractPreciseValue<a3, b3>,
        ExtractPreciseValue<a4, b4>
      ]
    : [a, b] extends [
        [infer a1, infer a2, infer a3] | infer otherBranches,
        [infer b1, infer b2, infer b3]
      ] // tripple
    ? [
        ExtractPreciseValue<a1, b1>,
        ExtractPreciseValue<a2, b2>,
        ExtractPreciseValue<a3, b3>
      ]
    : [a, b] extends [
        [infer a1, infer a2] | infer otherBranches,
        [infer b1, infer b2]
      ] // tupple
    ? [ExtractPreciseValue<a1, b1>, ExtractPreciseValue<a2, b2>]
    : [a, b] extends [(infer a1)[], (infer b1)[]]
    ? ExtractPreciseValue<a1, b1>[]
    : [a, b] extends [Map<infer ak, infer av>, Map<infer bk, infer bv>]
    ? Map<ExtractPreciseValue<ak, bk>, ExtractPreciseValue<av, bv>>
    : [a, b] extends [Set<infer av>, Set<infer bv>]
    ? Set<ExtractPreciseValue<av, bv>>
    : b extends object
    ? a extends object
      ? b extends a
        ? b
        : a extends b
        ? a
        : {
            // we use require to remove the optional property modifier.
            // since we use a[k] after that, optional properties will stay
            // optional if no pattern was more precise.
            [k in keyof Required<a>]: k extends keyof b
              ? ExtractPreciseValue<a[k], b[k]>
              : a[k];
          }
      : never
    : LeastUpperBound<a, b>
>;
