import { DeepExclude } from './DeepExclude';
import {
  IsPlainObject,
  Primitives,
  IsLiteral,
  ValueOf,
  Compute,
  Equal,
  Extends,
  Not,
  All,
  NonLiteralPrimitive,
} from './helpers';
import type { Matcher, Pattern, ToExclude, AnyMatcher } from './Pattern';

type OptionalKeys<p> = ValueOf<{
  [k in keyof p]: p[k] extends Matcher<any, any, infer matcherType>
    ? matcherType extends 'optional'
      ? k
      : never
    : never;
}>;

type ReduceUnion<
  tuple extends readonly any[],
  output = never
> = tuple extends readonly [infer p, ...infer tail]
  ? ReduceUnion<tail, output | InvertPattern<p>>
  : output;

type ReduceIntersection<
  tuple extends readonly any[],
  output = unknown
> = tuple extends readonly [infer p, ...infer tail]
  ? ReduceIntersection<tail, output & InvertPattern<p>>
  : output;

type InvertArrayPattern<
  p,
  startOutput extends readonly any[] = [],
  endOutput extends readonly any[] = []
> = p extends readonly []
  ? [...startOutput, ...endOutput]
  : p extends readonly [infer p1, ...infer pRest]
  ? InvertArrayPattern<pRest, [...startOutput, InvertPattern<p1>], endOutput>
  : p extends readonly [...infer pInit, infer p1]
  ? InvertArrayPattern<pInit, startOutput, [...endOutput, InvertPattern<p1>]>
  : // p has to be an array matcher in this case
  p extends readonly [...(readonly (infer pRest)[])]
  ? [
      ...startOutput,
      ...Extract<InvertPattern<pRest>, readonly any[]>,
      ...endOutput
    ]
  : [...startOutput, ...InvertPattern<ValueOf<p>>[], ...endOutput];

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
      map: narrowed extends [infer pk, infer pv]
        ? Map<InvertPattern<pk>, InvertPattern<pv>>
        : never;
      set: Set<InvertPattern<narrowed>>;
      optional: InvertPattern<narrowed> | undefined;
      and: ReduceIntersection<Extract<narrowed, readonly any[]>>;
      or: ReduceUnion<Extract<narrowed, readonly any[]>>;
      default: [narrowed] extends [never] ? input : narrowed;
    }[matcherType]
  : p extends Primitives
  ? p
  : p extends readonly any[]
  ? InvertArrayPattern<p>
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
            [k in Extract<optKeys, keyof p>]?: InvertPattern<p[k]>;
          }
        >
    : never
  : p;

export type ReduceIntersectionForExclude<
  tuple extends readonly any[],
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
  tuple extends readonly any[],
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

type InvertArrayPatternForExclude<
  p,
  i,
  empty,
  startOutput extends readonly any[] = [],
  endOutput extends readonly any[] = []
> = i extends readonly (infer ii)[]
  ? p extends readonly []
    ? readonly [...startOutput, ...endOutput]
    : p extends readonly [infer p1, ...infer pRest]
    ? i extends readonly [infer i1, ...infer iRest]
      ? InvertArrayPatternForExclude<
          pRest,
          iRest,
          empty,
          [...startOutput, InvertPatternForExcludeInternal<p1, i1, empty>],
          endOutput
        >
      : InvertArrayPatternForExclude<
          pRest,
          ii[],
          empty,
          [...startOutput, InvertPatternForExcludeInternal<p1, ii, empty>],
          endOutput
        >
    : p extends readonly [...infer pInit, infer p1]
    ? i extends readonly [...infer iInit, infer i1]
      ? InvertArrayPatternForExclude<
          pInit,
          iInit,
          empty,
          startOutput,
          [...endOutput, InvertPatternForExcludeInternal<p1, i1, empty>]
        >
      : InvertArrayPatternForExclude<
          pInit,
          ii[],
          empty,
          startOutput,
          [...endOutput, InvertPatternForExcludeInternal<p1, ii, empty>]
        >
    : // If P is a matcher, in this case, it's likely an array matcher
    p extends readonly [...(readonly (infer pRest & AnyMatcher)[])]
    ? readonly [
        ...startOutput,
        ...Extract<
          InvertPatternForExcludeInternal<pRest, i, empty>,
          readonly any[]
        >,
        ...endOutput
      ]
    : readonly [
        ...startOutput,
        ...InvertPatternForExcludeInternal<ValueOf<p>, ii, empty>[],
        ...endOutput
      ]
  : empty;

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
  unknown extends p
    ? i
    : [p] extends [Primitives]
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
        map: subpattern extends [infer pk, infer pv]
          ? i extends Map<infer ik, infer iv>
            ? Map<
                InvertPatternForExcludeInternal<pk, ik, empty>,
                InvertPatternForExcludeInternal<pv, iv, empty>
              >
            : empty
          : empty;
        set: i extends Set<infer iv>
          ? Set<InvertPatternForExcludeInternal<subpattern, iv, empty>>
          : empty;
        optional:
          | InvertPatternForExcludeInternal<subpattern, i, empty>
          | undefined;
        and: ReduceIntersectionForExclude<
          Extract<subpattern, readonly any[]>,
          i
        >;
        or: ReduceUnionForExclude<Extract<subpattern, readonly any[]>, i>;
        not: ExcludeIfExists<
          // we use matchableInput if possible because it represent the
          // union of all possible value, but i is only one of these values.
          unknown extends matchableInput ? i : matchableInput,
          InvertPatternForExcludeInternal<subpattern, i>
        >;
        default: excluded;
      }[matcherType]
    : p extends readonly any[]
    ? InvertArrayPatternForExclude<p, Extract<i, readonly any[]>, empty>
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
                readonly [k in Extract<optKeys, keyof p>]?: k extends keyof i
                  ? InvertPatternForExcludeInternal<p[k], i[k], empty>
                  : InvertPattern<p[k]>;
              }
            >
        : empty
      : empty
    : empty;
