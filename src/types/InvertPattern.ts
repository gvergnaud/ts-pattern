import { DeepExclude } from './DeepExclude';
import {
  IsPlainObject,
  Primitives,
  IsLiteral,
  ValueOf,
  Compute,
  Cast,
} from './helpers';
import type { Matchable, ToExclude } from './Pattern';

type OptionalKeys<p> = ValueOf<{
  [k in keyof p]: p[k] extends Matchable<any, any, infer matcherType>
    ? matcherType extends 'optional'
      ? k
      : never
    : never;
}>;

type ReduceUnion<tuple extends any[], output = never> = tuple extends readonly [
  infer p,
  ...infer tail
]
  ? ReduceUnion<tail, output | InvertPattern<p>>
  : output;

type ReduceIntersection<
  tuple extends any[],
  output = unknown
> = tuple extends readonly [infer p, ...infer tail]
  ? ReduceIntersection<tail, output & InvertPattern<p>>
  : output;

/**
 * ### InvertPattern
 * Since patterns have special wildcard values, we need a way
 * to transform a pattern into the type of value it represents
 */
export type InvertPattern<p> = p extends Matchable<
  infer input,
  infer narrowed,
  infer matcherType,
  any
>
  ? matcherType extends 'not'
    ? ToExclude<InvertPattern<narrowed>>
    : matcherType extends 'select'
    ? InvertPattern<narrowed>
    : matcherType extends 'array'
    ? InvertPattern<narrowed>[]
    : matcherType extends 'optional'
    ? InvertPattern<narrowed> | undefined
    : matcherType extends 'and'
    ? ReduceIntersection<Cast<narrowed, any[]>>
    : matcherType extends 'or'
    ? ReduceUnion<Cast<narrowed, any[]>>
    : [narrowed] extends [never]
    ? input
    : narrowed
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
      } & {
        [k in OptionalKeys<p>]?: InvertPattern<p[k]>;
      }
    >
  : p;

export type ReduceIntersectionForExclude<
  tuple extends any[],
  i,
  output = unknown
> = tuple extends readonly [infer p, ...infer tail]
  ? ReduceIntersectionForExclude<
      tail,
      i,
      output & InvertPatternForExclude<p, i, unknown>
    >
  : output;

export type ReduceUnionForExclude<
  tuple extends any[],
  i,
  output = never
> = tuple extends readonly [infer p, ...infer tail]
  ? ReduceUnionForExclude<
      tail,
      i,
      output | InvertPatternForExclude<p, i, never>
    >
  : output;

/**
 * ### InvertPatternForExclude
 */
export type InvertPatternForExclude<p, i, empty = never> = p extends Matchable<
  any,
  infer narrowed,
  infer matcherType,
  any,
  infer excluded
>
  ? matcherType extends 'not'
    ? InvertPatternForExclude<narrowed, i, unknown> extends infer inv
      ? [inv] extends [never]
        ? empty
        : DeepExclude<i, inv>
      : empty
    : matcherType extends 'select'
    ? InvertPatternForExclude<narrowed, i, empty>
    : matcherType extends 'array'
    ? i extends readonly (infer ii)[]
      ? InvertPatternForExclude<narrowed, ii, empty>[]
      : empty
    : matcherType extends 'optional'
    ? InvertPatternForExclude<narrowed, i, empty> | undefined
    : matcherType extends 'and'
    ? ReduceIntersectionForExclude<Cast<narrowed, any[]>, i>
    : matcherType extends 'or'
    ? ReduceUnionForExclude<Cast<narrowed, any[]>, i>
    : excluded
  : p extends Primitives
  ? IsLiteral<p> extends true
    ? p
    : IsLiteral<i> extends true
    ? p
    : empty
  : p extends readonly (infer pp)[]
  ? i extends readonly (infer ii)[]
    ? p extends readonly [infer p1, infer p2, infer p3, infer p4, infer p5]
      ? i extends readonly [infer i1, infer i2, infer i3, infer i4, infer i5]
        ? readonly [
            InvertPatternForExclude<p1, i1, empty>,
            InvertPatternForExclude<p2, i2, empty>,
            InvertPatternForExclude<p3, i3, empty>,
            InvertPatternForExclude<p4, i4, empty>,
            InvertPatternForExclude<p5, i5, empty>
          ]
        : empty
      : p extends readonly [infer p1, infer p2, infer p3, infer p4]
      ? i extends readonly [infer i1, infer i2, infer i3, infer i4]
        ? readonly [
            InvertPatternForExclude<p1, i1, empty>,
            InvertPatternForExclude<p2, i2, empty>,
            InvertPatternForExclude<p3, i3, empty>,
            InvertPatternForExclude<p4, i4, empty>
          ]
        : empty
      : p extends readonly [infer p1, infer p2, infer p3]
      ? i extends readonly [infer i1, infer i2, infer i3]
        ? readonly [
            InvertPatternForExclude<p1, i1, empty>,
            InvertPatternForExclude<p2, i2, empty>,
            InvertPatternForExclude<p3, i3, empty>
          ]
        : empty
      : p extends readonly [infer p1, infer p2]
      ? i extends readonly [infer i1, infer i2]
        ? readonly [
            InvertPatternForExclude<p1, i1, empty>,
            InvertPatternForExclude<p2, i2, empty>
          ]
        : empty
      : p extends readonly [infer p1]
      ? i extends readonly [infer i1]
        ? readonly [InvertPatternForExclude<p1, i1, empty>]
        : empty
      : p extends readonly []
      ? []
      : InvertPatternForExclude<pp, ii, empty>[]
    : empty
  : p extends Map<infer pk, infer pv>
  ? i extends Map<any, infer iv>
    ? Map<pk, InvertPatternForExclude<pv, iv, empty>>
    : empty
  : p extends Set<infer pv>
  ? i extends Set<infer iv>
    ? Set<InvertPatternForExclude<pv, iv, empty>>
    : empty
  : IsPlainObject<p> extends true
  ? i extends object
    ? [keyof p & keyof i] extends [never]
      ? empty
      : Compute<
          {
            readonly [k in Exclude<keyof p, OptionalKeys<p>>]: k extends keyof i
              ? InvertPatternForExclude<p[k], i[k], empty>
              : InvertPattern<p[k]>;
          } & {
            readonly [k in OptionalKeys<p>]?: k extends keyof i
              ? InvertPatternForExclude<p[k], i[k], empty>
              : InvertPattern<p[k]>;
          }
        >
    : empty
  : empty;
