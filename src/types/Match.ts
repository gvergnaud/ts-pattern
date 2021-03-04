import type { Pattern } from './Pattern';
import type { ExtractPreciseValue } from './ExtractPreciseValue';
import type { InvertNotPattern, InvertPattern } from './InvertPattern';
import type { ReduceDeepExclude } from './DeepExclude';
import type { WithDefault } from './helpers';
import type { FindSelected } from './FindSelected';

// We fall back to `a` if we weren't able to extract anything more precise
export type MatchedValue<a, invpattern> = WithDefault<
  ExtractPreciseValue<a, invpattern>,
  a
>;

export type Unset = '@ts-pattern/unset';

export type PickReturnValue<a, b> = a extends Unset ? b : a;

type NonExhaustivePattern<i> = { __nonExhaustive: never } & i;

type MapInvertPattern<ps extends any[], value> = ps extends [
  infer p,
  ...infer rest
]
  ? [
      InvertNotPattern<InvertPattern<p>, value>,
      ...MapInvertPattern<rest, value>
    ]
  : [];

/**
 * ### Match
 * An interface to create a pattern matching clause.
 */
export type Match<i, o, patterns extends any[]> = {
  /**
   * ### Match.with
   * If the data matches the pattern provided as first argument,
   * use this branch and execute the handler function.
   **/
  with<
    p extends Pattern<i>,
    c,
    invpattern = InvertPattern<p>,
    value = MatchedValue<i, invpattern>
  >(
    pattern: p,
    handler: (
      ...args: [...selections: FindSelected<value, p>, value: value]
    ) => PickReturnValue<o, c>
  ): Match<
    i,
    PickReturnValue<o, c>,
    [...patterns, InvertNotPattern<invpattern, value>]
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
    [...patterns, MapInvertPattern<ps, value>]
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
   * If this is of type `NonExhaustivePattern`, it means you aren't matching
   * every cases, and you should probably add a  another `.with(...)` clause
   * to prevent potential runtime errors.
   * */
  exhaustive: ReduceDeepExclude<i, patterns> extends infer remainingCases
    ? [remainingCases] extends [never]
      ? () => o
      : NonExhaustivePattern<remainingCases>
    : never;

  /**
   * ### Match.run
   * Runs the pattern matching and return a value.
   * */
  run: () => o;
};
