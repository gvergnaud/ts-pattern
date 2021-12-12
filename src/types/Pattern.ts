import type * as symbols from '../symbols';
import { Primitives, Compute, IsPlainObject, Cast } from './helpers';

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

// Using internal tags here to dissuade people from using them inside patterns.
// Theses properties should be used by ts-pattern's internals only.
// Unfortunately they must be publically visible to work at compile time
export type GuardPattern<input, output extends input = never> = {
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.PatternKind]: symbols.Guard;
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.Guard]: GuardFunction<input, output>;
};

// Using `...Pattern<a>[]`  instead of Pattern<a> on purpose here.
// Even though it's supposed to contain a single sub pattern, we need
// to use a list otherwise this won't be computed lazily by the typesystem
// and passing a wrong pattern will yield a "Type instanciation is too deep"
// error.

export type NotPattern<a> = readonly [symbols.not, ...Pattern<a>[]];

export type OptionalPattern<a> = readonly [symbols.optional, ...Pattern<a>[]];

export type ListPattern<a> = readonly [symbols.list, ...Pattern<a>[]];

export type AndPattern<a> = readonly [symbols.and, ...Pattern<a>[]];

export type OrPattern<a> = readonly [symbols.or, ...Pattern<a>[]];

export type AnonymousSelectPattern = {
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.PatternKind]: symbols.AnonymousSelect;
};

export type NamedSelectPattern<k extends string> = {
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.PatternKind]: symbols.NamedSelect;
  /** @internal This property should only be used by ts-pattern's internals. */
  [symbols.NamedSelect]: k;
};

/**
 * ### Pattern
 * Patterns can be any (nested) javascript value.
 * They can also be a "wildcards", like `__`.
 */
export type Pattern<a> =
  | AnonymousSelectPattern
  | NamedSelectPattern<string>
  | GuardPattern<a, a>
  | NotPattern<a | any>
  | OptionalPattern<a>
  | AndPattern<a>
  | OrPattern<a>
  // If all branches are objects, then you an match
  // on properties that all objects have (usually the discriminants).
  | ([a] extends [object]
      ? {
          readonly /*
            using (Compute<a>) to avoid the distribution of `a`
            if it is a union type, and let people pass subpatterns
            that match several branches in the union at once.
          */
          [k in keyof Compute<a> & keyof a]?: Pattern<a[k]>;
        }
      : never)
  | (a extends Primitives
      ? a
      : a extends readonly (infer i)[]
      ? a extends readonly [any, ...any[]]
        ? MapPattern<Cast<a, any[]>>
        : ListPattern<i> | readonly Pattern<i>[]
      : a extends Map<infer k, infer v>
      ? Map<k, Pattern<v>>
      : a extends Set<infer v>
      ? Set<Pattern<v>>
      : a extends object
      ? {
          [k in keyof a]?: Pattern<NonNullable<a[k]>>;
        }
      : a);

type MapPattern<
  xs extends any[],
  output extends readonly any[] = readonly []
> = xs extends readonly [infer head, ...infer tail]
  ? MapPattern<tail, readonly [...output, Pattern<head>]>
  : output;
