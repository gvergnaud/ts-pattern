import type { Matcher } from './Pattern';

export type PatternMatcher<input> = Matcher<input, unknown, any, any>;

/**
 * The patterns matching an input that only contains primitive types:
 * literals, primitive wildcards and pattern matchers.
 *
 * This is what `Pattern<a>` resolves to when `a` only contains primitive
 * types. It is named `Pattern` too, so that type errors read
 * `Pattern<"a" | "b">` instead of an internal name. TypeScript prints the
 * name of the type alias a union comes from, and only keeps it for an
 * alias whose body is that union (not for a branch of a conditional type),
 * so it can't be declared next to the exported `Pattern`.
 */
export type Pattern<a> = a | PatternMatcher<a>;
