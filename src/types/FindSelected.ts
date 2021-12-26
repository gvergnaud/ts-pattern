import type * as symbols from '../symbols';
import type { Cast, IsAny, UnionToIntersection } from './helpers';
import type {
  SelectPattern,
  MatchProtocolPattern,
  GetMatchSelection,
  GuardPattern,
  Pattern,
} from './Pattern';

export type SelectionsRecord = Record<string, [unknown, unknown[]]>;

export type RecordSelection<rec extends SelectionsRecord> = {
  type: 'record';
  record: rec;
};
export type PatternSelection<p extends Pattern<any>> = {
  type: 'fromPattern';
  pattern: p;
};
export type ListPatternSelection<p extends Pattern<any>> = {
  type: 'listPattern';
  pattern: p;
};
export type NoneSelection = {
  type: 'none';
};

export type SelectionType =
  | RecordSelection<any>
  | PatternSelection<any>
  | ListPatternSelection<any>
  | NoneSelection;

export type FindSelectionUnion<
  i,
  p,
  // path just serves as an id, to identify different anonymous patterns which have the same type
  path extends any[] = []
> = IsAny<i> extends true
  ? never
  : p extends GuardPattern<any, any, infer sel>
  ? sel extends RecordSelection<infer selections>
    ? {
        [k in keyof selections]: [
          selections[k][0],
          [...path, ...selections[k][1]]
        ];
      }
    : sel extends PatternSelection<infer pattern>
    ? FindSelectionUnion<i, pattern> extends infer selectionUnion
      ? {
          [k in keyof selectionUnion]: selectionUnion[k] extends [
            infer v,
            infer subpath
          ]
            ? [v, subpath]
            : never;
        }
      : never
    : sel extends ListPatternSelection<infer pattern>
    ? i extends (infer ii)[]
      ? FindSelectionUnion<ii, pattern> extends infer selectionUnion
        ? {
            [k in keyof selectionUnion]: selectionUnion[k] extends [
              infer v,
              infer subpath
            ]
              ? [v[], subpath]
              : never;
          }
        : never
      : never
    : never
  : p extends SelectPattern<infer k>
  ? { [kk in k]: [i, path] }
  : p extends readonly (infer pp)[]
  ? i extends readonly (infer ii)[]
    ? [i, p] extends [
        readonly [infer i1, infer i2, infer i3, infer i4, infer i5],
        readonly [infer p1, infer p2, infer p3, infer p4, infer p5]
      ]
      ?
          | FindSelectionUnion<i1, p1, [...path, 1]>
          | FindSelectionUnion<i2, p2, [...path, 2]>
          | FindSelectionUnion<i3, p3, [...path, 3]>
          | FindSelectionUnion<i4, p4, [...path, 4]>
          | FindSelectionUnion<i5, p5, [...path, 5]>
      : [i, p] extends [
          readonly [infer i1, infer i2, infer i3, infer i4],
          readonly [infer p1, infer p2, infer p3, infer p4]
        ]
      ?
          | FindSelectionUnion<i1, p1, [...path, 1]>
          | FindSelectionUnion<i2, p2, [...path, 2]>
          | FindSelectionUnion<i3, p3, [...path, 3]>
          | FindSelectionUnion<i4, p4, [...path, 4]>
      : [i, p] extends [
          readonly [infer i1, infer i2, infer i3],
          readonly [infer p1, infer p2, infer p3]
        ]
      ?
          | FindSelectionUnion<i1, p1, [...path, 1]>
          | FindSelectionUnion<i2, p2, [...path, 2]>
          | FindSelectionUnion<i3, p3, [...path, 3]>
      : [i, p] extends [
          readonly [infer i1, infer i2],
          readonly [infer p1, infer p2]
        ]
      ?
          | FindSelectionUnion<i1, p1, [...path, 1]>
          | FindSelectionUnion<i2, p2, [...path, 2]>
      : FindSelectionUnion<ii, pp, [...path, 1]>
    : never
  : p extends object
  ? i extends object
    ? {
        [k in keyof p]: k extends keyof i
          ? FindSelectionUnion<i[k], p[k], [...path, k]>
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
export type SelectionToArgs<selections extends SelectionsRecord, i> = [
  keyof selections
] extends [never]
  ? i
  : symbols.AnonymousSelectKey extends keyof selections
  ? // If the path is never, it means several anonymous patterns were `&` together
    [selections[symbols.AnonymousSelectKey][1]] extends [never]
    ? SeveralAnonymousSelectError
    : keyof selections extends symbols.AnonymousSelectKey
    ? selections[symbols.AnonymousSelectKey][0]
    : MixedNamedAndAnonymousSelectError
  : { [k in keyof selections]: selections[k][0] };

export type Selections<i, p> = Cast<
  UnionToIntersection<{} | FindSelectionUnion<i, p>>,
  SelectionsRecord
>;

export type FindSelected<i, p> = SelectionToArgs<Selections<i, p>, i>;
