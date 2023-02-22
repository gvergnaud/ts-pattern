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
  MaybeAddReadonly,
  IsReadonlyArray,
  MapKey,
  MapValue,
  SetValue,
  ExtractPlainObject,
  GetKey,
  Apply,
  Fn,
} from './helpers';
import type { Matcher, Pattern, Override, AnyMatcher } from './Pattern';

type OptionalKeys<p> = ValueOf<{
  [k in keyof p]: 0 extends 1 & p[k] // inlining IsAny for perf
    ? never
    : p[k] extends Matcher<any, any, infer matcherType>
    ? matcherType extends 'optional'
      ? k
      : never
    : never;
}>;

type ReduceUnion<
  tuple extends readonly any[],
  i,
  output = never
> = tuple extends readonly [infer p, ...infer tail]
  ? ReduceUnion<tail, i, output | InvertPattern<p, i>>
  : output;

type ReduceIntersection<
  tuple extends readonly any[],
  i,
  output = unknown
> = tuple extends readonly [infer p, ...infer tail]
  ? ReduceIntersection<tail, i, output & InvertPattern<p, i>>
  : output;

type InvertArrayPattern<
  p,
  i,
  startOutput extends any[] = [],
  endOutput extends any[] = []
> = i extends readonly (infer ii)[]
  ? p extends readonly []
    ? MaybeAddReadonly<[...startOutput, ...endOutput], IsReadonlyArray<i>>
    : p extends readonly [infer p1, ...infer pRest]
    ? i extends readonly [infer i1, ...infer iRest]
      ? InvertArrayPattern<
          pRest,
          iRest,
          [...startOutput, InvertPattern<p1, i1>],
          endOutput
        >
      : InvertArrayPattern<
          pRest,
          ii[],
          [...startOutput, InvertPattern<p1, ii>],
          endOutput
        >
    : p extends readonly [...infer pInit, infer p1]
    ? i extends readonly [...infer iInit, infer i1]
      ? InvertArrayPattern<
          pInit,
          iInit,
          startOutput,
          [...endOutput, InvertPattern<p1, i1>]
        >
      : InvertArrayPattern<
          pInit,
          ii[],
          startOutput,
          [...endOutput, InvertPattern<p1, ii>]
        >
    : // If P is a matcher, in this case, it's likely an array matcher
    p extends readonly [...(readonly (infer pRest & AnyMatcher)[])]
    ? MaybeAddReadonly<
        [
          ...startOutput,
          ...Extract<InvertPattern<pRest, i>, readonly any[]>,
          ...endOutput
        ],
        IsReadonlyArray<i>
      >
    : MaybeAddReadonly<
        [...startOutput, ...InvertPattern<ValueOf<p>, ii>[], ...endOutput],
        IsReadonlyArray<i>
      >
  : never;

/**
 * ### InvertPattern
 * Since patterns have special wildcard values, we need a way
 * to transform a pattern into the type of value it represents
 */
export type InvertPattern<p, input> = 0 extends 1 & p
  ? never
  : p extends Matcher<
      infer _input,
      infer subpattern,
      infer matcherType,
      any,
      infer fns
    >
  ? {
      not: DeepExclude<input, InvertPattern<subpattern, input>>;
      select: InvertPattern<subpattern, input>;
      map: subpattern extends [infer pk, infer pv]
        ? Map<
            InvertPattern<pk, MapKey<Extract<input, Map<any, any>>>>,
            InvertPattern<pv, MapValue<Extract<input, Map<any, any>>>>
          >
        : never;
      set: Set<InvertPattern<subpattern, SetValue<Extract<input, Set<any>>>>>;
      optional:
        | InvertPattern<subpattern, Exclude<input, undefined>>
        | undefined;
      and: ReduceIntersection<Extract<subpattern, readonly any[]>, input>;
      or: ReduceUnion<Extract<subpattern, readonly any[]>, input>;
      default: [subpattern] extends [never] ? input : subpattern;
      custom: Override<
        fns extends {
          narrow: infer narrow extends Fn;
        }
          ? Apply<narrow, [input, subpattern]>
          : never
      >;
    }[matcherType]
  : p extends Primitives
  ? p
  : p extends readonly any[]
  ? InvertArrayPattern<p, input>
  : IsPlainObject<p> extends true
  ? OptionalKeys<p> extends infer optKeys
    ? [optKeys] extends [never]
      ? {
          [k in Exclude<keyof p, optKeys>]: InvertPattern<
            p[k],
            GetKey<ExtractPlainObject<input>, k>
          >;
        }
      : Compute<
          {
            [k in Exclude<keyof p, optKeys>]: InvertPattern<
              p[k],
              GetKey<ExtractPlainObject<input>, k>
            >;
          } & {
            [k in Extract<optKeys, keyof p>]?: InvertPattern<
              p[k],
              GetKey<ExtractPlainObject<input>, k>
            >;
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
  startOutput extends any[] = [],
  endOutput extends any[] = []
> = i extends readonly (infer ii)[]
  ? p extends readonly []
    ? MaybeAddReadonly<[...startOutput, ...endOutput], IsReadonlyArray<i>>
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
    ? MaybeAddReadonly<
        [
          ...startOutput,
          ...Extract<
            InvertPatternForExcludeInternal<pRest, i, empty>,
            readonly any[]
          >,
          ...endOutput
        ],
        IsReadonlyArray<i>
      >
    : MaybeAddReadonly<
        [
          ...startOutput,
          ...InvertPatternForExcludeInternal<ValueOf<p>, ii, empty>[],
          ...endOutput
        ],
        IsReadonlyArray<i>
      >
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
        custom: excluded extends {
          narrow: infer narrow extends Fn;
        }
          ? Apply<narrow, [i, subpattern]>
          : never;
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
              // FIXME: -readonly breaks deep exclude if the input is a readonly object
              -readonly [k in keyof p]: k extends keyof i
                ? InvertPatternForExcludeInternal<p[k], i[k], empty>
                : InvertPattern<p[k], unknown>;
            }
          : Compute<
              {
                -readonly [k in Exclude<keyof p, optKeys>]: k extends keyof i
                  ? InvertPatternForExcludeInternal<p[k], i[k], empty>
                  : InvertPattern<p[k], unknown>;
              } & {
                -readonly [k in Extract<optKeys, keyof p>]?: k extends keyof i
                  ? InvertPatternForExcludeInternal<p[k], i[k], empty>
                  : InvertPattern<p[k], unknown>;
              }
            >
        : empty
      : empty
    : empty;
