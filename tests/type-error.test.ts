import { match, P } from "../mod.ts";
import type { Equal, Expect } from "../src/types/helpers.ts";
import type { Option } from "./types-catalog/utils.ts";

type Country = "France" | "Germany" | "Spain" | "USA";

Deno.test("if the inferred pattern type is any, it shouldn't say that the type instanciation is too deep.", () => {
  const f = (n: number) => {
    return (
      match(n)
        .with(P.array(P.number), (s) => {
          return "big number";
        })
        // @ts-expect-error: this isn't a list
        .exhaustive()
    );
  };

  match<Country>("France")
    // @ts-expect-error: 'Spai' instead of 'Spain'
    .with("France", "Germany", "Spai", (x) => "Europe")
    // @ts-expect-error
    .exhaustive();

  match<Country>("Germany")
    .with("Germany", "Spain", () => "Europe")
    // @ts-expect-error: 'US' instead of 'USA'
    .with("US", (x) => "America")
    // @ts-expect-error
    .exhaustive();
});

Deno.test("If the pattern's wrong, the inferred selection must be the input type", () => {
  match<Country>("Germany")
    .with("Germany", "Spain", () => "Europe")
    // @ts-expect-error: 'US' instead of 'USA'
    .with("US", (x) => {
      type t = Expect<Equal<typeof x, "France" | "USA">>;
      return "America";
    })
    // @ts-expect-error
    .exhaustive();
});

Deno.test("Patterns shouldn't accept values which will never match", () => {
  const f1 = (input: Option<{ x: number }>) =>
    match<Option<{ x: number }>>(input)
      .with({ kind: "some", value: { x: 2 } }, () => "2")
      // @ts-expect-error, value.x should be a number
      .with({ value: { x: "" } }, () => "2")
      .with({ kind: "none" }, () => "")
      .with({ kind: "some" }, () => "")
      .exhaustive();

  const f2 = (input: Option<number>) =>
    match(input)
      // @ts-expect-error: value is a number
      .with({ kind: "some", value: "string" }, () => "")
      .with({ kind: "none" }, () => "")
      .with({ kind: "some" }, () => "")
      .exhaustive();
});

Deno.test("shouldn't allow when guards with an invalid input", () => {
  const startsWith = (start: string) => (value: string) =>
    value.startsWith(start);

  const equals = <T>(n: T) => (n2: T) => n === n2;

  const f = (optionalNumber: Option<number>) =>
    match(optionalNumber)
      .with(
        {
          kind: "some",
          // @ts-expect-error: string isn't assigable to number
          value: P.when(startsWith("hello")),
        },
        () => "fizz",
      )
      .with(
        {
          kind: "some",
          // @ts-expect-error: string isn't assigable to number
          value: P.when((x: string) => x),
        },
        () => "fizz",
      )
      .with(
        {
          kind: "some",
          value: P.when((x: number) => x),
        },
        () => "fizz",
      )
      .with(
        {
          kind: "some",
          value: P.when(equals(2)),
        },
        () => "fizz",
      )
      .with(
        {
          kind: "some",
          // @ts-expect-error: string isn't assigable to number
          value: P.when(equals("yo")),
        },
        () => "fizz",
      )
      .with({ kind: "none" }, () => "nope")
      // @ts-expect-error
      .exhaustive();
});

Deno.test("if a pattern is any, the outer expression shouldn't throw a type error", () => {
  const anyVar = null as any;

  const input = { a: "a" };

  match(input)
    .with({ a: anyVar }, (x) => {
      type t = Expect<Equal<typeof x, typeof input>>;
      return "Ok";
    })
    .otherwise(() => "ko");
});

Deno.test("type errors should be well placed", () => {
  match<
    {
      a: 1;
      b: "hello" | "bonjour";
      c: { d: [number, number, boolean] };
      e: unknown;
    } | null
  >(null)
    .with(
      {
        // @ts-expect-error
        b: "oops",
      },
      () => "result",
    )
    .with(
      {
        c: {
          d: [
            1,
            2,
            // @ts-expect-error: number instead of boolean
            3,
          ],
        },
      },
      () => "x",
    )
    .with({ e: 1 }, () => "bas")
    .with({ b: "hello" }, ({ a }) => "result")
    .with({ b: "bonjour" }, ({ a }) => "result")
    .with(null, () => "result")
    .exhaustive();
});
