import { ExtractPreciseValue } from '../src/types/ExtractPreciseValue';
import { Expect, Equal, LeastUpperBound } from '../src/types/helpers';
import { NotPattern } from '../src/types/Pattern';
import { Event, Option, State } from './utils';

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
    type x = ExtractPreciseValue<
      { a: string; b: number } | [boolean, number],
      readonly [true, 2]
    >;
    type cases = [Expect<Equal<x, [true, 2]>>];
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
              { type: 'test'; id: NotPattern<undefined> }
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
});
