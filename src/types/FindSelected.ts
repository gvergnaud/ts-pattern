import type * as symbols from '../symbols';
import type { Cast, Equal, IsAny, UnionToIntersection } from './helpers';
import type {
  NamedSelectPattern,
  AnonymousSelectPattern,
  OptionalPattern,
  NotPattern,
  ListPattern,
  Pattern,
} from './Pattern';

export type FindSelectionUnion<
  i,
  p,
  isOptional extends boolean,
  // path just serves as an id, to identify different anonymous patterns which have the same type
  path extends any[] = []
> = IsAny<i> extends true
  ? never
  : p extends NamedSelectPattern<infer k>
  ? {
      [kk in k]: [i | (isOptional extends true ? undefined : never), path];
    }
  : p extends AnonymousSelectPattern
  ? {
      [kk in symbols.AnonymousSelect]: [
        i | (isOptional extends true ? undefined : never),
        path
      ];
    }
  : p extends OptionalPattern<infer p>
  ? FindSelectionUnion<i, p, true>
  : p extends NotPattern<any>
  ? never
  : p extends ListPattern<any>
  ? i extends readonly (infer ii)[]
    ? FindSelectionUnion<
        ii,
        p[1],
        isOptional,
        [...path, number]
      > extends infer selectionUnion
      ? {
          [k in keyof selectionUnion]: selectionUnion[k] extends [
            infer v,
            infer path
          ]
            ? [v[], path]
            : never;
        }
      : never
    : never
  : p extends readonly (infer pp)[]
  ? i extends readonly (infer ii)[]
    ? [i, p] extends [
        readonly [infer i1, infer i2, infer i3, infer i4, infer i5],
        readonly [infer p1, infer p2, infer p3, infer p4, infer p5]
      ]
      ?
          | FindSelectionUnion<i1, p1, isOptional, [...path, 1]>
          | FindSelectionUnion<i2, p2, isOptional, [...path, 2]>
          | FindSelectionUnion<i3, p3, isOptional, [...path, 3]>
          | FindSelectionUnion<i4, p4, isOptional, [...path, 4]>
          | FindSelectionUnion<i5, p5, isOptional, [...path, 5]>
      : [i, p] extends [
          readonly [infer i1, infer i2, infer i3, infer i4],
          readonly [infer p1, infer p2, infer p3, infer p4]
        ]
      ?
          | FindSelectionUnion<i1, p1, isOptional, [...path, 1]>
          | FindSelectionUnion<i2, p2, isOptional, [...path, 2]>
          | FindSelectionUnion<i3, p3, isOptional, [...path, 3]>
          | FindSelectionUnion<i4, p4, isOptional, [...path, 4]>
      : [i, p] extends [
          readonly [infer i1, infer i2, infer i3],
          readonly [infer p1, infer p2, infer p3]
        ]
      ?
          | FindSelectionUnion<i1, p1, isOptional, [...path, 1]>
          | FindSelectionUnion<i2, p2, isOptional, [...path, 2]>
          | FindSelectionUnion<i3, p3, isOptional, [...path, 3]>
      : [i, p] extends [
          readonly [infer i1, infer i2],
          readonly [infer p1, infer p2]
        ]
      ?
          | FindSelectionUnion<i1, p1, isOptional, [...path, 1]>
          | FindSelectionUnion<i2, p2, isOptional, [...path, 2]>
      : [i, p] extends [readonly (infer i1)[], readonly [infer p1]]
      ? FindSelectionUnion<i1, p1, isOptional, [...path, 1]>
      : never
    : never
  : p extends object
  ? i extends object
    ? {
        [k in keyof p]: k extends keyof i
          ? FindSelectionUnion<i[k], p[k], isOptional, [...path, k]>
          : never;
      }[keyof p]
    : never
  : never;

export type SeveralAnonymousSelectError<
  a = 'You can only use a single anonymous selection (with `select()`) in your pattern. If you need to select multiple values, give them names with `select(<name>)` instead'
> = {
  __error: never;
} & a;

export type MixedNamedAndAnonymousSelectError<
  a = 'Mixing named selections (`select("name")`) and anonymous selections (`select()`) is forbiden. Please, only use named selections.'
> = {
  __error: never;
} & a;

// SelectionToArgs :: [number | string, value][] -> [...args]
type SelectionToArgs<
  selections extends Record<string, [unknown, unknown]>,
  i
> = [keyof selections] extends [never]
  ? i
  : IsAny<keyof selections> extends true
  ? i
  : symbols.AnonymousSelect extends keyof selections
  ? // If the path is never, it means several anonymous patterns were `&` together
    [selections[symbols.AnonymousSelect][1]] extends [never]
    ? SeveralAnonymousSelectError
    : keyof selections extends symbols.AnonymousSelect
    ? selections[symbols.AnonymousSelect][0]
    : MixedNamedAndAnonymousSelectError
  : { [k in keyof selections]: selections[k][0] };

export type FindSelected<i, p> =
  // This happens if the provided pattern didn't extend Pattern<i>,
  // Because the compiler falls back on the general `Pattern<i>` type
  // in this case.
  Equal<p, Pattern<i>> extends true
    ? i
    : SelectionToArgs<
        Cast<
          UnionToIntersection<{} | FindSelectionUnion<i, p, false>>,
          Record<string, [unknown, unknown]>
        >,
        i
      >;
