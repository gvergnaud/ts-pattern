export type ValueOf<a> = a extends any[] ? a[number] : a[keyof a];

export type Values<a extends object> = UnionToTuple<ValueOf<a>>;

/**
 * ### LeastUpperBound
 * An interesting one. A type taking two imbricated sets and returning the
 * smallest one.
 * We need that because sometimes the pattern's infered type holds more
 * information than the value on which we are matching (if the value is any
 * or unknown for instance).
 */

export type LeastUpperBound<a, b> = a extends b ? a : b extends a ? b : never;

/**
 * if a key of an object has the never type,
 * returns never, otherwise returns the type of object
 **/

export type ExcludeIfContainsNever<a, b> = b extends Map<any, any> | Set<any>
  ? a
  : b extends readonly [any, ...any]
  ? ExcludeNeverObject<a, b, '0' | '1' | '2' | '3' | '4'>
  : b extends any[]
  ? ExcludeNeverObject<a, b, number>
  : ExcludeNeverObject<a, b, string>;

type ExcludeNeverObject<a, b, keyConstraint = unknown> = a extends any
  ? {
      [k in keyConstraint & keyof b & keyof a]-?: [a[k]] extends [never]
        ? 'exclude'
        : 'include';
    }[keyConstraint & keyof b & keyof a] extends infer includeOrExclude
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
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type IsUnion<a> = [a] extends [UnionToIntersection<a>] ? false : true;

export type UnionToTuple<T> = UnionToIntersection<
  T extends any ? (t: T) => T : never
> extends (_: any) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : [];

export type Cast<a, b> = a extends b ? a : never;

export type Flatten<xs extends any[]> = xs extends readonly [
  infer head,
  ...infer tail
]
  ? [...Cast<head, any[]>, ...Flatten<tail>]
  : [];

export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false;

export type Expect<T extends true> = T;

export type IsAny<a> = [a] extends [never] ? false : Equal<a, any>;

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

type BuiltInObjects =
  | Function
  | Error
  | Date
  | RegExp
  | Generator
  | { readonly [Symbol.toStringTag]: string };

export type IsPlainObject<o> = o extends object
  ? o extends BuiltInObjects
    ? false
    : true
  : false;

export type Compute<a extends any> = a extends BuiltInObjects
  ? a
  : { [k in keyof a]: a[k] } & unknown;

// All :: Bool[] -> Bool
export type All<xs> = xs extends readonly [infer head, ...infer tail]
  ? boolean extends head
    ? false
    : head extends true
    ? All<tail>
    : false
  : true;

export type Or<a extends boolean, b extends boolean> = true extends a | b
  ? true
  : false;

export type WithDefault<a, def> = [a] extends [never] ? def : a;

export type IsLiteral<T> = T extends null | undefined
  ? true
  : T extends string
  ? string extends T
    ? false
    : true
  : T extends number
  ? number extends T
    ? false
    : true
  : T extends boolean
  ? boolean extends T
    ? false
    : true
  : T extends symbol
  ? symbol extends T
    ? false
    : true
  : T extends bigint
  ? bigint extends T
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
