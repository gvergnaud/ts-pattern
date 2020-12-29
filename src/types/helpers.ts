export type ValueOf<a> = a[keyof a];

/**
 * ### LeastUpperBound
 * An interesting one. A type taking two imbricated sets and returning the
 * smallest one.
 * We need that because sometimes the pattern's infered type holds more
 * information than the value on which we are matching (if the value is any
 * or unknown for instance).
 */

export type LeastUpperBound<a, b> = b extends a ? b : a extends b ? a : never;

/**
 * if a key of an object has the never type,
 * returns never, otherwise returns the type of object
 **/
export type ExcludeIfContainsNever<a> = a extends Map<any, any> | Set<any>
  ? a
  : a extends any[]
  ? ExcludeNeverArray<a>
  : a extends object
  ? ExcludeNeverObject<a>
  : a;

type ExcludeNeverArray<a extends any[]> =
  | (a[0] extends never ? false : true)
  | (a[1] extends never ? false : true)
  | (a[2] extends never ? false : true)
  | (a[3] extends never ? false : true)
  | (a[4] extends never ? false : true) extends true
  ? a
  : never;

type ExcludeNeverObject<a extends object> = {
  [k in keyof a]-?: a[k] extends never ? 'exclude' : 'include';
}[keyof a] extends 'include'
  ? a
  : never;

// from https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type/50375286#50375286
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

type IsLiteralString<T extends string> = string extends T ? false : true;
type IsLiteralNumber<T extends number> = number extends T ? false : true;
type IsLiteralBoolean<T extends boolean> = boolean extends T ? false : true;
export type IsLiteral<T> = T extends string
  ? IsLiteralString<T>
  : T extends number
  ? IsLiteralNumber<T>
  : T extends boolean
  ? IsLiteralBoolean<T>
  : false;

export type UnionToTuple<T> = UnionToIntersection<
  T extends any ? (t: T) => T : never
> extends (_: any) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : [];

export type Cast<a, b> = a extends b ? a : never;
