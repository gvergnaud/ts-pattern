import type { Pattern, GuardValue, ExhaustivePattern } from './Pattern';
import type { ExtractPreciseValue } from './ExtractPreciseValue';
import type { InvertPattern } from './InvertPattern';
import type { DistributeUnions } from './DistributeUnions';
import type { UnionToIntersection } from './helpers';
import type { FindSelected } from './FindSelected';

// We fall back to `a` if we weren't able to extract anything more precise
export type MatchedValue<a, p extends Pattern<a>> = ExtractPreciseValue<
  a,
  InvertPattern<p>
> extends never
  ? a
  : ExtractPreciseValue<a, InvertPattern<p>>;

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
};

type NonExhaustivePattern<i> = { __nonExhaustive: never } & i;

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
  run: [i] extends [never] ? () => o : NonExhaustivePattern<i>;
};
