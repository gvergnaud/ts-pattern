import { ValueOf, UnionToIntersection } from './types/helpers';
import {
  Pattern,
  SelectPattern,
  GuardFunction,
  GuardPattern,
  NotPattern,
  PatternType,
  GuardValue,
  __,
} from './types/Pattern';
import { ExtractPreciseValue } from './types/ExtractPreciseValue';
import { InvertPattern } from './types/InvertPattern';

/**
 * # Pattern matching
 **/

export { Pattern, __ };

// We fall back to `a` if we weren't able to extract anything more precise
type MatchedValue<a, p extends Pattern<a>> = ExtractPreciseValue<
  a,
  InvertPattern<p>
> extends never
  ? a
  : ExtractPreciseValue<a, InvertPattern<p>>;

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

type ExtractSelections<a, p extends Pattern<a>> = UnionToIntersection<
  FindSelected<MatchedValue<a, p>, p>
>;

type PatternHandler<a, p extends Pattern<a>, c> = (
  value: MatchedValue<a, p>,
  selections: ExtractSelections<a, p>
) => c;

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
  with<p extends Pattern<a>, c>(
    pattern: p,
    handler: PatternHandler<a, p, PickReturnValue<b, c>>
  ): Match<a, PickReturnValue<b, c>>;
  with<
    pat extends Pattern<a>,
    pred extends (value: MatchedValue<a, pat>) => unknown,
    c
  >(
    pattern: pat,
    predicate: pred,
    handler: (
      value: GuardValue<pred>,
      selections: ExtractSelections<a, pat>
    ) => PickReturnValue<b, c>
  ): Match<a, PickReturnValue<b, c>>;

  with<
    pat extends Pattern<a>,
    pred extends (value: MatchedValue<a, pat>) => unknown,
    pred2 extends (value: GuardValue<pred>) => unknown,
    c
  >(
    pattern: pat,
    predicate: pred,
    predicate2: pred2,
    handler: (
      value: GuardValue<pred2>,
      selections: ExtractSelections<a, pat>
    ) => PickReturnValue<b, c>
  ): Match<a, PickReturnValue<b, c>>;

  with<
    pat extends Pattern<a>,
    pred extends (value: MatchedValue<a, pat>) => unknown,
    pred2 extends (value: GuardValue<pred>) => unknown,
    pred3 extends (value: GuardValue<pred2>) => unknown,
    c
  >(
    pattern: pat,
    predicate: pred,
    predicate2: pred2,
    predicate3: pred3,
    handler: (
      value: GuardValue<pred3>,
      selections: ExtractSelections<a, pat>
    ) => PickReturnValue<b, c>
  ): Match<a, PickReturnValue<b, c>>;

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
  with<p extends Pattern<a>, c>(
    pattern: p,
    ...args: any[]
  ): Match<a, PickReturnValue<b, c>> {
    const handler = args[args.length - 1];
    const predicates = args.slice(0, -1);

    const doesMatch = (value: a) =>
      Boolean(
        matchPattern<a, p>(pattern)(value) &&
          predicates.every((predicate) => predicate(value as any))
      );

    return builder<a, PickReturnValue<b, c>>(value, [
      ...patterns,
      {
        test: doesMatch,
        handler,
        select: selectWithPattern<a, p>(pattern),
      },
    ]);
  },

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
