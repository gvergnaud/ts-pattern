import type { SelectPattern } from './Pattern';
import type { ValueOf } from './helpers';

export type FindSelected<a, b> = b extends SelectPattern<infer Key>
  ? { [k in Key]: a }
  : [a, b] extends [(infer aa)[], [infer p]]
  ? FindSelected<aa, p> extends infer selected
    ? { [k in keyof selected]: selected[k][] }
    : never
  : [a, b] extends [object, object]
  ? ValueOf<{ [k in keyof a & keyof b]: FindSelected<a[k], b[k]> }>
  : never;
