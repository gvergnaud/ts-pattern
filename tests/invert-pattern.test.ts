import { Compute, Equal, Expect } from '../src/types/helpers';
import {
  InvertPattern,
  InvertPatternForExclude,
} from '../src/types/InvertPattern';
import { ArrayP, GuardP, Matcher } from '../src/types/Pattern';

describe('InvertPattern', () => {
  describe('variadic tuples', () => {
    it('[a, ...b[]]', () => {
      type pattern1 = [
        'Hello',
        ...Matcher<any, GuardP<unknown, number>, 'array'>[]
      ];
      type inverted1 = InvertPattern<pattern1>;
      type test1 = Expect<Equal<inverted1, ['Hello', ...number[]]>>;

      type pattern2 = [
        GuardP<unknown, unknown>,
        ...Matcher<unknown, unknown, 'array'>[]
      ];
      type inverted2 = InvertPattern<pattern2>;
      type test2 = Expect<Equal<inverted2, [unknown, ...unknown[]]>>;

      type pattern3 = [
        GuardP<unknown, string>,
        ...Matcher<any, GuardP<unknown, number>, 'array'>[]
      ];
      type inverted3 = InvertPattern<pattern3>;
      type test3 = Expect<Equal<inverted3, [string, ...number[]]>>;
    });

    it('[a, b, ...c[]]', () => {
      type pattern1 = [
        'Hello',
        7,
        ...Matcher<any, GuardP<unknown, number>, 'array'>[]
      ];
      type inverted1 = InvertPattern<pattern1>;
      type test1 = Expect<Equal<inverted1, ['Hello', 7, ...number[]]>>;

      type pattern2 = [
        GuardP<unknown, unknown>,
        GuardP<unknown, unknown>,
        ...Matcher<unknown, unknown, 'array'>[]
      ];
      type inverted2 = InvertPattern<pattern2>;
      type test2 = Expect<Equal<inverted2, [unknown, unknown, ...unknown[]]>>;

      type pattern3 = [
        GuardP<unknown, string>,
        GuardP<unknown, boolean>,
        ...Matcher<any, GuardP<unknown, number>, 'array'>[]
      ];
      type inverted3 = InvertPattern<pattern3>;
      type test3 = Expect<Equal<inverted3, [string, boolean, ...number[]]>>;
    });
    it('[...a[], b]', () => {
      type pattern1 = [
        ...Matcher<any, GuardP<unknown, number>, 'array'>[],
        'Hello'
      ];
      type inverted1 = InvertPattern<pattern1>;
      type test1 = Expect<Equal<inverted1, [...number[], 'Hello']>>;

      type pattern2 = [
        ...Matcher<unknown, unknown, 'array'>[],
        GuardP<unknown, unknown>
      ];
      type inverted2 = InvertPattern<pattern2>;
      type test2 = Expect<Equal<inverted2, [...unknown[], unknown]>>;

      type pattern3 = [
        ...Matcher<any, GuardP<unknown, number>, 'array'>[],
        GuardP<unknown, string>
      ];
      type inverted3 = InvertPattern<pattern3>;
      type test3 = Expect<Equal<inverted3, [...number[], string]>>;
    });
    it('[...a[], b, c]', () => {
      type pattern1 = [
        ...Matcher<any, GuardP<unknown, number>, 'array'>[],
        'Hello',
        7
      ];
      type inverted1 = InvertPattern<pattern1>;
      type test1 = Expect<Equal<inverted1, [...number[], 'Hello', 7]>>;

      type pattern2 = [
        ...Matcher<unknown, unknown, 'array'>[],
        GuardP<unknown, unknown>,
        GuardP<unknown, unknown>
      ];
      type inverted2 = InvertPattern<pattern2>;
      type test2 = Expect<Equal<inverted2, [...unknown[], unknown, unknown]>>;

      type pattern3 = [
        ...Matcher<any, GuardP<unknown, number>, 'array'>[],
        GuardP<unknown, string>,
        GuardP<unknown, boolean>
      ];
      type inverted3 = InvertPattern<pattern3>;
      type test3 = Expect<Equal<inverted3, [...number[], string, boolean]>>;
    });
    it('[a, ...b[], c]', () => {
      type pattern1 = [
        7,
        ...Matcher<any, GuardP<unknown, number>, 'array'>[],
        'Hello'
      ];
      type inverted1 = InvertPattern<pattern1>;
      type test1 = Expect<Equal<inverted1, [7, ...number[], 'Hello']>>;

      type pattern2 = [
        GuardP<unknown, unknown>,
        ...Matcher<unknown, unknown, 'array'>[],
        GuardP<unknown, unknown>
      ];
      type inverted2 = InvertPattern<pattern2>;
      type test2 = Expect<Equal<inverted2, [unknown, ...unknown[], unknown]>>;

      type pattern3 = [
        GuardP<unknown, string>,
        ...Matcher<any, GuardP<unknown, number>, 'array'>[],
        GuardP<unknown, boolean>
      ];
      type inverted3 = InvertPattern<pattern3>;
      type test3 = Expect<Equal<inverted3, [string, ...number[], boolean]>>;
    });

    it('[a, b, ...c[], d, e]', () => {
      type pattern1 = [
        7,
        8,
        ...Matcher<any, GuardP<unknown, number>, 'array'>[],
        'Hello',
        'Bonjour'
      ];
      type inverted1 = InvertPattern<pattern1>;
      type test1 = Expect<
        Equal<inverted1, [7, 8, ...number[], 'Hello', 'Bonjour']>
      >;

      type pattern2 = [
        GuardP<unknown, unknown>,
        GuardP<unknown, unknown>,
        ...Matcher<unknown, unknown, 'array'>[],
        GuardP<unknown, unknown>,
        GuardP<unknown, unknown>
      ];
      type inverted2 = InvertPattern<pattern2>;
      type test2 = Expect<
        Equal<inverted2, [unknown, unknown, ...unknown[], unknown, unknown]>
      >;

      type pattern3 = [
        GuardP<unknown, string>,
        GuardP<unknown, number>,
        ...Matcher<any, GuardP<unknown, number>, 'array'>[],
        GuardP<unknown, boolean>,
        GuardP<unknown, symbol>
      ];
      type inverted3 = InvertPattern<pattern3>;
      type test3 = Expect<
        Equal<inverted3, [string, number, ...number[], boolean, symbol]>
      >;
    });
  });
});

describe('InvertPatternForExclude', () => {
  it('should correctly invert type guards', () => {
    type cases = [
      Expect<
        Equal<
          InvertPatternForExclude<
            {
              x: Matcher<1 | 2 | 3, 3>;
            },
            { x: 1 | 2 | 3 }
          >,
          Readonly<{ x: 3 }>
        >
      >,
      Expect<
        Equal<
          InvertPatternForExclude<
            {
              x: Matcher<3, 3>;
            },
            { x: 1 } | { x: 2 } | { x: 3 }
          >,
          Readonly<{ x: 3 } | { x: 3 } | { x: 3 }>
        >
      >
    ];
  });

  it('should work with objects', () => {
    type res1 = InvertPatternForExclude<
      { a: Matcher<unknown, string> },
      { a: string; b: number } | [1, 2]
    >;
    type test1 = Expect<Equal<res1, Readonly<{ a: string }>>>;
  });

  describe('Tuples', () => {
    it('should work with tuples', () => {
      type res1 = InvertPatternForExclude<
        [1, 2],
        { a: string; b: number } | [1, 2]
      >;
      type test1 = Expect<Equal<res1, readonly [1, 2]>>;
    });

    it('should return readonly tuples because both mutable and readonly are assignable to them', () => {
      type res1 = InvertPatternForExclude<
        [[[1, 2]]],
        { a: string } | [[[1, 2]]]
      >;
      type test1 = Expect<Equal<res1, readonly [readonly [readonly [1, 2]]]>>;
    });
  });

  describe('optional', () => {
    type OptionalPattern<a> = Matcher<unknown, a, 'optional'>;

    it('an optional pattern in an object should be considered an optional key', () => {
      type input = { key?: 'a' | 'b' };
      type pattern = { key: OptionalPattern<'a'> };
      type inverted = InvertPatternForExclude<pattern, input>;

      type cases = [
        Expect<
          Equal<
            inverted,
            Readonly<{
              key?: 'a' | undefined;
            }>
          >
        >
      ];
    });
    it('the inverted value should be the intersection of all the inverted patterns', () => {
      type x = InvertPatternForExclude<
        { type2: 'c'; data: OptionalPattern<'f'> },
        { type: 'a' | 'b'; type2: 'c' | 'd'; data?: 'f' | 'g' }
      >;
      type cases = [
        Expect<Equal<x, Readonly<{ type2: 'c'; data?: 'f' | undefined }>>>
      ];
    });

    it('an optional pattern in an object should be considered an optional key', () => {
      type input = { key?: 'a' | 'b' };
      type pattern = { key: OptionalPattern<'a'> };
      type inverted = InvertPatternForExclude<pattern, input>;

      type cases = [
        Expect<
          Equal<
            inverted,
            Readonly<{
              key?: 'a' | undefined;
            }>
          >
        >
      ];
    });
  });

  describe('variadic tuples', () => {
    it('[a, ...b[]]', () => {
      type pattern1 = ['Hello', ...Matcher<any, GuardP<unknown, 2>, 'array'>[]];
      type input1 = { a: string; b: number } | [string, ...number[]];
      type inverted1 = InvertPatternForExclude<pattern1, input1>;
      type test1 = Expect<Equal<inverted1, readonly ['Hello', ...2[]]>>;

      type pattern2 = ['Hello', ...Matcher<any, GuardP<unknown, 2>, 'array'>[]];
      type input2 = [string, ...number[]];
      type inverted2 = InvertPatternForExclude<pattern2, input2>;
      type test2 = Expect<Equal<inverted2, readonly ['Hello', ...2[]]>>;

      type pattern3 = [...Matcher<any, GuardP<unknown, 2>, 'array'>[]];
      type input3 = [...number[]];
      type inverted3 = InvertPatternForExclude<pattern3, input3>;
      type test3 = Expect<Equal<inverted3, readonly [...2[]]>>;

      type pattern4 = readonly [
        GuardP<unknown, unknown>,
        ...ArrayP<unknown, unknown>[]
      ];
      type input4 = [string | number, ...(string | number)[]];
      type inverted4 = InvertPatternForExclude<pattern4, input4>;
      //    ^?
      type test4 = Expect<
        Equal<inverted4, readonly [unknown, ...(string | number)[]]>
      >;

      type pattern5 = ArrayP<unknown, unknown>;
      type input5 = (string | number)[];
      type inverted5 = InvertPatternForExclude<pattern5, input5>;
      type test5 = Expect<Equal<inverted5, (string | number)[]>>;
    });

    it('[a, b, ...c[]]', () => {
      type pattern1 = [
        'Hello',
        10,
        ...Matcher<any, GuardP<unknown, 2>, 'array'>[]
      ];
      type input1 = { a: string; b: number } | [string, number, ...number[]];
      type inverted1 = InvertPatternForExclude<pattern1, input1>;
      type test1 = Expect<Equal<inverted1, readonly ['Hello', 10, ...2[]]>>;
    });
    it('[...a[], b]', () => {
      type pattern1 = [
        ...Matcher<any, GuardP<unknown, number>, 'array'>[],
        'Hello'
      ];
      type input1 = { a: string; b: number } | [...number[], string];
      type inverted1 = InvertPatternForExclude<pattern1, input1>;
      type test1 = Expect<Equal<inverted1, readonly [...number[], 'Hello']>>;
    });
    it('[...a[], b, c]', () => {
      type pattern1 = [
        ...Matcher<any, GuardP<unknown, number>, 'array'>[],
        'Hello',
        true
      ];
      type input1 = { a: string; b: number } | [...number[], string, boolean];
      type inverted1 = InvertPatternForExclude<pattern1, input1>;
      type test1 = Expect<
        Equal<inverted1, readonly [...number[], 'Hello', true]>
      >;
    });
    it('[a, ...b[], c]', () => {
      type pattern1 = [
        'Hello',
        ...Matcher<any, GuardP<unknown, number>, 'array'>[],
        true
      ];
      type input1 = { a: string; b: number } | [string, ...number[], boolean];
      type inverted1 = InvertPatternForExclude<pattern1, input1>;
      type test1 = Expect<
        Equal<inverted1, readonly ['Hello', ...number[], true]>
      >;
    });
  });

  describe('issue #44', () => {
    it('if the pattern contains unknown keys, inverted this pattern should keep them', () => {
      type input = { sex: 'a' | 'b'; age: 'c' | 'd' };
      type pattern = Readonly<{ sex: 'a'; unknownKey: 'c' }>;
      type inverted = InvertPatternForExclude<pattern, input>;

      type cases = [Expect<Equal<inverted, pattern>>];
    });
  });
});
