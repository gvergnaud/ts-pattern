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

// We use a separate MatcherProtocol type that preserves
// the type level information (selections and excluded) used
// only for inference.
export type MatcherProtocol<
  input,
  narrowed,
  // Type of what this pattern selected from the input
  matcherType extends MatcherType = 'default',
  selections extends SelectionType = None,
  // Type to exclude from the input union because
  // it has been fully matched by this pattern
  excluded = narrowed
> = {
  match: <I extends input>(value: I) => MatchResult;
  getSelectionKeys?: () => string[];
  matcherType?: matcherType;
};

export type MatchResult = {
  matched: boolean;
  selections?: Record<string, any>;
};

export interface Matchable<
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

type AnyMatchable = Matchable<unknown, unknown, any, any>;

export type OptionalP<input, p> = Matchable<input, p, 'optional'>;

export type ArrayP<input, p> = Matchable<input, p, 'array'>;

export type AndP<input, ps> = Matchable<input, ps, 'and'>;

export type OrP<input, ps> = Matchable<input, ps, 'or'>;

export type NotP<input, p> = Matchable<input, p, 'not'>;

export type GuardP<input, narrowed> = Matchable<input, narrowed>;

export type SelectP<
  key extends string,
  input = unknown,
  p = Matchable<unknown, unknown>
> = Matchable<input, p, 'select', Some<key>>;

export interface ToExclude<a> {
  [symbols.toExclude]: a;
}

export type UnknownPattern =
  | readonly [UnknownPattern, ...UnknownPattern[]]
  | { readonly [k: string]: UnknownPattern }
  | Set<UnknownPattern>
  | Map<unknown, UnknownPattern>
  | Primitives
  | AnyMatchable;

/**
 * ### Pattern
 * Patterns can be any (nested) javascript value.
 * They can also be a "wildcards", like `__`.
 */
export type Pattern<a> =
  | Matchable<a, unknown, any, any>
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
