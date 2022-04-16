export type ValueOf<a> = a extends any[] ? a[number] : a[keyof a];

export type Values<a extends object> = UnionToTuple<ValueOf<a>>;

/**
 * ### LeastUpperBound
 * An interesting one. A type taking two imbricated sets and returning the
 * smallest one.
 * We need that because sometimes the pattern's inferred type holds more
 * information than the value on which we are matching (if the value is any
 * or unknown for instance).
 */

export type LeastUpperBound<a, b> = b extends a ? b : a extends b ? a : never;

/**
 * if a key of an object has the never type,
 * returns never, otherwise returns the type of object
 **/

export type ExcludeIfContainsNever<a, b> = b extends Map<any, any> | Set<any>
  ? a
  : b extends readonly [any, ...any]
  ? ExcludeObjectIfContainsNever<a, keyof b & ('0' | '1' | '2' | '3' | '4')>
  : b extends any[]
  ? ExcludeObjectIfContainsNever<a, keyof b & number>
  : ExcludeObjectIfContainsNever<a, keyof b & string>;

export type ExcludeObjectIfContainsNever<
  a,
  keyConstraint = unknown
> = a extends any
  ? {
      [k in keyConstraint & keyof a]-?: [a[k]] extends [never]
        ? 'exclude'
        : 'include';
    }[keyConstraint & keyof a] extends infer includeOrExclude
    ? (
        includeOrExclude extends 'include'
          ? 'include' extends includeOrExclude
            ? true
            : false
          : false
      ) extends true
      ? a
      : never
    : never
  : never;

// from https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type/50375286#50375286
export type UnionToIntersection<union> = (
  union extends any ? (k: union) => void : never
) extends (k: infer intersection) => void
  ? intersection
  : never;

export type IsUnion<a> = [a] extends [UnionToIntersection<a>] ? false : true;

export type UnionToTuple<
  union,
  output extends any[] = []
> = UnionToIntersection<
  union extends any ? (t: union) => union : never
> extends (_: any) => infer elem
  ? UnionToTuple<Exclude<union, elem>, [elem, ...output]>
  : output;

export type Cast<a, b> = a extends b ? a : never;

export type Flatten<
  xs extends any[],
  output extends any[] = []
> = xs extends readonly [infer head, ...infer tail]
  ? Flatten<tail, [...output, ...Cast<head, any[]>]>
  : output;

export type Equal<a, b> = (<T>() => T extends a ? 1 : 2) extends <
  T
>() => T extends b ? 1 : 2
  ? true
  : false;

export type Expect<a extends true> = a;

export type IsAny<a> = 0 extends 1 & a ? true : false;

export type Length<it extends any[]> = it['length'];

export type Iterator<
  n extends number,
  it extends any[] = []
> = it['length'] extends n ? it : Iterator<n, [any, ...it]>;

export type Next<it extends any[]> = [any, ...it];
export type Prev<it extends any[]> = it extends readonly [any, ...infer tail]
  ? tail
  : [];

export type Slice<
  xs extends readonly any[],
  it extends any[],
  output extends any[] = []
> = Length<it> extends 0
  ? output
  : xs extends readonly [infer head, ...infer tail]
  ? Slice<tail, Prev<it>, [...output, head]>
  : output;

export type Drop<
  xs extends readonly any[],
  n extends any[]
> = Length<n> extends 0
  ? xs
  : xs extends readonly [any, ...infer tail]
  ? Drop<tail, Prev<n>>
  : [];

export type BuiltInObjects =
  | Function
  | Date
  | RegExp
  | Generator
  | { readonly [Symbol.toStringTag]: string }
  | any[];

export type IsPlainObject<o, excludeUnion = BuiltInObjects> = o extends object
  ? // to excluded branded string types,
    // like `string & { __brand: "id" }`
    // and built-in objects
    o extends string | excludeUnion
    ? false
    : true
  : false;

export type Compute<a extends any> = a extends BuiltInObjects
  ? a
  : { [k in keyof a]: a[k] };

export type IntersectObjects<a> = (
  a extends any ? keyof a : never
) extends infer allKeys
  ? {
      [k in Cast<allKeys, PropertyKey>]: a extends any
        ? k extends keyof a
          ? a[k]
          : never
        : never;
    }
  : never;

export type WithDefault<a, def> = [a] extends [never] ? def : a;

export type IsLiteral<a> = a extends null | undefined
  ? true
  : a extends string
  ? string extends a
    ? false
    : true
  : a extends number
  ? number extends a
    ? false
    : true
  : a extends boolean
  ? boolean extends a
    ? false
    : true
  : a extends symbol
  ? symbol extends a
    ? false
    : true
  : a extends bigint
  ? bigint extends a
    ? false
    : true
  : false;

export type Primitives =
  | number
  | boolean
  | string
  | undefined
  | null
  | symbol
  | bigint;

export type TupleKeys = 0 | 1 | 2 | 3 | 4;

export type Union<a, b> = [b] extends [a] ? a : [a] extends [b] ? b : a | b;

/**
 * GuardValue returns the value guarded by a type guard function.
 */
export type GuardValue<fn> = fn extends (value: any) => value is infer b
  ? b
  : fn extends (value: infer a) => unknown
  ? a
  : never;

export type GuardFunction<input, narrowed> =
  | ((value: input) => value is Cast<narrowed, input>)
  | ((value: input) => boolean);
