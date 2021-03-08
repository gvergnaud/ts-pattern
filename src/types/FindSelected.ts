import type {
  Compute,
  IsPlainObject,
  UnionToIntersection,
  ValueOf,
} from './helpers';
import type { SelectPattern } from './Pattern';

type FindSelectionUnion<i, p> = p extends SelectPattern<infer Key>
  ? { [k in Key]: i }
  : [i, p] extends [readonly (infer ii)[], readonly (infer pp)[]]
  ? [i, p] extends [
      readonly [infer i1, infer i2, infer i3, infer i4, infer i5],
      readonly [infer p1, infer p2, infer p3, infer p4, infer p5]
    ]
    ?
        | FindSelectionUnion<i1, p1>
        | FindSelectionUnion<i2, p2>
        | FindSelectionUnion<i3, p3>
        | FindSelectionUnion<i4, p4>
        | FindSelectionUnion<i5, p5>
    : [i, p] extends [
        readonly [infer i1, infer i2, infer i3, infer i4],
        readonly [infer p1, infer p2, infer p3, infer p4]
      ]
    ?
        | FindSelectionUnion<i1, p1>
        | FindSelectionUnion<i2, p2>
        | FindSelectionUnion<i3, p3>
        | FindSelectionUnion<i4, p4>
    : [i, p] extends [
        readonly [infer i1, infer i2, infer i3],
        readonly [infer p1, infer p2, infer p3]
      ]
    ?
        | FindSelectionUnion<i1, p1>
        | FindSelectionUnion<i2, p2>
        | FindSelectionUnion<i3, p3>
    : [i, p] extends [
        readonly [infer i1, infer i2],
        readonly [infer p1, infer p2]
      ]
    ? FindSelectionUnion<i1, p1> | FindSelectionUnion<i2, p2>
    : FindSelectionUnion<ii, pp> extends infer selected
    ? { [k in keyof selected]: selected[k][] }
    : never
  : [IsPlainObject<i>, IsPlainObject<p>] extends [true, true]
  ? ValueOf<{ [k in keyof i & keyof p]: FindSelectionUnion<i[k], p[k]> }>
  : never;

export type FindSelected<i, p> = Compute<
  UnionToIntersection<FindSelectionUnion<i, p>>
>;
