import type * as symbols from '../internals/symbols';
import type { Cast, Equal, IsAny, TupleKeys, UnionToTuple } from './helpers';
import type { ArrayP, Matcher, Pattern } from './Pattern';

type SelectionsRecord = Record<string, [unknown, unknown[]]>;

export type None = {
  type: 'none';
};
export type Some<key extends string> = {
  type: 'some';
  key: key;
};

export type SelectionType = None | Some<string>;

type MapOptional<selections> = {
  [k in keyof selections]: selections[k] extends [infer v, infer subpath]
    ? [v | undefined, subpath]
    : never;
};

type MapList<selections> = {
  [k in keyof selections]: selections[k] extends [infer v, infer subpath]
    ? [v[], subpath]
    : never;
};

type ReduceFindSelectionUnion<
  i,
  ps extends any[],
  output = never
> = ps extends [infer head, ...infer tail]
  ? ReduceFindSelectionUnion<i, tail, output | FindSelectionUnion<i, head>>
  : output;

// FindSelectionUnion :: i -> p -> Union { [string]: [i, string[]] }
export type FindSelectionUnion<
  i,
  p,
  // path just serves as an id, to identify different anonymous patterns which have the same type
  path extends any[] = []
> = IsAny<i> extends true
  ? never
  : p extends Matcher<any, infer pattern, infer matcherType, infer sel>
  ? {
      select: sel extends Some<infer k>
        ? { [kk in k]: [i, path] } | FindSelectionUnion<i, pattern, path>
        : never;
      array: i extends (infer ii)[]
        ? MapList<FindSelectionUnion<ii, pattern>>
        : never;
      optional: MapOptional<FindSelectionUnion<i, pattern>>;
      or: MapOptional<ReduceFindSelectionUnion<i, Cast<pattern, any[]>>>;
      and: ReduceFindSelectionUnion<i, Cast<pattern, any[]>>;
      not: never;
      default: sel extends Some<infer k> ? { [kk in k]: [i, path] } : never;
    }[matcherType]
  : p extends readonly (infer pp)[]
  ? i extends readonly (infer ii)[]
    ? ArrayP<any, any> extends p[number]
      ? p extends readonly [infer p1, ...ArrayP<any, infer pRest>[]]
        ? i extends readonly [infer i1, ...(infer iRest)[]]
          ?
              | FindSelectionUnion<i1, p1, [...path, 0]>
              | FindSelectionUnion<
                  iRest[],
                  ArrayP<any, pRest>,
                  [...path, 'rest']
                >
          :
              | FindSelectionUnion<ii, p1, [...path, 0]>
              | FindSelectionUnion<ii[], ArrayP<any, pRest>, [...path, 'rest']>
        : p extends readonly [infer p1, infer p2, ...ArrayP<any, infer pRest>[]]
        ? i extends readonly [infer i1, infer i2, ...(infer iRest)[]]
          ?
              | FindSelectionUnion<i1, p1, [...path, 0]>
              | FindSelectionUnion<i2, p2, [...path, 1]>
              | FindSelectionUnion<
                  iRest[],
                  ArrayP<any, pRest>,
                  [...path, 'rest']
                >
          :
              | FindSelectionUnion<ii, p1, [...path, 0]>
              | FindSelectionUnion<ii, p2, [...path, 1]>
              | FindSelectionUnion<ii[], ArrayP<any, pRest>, [...path, 'rest']>
        : p extends readonly [...ArrayP<any, infer pRest>[], infer p1]
        ? i extends readonly [...(infer iRest)[], infer i1]
          ?
              | FindSelectionUnion<i1, p1, [...path, 0]>
              | FindSelectionUnion<
                  iRest[],
                  ArrayP<any, pRest>,
                  [...path, 'rest']
                >
          :
              | FindSelectionUnion<ii, p1, [...path, 0]>
              | FindSelectionUnion<ii[], ArrayP<any, pRest>, [...path, 'rest']>
        : p extends readonly [...ArrayP<any, infer pRest>[], infer p1, infer p2]
        ? i extends readonly [...(infer iRest)[], infer i1, infer i2]
          ?
              | FindSelectionUnion<i1, p1, [...path, 0]>
              | FindSelectionUnion<i2, p2, [...path, 1]>
              | FindSelectionUnion<
                  iRest[],
                  ArrayP<any, pRest>,
                  [...path, 'rest']
                >
          :
              | FindSelectionUnion<ii, p1, [...path, 0]>
              | FindSelectionUnion<ii, p2, [...path, 1]>
              | FindSelectionUnion<ii[], ArrayP<any, pRest>, [...path, 'rest']>
        : p extends readonly [infer p1, ...ArrayP<any, infer pRest>[], infer p2]
        ? i extends readonly [infer i1, ...(infer iRest)[], infer i2]
          ?
              | FindSelectionUnion<i1, p1, [...path, 0]>
              | FindSelectionUnion<i2, p2, [...path, 1]>
              | FindSelectionUnion<
                  iRest[],
                  ArrayP<any, pRest>,
                  [...path, 'rest']
                >
          :
              | FindSelectionUnion<ii, p1, [...path, 0]>
              | FindSelectionUnion<ii, p2, [...path, 1]>
              | FindSelectionUnion<ii[], ArrayP<any, pRest>, [...path, 'rest']>
        : p extends readonly [any, ...any[]]
        ? i extends readonly [any, ...any[]]
          ? {
              [k in TupleKeys & keyof p & keyof i]: FindSelectionUnion<
                i[k],
                p[k],
                [...path, k]
              >;
            }[TupleKeys]
          : FindSelectionUnion<ii, p[number], [...path, 0]>
        : FindSelectionUnion<ii, pp, [...path, 0]>
      : p extends readonly [any, ...any[]]
      ? i extends readonly [any, ...any[]]
        ? {
            [k in TupleKeys & keyof p & keyof i]: FindSelectionUnion<
              i[k],
              p[k],
              [...path, k]
            >;
          }[TupleKeys]
        : FindSelectionUnion<ii, p[number], [...path, 0]>
      : FindSelectionUnion<ii, pp, [...path, 0]>
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

export type SelectionToArgs<selections extends SelectionsRecord> =
  symbols.anonymousSelectKey extends keyof selections
    ? // If the path is never, it means several anonymous patterns were `&` together
      [selections[symbols.anonymousSelectKey][1]] extends [never]
      ? SeveralAnonymousSelectError
      : keyof selections extends symbols.anonymousSelectKey
      ? selections[symbols.anonymousSelectKey][0]
      : MixedNamedAndAnonymousSelectError
    : { [k in keyof selections]: selections[k][0] };

type ConcatSelections<
  a extends SelectionsRecord,
  b extends SelectionsRecord
> = {
  // keys both on output and sel
  [k in keyof a & keyof b]: [a[k][0] | b[k][0], a[k][1] & b[k][1]]; // the path has to be the same
} & {
  // keys of a
  [k in Exclude<keyof a, keyof b>]: a[k];
} & {
  // keyso of b
  [k in Exclude<keyof b, keyof a>]: b[k];
};

type ReduceToRecord<
  selections extends any[],
  output extends SelectionsRecord = {}
> = selections extends [infer sel, ...infer rest]
  ? ReduceToRecord<rest, ConcatSelections<Cast<sel, SelectionsRecord>, output>>
  : output;

export type Selections<i, p> = FindSelectionUnion<i, p> extends infer u
  ? [u] extends [never]
    ? i
    : SelectionToArgs<ReduceToRecord<UnionToTuple<u>>>
  : i;

export type FindSelected<i, p> =
  // This happens if the provided pattern didn't extend Pattern<i>,
  // Because the type checker falls back on the general `Pattern<i>` type
  // in this case.
  Equal<p, Pattern<i>> extends true ? i : Selections<i, p>;
