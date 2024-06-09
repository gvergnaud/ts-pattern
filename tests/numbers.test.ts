import { expect } from "@std/expect";
import type { Equal, Expect } from "../src/types/helpers.ts";
import { match, P } from "../mod.ts";

Deno.test("Should match exact numbers", () => {
  const res = match<number>(1)
    .with(1, (v) => {
      type t = Expect<Equal<typeof v, 1>>;
      return v * 2;
    })
    .with(2, (v) => {
      type t = Expect<Equal<typeof v, 2>>;
      return v * v;
    })
    .otherwise(() => -1);

  type t = Expect<Equal<typeof res, number>>;

  expect(res).toEqual(2);
});

Deno.test("P.number should match NaN", () => {
  const val: number | null = NaN;
  const res = match(val)
    .with(P.nullish, () => "bad")
    .with(1, () => "bad")
    .with(P.number, () => "good")
    .exhaustive();

  expect(res).toEqual("good");
});

Deno.test("NaN should match NaN specially", () => {
  const val: number | null = NaN;
  const res = match(val)
    .with(P.nullish, () => "bad")
    .with(1, () => "bad")
    .with(NaN, () => "good")
    .with(P.number, () => "bad")
    .exhaustive();

  expect(res).toEqual("good");
});

Deno.test("when matching only NaN, the expression shouldn't be exhaustive", () => {
  const f = (val: number) =>
    match(val)
      .with(NaN, () => "NaN")
      // @ts-expect-error
      .exhaustive();

  const f2 = (val: number) =>
    match(val)
      .with(NaN, () => "NaN")
      .with(P.number, () => "number")
      .exhaustive();
});

Deno.test(`P.number.between(1, 10)`, () => {
  const f = (input: string | number) =>
    match(input)
      .with(P.number.between(0, 10), (value) => {
        type t = Expect<Equal<typeof value, number>>;
        return "between 0 and 10";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | number>>;
        return "something else";
      });

  expect(f(5)).toBe("between 0 and 10");
  expect(f(0)).toBe("between 0 and 10");
  expect(f(10)).toBe("between 0 and 10");
  expect(f("gabriel")).toBe("something else");
});

Deno.test(`P.number.lt(..)`, () => {
  const f = (input: string | number | bigint) =>
    match(input)
      .with(P.number.lt(10), (value) => {
        type t = Expect<Equal<typeof value, number>>;
        return "yes";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | number | bigint>>;
        return "no";
      });

  expect(f(5)).toBe("yes");
  expect(f(12)).toBe("no");
  expect(f(10n)).toBe("no");
});
Deno.test(`P.number.gt(..)`, () => {
  const f = (input: string | number | bigint) =>
    match(input)
      .with(P.number.gt(10), (value) => {
        type t = Expect<Equal<typeof value, number>>;
        return "yes";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | number | bigint>>;
        return "no";
      });

  expect(f(5)).toBe("no");
  expect(f(10)).toBe("no");
  expect(f(12)).toBe("yes");
});
Deno.test(`P.number.gte(..)`, () => {
  const f = (input: string | number | bigint) =>
    match(input)
      .with(P.number.gte(10), (value) => {
        type t = Expect<Equal<typeof value, number>>;
        return "yes";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | number | bigint>>;
        return "no";
      });

  expect(f(5)).toBe("no");
  expect(f(10)).toBe("yes");
  expect(f(12)).toBe("yes");
});
Deno.test(`P.number.lte(..)`, () => {
  const f = (input: string | number | bigint) =>
    match(input)
      .with(P.number.lte(10), (value) => {
        type t = Expect<Equal<typeof value, number>>;
        return "yes";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | number | bigint>>;
        return "no";
      });

  expect(f(5)).toBe("yes");
  expect(f(10)).toBe("yes");
  expect(f(12)).toBe("no");
});
Deno.test(`P.number.int(..)`, () => {
  const f = (input: string | number | bigint) =>
    match(input)
      .with(P.number.int(), (value) => {
        type t = Expect<Equal<typeof value, number>>;
        return "yes";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | number | bigint>>;
        return "no";
      });

  expect(f(5)).toBe("yes");
  expect(f(10.123)).toBe("no");
  expect(f(-Infinity)).toBe("no");
});
Deno.test(`P.number.finite()`, () => {
  const f = (input: string | number | bigint) =>
    match(input)
      .with(P.number.finite(), (value) => {
        type t = Expect<Equal<typeof value, number>>;
        return "yes";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | number | bigint>>;
        return "no";
      });

  expect(f(5)).toBe("yes");
  expect(f(10.123)).toBe("yes");
  expect(f(-Infinity)).toBe("no");
});
Deno.test(`P.number.positive()`, () => {
  const f = (input: string | number | bigint) =>
    match(input)
      .with(P.number.positive(), (value) => {
        type t = Expect<Equal<typeof value, number>>;
        return "yes";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | number | bigint>>;
        return "no";
      });

  expect(f(5)).toBe("yes");
  expect(f(10.123)).toBe("yes");
  expect(f(-10.123)).toBe("no");
  expect(f(-Infinity)).toBe("no");
});
Deno.test(`P.number.negative()`, () => {
  const f = (input: string | number | bigint) =>
    match(input)
      .with(P.number.negative(), (value) => {
        type t = Expect<Equal<typeof value, number>>;
        return "yes";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | number | bigint>>;
        return "no";
      });

  expect(f(5)).toBe("no");
  expect(f(10.123)).toBe("no");
  expect(f(-10.123)).toBe("yes");
  expect(f(-Infinity)).toBe("yes");
});
