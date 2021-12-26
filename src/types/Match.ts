import type { Pattern, GuardValue, GuardPattern } from './Pattern';
import type { ExtractPreciseValue } from './ExtractPreciseValue';
import type { InvertPatternForExclude, InvertPattern } from './InvertPattern';
import type { DeepExclude } from './DeepExclude';
import type { WithDefault, Union } from './helpers';
import type { FindSelected } from './FindSelected';

// We fall back to `a` if we weren't able to extract anything more precise
export type MatchedValue<a, invpattern> = WithDefault<
  ExtractPreciseValue<a, invpattern>,
  a
>;

export type Unset = '@ts-pattern/unset';

export type PickReturnValue<a, b> = a extends Unset ? b : a;

type NonExhaustiveError<i> = { __nonExhaustive: never } & i;

/**
 * #### Match
 * An interface to create a pattern matching clause.
 */
export type Match<
  i,
  o,
  patternValueTuples extends [any, any] = never,
  inferredOutput = never
> = {
  /**
   * #### Match.with
   *
   * If the input matches the pattern provided as first argument,
   * execute the handler function and return its result.
   **/
  with<p extends Pattern<i>, c, value = MatchedValue<i, InvertPattern<p>>>(
    pattern: p,
    handler: (
      selections: FindSelected<value, p>,
      value: value
    ) => PickReturnValue<o, c>
  ): Match<i, o, patternValueTuples | [p, value], Union<inferredOutput, c>>;

  with<
    pat extends Pattern<i>,
    pred extends (value: MatchedValue<i, InvertPattern<pat>>) => unknown,
    c,
    value = GuardValue<pred>
  >(
    pattern: pat,
    predicate: pred,
    handler: (
      selections: FindSelected<value, pat>,
      value: value
    ) => PickReturnValue<o, c>
  ): Match<
    i,
    o,
    | patternValueTuples
    | (pred extends (value: any) => value is infer narrowed
        ? [GuardPattern<unknown, narrowed>, value]
        : never),
    Union<inferredOutput, c>
  >;

  with<
    ps extends [Pattern<i>, ...Pattern<i>[]],
    c,
    p = ps[number],
    value = p extends any ? MatchedValue<i, InvertPattern<p>> : never
  >(
    ...args: [...patterns: ps, handler: (value: value) => PickReturnValue<o, c>]
  ): Match<
    i,
    o,
    patternValueTuples | (p extends any ? [p, value] : never),
    Union<inferredOutput, c>
  >;

  /**
   * #### Match.when
   *
   * When the first function returns a truthy value,
   * execute the handler function and return its result.
   **/
  when: <pred extends (value: i) => unknown, c, value = GuardValue<pred>>(
    predicate: pred,
    handler: (value: value) => PickReturnValue<o, c>
  ) => Match<
    i,
    o,
    | patternValueTuples
    | (pred extends (value: any) => value is infer narrowed
        ? [GuardPattern<unknown, narrowed>, value]
        : never),
    Union<inferredOutput, c>
  >;

  /**
   * #### Match.otherwise
   *
   * takes a function returning the **default value**.
   * and return the result of the pattern matching expression.
   *
   * Equivalent to `.with(__, () => x).run()`
   **/
  otherwise: <c>(
    handler: (value: i) => PickReturnValue<o, c>
  ) => PickReturnValue<o, Union<inferredOutput, c>>;

  /**
   * #### Match.exhaustive
   *
   * Runs the pattern matching expression and return the result value.
   *
   * If this is of type `NonExhaustiveError`, it means you aren't matching
   * every cases, and you should probably add another `.with(...)` clause
   * to prevent potential runtime errors.
   *
   * */
  exhaustive: DeepExcludeAll<i, patternValueTuples> extends infer remainingCases
    ? [remainingCases] extends [never]
      ? () => PickReturnValue<o, inferredOutput>
      : NonExhaustiveError<remainingCases>
    : never;

  /**
   * #### Match.run
   * Runs the pattern matching expression and return the result.
   * */
  run: () => PickReturnValue<o, inferredOutput>;
};

type DeepExcludeAll<a, tuple extends [any, any]> = DeepExclude<
  a,
  tuple extends any ? InvertPatternForExclude<tuple[0], tuple[1]> : never
>;
