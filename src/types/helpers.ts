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
export type ExcludeIfContainsNever<a> = ValueOf<
  {
    [k in keyof a]-?: a[k] extends never ? 'exclude' : 'include';
  }
> extends 'include'
  ? a
  : never;

// from https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type/50375286#50375286
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
