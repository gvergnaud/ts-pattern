import { P, match } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('BigInts', () => {
  it(`P.bigint.between(1, 10)`, () => {
    const f = (input: string | bigint) =>
      match(input)
        .with(P.bigint.between(0n, 10n), (value) => {
          type t = Expect<Equal<typeof value, bigint>>;
          return 'between 0 and 10';
        })
        .otherwise((value) => {
          type t = Expect<Equal<typeof value, string | bigint>>;
          return 'something else';
        });

    expect(f(5n)).toBe('between 0 and 10');
    expect(f(0n)).toBe('between 0 and 10');
    expect(f(10n)).toBe('between 0 and 10');
    expect(f('gabriel')).toBe('something else');
  });

  it(`P.bigint.lt(..)`, () => {
    const f = (input: string | bigint) =>
      match(input)
        .with(P.bigint.lt(10n), (value) => {
          type t = Expect<Equal<typeof value, bigint>>;
          return 'yes';
        })
        .otherwise((value) => {
          type t = Expect<Equal<typeof value, string | bigint>>;
          return 'no';
        });

    expect(f(5n)).toBe('yes');
    expect(f(12n)).toBe('no');
    expect(f(10n)).toBe('no');
  });
  it(`P.bigint.gt(..)`, () => {
    const f = (input: string | bigint) =>
      match(input)
        .with(P.bigint.gt(10n), (value) => {
          type t = Expect<Equal<typeof value, bigint>>;
          return 'yes';
        })
        .otherwise((value) => {
          type t = Expect<Equal<typeof value, string | bigint>>;
          return 'no';
        });

    expect(f(5n)).toBe('no');
    expect(f(10n)).toBe('no');
    expect(f(12n)).toBe('yes');
  });
  it(`P.bigint.gte(..)`, () => {
    const f = (input: string | bigint) =>
      match(input)
        .with(P.bigint.gte(10n), (value) => {
          type t = Expect<Equal<typeof value, bigint>>;
          return 'yes';
        })
        .otherwise((value) => {
          type t = Expect<Equal<typeof value, string | bigint>>;
          return 'no';
        });

    expect(f(5n)).toBe('no');
    expect(f(10n)).toBe('yes');
    expect(f(12n)).toBe('yes');
  });
  it(`P.bigint.lte(..)`, () => {
    const f = (input: string | bigint) =>
      match(input)
        .with(P.bigint.lte(10n), (value) => {
          type t = Expect<Equal<typeof value, bigint>>;
          return 'yes';
        })
        .otherwise((value) => {
          type t = Expect<Equal<typeof value, string | bigint>>;
          return 'no';
        });

    expect(f(5n)).toBe('yes');
    expect(f(10n)).toBe('yes');
    expect(f(12n)).toBe('no');
  });
  it(`P.bigint.positive()`, () => {
    const f = (input: string | bigint) =>
      match(input)
        .with(P.bigint.positive(), (value) => {
          type t = Expect<Equal<typeof value, bigint>>;
          return 'yes';
        })
        .otherwise((value) => {
          type t = Expect<Equal<typeof value, string | bigint>>;
          return 'no';
        });

    expect(f(5n)).toBe('yes');
    expect(f(10123n)).toBe('yes');
    expect(f(-10123n)).toBe('no');
  });
  it(`P.bigint.negative()`, () => {
    const f = (input: string | bigint) =>
      match(input)
        .with(P.bigint.negative(), (value) => {
          type t = Expect<Equal<typeof value, bigint>>;
          return 'yes';
        })
        .otherwise((value) => {
          type t = Expect<Equal<typeof value, string | bigint>>;
          return 'no';
        });

    expect(f(5n)).toBe('no');
    expect(f(10123n)).toBe('no');
    expect(f(-10123n)).toBe('yes');
  });
});
