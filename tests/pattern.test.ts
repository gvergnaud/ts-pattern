import type { P } from "../mod.ts";
import type { Equal, Expect } from "../src/types/helpers.ts";
import type { Matcher } from "../src/types/Pattern.ts";

type ExtendsPattern<a, p extends P.Pattern<a>> = true;

Deno.test("shouldn't allow invalid patterns", () => {
  type cases = [
    ExtendsPattern<
      { type: "a"; x: { y: string } } | { type: "b" },
      { type: "a"; x: { y: Matcher<unknown, string> } }
    >,
  ];
});

Deno.test("Should return a single object pattern when the input is a union of objects", () => {
  type res1 = P.Pattern<{ kind: "some"; value: number } | { kind: "none" }>;

  type test1 = Expect<
    Equal<
      res1,
      | Matcher<
        { kind: "some"; value: number } | { kind: "none" },
        unknown,
        any,
        any,
        unknown
      >
      | {
        readonly kind?: P.Pattern<"some" | "none">;
        readonly value?: P.Pattern<number>;
      }
    >
  >;
});

Deno.test("Should return a single object pattern when the input is a union of objects and other types", () => {
  type t = P.Pattern<
    { kind: "some"; value: number } | { kind: "none" } | string
  >;

  type t1 = Expect<
    Equal<
      P.Pattern<{ kind: "some"; value: number } | { kind: "none" } | string>,
      | Matcher<
        string | { kind: "some"; value: number } | { kind: "none" },
        unknown,
        any,
        any,
        unknown
      >
      | {
        readonly kind?: P.Pattern<"some" | "none">;
        readonly value?: P.Pattern<number>;
      }
      | string
    >
  >;

  type t2 = Expect<
    Equal<
      P.Pattern<{ a?: { name: string; age: number } } | { b: "" }>,
      | Matcher<
        { a?: { name: string; age: number } } | { b: "" },
        unknown,
        any,
        any,
        unknown
      >
      | {
        readonly a?: P.Pattern<{ name: string; age: number }>;
        readonly b?: P.Pattern<"">;
      }
    >
  >;
  type t3 = Expect<
    Equal<
      P.Pattern<{ name: string; age: number } | undefined>,
      | Matcher<
        { name: string; age: number } | undefined,
        unknown,
        any,
        any,
        unknown
      >
      | {
        readonly name?: P.Pattern<string>;
        readonly age?: P.Pattern<number>;
      }
      | undefined
    >
  >;

  type res4 = P.Pattern<{ name: string; age: number } | [type: "Hello"]>;

  type t4 = Expect<
    Equal<
      res4,
      | Matcher<
        { name: string; age: number } | [type: "Hello"],
        unknown,
        any,
        any,
        unknown
      >
      | {
        readonly name?: P.Pattern<string>;
        readonly age?: P.Pattern<number>;
      }
      | readonly [type: P.Pattern<"Hello">]
    >
  >;
});
