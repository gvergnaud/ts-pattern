import { Pattern, SelectPattern, GuardValue } from './Pattern';
import { ExtractPreciseValue } from './ExtractPreciseValue';
import { InvertPattern } from './InvertPattern';
import { ValueOf, UnionToIntersection } from './helpers';

// We fall back to `a` if we weren't able to extract anything more precise
export type MatchedValue<a, p extends Pattern<a>> = ExtractPreciseValue<
  a,
  InvertPattern<p>
> extends never
  ? a
  : ExtractPreciseValue<a, InvertPattern<p>>;

// Infinite recursion is forbidden in typescript, so we have
// to trick this by duplicating type and compute its result
// on a predefined number of recursion levels.
type FindSelected<a, b> = b extends SelectPattern<infer Key>
  ? { [k in Key]: a }
  : [a, b] extends [(infer aa)[], [infer p]]
  ? { [k in keyof FindSelected1<aa, p>]: FindSelected1<aa, p>[k][] }
  : [a, b] extends [object, object]
  ? ValueOf<{ [k in keyof a & keyof b]: FindSelected1<a[k], b[k]> }>
  : never;

type FindSelected1<a, b> = b extends SelectPattern<infer Key>
  ? { [k in Key]: a }
  : [a, b] extends [(infer aa)[], [infer p]]
  ? { [k in keyof FindSelected2<aa, p>]: FindSelected2<aa, p>[k][] }
  : [a, b] extends [object, object]
  ? ValueOf<{ [k in keyof a & keyof b]: FindSelected2<a[k], b[k]> }>
  : never;

type FindSelected2<a, b> = b extends SelectPattern<infer Key>
  ? { [k in Key]: a }
  : [a, b] extends [(infer aa)[], [infer p]]
  ? { [k in keyof FindSelected3<aa, p>]: FindSelected3<aa, p>[k][] }
  : [a, b] extends [object, object]
  ? ValueOf<{ [k in keyof a & keyof b]: FindSelected3<a[k], b[k]> }>
  : never;

type FindSelected3<a, b> = b extends SelectPattern<infer Key>
  ? { [k in Key]: a }
  : [a, b] extends [(infer aa)[], [infer p]]
  ? { [k in keyof FindSelected4<aa, p>]: FindSelected4<aa, p>[k][] }
  : [a, b] extends [object, object]
  ? ValueOf<{ [k in keyof a & keyof b]: FindSelected4<a[k], b[k]> }>
  : never;

type FindSelected4<a, b> = b extends SelectPattern<infer Key>
  ? { [k in Key]: a }
  : never;

export type ExtractSelections<a, p extends Pattern<a>> = UnionToIntersection<
  FindSelected<MatchedValue<a, p>, p>
>;

export type Unset = '@match/unset';

export type PickReturnValue<a, b> = a extends Unset ? b : a;

export type ExcludePattern<a, p> = a extends string ? Exclude<a, p> : a;

/**
 * ### Match
 * An interface to create a pattern matching clause.
 */
export type Match<a, b> = {
  /**
   * ### Match.with
   * If the data matches the pattern provided as first argument,
   * use this branch and execute the handler function.
   **/
  with<p extends Pattern<a>, c>(
    pattern: p,
    handler: (
      value: MatchedValue<a, p>,
      selections: ExtractSelections<a, p>
    ) => PickReturnValue<b, c>
  ): Match<ExcludePattern<a, p>, PickReturnValue<b, c>>;
  with<
    pat extends Pattern<a>,
    pred extends (value: MatchedValue<a, pat>) => unknown,
    c
  >(
    pattern: pat,
    predicate: pred,
    handler: (
      value: GuardValue<pred>,
      selections: ExtractSelections<a, pat>
    ) => PickReturnValue<b, c>
  ): Match<a, PickReturnValue<b, c>>;

  with<
    pat extends Pattern<a>,
    pred extends (value: MatchedValue<a, pat>) => unknown,
    pred2 extends (value: GuardValue<pred>) => unknown,
    c
  >(
    pattern: pat,
    predicate: pred,
    predicate2: pred2,
    handler: (
      value: GuardValue<pred2>,
      selections: ExtractSelections<a, pat>
    ) => PickReturnValue<b, c>
  ): Match<a, PickReturnValue<b, c>>;

  with<
    pat extends Pattern<a>,
    pred extends (value: MatchedValue<a, pat>) => unknown,
    pred2 extends (value: GuardValue<pred>) => unknown,
    pred3 extends (value: GuardValue<pred2>) => unknown,
    c
  >(
    pattern: pat,
    predicate: pred,
    predicate2: pred2,
    predicate3: pred3,
    handler: (
      value: GuardValue<pred3>,
      selections: ExtractSelections<a, pat>
    ) => PickReturnValue<b, c>
  ): Match<a, PickReturnValue<b, c>>;

  /**
   * ### Match.when
   * When the first function returns a truthy value,
   * use this branch and execute the handler function.
   **/
  when: <p extends (value: a) => unknown, c>(
    predicate: p,
    handler: (value: GuardValue<p>) => PickReturnValue<b, c>
  ) => Match<a, PickReturnValue<b, c>>;

  /**
   * ### Match.otherwise
   * takes a function returning the default value
   * and return the matched result.
   *
   * Equivalent to `.with(__, () => x).run()`
   **/
  otherwise: <c>(handler: () => PickReturnValue<b, c>) => PickReturnValue<b, c>;

  /**
   * ### Match.run
   * Runs the pattern matching and return a value.
   * */
  run: () => b;

  /**
   * ### Match.exhaustive
   * Will yield a type error if all cases have not been handled
   *
   * nb: Only works when the matched value extends string
   */
  exhaustive: [a] extends [never] ? () => Match<a, b>
  : never;
};
