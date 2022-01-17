import type * as symbols from '../internals/symbols';
import type {
  Cast,
  Equal,
  IsAny,
  TupleKeys,
  UnionToIntersection,
} from './helpers';
import type { Matchable, Pattern } from './Pattern';

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

export type FindSelectionUnion<
  i,
  p,
  // path just serves as an id, to identify different anonymous patterns which have the same type
  path extends any[] = []
> = IsAny<i> extends true
  ? never
  : p extends Matchable<any, infer pattern, infer matcherType, infer sel>
  ? matcherType extends 'select'
    ? sel extends Some<infer k>
      ? { [kk in k]: [i, path] } | FindSelectionUnion<i, pattern, path>
      : never
    : matcherType extends 'array'
    ? i extends (infer ii)[]
      ? MapList<FindSelectionUnion<ii, pattern>>
      : never
    : matcherType extends 'optional'
    ? MapOptional<FindSelectionUnion<i, pattern>>
    : matcherType extends 'or'
    ? MapOptional<ReduceFindSelectionUnion<i, Cast<pattern, any[]>>>
    : matcherType extends 'and'
    ? ReduceFindSelectionUnion<i, Cast<pattern, any[]>>
    : sel extends Some<infer k>
    ? { [kk in k]: [i, path] }
    : never
  : p extends readonly [any, ...any[]]
  ? i extends readonly [any, ...any[]]
    ? {
        [k in TupleKeys & keyof i & keyof p]: FindSelectionUnion<
          i[k],
          p[k],
          [...path, k]
        >;
      }[TupleKeys & keyof i & keyof p]
    : i extends readonly (infer ii)[]
    ? FindSelectionUnion<ii, p[number], [...path, 0]>
    : never
  : p extends readonly (infer pp)[]
  ? i extends readonly (infer ii)[]
    ? FindSelectionUnion<ii, pp, [...path, 0]>
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
  : symbols.anonymousSelectKey extends keyof selections
  ? // If the path is never, it means several anonymous patterns were `&` together
    [selections[symbols.anonymousSelectKey][1]] extends [never]
    ? SeveralAnonymousSelectError
    : keyof selections extends symbols.anonymousSelectKey
    ? selections[symbols.anonymousSelectKey][0]
    : MixedNamedAndAnonymousSelectError
  : { [k in keyof selections]: selections[k][0] };

export type Selections<i, p> = Cast<
  // Intersection isn't really correct, we should OR values together
  UnionToIntersection<{} | FindSelectionUnion<i, p>>,
  SelectionsRecord
>;

export type FindSelected<i, p> =
  // This happens if the provided pattern didn't extend Pattern<i>,
  // Because the compiler falls back on the general `Pattern<i>` type
  // in this case.
  Equal<p, Pattern<i>> extends true ? i : SelectionToArgs<Selections<i, p>, i>;
