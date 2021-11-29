import {
  IsPlainObject,
  Primitives,
  IsLiteral,
  ValueOf,
  Compute,
  Equal,
} from './helpers';
import type {
  NamedSelectPattern,
  AnonymousSelectPattern,
  GuardPattern,
  NotPattern,
  OptionalPattern,
  AndPattern,
  OrPattern,
  ListPattern,
} from './Pattern';
import * as symbols from '../symbols';

type ReduceAnd<tuple extends any[], output = unknown> = tuple extends readonly [
  infer p,
  ...infer tail
]
  ? ReduceAnd<tail, output & InvertPattern<p>>
  : output;

type ReduceOr<tuple extends any[], output = never> = tuple extends readonly [
  infer p,
  ...infer tail
]
  ? ReduceOr<tail, output | InvertPattern<p>>
  : output;

/**
 * ### InvertPattern
 * Since patterns have special wildcard values, we need a way
 * to transform a pattern into the type of value it represents
 */
export type InvertPattern<p> = p extends
  | NamedSelectPattern<any>
  | AnonymousSelectPattern
  ? unknown
  : p extends GuardPattern<infer p1, infer p2>
  ? [p2] extends [never]
    ? p1
    : p2
  : p extends Primitives
  ? p
  : p extends readonly (infer pp)[]
  ? p extends NotPattern<infer a1>
    ? NotPattern<InvertPattern<a1>>
    : p extends readonly [symbols.optional, infer pattern]
    ? InvertPattern<pattern> | undefined
    : p extends readonly [symbols.and, ...infer ps]
    ? ReduceAnd<ps>
    : p extends readonly [symbols.or, ...infer ps]
    ? ReduceOr<ps>
    : p extends ListPattern<any>
    ? InvertPattern<p[1]>[]
    : p extends readonly [infer p1, infer p2, infer p3, infer p4, infer p5]
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
    : [InvertPattern<pp>]
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

type OptionalKeys<p> = ValueOf<
  {
    [k in keyof p]: p[k] extends OptionalPattern<any> ? k : never;
  }
>;

export type ReduceAndForExclude<
  tuple extends any[],
  i,
  output = unknown
> = tuple extends readonly [infer p, ...infer tail]
  ? ReduceAndForExclude<
      tail,
      i,
      output & InvertPatternForExclude<p, i, unknown>
    >
  : output;

export type ReduceOrForExclude<
  tuple extends any[],
  i,
  output = never
> = tuple extends readonly [infer p, ...infer tail]
  ? ReduceOrForExclude<tail, i, output | InvertPatternForExclude<p, i, never>>
  : output;

/**
 * ### InvertPatternForExclude
 */
export type InvertPatternForExclude<p, i, empty = never> = p extends
  | NamedSelectPattern<any>
  | AnonymousSelectPattern
  ? unknown
  : p extends GuardPattern<any, infer p1>
  ? p1
  : p extends Primitives
  ? IsLiteral<p> extends true
    ? p
    : IsLiteral<i> extends true
    ? p
    : empty
  : p extends readonly (infer pp)[]
  ? p extends NotPattern<infer p1>
    ? Exclude<i, p1>
    : p extends readonly [symbols.optional, infer pattern]
    ? InvertPatternForExclude<pattern, i, empty> | undefined
    : p extends readonly [symbols.and, ...infer ps]
    ? ReduceAndForExclude<ps, i>
    : p extends readonly [symbols.or, ...infer ps]
    ? ReduceOrForExclude<ps, i>
    : p extends ListPattern<any>
    ? i extends (infer i1)[]
      ? InvertPatternForExclude<p[1], i1, empty>[]
      : never
    : i extends readonly (infer ii)[]
    ? p extends readonly [infer p1, infer p2, infer p3, infer p4, infer p5]
      ? i extends readonly [infer i1, infer i2, infer i3, infer i4, infer i5]
        ? [
            InvertPatternForExclude<p1, i1, empty>,
            InvertPatternForExclude<p2, i2, empty>,
            InvertPatternForExclude<p3, i3, empty>,
            InvertPatternForExclude<p4, i4, empty>,
            InvertPatternForExclude<p5, i5, empty>
          ]
        : never
      : p extends readonly [infer p1, infer p2, infer p3, infer p4]
      ? i extends readonly [infer i1, infer i2, infer i3, infer i4]
        ? [
            InvertPatternForExclude<p1, i1, empty>,
            InvertPatternForExclude<p2, i2, empty>,
            InvertPatternForExclude<p3, i3, empty>,
            InvertPatternForExclude<p4, i4, empty>
          ]
        : never
      : p extends readonly [infer p1, infer p2, infer p3]
      ? i extends readonly [infer i1, infer i2, infer i3]
        ? [
            InvertPatternForExclude<p1, i1, empty>,
            InvertPatternForExclude<p2, i2, empty>,
            InvertPatternForExclude<p3, i3, empty>
          ]
        : never
      : p extends readonly [infer p1, infer p2]
      ? i extends readonly [infer i1, infer i2]
        ? [
            InvertPatternForExclude<p1, i1, empty>,
            InvertPatternForExclude<p2, i2, empty>
          ]
        : never
      : p extends readonly [infer p1]
      ? i extends readonly [infer i1]
        ? [InvertPatternForExclude<p1, i1, empty>]
        : never
      : p extends readonly []
      ? []
      : [InvertPatternForExclude<pp, ii, empty>]
    : never
  : p extends Map<infer pk, infer pv>
  ? i extends Map<any, infer iv>
    ? Map<pk, InvertPatternForExclude<pv, iv, empty>>
    : never
  : p extends Set<infer pv>
  ? i extends Set<infer iv>
    ? Set<InvertPatternForExclude<pv, iv, empty>>
    : never
  : IsPlainObject<p> extends true
  ? i extends object
    ? [keyof p & keyof i] extends [never]
      ? never
      : Compute<
          {
            [k in Exclude<keyof p, OptionalKeys<p>>]: k extends keyof i
              ? InvertPatternForExclude<p[k], i[k], empty>
              : InvertPattern<p[k]>;
          } &
            {
              [k in OptionalKeys<p>]?: k extends keyof i
                ? InvertPatternForExclude<p[k], i[k], empty>
                : InvertPattern<p[k]>;
            }
        >
    : never
  : never;
