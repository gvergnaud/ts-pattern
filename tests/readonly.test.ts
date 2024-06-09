import { match, P } from "../mod.ts";
import type { Equal, Expect } from "../src/types/helpers.ts";

Deno.test("tuples", () => {
  const f = (input: readonly ["a" | "b", "c" | "d"]) =>
    match(input)
      .with(["a", "c"], (x) => {
        type t = Expect<Equal<typeof x, readonly ["a", "c"]>>;
        return "ok";
      })
      .with(["a", "d"], (x) => {
        type t = Expect<Equal<typeof x, readonly ["a", "d"]>>;
        return "ok";
      })
      .with(["b", "c"], (x) => {
        type t = Expect<Equal<typeof x, readonly ["b", "c"]>>;
        return "ok";
      })
      .with(["b", "d"], (x) => {
        type t = Expect<Equal<typeof x, readonly ["b", "d"]>>;
        return "ok";
      })
      .exhaustive();
});

Deno.test("objects", () => {
  const f = (
    input:
      | Readonly<{ t: "a"; x: number }>
      | Readonly<{ t: "b"; x: string }>,
  ) =>
    match(input)
      .with({ t: "a" }, (x) => {
        type t = Expect<Equal<typeof x, Readonly<{ t: "a"; x: number }>>>;
        return "ok";
      })
      .with({ t: "b" }, (x) => {
        type t = Expect<Equal<typeof x, Readonly<{ t: "b"; x: string }>>>;
        return "ok";
      })
      .exhaustive();
});

Deno.test("mixed", () => {
  const f = (
    input:
      | Readonly<{ t: "a"; x: readonly [number, string, 2] }>
      | Readonly<{ t: "b"; x: string }>,
  ) =>
    match(input)
      .with({ t: "a", x: [2, "hello", 2] }, (x) => {
        type t = Expect<Equal<typeof x, { t: "a"; x: [2, "hello", 2] }>>;
        return "ok";
      })
      .with({ t: "a", x: [2, "hello", 2] as const }, (x) => {
        type t = Expect<Equal<typeof x, { t: "a"; x: [2, "hello", 2] }>>;
        return "ok";
      })
      .with({ t: "a" }, (x) => {
        type t = Expect<
          Equal<
            typeof x,
            Readonly<{ t: "a"; x: readonly [number, string, 2] }>
          >
        >;
        return "ok";
      })
      .with({ t: "b" }, (x) => {
        type t = Expect<Equal<typeof x, Readonly<{ t: "b"; x: string }>>>;
        return "ok";
      })
      .exhaustive();
});

Deno.test("must support exhaustive matching on readonly arrays", () => {
  const sum = (xs: readonly number[]): number =>
    match(xs)
      .with([], (x) => {
        type t = Expect<Equal<typeof x, readonly []>>;
        return 0;
      })
      .with([P._, ...P.array()], ([x, ...xs]) => x + sum(xs))
      .exhaustive();
});
