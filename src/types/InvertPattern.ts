import { DeepExclude } from './DeepExclude';
import {
  IsPlainObject,
  Primitives,
  IsLiteral,
  ValueOf,
  Compute,
} from './helpers';
import type {
  SelectPattern,
  GuardPattern,
  NotPattern,
  ToExclude,
} from './Pattern';

type OptionalKeys<p> = ValueOf<
  {
    [k in keyof p]: p[k] extends GuardPattern<any, any, any, infer isOptional>
      ? isOptional extends true
        ? k
        : never
      : never;
  }
>;

/**
 * ### InvertPattern
 * Since patterns have special wildcard values, we need a way
 * to transform a pattern into the type of value it represents
 */
export type InvertPattern<p> = p extends SelectPattern<any>
  ? unknown
  : p extends GuardPattern<infer p1, infer p2, any, any>
  ? [p2] extends [never]
    ? p1
    : p2
  : p extends NotPattern<any, infer p1>
  ? ToExclude<InvertPattern<p1>>
  : p extends Primitives
  ? p
  : p extends readonly (infer pp)[]
  ? p extends readonly [infer p1, infer p2, infer p3, infer p4, infer p5]
    ? [
        InvertPattern<p1>,
        InvertPattern<p2>,
        InvertPattern<p3>,
        InvertPattern<p4>,
        InvertPattern<p5>
      ]
    : p extends readonly [infer p1, infer p2, infer p3, infer p4]
    ? [
        InvertPattern<p1>,
        InvertPattern<p2>,
        InvertPattern<p3>,
        InvertPattern<p4>
      ]
    : p extends readonly [infer p1, infer p2, infer p3]
    ? [InvertPattern<p1>, InvertPattern<p2>, InvertPattern<p3>]
    : p extends readonly [infer p1, infer p2]
    ? [InvertPattern<p1>, InvertPattern<p2>]
    : p extends readonly [infer p1]
    ? [InvertPattern<p1>]
    : p extends readonly []
    ? []
    : InvertPattern<pp>[]
  : p extends Map<infer pk, infer pv>
  ? Map<pk, InvertPattern<pv>>
  : p extends Set<infer pv>
  ? Set<InvertPattern<pv>>
  : IsPlainObject<p> extends true
  ? Compute<
      {
        [k in Exclude<keyof p, OptionalKeys<p>>]: InvertPattern<p[k]>;
      } &
        {
          [k in OptionalKeys<p>]?: InvertPattern<p[k]>;
        }
    >
  : p;

/**
 * ### InvertPatternForExclude
 */
export type InvertPatternForExclude<p, i> = p extends NotPattern<any, infer p1>
  ? DeepExclude<i, p1>
  : p extends SelectPattern<any>
  ? unknown
  : p extends GuardPattern<any, infer p1, any, any>
  ? p1
  : p extends Primitives
  ? IsLiteral<p> extends true
    ? p
    : IsLiteral<i> extends true
    ? p
    : never
  : p extends readonly (infer pp)[]
  ? i extends readonly (infer ii)[]
    ? p extends readonly [infer p1, infer p2, infer p3, infer p4, infer p5]
      ? i extends readonly [infer i1, infer i2, infer i3, infer i4, infer i5]
        ? [
            InvertPatternForExclude<p1, i1>,
            InvertPatternForExclude<p2, i2>,
            InvertPatternForExclude<p3, i3>,
            InvertPatternForExclude<p4, i4>,
            InvertPatternForExclude<p5, i5>
          ]
        : never
      : p extends readonly [infer p1, infer p2, infer p3, infer p4]
      ? i extends readonly [infer i1, infer i2, infer i3, infer i4]
        ? [
            InvertPatternForExclude<p1, i1>,
            InvertPatternForExclude<p2, i2>,
            InvertPatternForExclude<p3, i3>,
            InvertPatternForExclude<p4, i4>
          ]
        : never
      : p extends readonly [infer p1, infer p2, infer p3]
      ? i extends readonly [infer i1, infer i2, infer i3]
        ? [
            InvertPatternForExclude<p1, i1>,
            InvertPatternForExclude<p2, i2>,
            InvertPatternForExclude<p3, i3>
          ]
        : never
      : p extends readonly [infer p1, infer p2]
      ? i extends readonly [infer i1, infer i2]
        ? [InvertPatternForExclude<p1, i1>, InvertPatternForExclude<p2, i2>]
        : never
      : p extends readonly [infer p1]
      ? i extends readonly [infer i1]
        ? [InvertPatternForExclude<p1, i1>]
        : never
      : p extends readonly []
      ? []
      : InvertPatternForExclude<pp, ii>[]
    : never
  : p extends Map<infer pk, infer pv>
  ? i extends Map<any, infer iv>
    ? Map<pk, InvertPatternForExclude<pv, iv>>
    : never
  : p extends Set<infer pv>
  ? i extends Set<infer iv>
    ? Set<InvertPatternForExclude<pv, iv>>
    : never
  : IsPlainObject<p> extends true
  ? i extends object
    ? [keyof p & keyof i] extends [never]
      ? never
      : Compute<
          {
            [k in Exclude<keyof p, OptionalKeys<p>>]: k extends keyof i
              ? InvertPatternForExclude<p[k], i[k]>
              : InvertPattern<p[k]>;
          } &
            {
              [k in OptionalKeys<p>]?: k extends keyof i
                ? InvertPatternForExclude<p[k], i[k]>
                : InvertPattern<p[k]>;
            }
        >
    : never
  : never;
