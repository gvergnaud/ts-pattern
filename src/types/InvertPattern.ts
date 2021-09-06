import type * as symbols from '../symbols';
import { IsPlainObject, Primitives, IsLiteral, Or } from './helpers';
import type {
  NamedSelectPattern,
  AnonymousSelectPattern,
  GuardPattern,
  NotPattern,
} from './Pattern';

/**
 * ### InvertPattern
 * Since patterns have special wildcard values, we need a way
 * to transform a pattern into the type of value it represents
 */
export type InvertPattern<p> = p extends
  | NamedSelectPattern<any>
  | AnonymousSelectPattern
  ? keyof p extends symbols.PatternKind | symbols.NamedSelect
    ? unknown
    : InvertPattern<Omit<p, symbols.PatternKind | symbols.NamedSelect>>
  : p extends GuardPattern<infer p1, infer p2>
  ? [p2] extends [never]
    ? p1
    : p2
  : p extends NotPattern<infer a1>
  ? NotPattern<InvertPattern<a1>>
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
    : InvertPattern<pp>[]
  : p extends Map<infer pk, infer pv>
  ? Map<pk, InvertPattern<pv>>
  : p extends Set<infer pv>
  ? Set<InvertPattern<pv>>
  : IsPlainObject<p> extends true
  ? { [k in keyof p]: InvertPattern<p[k]> }
  : p;

/**
 * ### InvertPatternForExclude
 */
export type InvertPatternForExclude<p, i> = p extends NotPattern<infer p1>
  ? Exclude<i, p1>
  : p extends NamedSelectPattern<any> | AnonymousSelectPattern
  ? keyof p extends symbols.PatternKind | symbols.NamedSelect
    ? unknown
    : InvertPatternForExclude<
        Omit<p, symbols.PatternKind | symbols.NamedSelect>,
        i
      >
  : p extends GuardPattern<any, infer p1>
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
      : {
          [k in keyof p]: k extends keyof i
            ? InvertPatternForExclude<p[k], i[k]>
            : p[k];
        }
    : never
  : never;
