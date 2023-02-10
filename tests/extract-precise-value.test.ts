import { ExtractPreciseValue } from '../src/types/ExtractPreciseValue';
import { Expect, Equal, LeastUpperBound } from '../src/types/helpers';
import { ToExclude } from '../src/types/Pattern';
import { Event, Option, State } from './types-catalog/utils';

describe('ExtractPreciseValue', () => {
  it('should correctly extract the matching value from the input and an inverted pattern', () => {
    type cases = [
      Expect<
        Equal<
          ExtractPreciseValue<
            { type: 'test' } | ['hello', Option<string>] | 'hello'[],
            ['hello', { kind: 'some' }]
          >,
          ['hello', { kind: 'some'; value: string }]
        >
      >,
      Expect<
        Equal<
          ExtractPreciseValue<
            | { type: 'a'; message: string }
            | { type: 'b'; count: number }
            | { type: 'c'; count: number },
            { count: number }
          >,
          { type: 'b'; count: number } | { type: 'c'; count: number }
        >
      >,
      Expect<
        Equal<
          ExtractPreciseValue<
            | {
                type: 'a';
                x: { type: 'b'; count: number } | { type: 'c'; count: number };
                y: 'other';
              }
            | { type: 'b'; count: number }
            | { type: 'c'; count: number },
            { type: 'a'; x: { type: 'b' } }
          >,
          {
            type: 'a';
            x: { type: 'b'; count: number };
            y: 'other';
          }
        >
      >,
      Expect<
        Equal<
          ExtractPreciseValue<
            | {
                type: 'a';
                x:
                  | { type: 'b'; count: number }
                  | { type: 'c'; count: number }
                  | { type: 'd' };
                y: 'other';
              }
            | { type: 'b'; count: number }
            | { type: 'c'; count: number },
            { type: 'a'; x: { count: number } }
          >,
          {
            type: 'a';
            x: { type: 'b'; count: number } | { type: 'c'; count: number };
            y: 'other';
          }
        >
      >
    ];
  });

  it('should use the type of the pattern if the input is any or never', () => {
    type cases = [
      Expect<
        Equal<
          ExtractPreciseValue<any, ['hello', { kind: 'some' }]>,
          ['hello', { kind: 'some' }]
        >
      >
    ];
  });

  it('should return the input type when pattern is unknown', () => {
    type cases = [
      Expect<
        Equal<
          ExtractPreciseValue<[State, Event], [unknown, unknown]>,
          [State, Event]
        >
      >
    ];
  });

  it('should return the correct branch a union based on the pattern', () => {
    type cases = [
      Expect<
        Equal<
          ExtractPreciseValue<
            { a: string; b: number } | [boolean, number],
            readonly [true, 2]
          >,
          [true, 2]
        >
      >,
      Expect<
        Equal<
          ExtractPreciseValue<
            | {
                type: 'img';
                src: string;
              }
            | {
                type: 'text';
                p: string;
              }
            | {
                type: 'video';
                src: number;
              }
            | {
                type: 'gif';
                p: string;
              }
            | undefined,
            {
              type: 'video';
              src: unknown;
            }
          >,
          {
            type: 'video';
            src: number;
          }
        >
      >
    ];
  });

  it('should support readonly input types', () => {
    type cases = [
      Expect<
        Equal<
          ExtractPreciseValue<
            { readonly a: string; b: number } | [boolean, number],
            readonly [true, 2]
          >,
          [true, 2]
        >
      >,
      Expect<
        Equal<
          ExtractPreciseValue<
            { readonly a: string; b: number } | [boolean, number],
            { b: number }
          >,
          { readonly a: string; b: number }
        >
      >,
      Expect<
        Equal<
          ExtractPreciseValue<
            { readonly a: string; b: number } | [boolean, number],
            { readonly a: string }
          >,
          { readonly a: string; b: number }
        >
      >
    ];
  });

  it('should work if the input type contains anys', () => {
    type Input = { t: 'a'; data: 'string'; x: any } | { t: 'b' };

    type cases = [
      Expect<
        Equal<
          ExtractPreciseValue<Input, { t: 'a' }>,
          { t: 'a'; data: 'string'; x: any }
        >
      >,
      Expect<Equal<ExtractPreciseValue<Input, { t: 'b' }>, { t: 'b' }>>,

      Expect<
        Equal<
          ExtractPreciseValue<[string | number, any], [string, unknown]>,
          [string, any]
        >
      >,
      Expect<
        Equal<
          ExtractPreciseValue<[number, any] | ['t', 2], ['t', unknown]>,
          ['t', 2]
        >
      >,

      Expect<
        Equal<
          ExtractPreciseValue<
            [
              { t: 'a' } | { t: 'b'; data: any },
              { t: 'a'; x: boolean } | { t: 'b' }
            ],
            [{ t: 'b' }, { t: 'a' }]
          >,
          [{ t: 'b'; data: any }, { t: 'a'; x: boolean }]
        >
      >
    ];
  });

  it('should work with arrays', () => {
    type cases = [
      Expect<
        Equal<
          ExtractPreciseValue<boolean | { type: string } | string[], string[]>,
          string[]
        >
      >
    ];
  });

  describe('Optional properties', () => {
    it('should pick the input type as the upper bound, even if it is assignable to the pattern type', () => {
      // This happens if the input type only has optional properties
      type Input =
        | { type: 'test'; id?: string }
        | { type: 'test2'; id?: string; otherProp: string }
        | { type: 'test3'; id?: string; otherProp?: string };

      type cases = [
        Expect<
          Equal<
            ExtractPreciseValue<Input, { type: 'test' }>,
            { type: 'test'; id?: string }
          >
        >,
        Expect<
          Equal<
            ExtractPreciseValue<
              Input,
              { type: 'test'; id: ToExclude<undefined> }
            >,
            { type: 'test'; id: string }
          >
        >,
        Expect<
          Equal<
            ExtractPreciseValue<Input, { type: 'test2' }>,
            { type: 'test2'; id?: string; otherProp: string }
          >
        >,
        Expect<
          Equal<
            ExtractPreciseValue<Input, { type: 'test3' }>,
            { type: 'test3'; id?: string; otherProp?: string }
          >
        >
      ];
    });

    it('should keep optional properties if they are optional on both `a` and `b`', () => {
      type Input =
        | {
            type: 'a';
            data?: { type: 'img'; src: string } | { type: 'text'; p: string };
          }
        | {
            type: 'b';
            data?: { type: 'video'; src: number } | { type: 'gif'; p: string };
          };

      type cases = [
        Expect<
          Equal<
            ExtractPreciseValue<
              Input,
              {
                type: 'a';
                data?: { type: 'img' } | undefined;
              }
            >,
            {
              type: 'a';
              data?: { type: 'img'; src: string } | undefined;
            }
          >
        >,
        Expect<
          Equal<
            ExtractPreciseValue<
              { data: { type?: 'a'; value: number } },
              { data: { type?: 'a' } }
            >,
            { data: { type?: 'a'; value: number } }
          >
        >
      ];
    });
  });

  describe('Branded strings', () => {
    it('Type narrowing should correctly work on branded strings', () => {
      // Branded strings is a commonly used way of implementing
      // nominal types in typescript.

      type BrandedId = string & { __brand: 'brandId' };

      type FooBar =
        | { type: 'foo'; id: BrandedId; value: string }
        | { type: 'bar' };

      type cases = [
        Expect<
          Equal<
            ExtractPreciseValue<
              {
                fooBar: FooBar;
                fooBarId: BrandedId;
              },
              {
                fooBar: { type: 'foo' };
                fooBarId: BrandedId;
              }
            >,
            {
              fooBar: {
                type: 'foo';
                id: BrandedId;
                value: string;
              };
              fooBarId: BrandedId;
            }
          >
        >
      ];
    });
  });

  describe('class instances', () => {
    it('Type narrowing should correctly work on class instances', () => {
      class A {
        a = 'a';
      }
      class B {
        b = 'b';
      }
      type cases = [Expect<Equal<ExtractPreciseValue<A | B, A>, A>>];
    });

    it('issue #63: it should correctly narrow Error subclasses', () => {
      class FooError extends Error {
        foo = 'bar';
      }

      class BazError extends Error {
        baz = 'bil';
      }

      class ErrorWithOptionalKeys1 extends Error {
        foo?: string;
      }

      class ErrorWithOptionalKeys2 extends Error {
        baz?: string;
      }

      type cases = [
        Expect<
          Equal<
            ExtractPreciseValue<FooError | BazError | Error, FooError>,
            FooError
          >
        >,
        Expect<
          Equal<
            ExtractPreciseValue<
              | ErrorWithOptionalKeys1
              | ErrorWithOptionalKeys2
              | ErrorWithOptionalKeys1,
              ErrorWithOptionalKeys1
            >,
            ErrorWithOptionalKeys1
          >
        >
      ];
    });
  });

  describe('variadic patterns', () => {
    it('[a, ...b[]]', () => {
      type res1 = ExtractPreciseValue<unknown[], [unknown, ...unknown[]]>;
      type t1 = Expect<Equal<res1, [unknown, ...unknown[]]>>;

      type res2 = ExtractPreciseValue<unknown[], [number, ...string[]]>;
      type t2 = Expect<Equal<res2, [number, ...string[]]>>;

      type res3 = ExtractPreciseValue<
        [string, ...boolean[]],
        ['a', ...unknown[]]
      >;
      type t3 = Expect<Equal<res3, ['a', ...boolean[]]>>;

      type res4 = ExtractPreciseValue<
        (string | boolean)[],
        ['a', ...unknown[]]
      >;
      type t4 = Expect<Equal<res4, ['a', ...(string | boolean)[]]>>;
    });

    it('[a, b, ...c[]]', () => {
      type res1 = ExtractPreciseValue<
        unknown[],
        [unknown, unknown, ...unknown[]]
      >;
      type t1 = Expect<Equal<res1, [unknown, unknown, ...unknown[]]>>;

      type res2 = ExtractPreciseValue<
        unknown[],
        [number, boolean, ...string[]]
      >;
      type t2 = Expect<Equal<res2, [number, boolean, ...string[]]>>;

      type res3 = ExtractPreciseValue<
        [string, number, ...boolean[]],
        ['a', 2, ...unknown[]]
      >;
      type t3 = Expect<Equal<res3, ['a', 2, ...boolean[]]>>;
    });

    it('[...a[], b]', () => {
      type res1 = ExtractPreciseValue<unknown[], [...unknown[], unknown]>;
      type t1 = Expect<Equal<res1, [...unknown[], unknown]>>;

      type res2 = ExtractPreciseValue<unknown[], [...string[], number]>;
      type t2 = Expect<Equal<res2, [...string[], number]>>;

      type res3 = ExtractPreciseValue<
        [...boolean[], string],
        [...unknown[], 'a']
      >;
      type t3 = Expect<Equal<res3, [...boolean[], 'a']>>;
    });
    it('[...a[], b, c]', () => {
      type res1 = ExtractPreciseValue<
        unknown[],
        [...unknown[], unknown, unknown]
      >;
      type t1 = Expect<Equal<res1, [...unknown[], unknown, unknown]>>;

      type res2 = ExtractPreciseValue<
        unknown[],
        [...string[], number, boolean]
      >;
      type t2 = Expect<Equal<res2, [...string[], number, boolean]>>;

      type res3 = ExtractPreciseValue<
        [...boolean[], string, boolean],
        [...unknown[], 'a', true]
      >;
      type t3 = Expect<Equal<res3, [...boolean[], 'a', true]>>;
    });
    it('[a, ...b[], c]', () => {
      type res1 = ExtractPreciseValue<
        unknown[],
        [unknown, ...unknown[], unknown]
      >;
      type t1 = Expect<Equal<res1, [unknown, ...unknown[], unknown]>>;

      type res2 = ExtractPreciseValue<
        unknown[],
        [number, ...string[], boolean]
      >;
      type t2 = Expect<Equal<res2, [number, ...string[], boolean]>>;

      type res3 = ExtractPreciseValue<
        [string, ...boolean[], number],
        ['a', ...unknown[], 2]
      >;
      type t3 = Expect<Equal<res3, ['a', ...boolean[], 2]>>;
    });
  });
});
