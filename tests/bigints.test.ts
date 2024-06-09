import { expect } from "@std/expect";
import { match, P } from "../mod.ts";
import type { Equal, Expect } from "../src/types/helpers.ts";

Deno.test(`P.bigint.between(1, 10)`, () => {
  const f = (input: string | bigint) =>
    match(input)
      .with(P.bigint.between(0n, 10n), (value) => {
        type t = Expect<Equal<typeof value, bigint>>;
        return "between 0 and 10";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | bigint>>;
        return "something else";
      });

  expect(f(5n)).toBe("between 0 and 10");
  expect(f(0n)).toBe("between 0 and 10");
  expect(f(10n)).toBe("between 0 and 10");
  expect(f("gabriel")).toBe("something else");
});

Deno.test(`P.bigint.lt(..)`, () => {
  const f = (input: string | bigint) =>
    match(input)
      .with(P.bigint.lt(10n), (value) => {
        type t = Expect<Equal<typeof value, bigint>>;
        return "yes";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | bigint>>;
        return "no";
      });

  expect(f(5n)).toBe("yes");
  expect(f(12n)).toBe("no");
  expect(f(10n)).toBe("no");
});
Deno.test(`P.bigint.gt(..)`, () => {
  const f = (input: string | bigint) =>
    match(input)
      .with(P.bigint.gt(10n), (value) => {
        type t = Expect<Equal<typeof value, bigint>>;
        return "yes";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | bigint>>;
        return "no";
      });

  expect(f(5n)).toBe("no");
  expect(f(10n)).toBe("no");
  expect(f(12n)).toBe("yes");
});
Deno.test(`P.bigint.gte(..)`, () => {
  const f = (input: string | bigint) =>
    match(input)
      .with(P.bigint.gte(10n), (value) => {
        type t = Expect<Equal<typeof value, bigint>>;
        return "yes";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | bigint>>;
        return "no";
      });

  expect(f(5n)).toBe("no");
  expect(f(10n)).toBe("yes");
  expect(f(12n)).toBe("yes");
});
Deno.test(`P.bigint.lte(..)`, () => {
  const f = (input: string | bigint) =>
    match(input)
      .with(P.bigint.lte(10n), (value) => {
        type t = Expect<Equal<typeof value, bigint>>;
        return "yes";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | bigint>>;
        return "no";
      });

  expect(f(5n)).toBe("yes");
  expect(f(10n)).toBe("yes");
  expect(f(12n)).toBe("no");
});
Deno.test(`P.bigint.positive()`, () => {
  const f = (input: string | bigint) =>
    match(input)
      .with(P.bigint.positive(), (value) => {
        type t = Expect<Equal<typeof value, bigint>>;
        return "yes";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | bigint>>;
        return "no";
      });

  expect(f(5n)).toBe("yes");
  expect(f(10123n)).toBe("yes");
  expect(f(-10123n)).toBe("no");
});
Deno.test(`P.bigint.negative()`, () => {
  const f = (input: string | bigint) =>
    match(input)
      .with(P.bigint.negative(), (value) => {
        type t = Expect<Equal<typeof value, bigint>>;
        return "yes";
      })
      .otherwise((value) => {
        type t = Expect<Equal<typeof value, string | bigint>>;
        return "no";
      });

  expect(f(5n)).toBe("no");
  expect(f(10123n)).toBe("no");
  expect(f(-10123n)).toBe("yes");
});
