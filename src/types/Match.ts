import type { Pattern, GuardValue, ExhaustivePattern } from './Pattern';
import type { ExtractPreciseValue } from './ExtractPreciseValue';
import type { InvertNotPattern, InvertPattern } from './InvertPattern';
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
    ps extends [ExhaustivePattern<i>, ...ExhaustivePattern<i>[]],
    c,
    value = ps[number] extends infer p
      ? p extends any 
        ? MatchedValue<i, InvertPattern<p>>
        : never
      : never
  >(...args: [
    ...patterns: ps,
    handler: (value: value) => PickReturnValue<o, c>
  ]): Match<i, PickReturnValue<o, c>>;

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

type NonExhaustivePattern<i> = { __nonExhaustive: never } & i;

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
    DeepExclude<distributedInput, InvertNotPattern<invpattern, value>>,
    i,
    PickReturnValue<o, c>
  >;

  with<
    ps extends [ExhaustivePattern<i>, ...ExhaustivePattern<i>[]],
    c,
    p = ps[number],
    value = p extends any ? MatchedValue<i, InvertPattern<p>> : never
  >(
    ...args: [
      ...patterns: ps,
      handler: (value: value) => PickReturnValue<o, c>
    ]
  ): ExhaustiveMatch<
    // For performances, keep the origin input `i` even after we call DeepExclude
    // in it, because Pattern<i> is generally mucb easier to compute than
    // the Pattern<distributedInput>.
    DeepExclude<
      distributedInput,
      p extends any ? InvertNotPattern<InvertPattern<p>, value> : never
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
   * If this is of type `NonExhaustivePattern`, it means you aren't matching
   * every cases, and you should probably add a  another `.with(...)` clause
   * to prevent potential runtime errors.
   * */
  run: [distributedInput] extends [never]
    ? () => o
    : NonExhaustivePattern<distributedInput>;
};
