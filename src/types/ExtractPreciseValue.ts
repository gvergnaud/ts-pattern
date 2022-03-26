import type { ToExclude } from './Pattern';
import type {
  BuiltInObjects,
  Compute,
  ExcludeObjectIfContainsNever,
  IsAny,
  IsPlainObject,
  LeastUpperBound,
} from './helpers';
import { DeepExclude } from './DeepExclude';

export type ExtractPreciseValue<a, b> = unknown extends b
  ? a
  : IsAny<a> extends true
  ? b
  : b extends readonly []
  ? []
  : b extends ToExclude<infer b1>
  ? DeepExclude<a, b1>
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
        : LeastUpperBound<a, b>
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
        : LeastUpperBound<a, b>
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
        : LeastUpperBound<a, b>
      : b extends readonly [infer b1, infer b2]
      ? a extends readonly [infer a1, infer a2]
        ? ExcludeObjectIfContainsNever<
            [ExtractPreciseValue<a1, b1>, ExtractPreciseValue<a2, b2>],
            '0' | '1'
          >
        : LeastUpperBound<a, b>
      : b extends readonly [infer b1]
      ? a extends readonly [infer a1]
        ? ExcludeObjectIfContainsNever<[ExtractPreciseValue<a1, b1>], '0'>
        : LeastUpperBound<a, b>
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
  : // We add `Error` to the excludeUnion because
  // We want to consider them like primitive values in this context.
  IsPlainObject<b, BuiltInObjects | Error> extends true
  ? a extends object
    ? a extends b
      ? a
      : b extends a
      ? b
      : [keyof a & keyof b] extends [never]
      ? never
      : ExcludeObjectIfContainsNever<
          Compute<
            // Keep other properties of `a`
            {
              [k in Exclude<keyof a, keyof b>]: a[k];
            } & {
              // use `b` to extract precise values on `a`.
              // This has the effect of preserving the optional
              // property modifier (?:) of b in the output type.
              [k in keyof b]: k extends keyof a
                ? ExtractPreciseValue<a[k], b[k]>
                : b[k];
            }
          >,
          keyof b & string
        >
    : LeastUpperBound<a, b>
  : LeastUpperBound<a, b>;
