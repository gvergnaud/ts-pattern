import type { SelectPattern } from './Pattern';
import type { ValueOf } from './helpers';

export type FindSelected<i, p> = p extends SelectPattern<infer Key>
  ? { [k in Key]: i }
  : [i, p] extends [(infer i2)[], [infer p2]]
  ? FindSelected<i2, p2> extends infer selected
    ? { [k in keyof selected]: selected[k][] }
    : never
  : [i, p] extends [object, object]
  ? ValueOf<{ [k in keyof i & keyof p]: FindSelected<i[k], p[k]> }>
  : never;
