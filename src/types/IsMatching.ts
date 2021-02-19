import { IsPlainObject, ValueOf, All } from './helpers';
import { NotPattern, Primitives } from './Pattern';

type Extends<a, b> = a extends b ? true : false;

export type IsMatching<a, p> = p extends NotPattern<infer a2>
  ? IsMatching<a, a2> extends true
    ? false
    : true
  : p extends Primitives
  ? Extends<p, a>
  : [a, p] extends [any[], any[]]
  ? [a, p] extends [
      [infer a1, infer a2, infer a3, infer a4, infer a5],
      [infer p1, infer p2, infer p3, infer p4, infer p5]
    ]
    ? All<
        [
          IsMatching<a1, p1>,
          IsMatching<a2, p2>,
          IsMatching<a3, p3>,
          IsMatching<a4, p4>,
          IsMatching<a5, p5>
        ]
      >
    : [a, p] extends [
        [infer a1, infer a2, infer a3, infer a4],
        [infer p1, infer p2, infer p3, infer p4]
      ]
    ? All<
        [
          IsMatching<a1, p1>,
          IsMatching<a2, p2>,
          IsMatching<a3, p3>,
          IsMatching<a4, p4>
        ]
      >
    : [a, p] extends [
        [infer a1, infer a2, infer a3],
        [infer p1, infer p2, infer p3]
      ]
    ? All<[IsMatching<a1, p1>, IsMatching<a2, p2>, IsMatching<a3, p3>]>
    : [a, p] extends [[infer a1, infer a2], [infer p1, infer p2]]
    ? All<[IsMatching<a1, p1>, IsMatching<a2, p2>]>
    : Extends<p, a>
  : IsPlainObject<p> extends true
  ? false extends ValueOf<
      {
        [k in keyof p & keyof a]: IsMatching<a[k], p[k]>;
      }
    >
    ? false
    : true
  : Extends<p, a>;
