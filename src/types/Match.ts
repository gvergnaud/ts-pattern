import type { Pattern, GuardValue, GuardPattern } from './Pattern';
import type { ExtractPreciseValue } from './ExtractPreciseValue';
import type { InvertPatternForExclude, InvertPattern } from './InvertPattern';
import type { DeepExclude } from './DeepExclude';
import type { WithDefault } from './helpers';
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
 * ### Match
 * An interface to create a pattern matching clause.
 */
export type Match<i, o, patternValueTuples extends any[] = []> = {
  /**
   * ### Match.with
   * If the data matches the pattern provided as first argument,
   * use this branch and execute the handler function.
   **/
  with<p extends Pattern<i>, c, value = MatchedValue<i, InvertPattern<p>>>(
    pattern: p,
    handler: (
      ...args: [...selections: FindSelected<value, p>, value: value]
    ) => PickReturnValue<o, c>
  ): Match<i, PickReturnValue<o, c>, [...patternValueTuples, [p, value]]>;

  with<
    ps extends [Pattern<i>, Pattern<i>, ...Pattern<i>[]],
    c,
    p = ps[number],
    value = p extends any ? MatchedValue<i, InvertPattern<p>> : never
  >(
    ...args: [...patterns: ps, handler: (value: value) => PickReturnValue<o, c>]
  ): Match<
    i,
    PickReturnValue<o, c>,
    [...patternValueTuples, ...MapPatternToTuple<ps, value>]
  >;

  with<
    pat extends Pattern<i>,
    pred extends (value: MatchedValue<i, InvertPattern<pat>>) => unknown,
    c,
    value = GuardValue<pred>
  >(
    pattern: pat,
    predicate: pred,
    handler: (
      value: value,
      selections: FindSelected<i, pat>
    ) => PickReturnValue<o, c>
  ): Match<
    i,
    PickReturnValue<o, c>,
    pred extends (value: any) => value is infer narrowed
      ? [...patternValueTuples, [GuardPattern<unknown, narrowed>, value]]
      : patternValueTuples
  >;

  /**
   * ### Match.when
   * When the first function returns a truthy value,
   * use this branch and execute the handler function.
   **/
  when: <pred extends (value: i) => unknown, c, value = GuardValue<pred>>(
    predicate: pred,
    handler: (value: value) => PickReturnValue<o, c>
  ) => Match<
    i,
    PickReturnValue<o, c>,
    pred extends (value: any) => value is infer narrowed
      ? [...patternValueTuples, [GuardPattern<unknown, narrowed>, value]]
      : patternValueTuples
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
   * ### Match.exhaustive
   * Runs the pattern matching and return a value.
   *
   * If this is of type `NonExhaustiveError`, it means you aren't matching
   * every cases, and you should probably add a  another `.with(...)` clause
   * to prevent potential runtime errors.
   * */
  exhaustive: DeepExcludeAll<i, patternValueTuples> extends infer remainingCases
    ? [remainingCases] extends [never]
      ? () => o
      : NonExhaustiveError<remainingCases>
    : never;

  /**
   * ### Match.run
   * Runs the pattern matching and return a value.
   * */
  run: () => o;
};

type DeepExcludeAll<a, tuples extends any[]> = tuples extends [
  [infer p, infer value],
  ...infer rest
]
  ? DeepExcludeAll<DeepExclude<a, InvertPatternForExclude<p, value>>, rest>
  : a;

type MapPatternToTuple<
  ps extends any[],
  value,
  output extends any[] = []
> = ps extends [infer p, ...infer rest]
  ? MapPatternToTuple<rest, value, [...output, [p, value]]>
  : output;
