import type { DeepExclude } from "./DeepExclude.ts";
import type {
  All,
  Call,
  Compute,
  Equal,
  Extends,
  ExtractPlainObject,
  Fn,
  GetKey,
  IsLiteral,
  IsPlainObject,
  IsReadonlyArray,
  MapKey,
  MapValue,
  MaybeAddReadonly,
  NonLiteralPrimitive,
  Not,
  Primitives,
  ReadonlyArrayValue,
  SetValue,
  ValueOf,
  WithDefault,
} from "./helpers.ts";
import type { AnyMatcher, Matcher, Override, Pattern } from "./Pattern.ts";

type OptionalKeys<p> = ValueOf<
  {
    [k in keyof p]: 0 extends 1 & p[k] // inlining IsAny for perf
      ? never
      : p[k] extends Matcher<any, any, infer matcherType>
        ? matcherType extends "optional" ? k
        : never
      : never;
  }
>;

type ReduceUnion<
  tuple extends readonly any[],
  i,
  output = never,
> = tuple extends readonly [infer p, ...infer tail]
  ? ReduceUnion<tail, i, output | InvertPatternInternal<p, i>>
  : output;

type ReduceIntersection<
  tuple extends readonly any[],
  i,
  output = unknown,
> = tuple extends readonly [infer p, ...infer tail]
  ? ReduceIntersection<tail, i, output & InvertPatternInternal<p, i>>
  : output;

type InvertArrayPattern<
  p,
  i,
  startOutput extends any[] = [],
  endOutput extends any[] = [],
> = i extends readonly (infer ii)[]
  ? p extends readonly [] ? [...startOutput, ...endOutput]
  : p extends readonly [infer p1, ...infer pRest]
    ? i extends readonly [infer i1, ...infer iRest] ? InvertArrayPattern<
        pRest,
        iRest,
        [...startOutput, InvertPatternInternal<p1, i1>],
        endOutput
      >
    : InvertArrayPattern<
      pRest,
      ii[],
      [...startOutput, InvertPatternInternal<p1, ii>],
      endOutput
    >
  : p extends readonly [...infer pInit, infer p1]
    ? i extends readonly [...infer iInit, infer i1] ? InvertArrayPattern<
        pInit,
        iInit,
        startOutput,
        [...endOutput, InvertPatternInternal<p1, i1>]
      >
    : InvertArrayPattern<
      pInit,
      ii[],
      startOutput,
      [...endOutput, InvertPatternInternal<p1, ii>]
    >
    // If P is a matcher, in this case, it's likely an array matcher
  : p extends readonly [...(readonly (infer pRest & AnyMatcher)[])] ? [
      ...startOutput,
      ...Extract<InvertPatternInternal<pRest, i>, readonly any[]>,
      ...endOutput,
    ]
  : [...startOutput, ...InvertPatternInternal<ValueOf<p>, ii>[], ...endOutput]
  : never;

/**
 * ### InvertPatternInternal
 * Since patterns have special wildcard values, we need a way
 * to transform a pattern into the type of value it represents
 */
export type InvertPattern<p, input> = Equal<Pattern<input>, p> extends true
  ? never
  : InvertPatternInternal<p, input>;

type InvertPatternInternal<p, input> = 0 extends 1 & p ? never
  : p extends Matcher<
    infer _input,
    infer subpattern,
    infer matcherType,
    any,
    infer narrowedOrFn
  > ? {
      not: DeepExclude<input, InvertPatternInternal<subpattern, input>>;
      select: InvertPatternInternal<subpattern, input>;
      array: InvertPatternInternal<subpattern, ReadonlyArrayValue<input>>[];
      map: subpattern extends [infer pk, infer pv] ? Map<
          InvertPatternInternal<pk, MapKey<Extract<input, Map<any, any>>>>,
          InvertPatternInternal<pv, MapValue<Extract<input, Map<any, any>>>>
        >
        : never;
      set: Set<
        InvertPatternInternal<subpattern, SetValue<Extract<input, Set<any>>>>
      >;
      optional:
        | InvertPatternInternal<subpattern, Exclude<input, undefined>>
        | undefined;
      and: ReduceIntersection<Extract<subpattern, readonly any[]>, input>;
      or: ReduceUnion<Extract<subpattern, readonly any[]>, input>;
      default: [subpattern] extends [never] ? input : subpattern;
      custom: Override<
        narrowedOrFn extends Fn ? Call<narrowedOrFn, input> : narrowedOrFn
      >;
    }[matcherType]
  : p extends Primitives ? p
  : p extends readonly any[] ? InvertArrayPattern<
      p,
      WithDefault<Extract<input, readonly any[]>, unknown[]>
    >
  : IsPlainObject<p> extends true
    ? OptionalKeys<p> extends infer optKeys ? [optKeys] extends [never] ? {
          [k in Exclude<keyof p, optKeys>]: InvertPatternInternal<
            p[k],
            WithDefault<GetKey<ExtractPlainObject<input>, k>, unknown>
          >;
        }
      : Compute<
        & {
          [k in Exclude<keyof p, optKeys>]: InvertPatternInternal<
            p[k],
            WithDefault<GetKey<ExtractPlainObject<input>, k>, unknown>
          >;
        }
        & {
          [k in Extract<optKeys, keyof p>]?: InvertPatternInternal<
            p[k],
            WithDefault<GetKey<ExtractPlainObject<input>, k>, unknown>
          >;
        }
      >
    : never
  : p;

export type ReduceIntersectionForExclude<
  tuple extends readonly any[],
  i,
  output = unknown,
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
  output = never,
> = tuple extends readonly [infer p, ...infer tail] ? ReduceUnionForExclude<
    tail,
    i,
    output | InvertPatternForExcludeInternal<p, i, never>
  >
  : output;

type ExcludeIfExists<a, b> =
  // If b is of type never, it probably means that P.not
  // was called with a `P.when` that wasn't a type guard function.
  // in this case we do not exclude
  [b] extends [never] ? never
    // If a is unknown, we can't exclude
    // (Unless negative types are added in the future)
    : unknown extends a ? never
    : All<
      [
        // if `a` is one of the non-literal primitive
        Extends<a, NonLiteralPrimitive>,
        Not<IsLiteral<a>>,
        // and b is a literal
        IsLiteral<b>,
      ]
    > extends true
    // we shouldn't exclude because this will result in
    // excluding the whole primitive type even though only
    // one value has been handled by this pattern.
    // In other words `P.not(10)` on a `number` input shouldn't
    // exclude `number`.
      ? never
    : DeepExclude<a, b>;

type InvertArrayPatternForExclude<
  p,
  i,
  empty,
  isReadonly extends boolean,
  startOutput extends any[] = [],
  endOutput extends any[] = [],
> = i extends readonly (infer ii)[]
  ? p extends readonly []
    ? MaybeAddReadonly<[...startOutput, ...endOutput], isReadonly>
  : p extends readonly [infer p1, ...infer pRest]
    ? i extends readonly [infer i1, ...infer iRest]
      ? InvertArrayPatternForExclude<
        pRest,
        iRest,
        empty,
        isReadonly,
        [...startOutput, InvertPatternForExcludeInternal<p1, i1, empty>],
        endOutput
      >
    : InvertArrayPatternForExclude<
      pRest,
      ii[],
      empty,
      isReadonly,
      [...startOutput, InvertPatternForExcludeInternal<p1, ii, empty>],
      endOutput
    >
  : p extends readonly [...infer pInit, infer p1]
    ? i extends readonly [...infer iInit, infer i1]
      ? InvertArrayPatternForExclude<
        pInit,
        iInit,
        empty,
        isReadonly,
        startOutput,
        [...endOutput, InvertPatternForExcludeInternal<p1, i1, empty>]
      >
    : InvertArrayPatternForExclude<
      pInit,
      ii[],
      empty,
      isReadonly,
      startOutput,
      [...endOutput, InvertPatternForExcludeInternal<p1, ii, empty>]
    >
    // If P is a matcher, in this case, it's likely an array matcher
  : p extends readonly [...(readonly (infer pRest & AnyMatcher)[])]
    ? MaybeAddReadonly<
      [
        ...startOutput,
        ...Extract<
          InvertPatternForExcludeInternal<pRest, i, empty>,
          readonly any[]
        >,
        ...endOutput,
      ],
      isReadonly
    >
  : MaybeAddReadonly<
    [
      ...startOutput,
      ...InvertPatternForExcludeInternal<ValueOf<p>, ii, empty>[],
      ...endOutput,
    ],
    isReadonly
  >
  : empty;

/**
 * ### InvertPatternForExclude
 */
export type InvertPatternForExclude<p, i> = Equal<Pattern<i>, p> extends true
  ? never
  : InvertPatternForExcludeInternal<p, i>;

type InvertPatternForExcludeInternal<p, i, empty = never> =
  // We need to prevent distribution because the boolean
  // type is a union of literal as well as a Primitive type
  // and it will end up being a false positif if we distribute it.
  unknown extends p ? i
    : [p] extends [Primitives] ? IsLiteral<p> extends true ? p
      : IsLiteral<i> extends true ? p
      : empty
    : p extends Matcher<
      infer matchableInput,
      infer subpattern,
      infer matcherType,
      any,
      infer excluded
    > ? {
        select: InvertPatternForExcludeInternal<subpattern, i, empty>;
        array: i extends readonly (infer ii)[]
          ? InvertPatternForExcludeInternal<subpattern, ii, empty>[]
          : empty;
        map: subpattern extends [infer pk, infer pv]
          ? i extends Map<infer ik, infer iv> ? Map<
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
        custom: excluded extends infer narrowedOrFn extends Fn
          ? Call<narrowedOrFn, i>
          : excluded;
      }[matcherType]
    : p extends readonly any[]
      ? Extract<i, readonly any[]> extends infer arrayInput
        ? InvertArrayPatternForExclude<
          p,
          arrayInput,
          empty,
          IsReadonlyArray<arrayInput>
        >
      : never
    : IsPlainObject<p> extends true
      ? i extends object ? [keyof p & keyof i] extends [never] ? empty
        : OptionalKeys<p> extends infer optKeys ? [optKeys] extends [never] ? {
              readonly [k in keyof p]: k extends keyof i
                ? InvertPatternForExcludeInternal<p[k], i[k], empty>
                : InvertPatternInternal<p[k], unknown>;
            }
          : Compute<
            & {
              readonly [k in Exclude<keyof p, optKeys>]: k extends keyof i
                ? InvertPatternForExcludeInternal<p[k], i[k], empty>
                : InvertPatternInternal<p[k], unknown>;
            }
            & {
              readonly [k in Extract<optKeys, keyof p>]?: k extends keyof i
                ? InvertPatternForExcludeInternal<p[k], i[k], empty>
                : InvertPatternInternal<p[k], unknown>;
            }
          >
        : empty
      : empty
    : empty;
