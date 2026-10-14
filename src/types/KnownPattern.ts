import type { Pattern as AnyPattern } from './Pattern';
import type { PatternMatcher } from './PrimitivePattern';
import type { MergeUnion, Primitives } from './helpers';

/**
 * The patterns matching an input that contains objects or arrays.
 *
 * This is what `Pattern<a>` resolves to when `a` isn't `unknown` and
 * doesn't only contain primitive types. It is named `Pattern` too, so that
 * type errors read `Pattern<string[]>` instead of an internal name.
 * TypeScript prints the name of the type alias a union comes from, with
 * all its type arguments (defaults included), and only keeps it for an
 * alias whose body is that union. So this alias takes a single type
 * parameter, its body is the union itself, and it can't be declared next
 * to the exported `Pattern`.
 */
export type Pattern<a> =
  | Extract<a, Primitives>
  | PatternMatcher<a>
  | (Exclude<
      a,
      Primitives | Map<any, any> | Set<any> | readonly any[]
    > extends infer objs
      ? [objs] extends [never]
        ? never
        : ObjectPattern<Readonly<MergeUnion<objs>>>
      : never)
  | (Extract<a, readonly any[]> extends infer arrays
      ? [arrays] extends [never]
        ? never
        : ArrayPattern<arrays>
      : never);

type ObjectPattern<a> =
  | {
      readonly [k in keyof a]?: AnyPattern<a[k]>;
    }
  | never;

type ArrayPattern<a> = a extends readonly (infer i)[]
  ? a extends readonly [any, ...any]
    ? { readonly [index in keyof a]: AnyPattern<a[index]> }
    :
        | readonly []
        | readonly [AnyPattern<i>, ...AnyPattern<i>[]]
        | readonly [...AnyPattern<i>[], AnyPattern<i>]
  : never;
