import {
  ValueOf,
  LeastUpperBound,
  ExcludeIfContainsNever,
  UnionToIntersection,
} from './types/helpers';

/**
 * # Pattern matching
 **/

enum PatternType {
  String = '@match/string',
  Number = '@match/number',
  Boolean = '@match/boolean',
  Guard = '@match/guard',
  Not = '@match/not',
  Select = '@match/select',
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

type GuardFunction<a, b extends a> =
  | ((value: a) => value is b)
  | ((value: a) => boolean);

type GuardPattern<a, b extends a = a> = {
  __patternKind: PatternType.Guard;
  __when: GuardFunction<a, b>;
};

type NotPattern<a> = {
  __patternKind: PatternType.Not;
  __pattern: Pattern<a>;
};

type SelectPattern<k extends string> = {
  __patternKind: PatternType.Select;
  __key: k;
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
  | SelectPattern<string>
  | GuardPattern<a>
  | NotPattern<a | any>
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
type InvertPattern<p> = p extends typeof __.number
  ? number
  : p extends typeof __.string
  ? string
  : p extends typeof __.boolean
  ? boolean
  : p extends SelectPattern<string>
  ? __
  : p extends __
  ? __
  : p extends GuardPattern<infer pa, infer pb>
  ? pb
  : p extends NotPattern<infer pb>
  ? {
      valueKind: PatternType.Not;
      value: InvertPattern<pb>;
    }
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
  : p extends object
  ? { [k in keyof p]: InvertPattern<p[k]> }
  : p;

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
  ? Exclude<a, b1>
  : b extends object
  ? ObjectExtractMostPreciseValue<a, b>
  : LeastUpperBound<a, b>;

type ObjectExtractMostPreciseValue<a, b> = b extends a
  ? b
  : a extends b
  ? a
  : ExcludeIfContainsNever<
      {
        // we use require to remove the optional property modifier.
        // since we use a[k] after that, optional properties will stay
        // optional if no pattern was more precise.
        [k in keyof Required<a>]: k extends keyof b
          ? ExtractMostPreciseValue<a[k], b[k]>
          : a[k];
      }
    >;

// We fall back to `a` if we weren't able to extract anything more precise
type MatchedValue<a, p extends Pattern<a>> = ExtractMostPreciseValue<
  a,
  InvertPattern<p>
> extends never
  ? a
  : ExtractMostPreciseValue<a, InvertPattern<p>>;

// Infinite recursion is forbidden in typescript, so we have
// to trick this by duplicating type and compute its result
// on a predefined number of recursion levels.
type FindSelected<a, b> = b extends SelectPattern<infer Key>
  ? { [k in Key]: a }
  : [a, b] extends [object, object]
  ? ValueOf<{ [k in keyof a & keyof b]: FindSelected1<a[k], b[k]> }>
  : never;

type FindSelected1<a, b> = b extends SelectPattern<infer Key>
  ? { [k in Key]: a }
  : [a, b] extends [object, object]
  ? ValueOf<{ [k in keyof a & keyof b]: FindSelected2<a[k], b[k]> }>
  : never;

type FindSelected2<a, b> = b extends SelectPattern<infer Key>
  ? { [k in Key]: a }
  : [a, b] extends [object, object]
  ? ValueOf<{ [k in keyof a & keyof b]: FindSelected3<a[k], b[k]> }>
  : never;

type FindSelected3<a, b> = b extends SelectPattern<infer Key>
  ? { [k in Key]: a }
  : [a, b] extends [object, object]
  ? ValueOf<{ [k in keyof a & keyof b]: FindSelected4<a[k], b[k]> }>
  : never;

type FindSelected4<a, b> = b extends SelectPattern<infer Key>
  ? { [k in Key]: a }
  : [a, b] extends [object, object]
  ? ValueOf<{ [k in keyof a & keyof b]: FindSelected5<a[k], b[k]> }>
  : never;

type FindSelected5<a, b> = b extends SelectPattern<infer Key>
  ? { [k in Key]: a }
  : never;

type ToHandler<a, b, c> = (
  value: a,
  selections: UnionToIntersection<FindSelected<a, b>>
) => c;

type PatternHandler<a, b extends Pattern<a>, c> = ToHandler<
  MatchedValue<a, b>,
  b,
  c
>;

export const when = <a, b extends a = a>(
  predicate: GuardFunction<a, b>
): GuardPattern<a, b> => ({
  __patternKind: PatternType.Guard,
  __when: predicate,
});

export const not = <a>(pattern: Pattern<a>): NotPattern<a> => ({
  __patternKind: PatternType.Not,
  __pattern: pattern,
});

export const select = <k extends string>(key: k): SelectPattern<k> => ({
  __patternKind: PatternType.Select,
  __key: key,
});

type Unset = '@match/unset';

type PickReturnValue<a, b> = a extends Unset ? b : a;

/**
 * ### match
 * Entry point to create pattern matching code branches. It returns an
 * empty Match case.
 */
export const match = <a, b = Unset>(value: a): Match<a, b> =>
  builder<a, b>(value, []);

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
  with: <p extends Pattern<a>, c>(
    pattern: p,
    handler: PatternHandler<a, p, PickReturnValue<b, c>>
  ) => Match<a, PickReturnValue<b, c>>;

  /**
   * ### Match.when
   * When the first function returns a truthy value,
   * use this branch and execute the handler function.
   **/
  when: <p extends (value: a) => unknown, c>(
    predicate: p,
    handler: (value: GuardValue<p>) => PickReturnValue<b, c>
  ) => Match<a, PickReturnValue<b, c>>;

  /**
   * ### Match.withWhen
   * When the data matches the pattern provided as first argument,
   * and the predicate function provided as second argument returns a truthy value,
   * use this branch and execute the handler function.
   **/
  withWhen: <
    pat extends Pattern<a>,
    pred extends (value: MatchedValue<a, pat>) => unknown,
    c
  >(
    pattern: pat,
    predicate: pred,
    handler: (value: GuardValue<pred>) => PickReturnValue<b, c>
  ) => Match<a, PickReturnValue<b, c>>;

  /**
   * ### Match.otherwise
   * Catch-all branch.
   *
   * Equivalent to `.with(__)`
   **/
  otherwise: <c>(
    handler: () => PickReturnValue<b, c>
  ) => Match<a, PickReturnValue<b, c>>;

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
  patterns: {
    test: (value: a) => unknown;
    select: (value: a) => object;
    handler: (...args: any) => any;
  }[]
): Match<a, b> => ({
  with: <p extends Pattern<a>, c>(
    pattern: p,
    handler: PatternHandler<a, p, PickReturnValue<b, c>>
  ): Match<a, PickReturnValue<b, c>> =>
    builder<a, PickReturnValue<b, c>>(value, [
      ...patterns,
      {
        test: matchPattern<a, p>(pattern),
        handler,
        select: selectWithPattern<a, p>(pattern),
      },
    ]),

  when: <p extends (value: a) => unknown, c>(
    predicate: p,
    handler: (value: GuardValue<p>) => PickReturnValue<b, c>
  ): Match<a, PickReturnValue<b, c>> =>
    builder<a, PickReturnValue<b, c>>(value, [
      ...patterns,
      {
        test: predicate,
        handler,
        select: () => ({}),
      },
    ]),

  withWhen: <
    pat extends Pattern<a>,
    pred extends (value: MatchedValue<a, pat>) => unknown,
    c
  >(
    pattern: pat,
    predicate: pred,
    handler: (value: GuardValue<pred>) => PickReturnValue<b, c>
  ): Match<a, PickReturnValue<b, c>> => {
    const doesMatch = (value: a) =>
      Boolean(matchPattern<a, pat>(pattern)(value) && predicate(value as any));
    return builder<a, PickReturnValue<b, c>>(value, [
      ...patterns,
      {
        test: doesMatch,
        handler,
        select: () => ({}),
      },
    ]);
  },

  otherwise: <c>(
    handler: () => PickReturnValue<b, c>
  ): Match<a, PickReturnValue<b, c>> =>
    builder<a, PickReturnValue<b, c>>(value, [
      ...patterns,
      {
        test: matchPattern<a, Pattern<a>>(__ as Pattern<a>),
        handler,
        select: () => ({}),
      },
    ]),

  run: (): b => {
    const entry = patterns.find(({ test }) => test(value));
    if (!entry) {
      throw new Error(
        `Pattern matching error: no pattern matches value ${value}`
      );
    }
    return entry.handler(value, entry.select(value));
  },
});

const isObject = (value: unknown): value is Object =>
  value && typeof value === 'object';

const isGuardPattern = (x: unknown): x is GuardPattern<unknown> => {
  const pattern = x as GuardPattern<unknown>;
  return (
    pattern &&
    pattern.__patternKind === PatternType.Guard &&
    typeof pattern.__when === 'function'
  );
};

const isNotPattern = (x: unknown): x is NotPattern<unknown> => {
  const pattern = x as NotPattern<unknown>;
  return pattern && pattern.__patternKind === PatternType.Not;
};

const isSelectPattern = (x: unknown): x is SelectPattern<string> => {
  const pattern = x as SelectPattern<string>;
  return pattern && pattern.__patternKind === PatternType.Select;
};

// tells us if the value matches a given pattern.
const matchPattern = <a, p extends Pattern<a>>(pattern: p) => (
  value: a
): boolean => {
  if (pattern === __ || isSelectPattern(pattern)) return true;

  if (pattern === __.string) return typeof value === 'string';
  if (pattern === __.boolean) return typeof value === 'boolean';
  if (pattern === __.number) {
    return typeof value === 'number' && !Number.isNaN(value);
  }
  if (isGuardPattern(pattern)) return Boolean(pattern.__when(value));
  if (isNotPattern(pattern)) return !matchPattern(pattern.__pattern)(value);

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

const selectWithPattern = <a, p extends Pattern<a>>(pattern: p) => (
  value: a
): object => {
  if (isSelectPattern(pattern)) return { [pattern.__key]: value };

  if (Array.isArray(pattern) && Array.isArray(value))
    return pattern.length === 1
      ? value.reduce(
          (acc, v) => Object.assign(acc, selectWithPattern(pattern[0])(v)),
          {}
        )
      : pattern.length === value.length
      ? value.reduce(
          (acc, v, i) => Object.assign(acc, selectWithPattern(pattern[i])(v)),
          {}
        )
      : {};

  if (isObject(pattern) && isObject(value))
    return Object.keys(pattern).reduce(
      (acc, k: string) =>
        // @ts-ignore
        Object.assign(acc, selectWithPattern(pattern[k])(value[k])),
      {}
    );

  return {};
};
