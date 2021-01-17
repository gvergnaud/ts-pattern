import type { PatternType, __ } from '../PatternType';
import type { Primitives } from './Pattern';
import type { ExcludeIfContainsNever, LeastUpperBound } from './helpers';

export type ExtractPreciseValue<a, b> = ExcludeIfContainsNever<
  b extends []
    ? []
    : b extends typeof __
    ? a
    : b extends { valueKind: PatternType.Not; value: infer b1 }
    ? Exclude<a, b1>
    : b extends (infer b1)[]
    ? a extends (infer a1)[]
      ? b extends [infer b1, infer b2, infer b3, infer b4, infer b5]
        ? a extends [infer a1, infer a2, infer a3, infer a4, infer a5]
          ? [
              ExtractPreciseValue<a1, b1>,
              ExtractPreciseValue<a2, b2>,
              ExtractPreciseValue<a3, b3>,
              ExtractPreciseValue<a4, b4>,
              ExtractPreciseValue<a5, b5>
            ]
          : LeastUpperBound<a, b>
        : b extends [infer b1, infer b2, infer b3, infer b4]
        ? a extends [infer a1, infer a2, infer a3, infer a4]
          ? [
              ExtractPreciseValue<a1, b1>,
              ExtractPreciseValue<a2, b2>,
              ExtractPreciseValue<a3, b3>,
              ExtractPreciseValue<a4, b4>
            ]
          : LeastUpperBound<a, b>
        : b extends [infer b1, infer b2, infer b3]
        ? a extends [infer a1, infer a2, infer a3]
          ? [
              ExtractPreciseValue<a1, b1>,
              ExtractPreciseValue<a2, b2>,
              ExtractPreciseValue<a3, b3>
            ]
          : LeastUpperBound<a, b>
        : b extends [infer b1, infer b2]
        ? a extends [infer a1, infer a2]
          ? [ExtractPreciseValue<a1, b1>, ExtractPreciseValue<a2, b2>]
          : LeastUpperBound<a, b>
        : ExtractPreciseValue<a1, b1>[]
      : LeastUpperBound<a, b>
    : b extends Map<infer bk, infer bv>
    ? a extends Map<infer ak, infer av>
      ? Map<ExtractPreciseValue<ak, bk>, ExtractPreciseValue<av, bv>>
      : LeastUpperBound<a, b>
    : b extends Set<infer bv>
    ? a extends Set<infer av>
      ? Set<ExtractPreciseValue<av, bv>>
      : LeastUpperBound<a, b>
    : b extends object
    ? a extends any[] | Set<any> | Map<any, any> | Primitives
      ? LeastUpperBound<a, b>
      : b extends a
      ? b
      : a extends b
      ? a
      : {
          // we use Required to remove the optional property modifier (?:).
          // since we use a[k] after that, optional properties will stay
          // optional if no pattern was more precise.
          [k in keyof Required<a>]: k extends keyof b
            ? ExtractPreciseValue<a[k], b[k]>
            : a[k];
        }
    : LeastUpperBound<a, b>
>;
