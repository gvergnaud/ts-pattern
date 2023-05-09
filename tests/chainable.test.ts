import { P, match } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('chainable methods', () => {
  describe('string', () => {
    it(`P.string.includes('str')`, () => {
      const f = (input: string | number) =>
        match(input)
          .with(P.string.includes('!!'), (value) => {
            type t = Expect<Equal<typeof value, string>>;
            return 'includes !!';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number>>;
            return 'something else';
          });

      expect(f('hello!!')).toBe('includes !!');
      expect(f('nope')).toBe('something else');
    });

    it(`P.string.startsWith('str')`, () => {
      const f = (input: string | number) =>
        match(input)
          .with(P.string.startsWith('hello '), (value) => {
            type t = Expect<Equal<typeof value, `hello ${string}`>>;
            return 'starts with hello';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number>>;
            return 'something else';
          });

      expect(f('hello gabriel')).toBe('starts with hello');
      expect(f('gabriel')).toBe('something else');
    });

    it(`P.string.endsWith('str')`, () => {
      const f = (input: string | number) =>
        match(input)
          .with(P.string.endsWith('!!'), (value) => {
            type t = Expect<Equal<typeof value, `${string}!!`>>;
            return 'ends with !!';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number>>;
            return 'something else';
          });

      expect(f('hello!!')).toBe('ends with !!');
      expect(f('nope')).toBe('something else');
    });
    it(`P.string.regex('[a-z]+')`, () => {});
  });

  describe('number', () => {
    it(`P.number.between(1, 10)`, () => {});
    it(`P.number.lt(12)`, () => {});
    it(`P.number.gt(12)`, () => {});
    it(`P.number.gte(12)`, () => {});
    it(`P.number.lte(12)`, () => {});
    it(`P.number.int(12)`, () => {});
    it(`P.number.finite(12)`, () => {});
    it(`P.number.positive(12)`, () => {});
    it(`P.number.negative(12)`, () => {});
  });
  describe('all', () => {
    it(`P.number.optional`, () => {});
    it(`P.string.optional`, () => {});
    it(`P.number.select()`, () => {});
    it(`P.string.select()`, () => {});
    it(`P.number.optional.select()`, () => {});
    it(`P.string.optional.select()`, () => {});
  });
});
