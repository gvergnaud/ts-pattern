import type { NotPattern } from './Pattern';
import type {
  ExcludeIfContainsNever,
  IsAny,
  IsPlainObject,
  LeastUpperBound,
} from './helpers';

export type ExtractPreciseValue<a, b> =
  /**
   * we handle the `unknown` type separately because
   * the `ExcludeIfContainsNever<...>` type doesn't
   * reduce with type variables (foralls).
   * We want it to at least reduce on wildcard patterns
   * (we know it is going to evaluate to the input type)
   * and `unknown` is the inverted type of wildcard patterns.
   */
  unknown extends b
    ? a
    : IsAny<a> extends true
    ? b
    : ExcludeIfContainsNever<
        b extends readonly []
          ? []
          : b extends NotPattern<infer b1>
          ? Exclude<a, b1>
          : b extends readonly (infer bItem)[]
          ? a extends readonly (infer aItem)[]
            ? b extends readonly [
                infer b1,
                infer b2,
                infer b3,
                infer b4,
                infer b5
              ]
              ? a extends readonly [
                  infer a1,
                  infer a2,
                  infer a3,
                  infer a4,
                  infer a5
                ]
                ? [
                    ExtractPreciseValue<a1, b1>,
                    ExtractPreciseValue<a2, b2>,
                    ExtractPreciseValue<a3, b3>,
                    ExtractPreciseValue<a4, b4>,
                    ExtractPreciseValue<a5, b5>
                  ]
                : LeastUpperBound<a, b>
              : b extends readonly [infer b1, infer b2, infer b3, infer b4]
              ? a extends readonly [infer a1, infer a2, infer a3, infer a4]
                ? [
                    ExtractPreciseValue<a1, b1>,
                    ExtractPreciseValue<a2, b2>,
                    ExtractPreciseValue<a3, b3>,
                    ExtractPreciseValue<a4, b4>
                  ]
                : LeastUpperBound<a, b>
              : b extends readonly [infer b1, infer b2, infer b3]
              ? a extends readonly [infer a1, infer a2, infer a3]
                ? [
                    ExtractPreciseValue<a1, b1>,
                    ExtractPreciseValue<a2, b2>,
                    ExtractPreciseValue<a3, b3>
                  ]
                : LeastUpperBound<a, b>
              : b extends readonly [infer b1, infer b2]
              ? a extends readonly [infer a1, infer a2]
                ? [ExtractPreciseValue<a1, b1>, ExtractPreciseValue<a2, b2>]
                : LeastUpperBound<a, b>
              : ExtractPreciseValue<aItem, bItem>[]
            : LeastUpperBound<a, b>
          : b extends Map<infer bk, infer bv>
          ? a extends Map<infer ak, infer av>
            ? Map<ExtractPreciseValue<ak, bk>, ExtractPreciseValue<av, bv>>
            : LeastUpperBound<a, b>
          : b extends Set<infer bv>
          ? a extends Set<infer av>
            ? Set<ExtractPreciseValue<av, bv>>
            : LeastUpperBound<a, b>
          : IsPlainObject<b> extends true
          ? a extends object
            ? b extends a
              ? b
              : a extends b
              ? a
              : [keyof a & keyof b] extends [never]
              ? never
              : {
                  // we use Required to remove the optional property modifier (?:).
                  // since we use a[k] after that, optional properties will stay
                  // optional if no pattern was more precise.
                  [k in keyof Required<a>]: k extends keyof b
                    ? ExtractPreciseValue<a[k], b[k]>
                    : a[k];
                }
            : LeastUpperBound<a, b>
          : LeastUpperBound<a, b>,
        b
      >;
