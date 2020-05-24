/**
 * # Pattern matching
 **/
/**
 * ## Catch All Type
 * `__` refers to a wildcard pattern matching any value
 */
declare type __ = '__CATCH_ALL__';
export declare const __: __;
/**
 * ## Pattern
 * Patterns can be any (nested) javascript value.
 * They can also be "wildcards", using type constructors
 */
export declare type Pattern<a> = a extends number ? a | NumberConstructor | __ : a extends string ? a | StringConstructor | __ : a extends boolean ? a | BooleanConstructor | __ : a extends [infer b, infer c, infer d, infer e, infer f] ? [Pattern<b>, Pattern<c>, Pattern<d>, Pattern<e>, Pattern<f>] | __ : a extends [infer b, infer c, infer d, infer e] ? [Pattern<b>, Pattern<c>, Pattern<d>, Pattern<e>] | __ : a extends [infer b, infer c, infer d] ? [Pattern<b>, Pattern<c>, Pattern<d>] | __ : a extends [infer b, infer c] ? [Pattern<b>, Pattern<c>] | __ : a extends (infer b)[] ? Pattern<b>[] | __ : a extends Map<infer k, infer v> ? Map<k, Pattern<v>> | __ : a extends Set<infer v> ? Set<Pattern<v>> | __ : {
    [k in keyof a]?: Pattern<a[k]>;
} | __;
/**
 * ## Invert Pattern
 * Since patterns have special wildcard values, we need a way
 * to transform a pattern into the type of value it represents
 */
export declare type InvertPattern<p> = p extends NumberConstructor ? number : p extends StringConstructor ? string : p extends BooleanConstructor ? boolean : p extends [infer pb, infer pc, infer pd, infer pe, infer pf] ? [InvertPattern<pb>, InvertPattern<pc>, InvertPattern<pd>, InvertPattern<pe>, InvertPattern<pf>] : p extends [infer pb, infer pc, infer pd, infer pe] ? [InvertPattern<pb>, InvertPattern<pc>, InvertPattern<pd>, InvertPattern<pe>] : p extends [infer pb, infer pc, infer pd] ? [InvertPattern<pb>, InvertPattern<pc>, InvertPattern<pd>] : p extends [infer pb, infer pc] ? [InvertPattern<pb>, InvertPattern<pc>] : p extends (infer pp)[] ? InvertPattern<pp>[] : p extends Map<infer pk, infer pv> ? Map<pk, InvertPattern<pv>> : p extends Set<infer pv> ? Set<InvertPattern<pv>> : p extends __ ? __ : {
    [k in keyof p]: InvertPattern<p[k]>;
};
declare type Fun<a, b> = (value: a) => b;
/**
 * ## LeastUpperBound
 * An interesting one. A type taking two imbricated sets and returning the
 * smallest one.
 * We need that because sometimes the pattern's infered type holds more
 * information than the value on which we are matching (if the value is any
 * or unknown for instance).
 */
declare type LeastUpperBound<a, b> = [a, b] extends [[infer aa, infer ab, infer ac, infer ad, infer ae], [infer ba, infer bb, infer bc, infer bd, infer be]] ? [LeastUpperBound<aa, ba>, LeastUpperBound<ab, bb>, LeastUpperBound<ac, bc>, LeastUpperBound<ad, bd>, LeastUpperBound<ae, be>] : [a, b] extends [[infer aa, infer ab, infer ac, infer ad], [infer ba, infer bb, infer bc, infer bd]] ? [LeastUpperBound<aa, ba>, LeastUpperBound<ab, bb>, LeastUpperBound<ac, bc>, LeastUpperBound<ad, bd>] : [a, b] extends [[infer aa, infer ab, infer ac], [infer ba, infer bb, infer bc]] ? [LeastUpperBound<aa, ba>, LeastUpperBound<ab, bb>, LeastUpperBound<ac, bc>] : [a, b] extends [[infer aa, infer ab], [infer ba, infer bb]] ? [LeastUpperBound<aa, ba>, LeastUpperBound<ab, bb>] : [a, b] extends [(infer aa)[], (infer ba)[]] ? LeastUpperBound<aa, ba>[] : [a, b] extends [Map<infer ak, infer av>, Map<infer bk, infer bv>] ? Map<LeastUpperBound<ak, bk>, LeastUpperBound<av, bv>> : [a, b] extends [Set<infer av>, Set<infer bv>] ? Set<LeastUpperBound<av, bv>> : b extends __ ? a : a extends __ ? b : b extends a ? b : a extends b ? a : never;
/**
 * ## match
 * Entry point to create pattern matching code branches. It returns an
 * empty builder
 */
export declare const match: <a, b>(value: a) => {
    with: <p extends Pattern<a>>(pattern: p, f: Fun<LeastUpperBound<a, InvertPattern<p>>, b>) => any;
    when: (predicate: Fun<a, unknown>, f: Fun<a, b>) => any;
    withWhen: <p_1 extends Pattern<a>>(pattern: p_1, predicate: Fun<LeastUpperBound<a, InvertPattern<p_1>>, unknown>, f: Fun<LeastUpperBound<a, InvertPattern<p_1>>, b>) => any;
    otherwise: (f: () => b) => any;
    run: () => b;
};
export {};
