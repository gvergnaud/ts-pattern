import type { Pattern, GuardValue, ExhaustivePattern } from './Pattern';
import type { ExtractPreciseValue } from './ExtractPreciseValue';
import type { InvertPattern, InvertPatternForExclude } from './InvertPattern';
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

/**
 * ### Match
 * An interface to create a pattern matching clause.
 */
export type Match<i, o> = {
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
      value: value,
      selections: FindSelected<value, p>
    ) => PickReturnValue<o, c>
  ): Match<i, PickReturnValue<o, c>>;

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
  ): Match<i, PickReturnValue<o, c>>;

  with<
    p1 extends Pattern<i>,
    p2 extends Pattern<i>,
    p3 extends Pattern<i>,
    c,
    p = p1 | p2 | p3,
    value = p extends any ? MatchedValue<i, InvertPattern<p>> : never
  >(
    pattern1: p1,
    pattern2: p2,
    pattern3: p3,
    handler: (value: value) => PickReturnValue<o, c>
  ): Match<i, PickReturnValue<o, c>>;

  with<
    p1 extends Pattern<i>,
    p2 extends Pattern<i>,
    p3 extends Pattern<i>,
    p4 extends Pattern<i>,
    c,
    p = p1 | p2 | p3 | p4,
    value = p extends any ? MatchedValue<i, InvertPattern<p>> : never
  >(
    pattern1: p1,
    pattern2: p2,
    pattern3: p3,
    pattern4: p4,
    handler: (value: value) => PickReturnValue<o, c>
  ): Match<i, PickReturnValue<o, c>>;

  with<
    p1 extends Pattern<i>,
    p2 extends Pattern<i>,
    p3 extends Pattern<i>,
    p4 extends Pattern<i>,
    p5 extends Pattern<i>,
    c,
    p = p1 | p2 | p3 | p4 | p5,
    value = p extends any ? MatchedValue<i, InvertPattern<p>> : never
  >(
    pattern1: p1,
    pattern2: p2,
    pattern3: p3,
    pattern4: p4,
    pattern5: p5,
    handler: (value: value) => PickReturnValue<o, c>
  ): Match<i, PickReturnValue<o, c>>;

  with<
    pat extends Pattern<i>,
    pred extends (value: MatchedValue<i, InvertPattern<pat>>) => unknown,
    c
  >(
    pattern: pat,
    predicate: pred,
    handler: (
      value: GuardValue<pred>,
      selections: FindSelected<i, pat>
    ) => PickReturnValue<o, c>
  ): Match<i, PickReturnValue<o, c>>;

  with<
    pat extends Pattern<i>,
    pred extends (value: MatchedValue<i, InvertPattern<pat>>) => unknown,
    pred2 extends (value: GuardValue<pred>) => unknown,
    c
  >(
    pattern: pat,
    predicate: pred,
    predicate2: pred2,
    handler: (
      value: GuardValue<pred2>,
      selections: FindSelected<i, pat>
    ) => PickReturnValue<o, c>
  ): Match<i, PickReturnValue<o, c>>;

  with<
    pat extends Pattern<i>,
    pred extends (value: MatchedValue<i, InvertPattern<pat>>) => unknown,
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
      selections: FindSelected<i, pat>
    ) => PickReturnValue<o, c>
  ): Match<i, PickReturnValue<o, c>>;

  /**
   * ### Match.when
   * When the first function returns a truthy value,
   * use this branch and execute the handler function.
   **/
  when: <p extends (value: i) => unknown, c>(
    predicate: p,
    handler: (value: GuardValue<p>) => PickReturnValue<o, c>
  ) => Match<i, PickReturnValue<o, c>>;

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
   * */
  run: () => o;
};

export type EmptyMatch<i, o> = Match<i, o> & {
  /**
   * ### exhaustive
   * creates an exhaustive match expression checking
   * that **all cases are handled**. `when` predicates
   * aren't supported on exhaustive matches.
   **/
  exhaustive: () => ExhaustiveMatch<i, i, o>;
};

type NonExhaustiveError<i> = { __nonExhaustive: never } & i;

/**
 * ### ExhaustiveMatch
 * An interface to create an exhaustive pattern matching clause.
 */
export type ExhaustiveMatch<distributedInput, i, o> = {
  /**
   * ### Match.with
   * If the data matches the pattern provided as first argument,
   * use this branch and execute the handler function.
   **/
  with<
    p extends ExhaustivePattern<i>,
    c,
    invpattern = InvertPattern<p>,
    value = MatchedValue<i, invpattern>
  >(
    pattern: p,
    handler: (
      value: value,
      selections: FindSelected<value, p>
    ) => PickReturnValue<o, c>
  ): ExhaustiveMatch<
    // For performances, keep the origin input `i` even after we call DeepExclude
    // in it, because Pattern<i> is generally mucb easier to compute than
    // the Pattern<distributedInput>.
    DeepExclude<distributedInput, InvertPatternForExclude<p, value>>,
    i,
    PickReturnValue<o, c>
  >;

  with<
    p1 extends ExhaustivePattern<i>,
    p2 extends ExhaustivePattern<i>,
    c,
    p = p1 | p2,
    value = p extends any ? MatchedValue<i, InvertPattern<p>> : never
  >(
    pattern1: p1,
    pattern2: p2,
    handler: (value: value) => PickReturnValue<o, c>
  ): ExhaustiveMatch<
    DeepExclude<
      distributedInput,
      p extends any ? InvertPatternForExclude<p, value> : never
    >,
    i,
    PickReturnValue<o, c>
  >;

  with<
    p1 extends ExhaustivePattern<i>,
    p2 extends ExhaustivePattern<i>,
    p3 extends ExhaustivePattern<i>,
    c,
    p = p1 | p2 | p3,
    value = p extends any ? MatchedValue<i, InvertPattern<p>> : never
  >(
    pattern1: p1,
    pattern2: p2,
    pattern3: p3,
    handler: (value: value) => PickReturnValue<o, c>
  ): ExhaustiveMatch<
    DeepExclude<
      distributedInput,
      p extends any ? InvertPatternForExclude<p, value> : never
    >,
    i,
    PickReturnValue<o, c>
  >;

  with<
    p1 extends ExhaustivePattern<i>,
    p2 extends ExhaustivePattern<i>,
    p3 extends ExhaustivePattern<i>,
    p4 extends ExhaustivePattern<i>,
    c,
    p = p1 | p2 | p3 | p4,
    value = p extends any ? MatchedValue<i, InvertPattern<p>> : never
  >(
    pattern1: p1,
    pattern2: p2,
    pattern3: p3,
    pattern4: p4,
    handler: (value: value) => PickReturnValue<o, c>
  ): ExhaustiveMatch<
    DeepExclude<
      distributedInput,
      p extends any ? InvertPatternForExclude<p, value> : never
    >,
    i,
    PickReturnValue<o, c>
  >;

  with<
    p1 extends ExhaustivePattern<i>,
    p2 extends ExhaustivePattern<i>,
    p3 extends ExhaustivePattern<i>,
    p4 extends ExhaustivePattern<i>,
    p5 extends ExhaustivePattern<i>,
    c,
    p = p1 | p2 | p3 | p4 | p5,
    value = p extends any ? MatchedValue<i, InvertPattern<p>> : never
  >(
    pattern1: p1,
    pattern2: p2,
    pattern3: p3,
    pattern4: p4,
    pattern5: p5,
    handler: (value: value) => PickReturnValue<o, c>
  ): ExhaustiveMatch<
    DeepExclude<
      distributedInput,
      p extends any ? InvertPatternForExclude<p, value> : never
    >,
    i,
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
   * If this is of type `NonExhaustiveError`, it means you aren't matching
   * every cases, and you should probably add a  another `.with(...)` clause
   * to prevent potential runtime errors.
   * */
  run: [distributedInput] extends [never]
    ? () => o
    : NonExhaustiveError<distributedInput>;
};
