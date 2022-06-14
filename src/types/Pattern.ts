import type * as symbols from '../internals/symbols';
import { Primitives } from './helpers';
import { None, Some, SelectionType } from './FindSelected';

export type MatcherType =
  | 'not'
  | 'optional'
  | 'or'
  | 'and'
  | 'array'
  | 'select'
  | 'default';

// We use a separate MatcherProtocol type to preserves
// the type level information (selections and excluded) used
// only for inference.
export type MatcherProtocol<
  input,
  narrowed,
  // Type of what this pattern selected from the input
  matcherType extends MatcherType,
  selections extends SelectionType,
  // Type to exclude from the input union because
  // it has been fully matched by this pattern
  excluded
> = {
  match: <I>(value: I | input) => MatchResult;
  getSelectionKeys?: () => string[];
  matcherType?: matcherType;
};

export type MatchResult = {
  matched: boolean;
  selections?: Record<string, any>;
};

/**
 * A `Matcher` is an object implementing the match
 * protocol. It must define a `symbols.matcher` property
 * which returns an object with a `match()` method, taking
 * the input value and returning whether the pattern matches
 * or not, along with optional selections.
 */
export interface Matcher<
  input,
  narrowed,
  // Type of what this pattern selected from the input
  matcherType extends MatcherType = 'default',
  selections extends SelectionType = None,
  // Type to exclude from the input union because
  // it has been fully matched by this pattern
  excluded = narrowed
> {
  [symbols.matcher](): MatcherProtocol<
    input,
    narrowed,
    matcherType,
    selections,
    excluded
  >;
}

type UnknownMatcher = Matcher<unknown, unknown, any, any>;

export type OptionalP<input, p> = Matcher<input, p, 'optional'>;

export type ArrayP<input, p> = Matcher<input, p, 'array'>;

export type AndP<input, ps> = Matcher<input, ps, 'and'>;

export type OrP<input, ps> = Matcher<input, ps, 'or'>;

export type NotP<input, p> = Matcher<input, p, 'not'>;

export type GuardP<input, narrowed> = Matcher<input, narrowed>;

export type GuardExcludeP<input, narrowed, excluded> = Matcher<
  input,
  narrowed,
  'default',
  None,
  excluded
>;

export type SelectP<
  key extends string,
  input = unknown,
  p = Matcher<unknown, unknown>
> = Matcher<input, p, 'select', Some<key>>;

export type AnonymousSelectP = SelectP<symbols.anonymousSelectKey>;

export interface ToExclude<a> {
  [symbols.toExclude]: a;
}

export type UnknownPattern =
  | readonly []
  | readonly [UnknownPattern, ...UnknownPattern[]]
  | { readonly [k: string]: UnknownPattern }
  | Set<UnknownPattern>
  | Map<unknown, UnknownPattern>
  | Primitives
  | UnknownMatcher;

/**
 * `Pattern<a>` is the generic type for patterns matching a value of type `a`. A pattern can be any (nested) javascript value.
 *
 * They can also be wildcards, like `P._`, `P.string`, `P.number`,
 * or other matchers, like `P.when(predicate)`, `P.not(pattern)`, etc.
 *
 * [Read `Patterns` documentation on GitHub](https://github.com/gvergnaud/ts-pattern#patterns)
 *
 * @example
 * const pattern: P.Pattern<User> = { name: P.string }
 */
export type Pattern<a> =
  | Matcher<a, unknown, any, any>
  | (a extends Primitives
      ? a
      : unknown extends a
      ? UnknownPattern
      : a extends readonly (infer i)[]
      ? a extends readonly [infer a1, infer a2, infer a3, infer a4, infer a5]
        ? readonly [
            Pattern<a1>,
            Pattern<a2>,
            Pattern<a3>,
            Pattern<a4>,
            Pattern<a5>
          ]
        : a extends readonly [infer a1, infer a2, infer a3, infer a4]
        ? readonly [Pattern<a1>, Pattern<a2>, Pattern<a3>, Pattern<a4>]
        : a extends readonly [infer a1, infer a2, infer a3]
        ? readonly [Pattern<a1>, Pattern<a2>, Pattern<a3>]
        : a extends readonly [infer a1, infer a2]
        ? readonly [Pattern<a1>, Pattern<a2>]
        : a extends readonly [infer a1]
        ? readonly [Pattern<a1>]
        : readonly [] | readonly [Pattern<i>, ...Pattern<i>[]]
      : a extends Map<infer k, infer v>
      ? Map<k, Pattern<v>>
      : a extends Set<infer v>
      ? Set<Pattern<v>>
      : a extends object
      ? { readonly [k in keyof a]?: Pattern<Exclude<a[k], undefined>> }
      : a);
