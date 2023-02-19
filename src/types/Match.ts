import type * as symbols from '../internals/symbols.js';
import type { Pattern, Matcher } from './Pattern.js';
import type { ExtractPreciseValue } from './ExtractPreciseValue.js';
import type { InvertPatternForExclude, InvertPattern } from './InvertPattern.js';
import type { DeepExclude } from './DeepExclude.js';
import type { WithDefault, Union, GuardValue } from './helpers.js';
import type { FindSelected } from './FindSelected.js';

// We fall back to `a` if we weren't able to extract anything more precise
export type MatchedValue<a, invpattern> = WithDefault<
  ExtractPreciseValue<a, invpattern>,
  a
>;

export type PickReturnValue<a, b> = a extends symbols.unset ? b : a;

type NonExhaustiveError<i> = { __nonExhaustive: never } & i;

/**
 * #### Match
 * An interface to create a pattern matching clause.
 */
export type Match<
  i,
  o,
  patternValueTuples extends any[] = [],
  inferredOutput = never
> = {
  /**
   * `.with(pattern, handler)` Registers a pattern and an handler function which
   * will be called if this pattern matches the input value.
   *
   * [Read documentation for `.with()` on GitHub](https://github.com/gvergnaud/ts-pattern#with)
   **/
  with<
    p extends Pattern<i>,
    c,
    value extends MatchedValue<i, InvertPattern<p>>
  >(
    pattern: p,
    handler: (
      selections: FindSelected<value, p>,
      value: value
    ) => PickReturnValue<o, c>
  ): [InvertPatternForExclude<p, value>] extends [infer excluded]
    ? Match<
        Exclude<i, excluded>,
        o,
        [...patternValueTuples, excluded],
        Union<inferredOutput, c>
      >
    : never;

  with<
    p1 extends Pattern<i>,
    p2 extends Pattern<i>,
    c,
    p extends p1 | p2,
    value extends p extends any ? MatchedValue<i, InvertPattern<p>> : never
  >(
    p1: p1,
    p2: p2,
    handler: (value: value) => PickReturnValue<o, c>
  ): [
    InvertPatternForExclude<p1, value>,
    InvertPatternForExclude<p2, value>
  ] extends [infer excluded1, infer excluded2]
    ? Match<
        Exclude<i, excluded1 | excluded2>,
        o,
        [...patternValueTuples, excluded1, excluded2],
        Union<inferredOutput, c>
      >
    : never;

  with<
    p1 extends Pattern<i>,
    p2 extends Pattern<i>,
    p3 extends Pattern<i>,
    ps extends Pattern<i>[],
    c,
    p extends p1 | p2 | p3 | ps[number],
    value extends p extends any ? MatchedValue<i, InvertPattern<p>> : never
  >(
    ...args: [
      p1: p1,
      p2: p2,
      p3: p3,
      ...patterns: ps,
      handler: (value: value) => PickReturnValue<o, c>
    ]
  ): [
    InvertPatternForExclude<p1, value>,
    InvertPatternForExclude<p2, value>,
    InvertPatternForExclude<p3, value>,
    MakeTuples<ps, value>
  ] extends [
    infer excluded1,
    infer excluded2,
    infer excluded3,
    infer excludedRest
  ]
    ? Match<
        Exclude<
          i,
          | excluded1
          | excluded2
          | excluded3
          | Extract<excludedRest, any[]>[number]
        >,
        o,
        [
          ...patternValueTuples,
          excluded1,
          excluded2,
          excluded3,
          ...Extract<excludedRest, any[]>
        ],
        Union<inferredOutput, c>
      >
    : never;

  with<
    pat extends Pattern<i>,
    pred extends (value: MatchedValue<i, InvertPattern<pat>>) => unknown,
    c,
    value extends GuardValue<pred>
  >(
    pattern: pat,
    predicate: pred,
    handler: (
      selections: FindSelected<value, pat>,
      value: value
    ) => PickReturnValue<o, c>
  ): pred extends (value: any) => value is infer narrowed
    ? Match<
        Exclude<i, narrowed>,
        o,
        [...patternValueTuples, narrowed],
        Union<inferredOutput, c>
      >
    : Match<i, o, patternValueTuples, Union<inferredOutput, c>>;

  /**
   * `.when(predicate, handler)` Registers a predicate function and an handler function.
   * If the predicate returns true, the handler function will be chosen to handle the input.
   *
   * [Read documentation for `.when()` on GitHub](https://github.com/gvergnaud/ts-pattern#when)
   **/
  when<pred extends (value: i) => unknown, c, value extends GuardValue<pred>>(
    predicate: pred,
    handler: (value: value) => PickReturnValue<o, c>
  ): pred extends (value: any) => value is infer narrowed
    ? Match<
        Exclude<i, narrowed>,
        o,
        [...patternValueTuples, narrowed],
        Union<inferredOutput, c>
      >
    : Match<i, o, patternValueTuples, Union<inferredOutput, c>>;

  /**
   * `.otherwise()` takes a function returning the **default value**, and
   * will be used to handle the input value if no previous pattern matched.
   *
   * Equivalent to `.with(P._, () => x).exhaustive()`
   *
   * [Read documentation for `.otherwise()` on GitHub](https://github.com/gvergnaud/ts-pattern#otherwise)
   *
   **/
  otherwise<c>(
    handler: (value: i) => PickReturnValue<o, c>
  ): PickReturnValue<o, Union<inferredOutput, c>>;

  /**
   * `.exhaustive()` runs the pattern matching expression and return the result value.
   *
   * If this is of type `NonExhaustiveError`, it means you aren't matching
   * every case, and you should add another `.with(...)` clause
   * to prevent potential runtime errors.
   *
   * [Read documentation for `.exhaustive()` on GitHub](https://github.com/gvergnaud/ts-pattern#exhaustive)
   *
   * */
  exhaustive: DeepExcludeAll<i, patternValueTuples> extends infer remainingCases
    ? [remainingCases] extends [never]
      ? () => PickReturnValue<o, inferredOutput>
      : NonExhaustiveError<remainingCases>
    : never;

  /**
   * `.run()` runs the pattern matching expression and return the result value.
   * */
  run(): PickReturnValue<o, inferredOutput>;
};

/**
 * Potential for optimization here:
 *
 * Since DeepExclude distributes the union of the input type, it can
 * generate very large union types on patterns touching several unions at once.
 * If we were sorting patterns from those which distribute the smallest
 * amount of union types to those which distribute the largest, we would eliminate
 * cheap cases more quickly and have less cases in the input type for patterns
 * that will be expensive to exclude.
 *
 * This pre supposes that we have a cheap way of telling if the number
 * of union types a pattern touches and a cheap way of sorting the tuple
 * of patterns.
 * - For the first part, we could reuse `FindMatchingUnions` and pick the `length`
 *   of the returned tuple.
 * - For the second part though I'm not aware a cheap way of sorting a tuple.
 */
type DeepExcludeAll<a, tupleList extends any[]> = [a] extends [never]
  ? never
  : tupleList extends [infer excluded, ...infer tail]
  ? DeepExcludeAll<DeepExclude<a, excluded>, tail>
  : a;

type MakeTuples<ps extends any[], value> = {
  -readonly [index in keyof ps]: InvertPatternForExclude<ps[index], value>;
};
