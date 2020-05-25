/**
 * # Pattern matching
 **/

/**
 * GuardValue returns the value guarded by a type guard function.
 */
type GuardValue<F> = F extends (value: any) => value is infer b
  ? b
  : F extends (value: infer a) => unknown
  ? a
  : never;

type GuardFunction<a> = (value: a) => boolean;

/**
 * ### Catch All wildcard
 * `__` refers to a wildcard pattern, matching any value
 */
export const __ = {
  string: '@match/string',
  number: '@match/number',
  boolean: '@match/boolean',
} as const;

/** type alias for the catch all string */
type __ = typeof __;
type StringPattern = '@match/string';
type NumberPattern = '@match/number';
type BooleanPattern = '@match/boolean';

type SpecialPattern<a> = a extends number
  ? NumberPattern | __
  : a extends string
  ? StringPattern | __
  : a extends boolean
  ? BooleanPattern | __
  : __;

type Primitives =
  | number
  | boolean
  | string
  | undefined
  | null
  | symbol
  | bigint;

/**
 * ### Pattern
 * Patterns can be any (nested) javascript value.
 * They can also be "wildcards", using type constructors
 */
export type Pattern<a> =
  | GuardFunction<a>
  | SpecialPattern<a>
  | (a extends Primitives
      ? a
      : a extends [infer b, infer c, infer d, infer e, infer f]
      ? [Pattern<b>, Pattern<c>, Pattern<d>, Pattern<e>, Pattern<f>]
      : a extends [infer b, infer c, infer d, infer e]
      ? [Pattern<b>, Pattern<c>, Pattern<d>, Pattern<e>]
      : a extends [infer b, infer c, infer d]
      ? [Pattern<b>, Pattern<c>, Pattern<d>]
      : a extends [infer b, infer c]
      ? [Pattern<b>, Pattern<c>]
      : a extends (infer b)[]
      ? Pattern<b>[]
      : a extends Map<infer k, infer v>
      ? Map<k, Pattern<v>>
      : a extends Set<infer v>
      ? Set<Pattern<v>>
      : a extends object
      ? { [k in keyof a]?: Pattern<a[k]> }
      : a);

/**
 * ### InvertPattern
 * Since patterns have special wildcard values, we need a way
 * to transform a pattern into the type of value it represents
 */
export type InvertPattern<p> = p extends NumberPattern
  ? number
  : p extends StringPattern
  ? string
  : p extends BooleanPattern
  ? boolean
  : p extends __
  ? __
  : p extends Primitives
  ? p
  : p extends [infer pb, infer pc, infer pd, infer pe, infer pf]
  ? [
      InvertPattern<pb>,
      InvertPattern<pc>,
      InvertPattern<pd>,
      InvertPattern<pe>,
      InvertPattern<pf>
    ]
  : p extends [infer pb, infer pc, infer pd, infer pe]
  ? [InvertPattern<pb>, InvertPattern<pc>, InvertPattern<pd>, InvertPattern<pe>]
  : p extends [infer pb, infer pc, infer pd]
  ? [InvertPattern<pb>, InvertPattern<pc>, InvertPattern<pd>]
  : p extends [infer pb, infer pc]
  ? [InvertPattern<pb>, InvertPattern<pc>]
  : p extends (infer pp)[]
  ? InvertPattern<pp>[]
  : p extends Map<infer pk, infer pv>
  ? Map<pk, InvertPattern<pv>>
  : p extends Set<infer pv>
  ? Set<InvertPattern<pv>>
  : p extends GuardFunction<any>
  ? GuardValue<p>
  : p extends object
  ? { [k in keyof p]: InvertPattern<p[k]> }
  : p;

/**
 * ### LeastUpperBound
 * An interesting one. A type taking two imbricated sets and returning the
 * smallest one.
 * We need that because sometimes the pattern's infered type holds more
 * information than the value on which we are matching (if the value is any
 * or unknown for instance).
 */
export type LeastUpperBound<a, b> = [a, b] extends [
  [infer aa, infer ab, infer ac, infer ad, infer ae],
  [infer ba, infer bb, infer bc, infer bd, infer be]
] // quintupple
  ? [
      LeastUpperBound<aa, ba>,
      LeastUpperBound<ab, bb>,
      LeastUpperBound<ac, bc>,
      LeastUpperBound<ad, bd>,
      LeastUpperBound<ae, be>
    ]
  : [a, b] extends [
      [infer aa, infer ab, infer ac, infer ad],
      [infer ba, infer bb, infer bc, infer bd]
    ] // quadrupple
  ? [
      LeastUpperBound<aa, ba>,
      LeastUpperBound<ab, bb>,
      LeastUpperBound<ac, bc>,
      LeastUpperBound<ad, bd>
    ]
  : [a, b] extends [
      [infer aa, infer ab, infer ac],
      [infer ba, infer bb, infer bc]
    ] // tripple
  ? [LeastUpperBound<aa, ba>, LeastUpperBound<ab, bb>, LeastUpperBound<ac, bc>]
  : [a, b] extends [[infer aa, infer ab], [infer ba, infer bb]] // tupple
  ? [LeastUpperBound<aa, ba>, LeastUpperBound<ab, bb>]
  : [a, b] extends [(infer aa)[], (infer ba)[]]
  ? LeastUpperBound<aa, ba>[]
  : [a, b] extends [Map<infer ak, infer av>, Map<infer bk, infer bv>]
  ? Map<LeastUpperBound<ak, bk>, LeastUpperBound<av, bv>>
  : [a, b] extends [Set<infer av>, Set<infer bv>]
  ? Set<LeastUpperBound<av, bv>>
  : b extends __
  ? a
  : a extends __
  ? b
  : [a, b] extends [object, object]
  ? ObjectLeastUpperBound<a, b>
  : b extends a
  ? b
  : a extends b
  ? a
  : never;

/**
 * if a key of an object has the never type,
 * returns never, otherwise returns the type of object
 **/
type ExcludeIfContainsNever<a> = ValueOf<
  {
    [k in keyof a]: a[k] extends never ? 'exclude' : 'include';
  }
> extends 'include'
  ? a
  : never;

type ObjectLeastUpperBound<a, b> = b extends a
  ? b
  : a extends b
  ? a
  : ExcludeIfContainsNever<
      {
        [k in keyof a]: k extends keyof b ? LeastUpperBound<a[k], b[k]> : a[k];
      }
    >;

type ValueOf<a> = a[keyof a];

export type MatchedValue<a, p extends Pattern<a>> = LeastUpperBound<
  a,
  InvertPattern<p>
>;

/**
 * ### match
 * Entry point to create pattern matching code branches. It returns an
 * empty Match case.
 */
export const match = <a, b>(value: a): Match<a, b> => builder<a, b>(value, []);

/**
 * ### Match
 * An interface to create a pattern matching close.
 */
type Match<a, b> = {
  /**
   * ### Match.with
   * If the data matches the pattern provided as first argument,
   * use this branch and execute the handler function.
   **/
  with: <p extends Pattern<a>>(
    pattern: p,
    handler: (value: MatchedValue<a, p>) => b
  ) => Match<a, b>;

  /**
   * ### Match.when
   * When the first function returns a truthy value,
   * use this branch and execute the handler function.
   **/
  when: <p extends (value: a) => unknown>(
    predicate: p,
    handler: (value: GuardValue<p>) => b
  ) => Match<a, b>;

  /**
   * ### Match.withWhen
   * When the data matches the pattern provided as first argument,
   * and the predicate function provided as second argument returns a truthy value,
   * use this branch and execute the handler function.
   **/
  withWhen: <
    pat extends Pattern<a>,
    pred extends (value: MatchedValue<a, pat>) => unknown
  >(
    pattern: pat,
    predicate: pred,
    handler: (value: GuardValue<pred>) => b
  ) => Match<a, b>;

  /**
   * ### Match.otherwise
   * Catch-all branch.
   *
   * Equivalent to `.with(__)`
   **/
  otherwise: (handler: () => b) => Match<a, b>;

  /**
   * ### Match.run
   * Runs the pattern matching and return a value.
   * */
  run: () => b;
};

/**
 * ### builder
 * This is the implementation of our pattern matching, using the
 * builder pattern.
 * This builder pattern is neat because we can have complexe type checking
 * for each of the methods adding new behavior to our pattern matching.
 */
const builder = <a, b>(
  value: a,
  patterns: [(value: a) => unknown, (value: any) => b][]
): Match<a, b> => ({
  with: <p extends Pattern<a>>(
    pattern: p,
    handler: (value: MatchedValue<a, p>) => b
  ): Match<a, b> =>
    builder<a, b>(value, [...patterns, [matchPattern<a, p>(pattern), handler]]),

  when: <p extends (value: a) => unknown>(
    predicate: p,
    handler: (value: GuardValue<p>) => b
  ): Match<a, b> => builder<a, b>(value, [...patterns, [predicate, handler]]),

  withWhen: <
    pat extends Pattern<a>,
    pred extends (value: MatchedValue<a, pat>) => unknown
  >(
    pattern: pat,
    predicate: pred,
    handler: (value: GuardValue<pred>) => b
  ): Match<a, b> => {
    const doesMatch = (value: a) =>
      Boolean(matchPattern<a, pat>(pattern)(value) && predicate(value as any));
    return builder<a, b>(value, [...patterns, [doesMatch, handler]]);
  },

  otherwise: (handler: () => b): Match<a, b> =>
    builder<a, b>(value, [
      ...patterns,
      [matchPattern<a, Pattern<a>>(__ as Pattern<a>), handler],
    ]),

  run: (): b => {
    const tupple = patterns.find(([predicate]) => predicate(value));
    if (!tupple) {
      throw new Error(
        `Pattern matching error: no pattern matches value ${value}`
      );
    }
    const [, mapper] = tupple;
    return mapper(value);
  },
});

const isObject = (value: unknown): value is Object =>
  value && typeof value === 'object';

const isPredicate = (f: unknown): f is (value: any) => unknown =>
  typeof f === 'function';

// tells us if the value matches a given pattern.
const matchPattern = <a, p extends Pattern<a>>(pattern: p) => (
  value: a
): boolean => {
  if (pattern === __) return true;
  if (pattern === __.string) return typeof value === 'string';
  if (pattern === __.boolean) return typeof value === 'boolean';
  if (pattern === __.number) {
    return typeof value === 'number' && !Number.isNaN(value);
  }
  if (isPredicate(pattern)) return Boolean(pattern(value));

  if (typeof pattern !== typeof value) return false;

  if (Array.isArray(pattern) && Array.isArray(value)) {
    return pattern.length === 1
      ? value.every((v) => matchPattern(pattern[0])(v))
      : pattern.length === value.length
      ? value.every((v, i) =>
          pattern[i] ? matchPattern(pattern[i])(v) : false
        )
      : false;
  }

  if (value instanceof Map && pattern instanceof Map) {
    return [...pattern.keys()].every((key) =>
      matchPattern(pattern.get(key))(value.get(key))
    );
  }

  if (value instanceof Set && pattern instanceof Set) {
    const patternValues = [...pattern.values()];
    const allValues = [...value.values()];
    return patternValues.length === 0
      ? allValues.length === 0
      : patternValues.length === 1
      ? patternValues.every((subPattern) =>
          Object.values(__).includes(subPattern)
            ? matchPattern<any, Pattern<any>>([subPattern])(allValues)
            : value.has(subPattern)
        )
      : patternValues.every((subPattern) => value.has(subPattern));
  }

  if (isObject(value) && isObject(pattern)) {
    return Object.keys(pattern).every((k: string): boolean =>
      // @ts-ignore
      matchPattern(pattern[k])(value[k])
    );
  }
  return value === pattern;
};
