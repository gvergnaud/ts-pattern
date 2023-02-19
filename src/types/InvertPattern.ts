import { DeepExclude } from './DeepExclude.js';
import {
  IsPlainObject,
  Primitives,
  IsLiteral,
  ValueOf,
  Compute,
  Cast,
  Equal,
  Extends,
  Not,
  All,
  NonLiteralPrimitive,
} from './helpers.js';
import type { Matcher, Pattern, ToExclude } from './Pattern.js';

type OptionalKeys<p> = ValueOf<{
  [k in keyof p]: p[k] extends Matcher<any, any, infer matcherType>
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
export type InvertPattern<p> = p extends Matcher<
  infer input,
  infer narrowed,
  infer matcherType,
  any
>
  ? {
      not: ToExclude<InvertPattern<narrowed>>;
      select: InvertPattern<narrowed>;
      array: InvertPattern<narrowed>[];
      optional: InvertPattern<narrowed> | undefined;
      and: ReduceIntersection<Cast<narrowed, any[]>>;
      or: ReduceUnion<Cast<narrowed, any[]>>;
      default: [narrowed] extends [never] ? input : narrowed;
    }[matcherType]
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
  ? OptionalKeys<p> extends infer optKeys
    ? [optKeys] extends [never]
      ? {
          [k in Exclude<keyof p, optKeys>]: InvertPattern<p[k]>;
        }
      : Compute<
          {
            [k in Exclude<keyof p, optKeys>]: InvertPattern<p[k]>;
          } & {
            [k in Cast<optKeys, keyof p>]?: InvertPattern<p[k]>;
          }
        >
    : never
  : p;

export type ReduceIntersectionForExclude<
  tuple extends any[],
  i,
  output = unknown
> = tuple extends readonly [infer p, ...infer tail]
  ? ReduceIntersectionForExclude<
      tail,
      i,
      output & InvertPatternForExcludeInternal<p, i, unknown>
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
      output | InvertPatternForExcludeInternal<p, i, never>
    >
  : output;

type ExcludeIfExists<a, b> =
  // If b is of type never, it probably means that P.not
  // was called with a `P.when` that wasn't a type guard function.
  // in this case we do not exclude
  [b] extends [never]
    ? never
    : // If a is unknown, we can't exclude
    // (Unless negative types are added in the future)
    unknown extends a
    ? never
    : All<
        [
          // if `a` is one of the non-literal primitive
          Extends<a, NonLiteralPrimitive>,
          Not<IsLiteral<a>>,
          // and b is a literal
          IsLiteral<b>
        ]
      > extends true
    ? // we shouldn't exclude because this will result in
      // excluding the whole primitive type even though only
      // one value has been handled by this pattern.
      // In other words `P.not(10)` on a `number` input shouldn't
      // exclude `number`.
      never
    : DeepExclude<a, b>;

/**
 * ### InvertPatternForExclude
 */
export type InvertPatternForExclude<p, i> = Equal<p, Pattern<i>> extends true
  ? never
  : InvertPatternForExcludeInternal<p, i>;

type InvertPatternForExcludeInternal<p, i, empty = never> =
  // We need to prevent distribution because the boolean
  // type is a union of literal as well as a Primitive type
  // and it will end up being a false positif if we distribute it.
  [p] extends [Primitives]
    ? IsLiteral<p> extends true
      ? p
      : IsLiteral<i> extends true
      ? p
      : empty
    : p extends Matcher<
        infer matchableInput,
        infer subpattern,
        infer matcherType,
        any,
        infer excluded
      >
    ? {
        select: InvertPatternForExcludeInternal<subpattern, i, empty>;
        array: i extends readonly (infer ii)[]
          ? InvertPatternForExcludeInternal<subpattern, ii, empty>[]
          : empty;
        optional:
          | InvertPatternForExcludeInternal<subpattern, i, empty>
          | undefined;
        and: ReduceIntersectionForExclude<Cast<subpattern, any[]>, i>;
        or: ReduceUnionForExclude<Cast<subpattern, any[]>, i>;
        not: ExcludeIfExists<
          // we use matchableInput if possible because it represent the
          // union of all possible value, but i is only one of these values.
          unknown extends matchableInput ? i : matchableInput,
          InvertPatternForExcludeInternal<subpattern, i>
        >;
        default: excluded;
      }[matcherType]
    : p extends readonly (infer pp)[]
    ? i extends readonly (infer ii)[]
      ? p extends readonly [infer p1, infer p2, infer p3, infer p4, infer p5]
        ? i extends readonly [infer i1, infer i2, infer i3, infer i4, infer i5]
          ? readonly [
              InvertPatternForExcludeInternal<p1, i1, empty>,
              InvertPatternForExcludeInternal<p2, i2, empty>,
              InvertPatternForExcludeInternal<p3, i3, empty>,
              InvertPatternForExcludeInternal<p4, i4, empty>,
              InvertPatternForExcludeInternal<p5, i5, empty>
            ]
          : empty
        : p extends readonly [infer p1, infer p2, infer p3, infer p4]
        ? i extends readonly [infer i1, infer i2, infer i3, infer i4]
          ? readonly [
              InvertPatternForExcludeInternal<p1, i1, empty>,
              InvertPatternForExcludeInternal<p2, i2, empty>,
              InvertPatternForExcludeInternal<p3, i3, empty>,
              InvertPatternForExcludeInternal<p4, i4, empty>
            ]
          : empty
        : p extends readonly [infer p1, infer p2, infer p3]
        ? i extends readonly [infer i1, infer i2, infer i3]
          ? readonly [
              InvertPatternForExcludeInternal<p1, i1, empty>,
              InvertPatternForExcludeInternal<p2, i2, empty>,
              InvertPatternForExcludeInternal<p3, i3, empty>
            ]
          : empty
        : p extends readonly [infer p1, infer p2]
        ? i extends readonly [infer i1, infer i2]
          ? readonly [
              InvertPatternForExcludeInternal<p1, i1, empty>,
              InvertPatternForExcludeInternal<p2, i2, empty>
            ]
          : empty
        : p extends readonly [infer p1]
        ? i extends readonly [infer i1]
          ? readonly [InvertPatternForExcludeInternal<p1, i1, empty>]
          : empty
        : p extends readonly []
        ? []
        : InvertPatternForExcludeInternal<pp, ii, empty>[]
      : empty
    : p extends Map<infer pk, infer pv>
    ? i extends Map<any, infer iv>
      ? Map<pk, InvertPatternForExcludeInternal<pv, iv, empty>>
      : empty
    : p extends Set<infer pv>
    ? i extends Set<infer iv>
      ? Set<InvertPatternForExcludeInternal<pv, iv, empty>>
      : empty
    : IsPlainObject<p> extends true
    ? i extends object
      ? [keyof p & keyof i] extends [never]
        ? empty
        : OptionalKeys<p> extends infer optKeys
        ? [optKeys] extends [never]
          ? {
              readonly [k in keyof p]: k extends keyof i
                ? InvertPatternForExcludeInternal<p[k], i[k], empty>
                : InvertPattern<p[k]>;
            }
          : Compute<
              {
                readonly [k in Exclude<keyof p, optKeys>]: k extends keyof i
                  ? InvertPatternForExcludeInternal<p[k], i[k], empty>
                  : InvertPattern<p[k]>;
              } & {
                readonly [k in Cast<optKeys, keyof p>]?: k extends keyof i
                  ? InvertPatternForExcludeInternal<p[k], i[k], empty>
                  : InvertPattern<p[k]>;
              }
            >
        : empty
      : empty
    : empty;
