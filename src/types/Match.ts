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
export type Match<i, o, patternValueTuples extends [any, any] = never> = {
  /**
   * ### Match.with
   * If the data matches the pattern provided as first argument,
   * use this branch and execute the handler function.
   **/
  with<p extends Pattern<i>, c, value = MatchedValue<i, InvertPattern<p>>>(
    pattern: p,
    handler: (
      selections: FindSelected<value, p>,
      value: value
    ) => PickReturnValue<o, c>
  ): Match<i, PickReturnValue<o, c>, patternValueTuples | [p, value]>;

  with<
    p1 extends Pattern<i>,
    p2 extends Pattern<i>,
    c,
    p = p1 | p2,
    value = p extends any ? MatchedValue<i, InvertPattern<p>> : never
  >(
    pattern1: p1,
    pattern2: p2,
    handler: (value: value) => PickReturnValue<o, c>
  ): Match<
    i,
    PickReturnValue<o, c>,
    patternValueTuples | (p extends any ? [p, value] : never)
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
    PickReturnValue<o, c>,
    patternValueTuples | (p extends any ? [p, value] : never)
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
    | patternValueTuples
    | (pred extends (value: any) => value is infer narrowed
        ? [GuardPattern<unknown, narrowed>, value]
        : never)
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
    | patternValueTuples
    | (pred extends (value: any) => value is infer narrowed
        ? [GuardPattern<unknown, narrowed>, value]
        : never)
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

type DeepExcludeAll<a, tuple extends [any, any]> = DeepExclude<
  a,
  tuple extends any ? InvertPatternForExclude<tuple[0], tuple[1]> : never
>;
