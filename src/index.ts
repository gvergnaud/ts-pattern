/**
 * # Pattern matching
 **/

enum PatternType {
  String = '@match/string',
  Number = '@match/number',
  Boolean = '@match/boolean',
  Guard = '@match/guard',
  Not = '@match/not',
}

/**
 * ### Catch All wildcard
 * `__` is wildcard pattern, matching **any value**.
 *
 * `__.string` is wildcard pattern matching any **string**.
 *
 * `__.number` is wildcard pattern matching any **number**.
 *
 * `__.boolean` is wildcard pattern matching any **boolean**.
 * @example
 *  match(value)
 *   .with(__, () => 'will always match')
 *   .with(__.string, () => 'will match on strings only')
 *   .with(__.number, () => 'will match on numbers only')
 *   .with(__.boolean, () => 'will match on booleans only')
 */
export const __ = {
  string: PatternType.String,
  number: PatternType.Number,
  boolean: PatternType.Boolean,
} as const;

/** type alias for the catch all string */
type __ = typeof __;

type Primitives =
  | number
  | boolean
  | string
  | undefined
  | null
  | symbol
  | bigint;

/**
 * GuardValue returns the value guarded by a type guard function.
 */
type GuardValue<F> = F extends (value: any) => value is infer b
  ? b
  : F extends (value: infer a) => unknown
  ? a
  : never;

type GuardFunction<a> = (value: a) => unknown;

type GuardPattern<a> = {
  patternKind: PatternType.Guard;
  when: GuardFunction<a>;
};

type NotPattern<a> = {
  patternKind: PatternType.Not;
  pattern: Pattern<a>;
};

type SpecialPattern<a> = a extends number
  ? typeof __.number | __
  : a extends string
  ? typeof __.string | __
  : a extends boolean
  ? typeof __.boolean | __
  : __;

/**
 * ### Pattern
 * Patterns can be any (nested) javascript value.
 * They can also be "wildcards", using type constructors
 */
export type Pattern<a> =
  | GuardPattern<a>
  | NotPattern<a | any>
  | SpecialPattern<a>
  | (a extends Primitives
      ? a
      : a extends [infer b, infer c, infer d, infer e, infer f]
      ? readonly [Pattern<b>, Pattern<c>, Pattern<d>, Pattern<e>, Pattern<f>]
      : a extends [infer b, infer c, infer d, infer e]
      ? readonly [Pattern<b>, Pattern<c>, Pattern<d>, Pattern<e>]
      : a extends [infer b, infer c, infer d]
      ? readonly [Pattern<b>, Pattern<c>, Pattern<d>]
      : a extends [infer b, infer c]
      ? readonly [Pattern<b>, Pattern<c>]
      : a extends (infer b)[]
      ? readonly Pattern<b>[]
      : a extends Map<infer k, infer v>
      ? Map<k, Pattern<v>>
      : a extends Set<infer v>
      ? Set<Pattern<v>>
      : a extends object
      ? { readonly [k in keyof a]?: Pattern<a[k]> }
      : a);

/**
 * ### InvertPattern
 * Since patterns have special wildcard values, we need a way
 * to transform a pattern into the type of value it represents
 */
type InvertPattern<p> = p extends typeof __.number
  ? number
  : p extends typeof __.string
  ? string
  : p extends typeof __.boolean
  ? boolean
  : p extends __
  ? __
  : p extends GuardPattern<infer pb>
  ? GuardValue<p['when']>
  : p extends NotPattern<infer pb>
  ? {
      valueKind: PatternType.Not;
      value: InvertPattern<pb>;
    }
  : p extends Primitives
  ? p
  : p extends readonly [infer pb, infer pc, infer pd, infer pe, infer pf]
  ? [
      InvertPattern<pb>,
      InvertPattern<pc>,
      InvertPattern<pd>,
      InvertPattern<pe>,
      InvertPattern<pf>
    ]
  : p extends readonly [infer pb, infer pc, infer pd, infer pe]
  ? [InvertPattern<pb>, InvertPattern<pc>, InvertPattern<pd>, InvertPattern<pe>]
  : p extends readonly [infer pb, infer pc, infer pd]
  ? [InvertPattern<pb>, InvertPattern<pc>, InvertPattern<pd>]
  : p extends readonly [infer pb, infer pc]
  ? [InvertPattern<pb>, InvertPattern<pc>]
  : p extends readonly (infer pp)[]
  ? InvertPattern<pp>[]
  : p extends Map<infer pk, infer pv>
  ? Map<pk, InvertPattern<pv>>
  : p extends Set<infer pv>
  ? Set<InvertPattern<pv>>
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

type LeastUpperBound<a, b> = b extends a ? b : a extends b ? a : never;

type ExtractMostPreciseValue<a, b> = b extends []
  ? []
  : [a, b] extends [
      // a can be a union of a quintupple and other values,
      // that's why we add `infer otherBranches` at the end
      [infer a1, infer a2, infer a3, infer a4, infer a5] | infer otherBranches,
      [infer b1, infer b2, infer b3, infer b4, infer b5]
    ] // quintupple
  ? [
      ExtractMostPreciseValue<a1, b1>,
      ExtractMostPreciseValue<a2, b2>,
      ExtractMostPreciseValue<a3, b3>,
      ExtractMostPreciseValue<a4, b4>,
      ExtractMostPreciseValue<a5, b5>
    ]
  : [a, b] extends [
      [infer a1, infer a2, infer a3, infer a4] | infer otherBranches,
      [infer b1, infer b2, infer b3, infer b4]
    ] // qua4rupple
  ? [
      ExtractMostPreciseValue<a1, b1>,
      ExtractMostPreciseValue<a2, b2>,
      ExtractMostPreciseValue<a3, b3>,
      ExtractMostPreciseValue<a4, b4>
    ]
  : [a, b] extends [
      [infer a1, infer a2, infer a3] | infer otherBranches,
      [infer b1, infer b2, infer b3]
    ] // tripple
  ? [
      ExtractMostPreciseValue<a1, b1>,
      ExtractMostPreciseValue<a2, b2>,
      ExtractMostPreciseValue<a3, b3>
    ]
  : [a, b] extends [
      [infer a1, infer a2] | infer otherBranches,
      [infer b1, infer b2]
    ] // tupple
  ? [ExtractMostPreciseValue<a1, b1>, ExtractMostPreciseValue<a2, b2>]
  : [a, b] extends [(infer a1)[], (infer b1)[]]
  ? ExtractMostPreciseValue<a1, b1>[]
  : [a, b] extends [Map<infer ak, infer av>, Map<infer bk, infer bv>]
  ? Map<ExtractMostPreciseValue<ak, bk>, ExtractMostPreciseValue<av, bv>>
  : [a, b] extends [Set<infer av>, Set<infer bv>]
  ? Set<ExtractMostPreciseValue<av, bv>>
  : b extends __
  ? a
  : b extends { valueKind: PatternType.Not; value: infer b1 }
  ? Exclude<a, b1> extends never
    ? a
    : Exclude<a, b1>
  : b extends object
  ? ObjectExtractMostPreciseValue<a, b>
  : LeastUpperBound<a, b>;

/**
 * if a key of an object has the never type,
 * returns never, otherwise returns the type of object
 **/
type ExcludeIfContainsNever<a> = ValueOf<
  {
    [k in keyof a]-?: a[k] extends never ? 'exclude' : 'include';
  }
> extends 'include'
  ? a
  : never;

type ObjectExtractMostPreciseValue<a, b> = b extends a
  ? b
  : a extends b
  ? a
  : ExcludeIfContainsNever<
      {
        [k in keyof a]: k extends keyof b
          ? ExtractMostPreciseValue<a[k], b[k]>
          : a[k];
      }
    >;

type ValueOf<a> = a[keyof a];

type MatchedValue<a, p extends Pattern<a>> = ExtractMostPreciseValue<
  a,
  InvertPattern<p>
>;

export const when = <a>(predicate: GuardFunction<a>): GuardPattern<a> => ({
  patternKind: PatternType.Guard,
  when: predicate,
});

export const not = <a>(pattern: Pattern<a>): NotPattern<a> => ({
  patternKind: PatternType.Not,
  pattern,
});

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

const isGuardPattern = (x: unknown): x is GuardPattern<unknown> => {
  const pattern = x as GuardPattern<unknown>;
  return (
    pattern &&
    pattern.patternKind === PatternType.Guard &&
    typeof pattern.when === 'function'
  );
};

const isNotPattern = (x: unknown): x is NotPattern<unknown> => {
  const pattern = x as NotPattern<unknown>;
  return pattern && pattern.patternKind === PatternType.Not;
};

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
  if (isGuardPattern(pattern)) return Boolean(pattern.when(value));
  if (isNotPattern(pattern)) return !matchPattern(pattern.pattern)(value);

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
