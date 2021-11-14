import type { NotPattern } from './Pattern';
import type {
  ExcludeObjectIfContainsNever,
  IsAny,
  IsPlainObject,
  LeastUpperBound,
} from './helpers';

export type ExtractPreciseValue<a, b> = unknown extends b
  ? a
  : IsAny<a> extends true
  ? b
  : b extends readonly []
  ? []
  : b extends NotPattern<infer b1>
  ? Exclude<a, b1>
  : b extends readonly (infer bItem)[]
  ? a extends readonly (infer aItem)[]
    ? b extends readonly [infer b1, infer b2, infer b3, infer b4, infer b5]
      ? a extends readonly [infer a1, infer a2, infer a3, infer a4, infer a5]
        ? ExcludeObjectIfContainsNever<
            [
              ExtractPreciseValue<a1, b1>,
              ExtractPreciseValue<a2, b2>,
              ExtractPreciseValue<a3, b3>,
              ExtractPreciseValue<a4, b4>,
              ExtractPreciseValue<a5, b5>
            ],
            '0' | '1' | '2' | '3' | '4'
          >
        : ExcludeObjectIfContainsNever<
            [
              ExtractPreciseValue<aItem, b1>,
              ExtractPreciseValue<aItem, b2>,
              ExtractPreciseValue<aItem, b3>,
              ExtractPreciseValue<aItem, b4>,
              ExtractPreciseValue<aItem, b5>
            ],
            '0' | '1' | '2' | '3' | '4'
          >
      : b extends readonly [infer b1, infer b2, infer b3, infer b4]
      ? a extends readonly [infer a1, infer a2, infer a3, infer a4]
        ? ExcludeObjectIfContainsNever<
            [
              ExtractPreciseValue<a1, b1>,
              ExtractPreciseValue<a2, b2>,
              ExtractPreciseValue<a3, b3>,
              ExtractPreciseValue<a4, b4>
            ],
            '0' | '1' | '2' | '3'
          >
        : ExcludeObjectIfContainsNever<
            [
              ExtractPreciseValue<aItem, b1>,
              ExtractPreciseValue<aItem, b2>,
              ExtractPreciseValue<aItem, b3>,
              ExtractPreciseValue<aItem, b4>
            ],
            '0' | '1' | '2' | '3'
          >
      : b extends readonly [infer b1, infer b2, infer b3]
      ? a extends readonly [infer a1, infer a2, infer a3]
        ? ExcludeObjectIfContainsNever<
            [
              ExtractPreciseValue<a1, b1>,
              ExtractPreciseValue<a2, b2>,
              ExtractPreciseValue<a3, b3>
            ],
            '0' | '1' | '2'
          >
        : ExcludeObjectIfContainsNever<
            [
              ExtractPreciseValue<aItem, b1>,
              ExtractPreciseValue<aItem, b2>,
              ExtractPreciseValue<aItem, b3>
            ],
            '0' | '1' | '2'
          >
      : b extends readonly [infer b1, infer b2]
      ? a extends readonly [infer a1, infer a2]
        ? ExcludeObjectIfContainsNever<
            [ExtractPreciseValue<a1, b1>, ExtractPreciseValue<a2, b2>],
            '0' | '1'
          >
        : ExcludeObjectIfContainsNever<
            [ExtractPreciseValue<aItem, b1>, ExtractPreciseValue<aItem, b2>],
            '0' | '1'
          >
      : b extends readonly [infer b1]
      ? a extends readonly [infer a1]
        ? ExcludeObjectIfContainsNever<[ExtractPreciseValue<a1, b1>], '0'>
        : ExcludeObjectIfContainsNever<[ExtractPreciseValue<aItem, b1>], '0'>
      : b extends readonly []
      ? []
      : ExtractPreciseValue<aItem, bItem> extends infer preciseValue
      ? [preciseValue] extends [never]
        ? never
        : preciseValue[]
      : never
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
    ? a extends b
      ? a
      : b extends a
      ? b
      : [keyof a & keyof b] extends [never]
      ? never
      : ExcludeObjectIfContainsNever<
          {
            // we use Required to remove the optional property modifier (?:).
            // since we use a[k] after that, optional properties will stay
            // optional if no pattern was more precise.
            [k in keyof Required<a>]: k extends keyof b
              ? ExtractPreciseValue<a[k], b[k]>
              : a[k];
          },
          keyof b & string
        >
    : LeastUpperBound<a, b>
  : LeastUpperBound<a, b>;
