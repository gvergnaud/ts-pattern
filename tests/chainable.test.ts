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
    it(`P.string.regex('^[a-z]+$')`, () => {
      const f = (input: string | number) =>
        match(input)
          .with(P.string.regex('^[a-z]+$'), (value) => {
            type t = Expect<Equal<typeof value, string>>;
            return 'single word';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number>>;
            return 'something else';
          });

      expect(f('hello')).toBe('single word');
      expect(f('a b c')).toBe('something else');
    });

    it(`P.string.regex(/[a-z]+/)`, () => {
      const f = (input: string | number) =>
        match(input)
          .with(P.string.regex(/^https?:\/\//), (value) => {
            type t = Expect<Equal<typeof value, string>>;
            return 'url';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number>>;
            return 'something else';
          });

      expect(f('https://type-level-typescript.com')).toBe('url');
      expect(f('a b c')).toBe('something else');
    });
  });

  describe('number', () => {
    it(`P.number.between(1, 10)`, () => {
      const f = (input: string | number) =>
        match(input)
          .with(P.number.between(0, 10), (value) => {
            type t = Expect<Equal<typeof value, number>>;
            return 'between 0 and 10';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number>>;
            return 'something else';
          });

      expect(f(5)).toBe('between 0 and 10');
      expect(f(0)).toBe('between 0 and 10');
      expect(f(10)).toBe('between 0 and 10');
      expect(f('gabriel')).toBe('something else');
    });

    it(`P.number.lt(12)`, () => {
      const f = (input: string | number | bigint) =>
        match(input)
          .with(P.number.lt(10), (value) => {
            type t = Expect<Equal<typeof value, number>>;
            return 'yes';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number | bigint>>;
            return 'no';
          });

      expect(f(5)).toBe('yes');
      expect(f(12)).toBe('no');
      expect(f(10n)).toBe('no');
    });
    it(`P.number.gt(12)`, () => {});
    it(`P.number.gte(12)`, () => {});
    it(`P.number.lte(12)`, () => {});
    it(`P.number.int(12)`, () => {});
    it(`P.number.finite()`, () => {});
    it(`P.number.positive()`, () => {});
    it(`P.number.negative()`, () => {});
  });
  describe('all', () => {
    it(`P.number.optional()`, () => {});
    it(`P.string.optional()`, () => {});
    it(`P.number.select()`, () => {});
    it(`P.string.select()`, () => {});
    it(`P.number.optional.select()`, () => {});
    it(`P.string.optional.select()`, () => {});
  });
});
