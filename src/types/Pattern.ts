import type * as symbols from '../symbols';
import { Primitives, IsPlainObject } from './helpers';

/**
 * GuardValue returns the value guarded by a type guard function.
 */
export type GuardValue<F> = F extends (value: any) => value is infer b
  ? b
  : F extends (value: infer a) => unknown
  ? a
  : never;

export type GuardFunction<input, output extends input = never> =
  | ((value: input) => value is output)
  | ((value: input) => boolean);

export type GetMatchInput<
  T extends MatchProtocolPattern<any, any, any>,
  input // This is what we need to inject as a type parameter to the generic function
> = T[symbols.MatchProtocol]['predicate'] extends (
  value: infer input
) => unknown
  ? input
  : never;

export type GetMatchOutput<
  T extends MatchProtocolPattern<any, any, any>,
  input // This is what we need to inject as a type parameter to the generic function
> = T[symbols.MatchProtocol]['predicate'] extends (
  value: any
) => value is infer output
  ? output
  : never;

export type GetMatchSelection<
  pattern extends MatchProtocolPattern<any, any, any>,
  input // This is what we need to inject as a type parameter to the generic function
> = pattern[symbols.MatchProtocol]['selector'] extends (
  value: input
) => { value: infer value }
  ? value
  : never;

export type MatchProtocolPattern<
  key extends string,
  p extends (value: unknown) => unknown,
  s extends (value: unknown) => { key: key; value: unknown }
> = {
  readonly [symbols.PatternKind]: symbols.MatchProtocol;
  readonly [symbols.MatchProtocol]: {
    readonly predicate: p;
    readonly selector: s;
  };
};

// Using internal tags here to dissuade people from using them inside patterns.
// Theses properties should be used by ts-pattern's internals only.
// Unfortunately they must be publically visible to work at compile time
export type GuardPattern<input, output extends input = never> = {
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.PatternKind]: symbols.Guard;
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.Guard]: GuardFunction<input, output>;
};

export type NotPattern<a> = {
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.PatternKind]: symbols.Not;
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.Not]: Pattern<a>;
};

export type AnonymousSelectPattern = SelectPattern<symbols.AnonymousSelectKey>;

export type SelectPattern<k extends string> = {
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.PatternKind]: symbols.Select;
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.Select]: k;
};

/**
 * ### Pattern
 * Patterns can be any (nested) javascript value.
 * They can also be a "wildcards", like `__`.
 */
export type Pattern<a> =
  | SelectPattern<string>
  | GuardPattern<a, a>
  | NotPattern<a | any>
  | MatchProtocolPattern<string, (value: any) => any, (value: any) => any>
  | (a extends Primitives
      ? a
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
        :
            | readonly []
            | readonly [Pattern<i>]
            | readonly [Pattern<i>, Pattern<i>]
            | readonly [Pattern<i>, Pattern<i>, Pattern<i>]
            | readonly [Pattern<i>, Pattern<i>, Pattern<i>, Pattern<i>]
            | readonly [
                Pattern<i>,
                Pattern<i>,
                Pattern<i>,
                Pattern<i>,
                Pattern<i>
              ]
      : a extends Map<infer k, infer v>
      ? Map<k, Pattern<v>>
      : a extends Set<infer v>
      ? Set<Pattern<v>>
      : IsPlainObject<a> extends true
      ? { readonly [k in keyof a]?: Pattern<a[k]> }
      : a);
