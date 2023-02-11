import { Primitives, IsPlainObject, IsUnion } from './helpers';

export type IsMatching<a, b> = true extends IsUnion<a> | IsUnion<b>
  ? true extends (
      b extends any ? (a extends any ? IsMatching<a, b> : never) : never
    )
    ? true
    : false
  : // Special case for unknown, because this is the type
  // of the inverted `_` wildcard pattern, which should
  // match everything.
  unknown extends b
  ? true
  : b extends Primitives
  ? b extends a
    ? true
    : false
  : [b, a] extends [readonly any[], readonly any[]]
  ? [b, a] extends [
      readonly [infer b1, infer b2, infer b3, infer b4, infer b5],
      readonly [infer a1, infer a2, infer a3, infer a4, infer a5]
    ]
    ? [
        IsMatching<a1, b1>,
        IsMatching<a2, b2>,
        IsMatching<a3, b3>,
        IsMatching<a4, b4>,
        IsMatching<a5, b5>
      ] extends [true, true, true, true, true]
      ? true
      : false
    : [b, a] extends [
        readonly [infer b1, infer b2, infer b3, infer b4],
        readonly [infer a1, infer a2, infer a3, infer a4]
      ]
    ? [
        IsMatching<a1, b1>,
        IsMatching<a2, b2>,
        IsMatching<a3, b3>,
        IsMatching<a4, b4>
      ] extends [true, true, true, true]
      ? true
      : false
    : [b, a] extends [
        readonly [infer b1, infer b2, infer b3],
        readonly [infer a1, infer a2, infer a3]
      ]
    ? [IsMatching<a1, b1>, IsMatching<a2, b2>, IsMatching<a3, b3>] extends [
        true,
        true,
        true
      ]
      ? true
      : false
    : [b, a] extends [
        readonly [infer b1, infer b2],
        readonly [infer a1, infer a2]
      ]
    ? [IsMatching<a1, b1>, IsMatching<a2, b2>] extends [true, true]
      ? true
      : false
    : [b, a] extends [readonly [infer b1], readonly [infer a1]]
    ? IsMatching<a1, b1>
    : b extends a
    ? true
    : false
  : IsPlainObject<b> extends true
  ? true extends ( // `true extends union` means "if some cases of the a union are matching"
      a extends any // loop over the `a` union
        ? [keyof b & keyof a] extends [never] // if no common keys
          ? false
          : /**
           * Intentionally not using ValueOf, to avoid reaching the
           * 'type instanciation is too deep error'.
           */
          { [k in keyof b & keyof a]: IsMatching<a[k], b[k]> }[keyof b &
              keyof a] extends true
          ? true // all values are matching
          : false
        : never
    )
    ? true
    : false
  : b extends a
  ? true
  : false;
