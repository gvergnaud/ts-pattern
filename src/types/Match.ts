import type {
  Pattern,
  SelectPattern,
  GuardValue,
  ExhaustivePattern,
} from './Pattern';
import type { ExtractPreciseValue } from './ExtractPreciseValue';
import type { InvertPattern } from './InvertPattern';
import type {
  IsLiteral,
  ValueOf,
  UnionToIntersection,
  ExcludeIfContainsNever,
} from './helpers';

// We fall back to `a` if we weren't able to extract anything more precise
export type MatchedValue<a, p extends Pattern<a>> = ExtractPreciseValue<
  a,
  InvertPattern<p>
> extends never
  ? a
  : ExtractPreciseValue<a, InvertPattern<p>>;

// Infinite recursion is forbidden in TypeScript < 4.1, so we have
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
  ): Match<a, PickReturnValue<b, c>>;
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
   * Converts the match expression into an exhaustive match,
   * checking that **all cases are handled**. `when` predicates
   * aren't supported on exhaustive matches.
   **/
  exhaustive: () => ExhaustiveMatch<a, b>;
};

type NonExhaustivePattern = { __nonExhaustive: never };

type Equal<a, b> = a extends b ? (b extends a ? true : false) : false;

type SmartExclude<a, b> = Equal<a, Exclude<a, b>> extends true
  ? ExcludeIfContainsNever<
      [a, b] extends [(infer a1)[], (infer b1)[]]
        ? [a, b] extends [
            [infer a1, infer a2, infer a3, infer a4, infer a5],
            [infer b1, infer b2, infer b3, infer b4, infer b5]
          ]
          ? [
              SmartExclude<a1, b1>,
              SmartExclude<a2, b2>,
              SmartExclude<a3, b3>,
              SmartExclude<a4, b4>,
              SmartExclude<a5, b5>
            ]
          : [a, b] extends [
              [infer a1, infer a2, infer a3, infer a4],
              [infer b1, infer b2, infer b3, infer b4]
            ]
          ? [
              SmartExclude<a1, b1>,
              SmartExclude<a2, b2>,
              SmartExclude<a3, b3>,
              SmartExclude<a4, b4>
            ]
          : [a, b] extends [
              [infer a1, infer a2, infer a3],
              [infer b1, infer b2, infer b3]
            ]
          ? [SmartExclude<a1, b1>, SmartExclude<a2, b2>, SmartExclude<a3, b3>]
          : [a, b] extends [[infer a1, infer a2], [infer b1, infer b2]]
          ? [SmartExclude<a1, b1>, SmartExclude<a2, b2>]
          : SmartExclude<a1, b1>[]
        : [a, b] extends [object, object]
        ? { [k in keyof a & keyof b]: SmartExclude<a[k], b[k]> }
        : Exclude<a, b>
    >
  : Exclude<a, b>;

/**
 * ### ExhaustiveMatch
 * An interface to create an exhaustive pattern matching clause.
 */
export type ExhaustiveMatch<i, o> = {
  /**
   * ### Match.with
   * If the data matches the pattern provided as first argument,
   * use this branch and execute the handler function.
   **/
  with<p extends ExhaustivePattern<i>, c>(
    pattern: p,
    handler: (
      value: MatchedValue<i, p>,
      selections: ExtractSelections<i, p>
    ) => PickReturnValue<o, c>
  ): ExhaustiveMatch<
    Exclude<i, ExtractPreciseValue<i, InvertPattern<p>>>,
    PickReturnValue<o, c>
  >;

  /**
   * ### Match.otherwise
   * takes a function returning the default value
   * and return the matched result.
   *
   * Equivalent to `.with(__, () => x).run()`
   **/
  otherwise: <c>(handler: () => PickReturnValue<o, c>) => PickReturnValue<o, c>;

  /**
   * ### Match.run
   * Runs the pattern matching and return a value.
   *
   * If this is of type `NonExhaustivePattern`, it means you aren't matching
   * every cases, and you should probably add a  another `.with(...)` clause
   * to prevent potential runtime errors.
   * */
  run: [i] extends [never] ? () => o : NonExhaustivePattern;
};
