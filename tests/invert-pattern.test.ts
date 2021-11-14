import { optional } from '../src';
import { Compute, Equal, Expect } from '../src/types/helpers';
import {
  InvertPattern,
  InvertPatternForExclude,
  ReduceAndForExclude,
  ReduceOrForExclude,
} from '../src/types/InvertPattern';
import { GuardPattern, OptionalPattern, OrPattern } from '../src/types/Pattern';

describe('InvertPatternForExclude', () => {
  it('should correctly invert type guards', () => {
    type cases = [
      Expect<
        Equal<
          InvertPatternForExclude<
            {
              x: GuardPattern<1 | 2 | 3, 3>;
            },
            { x: 1 | 2 | 3 }
          >,
          { x: 3 }
        >
      >,
      Expect<
        Equal<
          InvertPatternForExclude<
            {
              x: GuardPattern<3, 3>;
            },
            { x: 1 } | { x: 2 } | { x: 3 }
          >,
          { x: 3 } | { x: 3 } | { x: 3 }
        >
      >
    ];
  });

  it('should work with objects', () => {
    type t = InvertPatternForExclude<
      { a: GuardPattern<unknown, string> },
      { a: string; b: number } | [1, 2]
    >;

    type cases = [
      Expect<
        Equal<
          InvertPatternForExclude<
            { a: GuardPattern<unknown, string> },
            { a: string; b: number } | [1, 2]
          >,
          { a: string }
        >
      >
    ];
  });

  it('should work with tuples', () => {
    type cases = [
      Expect<
        Equal<
          InvertPatternForExclude<[1, 2], { a: string; b: number } | [1, 2]>,
          [1, 2]
        >
      >
    ];
  });

  describe('issue #44', () => {
    it('if the pattern contains unknown keys, inverted this pattern should keep them', () => {
      type input = { sex: 'a' | 'b'; age: 'c' | 'd' };
      type pattern = { sex: 'a'; unknownKey: 'c' };
      type inverted = InvertPatternForExclude<pattern, input>;

      type cases = [Expect<Equal<inverted, pattern>>];
    });
  });

  describe('optional', () => {
    it('an optional pattern in an object should be considered an optional key', () => {
      type input = { key?: 'a' | 'b' };
      type pattern = { key: { $optional: 'a' } };
      type inverted = InvertPatternForExclude<pattern, input>;

      type cases = [
        Expect<
          Equal<
            inverted,
            {
              key?: 'a' | undefined;
            }
          >
        >
      ];
    });
    it('the inverted value should be the intersection of all the inverted patterns', () => {
      type x = InvertPatternForExclude<
        { type2: 'c'; data: { $optional: 'f' } },
        { type: 'a' | 'b'; type2: 'c' | 'd'; data?: 'f' | 'g' }
      >;
      type cases = [Expect<Equal<x, { type2: 'c'; data?: 'f' | undefined }>>];
    });

    it('an optional pattern in an object should be considered an optional key', () => {
      type input = { key?: 'a' | 'b' };
      type pattern = { key: { $optional: 'a' } };
      type inverted = InvertPatternForExclude<pattern, input>;

      type cases = [
        Expect<
          Equal<
            inverted,
            {
              key?: 'a' | undefined;
            }
          >
        >
      ];
    });
  });

  describe('or', () => {
    it('the inverted value should be a union of all the inverted patterns', () => {
      type input = { key: 'a' | 'b' | 'c' };
      type pattern = { key: { $or: ['a', 'b'] } };
      type inverted = InvertPatternForExclude<pattern, input>;

      type cases = [
        Expect<
          Equal<
            inverted,
            {
              key: 'a' | 'b';
            }
          >
        >,
        Expect<
          Equal<
            InvertPatternForExclude<
              {
                $or: [{ type: 'a' }, { type: 'b'; data: string }];
              },
              { type: 'a' } | { type: 'b'; data?: string } | { type: 'c' }
            >,
            // This Union is too large and redundant, but at least it's correct
            | {
                type: 'a';
              }
            | {
                type: 'a';
              }
            | {
                type: 'a';
              }
            | {
                type: 'b';
                data: string;
              }
            | {
                type: 'b';
                data: never;
              }
            | {
                type: 'b';
                data: string;
              }
          >
        >
      ];
    });

    it('or patterns should be composable with optional patterns', () => {
      type input = { key?: 'a' | 'b' | 'c' };
      type pattern = { key: { $optional: { $or: ['a', 'b'] } } };
      type inverted = InvertPatternForExclude<pattern, input>;

      type cases = [
        Expect<
          Equal<
            inverted,
            {
              key?: 'a' | 'b' | undefined;
            }
          >
        >
      ];
    });
  });

  describe('and', () => {
    it('the inverted value should be the intersection of all the inverted patterns', () => {
      type cases = [
        Expect<
          Equal<
            InvertPatternForExclude<
              { key: { $and: [string, 'b'] } },
              { key: string | number }
            >,
            { key: 'b' }
          >
        >,
        Expect<
          Equal<
            InvertPatternForExclude<
              {
                $and: [{ type: 'a' }, { type2: 'c'; data: { $optional: 'f' } }];
              },
              { type: 'a' | 'b'; type2: 'c' | 'd'; data?: 'f' | 'g' }
            >,
            {
              type: 'a';
            } & {
              type2: 'c';
              data?: 'f';
            }
          >
        >
      ];
    });

    it('and patterns should be composable with optional patterns', () => {
      type input = { key?: { key1: 's' | 'n'; key2: 's' | 'n' } };
      type pattern = {
        key: { $optional: { $and: [{ key1: 's' }, { key2: 'n' }] } };
      };
      type inverted = InvertPatternForExclude<pattern, input>;

      type cases = [
        Expect<
          Equal<
            inverted,
            {
              key?: ({ key1: 's' } & { key2: 'n' }) | undefined;
            }
          >
        >
      ];
    });
  });
});

describe('InvertPattern', () => {
  describe('optional', () => {
    it('an optional pattern in an object should be considered an optional key', () => {
      type input = { key?: 'a' | 'b' };
      type pattern = { key: { $optional: 'a' } };
      type inverted = InvertPattern<pattern>;

      type cases = [
        Expect<
          Equal<
            inverted,
            {
              key?: 'a' | undefined;
            }
          >
        >
      ];
    });

    it('an optional pattern in an object should be considered an optional key', () => {
      type input = { key?: 'a' | 'b' };
      type pattern = { key: { $optional: 'a' } };
      type inverted = InvertPatternForExclude<pattern, input>;

      type cases = [
        Expect<
          Equal<
            inverted,
            {
              key?: 'a' | undefined;
            }
          >
        >
      ];
    });
  });

  describe('or', () => {
    it('the inverted value should be a union of all the inverted patterns', () => {
      type pattern = { key: { $or: ['a', 'b'] } };
      type inverted = InvertPattern<pattern>;

      type cases = [
        Expect<
          Equal<
            inverted,
            {
              key: 'a' | 'b';
            }
          >
        >,
        Expect<
          Equal<
            InvertPattern<{
              $or: [{ type: 'a' }, { type: 'b'; data: { $optional: string } }];
            }>,
            | {
                type: 'a';
              }
            | {
                type: 'b';
                data?: string;
              }
          >
        >
      ];
    });

    it('or patterns should be composable with optional patterns', () => {
      type pattern = { key: { $optional: { $or: ['a', 'b'] } } };
      type inverted = InvertPattern<pattern>;

      type cases = [
        Expect<
          Equal<
            inverted,
            {
              key?: 'a' | 'b' | undefined;
            }
          >
        >
      ];
    });
  });

  describe('and', () => {
    it('the inverted value should be the intersection of all the inverted patterns', () => {
      type cases = [
        Expect<
          Equal<InvertPattern<{ key: { $and: [string, 'b'] } }>, { key: 'b' }>
        >,
        Expect<
          Equal<
            InvertPattern<{
              $and: [
                { type: 'a' },
                { type2: 'b'; data: { $optional: string } }
              ];
            }>,
            {
              type: 'a';
            } & {
              type2: 'b';
              data?: string;
            }
          >
        >
      ];
    });

    it('and patterns should be composable with optional patterns', () => {
      type pattern = {
        key: { $optional: { $and: [{ key1: string }, { key2: number }] } };
      };
      type inverted = InvertPattern<pattern>;

      type cases = [
        Expect<
          Equal<
            inverted,
            {
              key?:
                | ({
                    key1: string;
                  } & {
                    key2: number;
                  })
                | undefined;
            }
          >
        >
      ];
    });
  });
});
