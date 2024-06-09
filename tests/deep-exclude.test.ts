import type { DeepExclude } from "../src/types/DeepExclude.ts";
import type {
  DistributeMatchingUnions,
  FindUnions,
  FindUnionsMany,
} from "../src/types/DistributeUnions.ts";
import type { Equal, Expect, Primitives } from "../src/types/helpers.ts";
import type { IsMatching } from "../src/types/IsMatching.ts";
import type { BigUnion, Option, State } from "./types-catalog/utils.ts";

type Colors = "pink" | "purple" | "red" | "yellow" | "blue";

Deno.test("Primitives", () => {
  type cases = [
    Expect<Equal<DeepExclude<string, "hello">, string>>,
    Expect<Equal<DeepExclude<string, string>, never>>,
    Expect<Equal<DeepExclude<string | number, string>, number>>,
    Expect<Equal<DeepExclude<string | number, boolean>, string | number>>,
    Expect<
      Equal<
        DeepExclude<Primitives, null | undefined>,
        string | number | bigint | boolean | symbol
      >
    >,
    Expect<Equal<DeepExclude<Primitives, never>, Primitives>>,
  ];
});

Deno.test("Literals", () => {
  type cases = [
    Expect<Equal<DeepExclude<"hello" | "bonjour", "hello">, "bonjour">>,
    Expect<
      Equal<DeepExclude<"hello" | "bonjour", "hola">, "hello" | "bonjour">
    >,
    Expect<Equal<DeepExclude<1 | 2 | 3, 3>, 1 | 2>>,
    Expect<Equal<DeepExclude<"hello" | 1, string>, 1>>,
    Expect<Equal<DeepExclude<"hello" | 1, number>, "hello">>,
    Expect<Equal<DeepExclude<200n | number, bigint>, number>>,
    Expect<Equal<DeepExclude<undefined | number, number>, undefined>>,
  ];
});

Deno.test("should correctly exclude when it matches", () => {
  type cases = [
    Expect<Equal<DeepExclude<{ a: "x" | "y" }, { a: string }>, never>>,
    Expect<Equal<DeepExclude<{ a: "x" | "y" }, { a: "x" }>, { a: "y" }>>,
  ];
});

Deno.test("if it doesn't match, it should leave the data structure untouched", () => {
  type cases = [
    Expect<
      Equal<DeepExclude<{ a: "x" | "y" }, { b: "x" }>, { a: "x" | "y" }>
    >,
    Expect<
      Equal<DeepExclude<{ a: "x" | "y" }, { a: "z" }>, { a: "x" | "y" }>
    >,
  ];
});

Deno.test("should work with nested object and only distribute what is necessary", () => {
  type x = DeepExclude<{ str: string | null | undefined }, { str: string }>;
  type xx = DistributeMatchingUnions<
    { str: string | null | undefined },
    { str: string }
  >;
  type xxx = FindUnionsMany<
    { str: string | null | undefined },
    { str: string }
  >;
  type xxxx = IsMatching<
    { str: string | null | undefined },
    { str: string }
  >;
  type xxxxx = FindUnions<
    { str: string | null | undefined },
    { str: string },
    []
  >;
  type y = DeepExclude<
    { str: string | null | undefined },
    { str: null | undefined }
  >;

  type cases = [
    Expect<Equal<x, { str: null } | { str: undefined }>>,
    Expect<Equal<y, { str: string }>>,
    Expect<
      Equal<
        DeepExclude<{ a: { b: "x" | "y" } }, { a: { b: "x" } }>,
        { a: { b: "y" } }
      >
    >,
    Expect<
      Equal<
        DeepExclude<{ a: { b: "x" | "y" | "z" } }, { a: { b: "x" } }>,
        { a: { b: "y" } } | { a: { b: "z" } }
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          { a: { b: "x" | "y" | "z" }; c: "u" | "v" },
          { a: { b: "x" } }
        >,
        { a: { b: "y" }; c: "u" | "v" } | { a: { b: "z" }; c: "u" | "v" }
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          { a: { b: "x" | "y" | "z" }; c: "u" | "v" },
          { c: "u" }
        >,
        { a: { b: "x" | "y" | "z" }; c: "v" }
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          { a: { b: "x" | "y" | "z" }; c: "u" | "v" },
          { c: "u" }
        >,
        { a: { b: "x" | "y" | "z" }; c: "v" }
      >
    >,
  ];
});

Deno.test("should correctly exclude when it matches", () => {
  type cases = [
    Expect<Equal<DeepExclude<["x" | "y"], [string]>, never>>,
    Expect<Equal<DeepExclude<["x" | "y"], ["x"]>, ["y"]>>,
    Expect<
      Equal<
        DeepExclude<[string, string], readonly [unknown, unknown]>,
        never
      >
    >,
    Expect<
      Equal<
        DeepExclude<[number, State], [unknown, { status: "error" }]>,
        | [number, { status: "idle" }]
        | [number, { status: "loading" }]
        | [number, { status: "success"; data: string }]
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          readonly [number, State],
          [unknown, { status: "error" }]
        >,
        | [number, { status: "idle" }]
        | [number, { status: "loading" }]
        | [number, { status: "success"; data: string }]
      >
    >,
  ];
});

Deno.test("if it doesn't match, it should leave the data structure untouched", () => {
  type cases = [
    Expect<Equal<DeepExclude<["x" | "y"], ["z"]>, ["x" | "y"]>>,
    Expect<Equal<DeepExclude<["x" | "y"], []>, ["x" | "y"]>>,
    Expect<Equal<DeepExclude<["x" | "y"], ["a", "b", "c"]>, ["x" | "y"]>>,
  ];
});

Deno.test("should work with nested tuples and only distribute what is necessary", () => {
  type cases = [
    Expect<Equal<DeepExclude<[["x" | "y"]], [["x"]]>, [["y"]]>>,
    Expect<
      Equal<DeepExclude<[["x" | "y" | "z"]], [["x"]]>, [["y"]] | [["z"]]>
    >,
    Expect<
      Equal<
        DeepExclude<[["x" | "y" | "z"], "u" | "v"], [["x"], unknown]>,
        [["y"], "u" | "v"] | [["z"], "u" | "v"]
      >
    >,
    Expect<
      Equal<
        DeepExclude<[["x" | "y" | "z"], "u" | "v"], [unknown, "v"]>,
        [["x" | "y" | "z"], "u"]
      >
    >,
  ];
});

Deno.test("should work with nested unary tuples", () => {
  type State = {};
  type Msg = [type: "Login"] | [type: "UrlChange", url: string];
  type Input = [State, Msg];

  type cases = [
    Expect<Equal<DeepExclude<[[number]], [[unknown]]>, never>>,
    Expect<Equal<DeepExclude<[[[number]]], [[[unknown]]]>, never>>,
    Expect<Equal<DeepExclude<[[[[number]]]], [[[[unknown]]]]>, never>>,
    Expect<
      Equal<
        DeepExclude<[[[number]]], readonly [readonly [readonly [unknown]]]>,
        never
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          readonly [[[[{ t: number }]]]],
          readonly [[[[{ t: unknown }]]]]
        >,
        never
      >
    >,
    Expect<
      Equal<
        DeepExclude<[{}, Msg], [unknown, ["UrlChange", unknown]]>,
        [{}, [type: "Login"]]
      >
    >,
  ];
});

Deno.test("should correctly turn variadic exclude into their opposite", () => {
  type res1 = DeepExclude<number[], [number, ...number[]]>;
  type test1 = Expect<Equal<res1, []>>;

  type res2 = DeepExclude<number[], []>;
  type test2 = Expect<Equal<res2, [number, ...number[]]>>;

  type res3 = DeepExclude<number[], [...number[], number]>;
  type test3 = Expect<Equal<res3, []>>;

  type res4 = DeepExclude<[number, ...number[]], [...number[], number]>;
  // @ts-expect-error fixme! never would make more sense here.
  type test4 = Expect<Equal<res4, never>>;
});

Deno.test("should only exclude if the pattern really matches", () => {
  type res1 = DeepExclude<number[], [string, ...number[]]>;
  type test1 = Expect<Equal<res1, number[]>>;

  type res3 = DeepExclude<number[], [...string[], number]>;
  type test3 = Expect<Equal<res3, number[]>>;

  // matches, but some cases may not have been handled.
  type res4 = DeepExclude<[number, ...string[]], [...number[], string]>;
  type test4 = Expect<Equal<res4, [number, ...string[]]>>;
});

// @ts-ignore
type cases = [
  Expect<Equal<DeepExclude<(1 | 2 | 3)[], 1[]>, (1 | 2 | 3)[]>>,
  Expect<Equal<DeepExclude<(1 | 2 | 3)[], (1 | 2 | 3)[]>, never>>,
  Expect<Equal<DeepExclude<(1 | 2 | 3)[], unknown[]>, never>>,
  Expect<
    Equal<DeepExclude<(1 | 2 | 3)[] | string[], string[]>, (1 | 2 | 3)[]>
  >,
];

Deno.test("should work with empty list patterns", () => {
  type res1 = DeepExclude<{ values: (1 | 2 | 3)[] }, { values: [] }>;
  type test1 = Expect<
    Equal<res1, { values: [1 | 2 | 3, ...(1 | 2 | 3)[]] }>
  >;

  type cases = [
    Expect<Equal<DeepExclude<[] | [1, 2, 3], []>, [1, 2, 3]>>,
    Expect<
      Equal<
        DeepExclude<{ values: [] | [1, 2, 3] }, { values: [] }>,
        { values: [1, 2, 3] }
      >
    >,
    Expect<
      Equal<
        DeepExclude<{ values: [1, 2, 3] }, { values: [] }>,
        { values: [1, 2, 3] }
      >
    >,
  ];
});

// @ts-ignore
type cases = [
  Expect<Equal<DeepExclude<Set<1 | 2 | 3>, Set<1>>, Set<1 | 2 | 3>>>,
  Expect<Equal<DeepExclude<Set<1 | 2 | 3>, Set<1 | 2 | 3>>, never>>,
  Expect<Equal<DeepExclude<Set<1 | 2 | 3>, Set<unknown>>, never>>,
  Expect<
    Equal<
      DeepExclude<Set<1 | 2 | 3> | Set<string>, Set<string>>,
      Set<1 | 2 | 3>
    >
  >,
];

// @ts-ignore
type cases = [
  Expect<
    Equal<
      DeepExclude<Map<string, 1 | 2 | 3>, Map<string, 1>>,
      Map<string, 1 | 2 | 3>
    >
  >,
  Expect<
    Equal<
      DeepExclude<Map<string, 1 | 2 | 3>, Map<string, 1 | 2 | 3>>,
      never
    >
  >,
  Expect<
    Equal<DeepExclude<Map<string, 1 | 2 | 3>, Map<string, unknown>>, never>
  >,
  Expect<
    Equal<
      DeepExclude<
        Map<string, 1 | 2 | 3> | Map<string, string>,
        Map<string, string>
      >,
      Map<string, 1 | 2 | 3>
    >
  >,
];

Deno.test("should work with big unions", () => {
  type cases = [
    Expect<
      Equal<
        DeepExclude<
          | { type: "textWithColor"; union: BigUnion }
          | {
            type: "textWithColorAndBackground";
            union: BigUnion;
            union2: BigUnion;
          },
          { type: "textWithColor" }
        >,
        {
          type: "textWithColorAndBackground";
          union: BigUnion;
          union2: BigUnion;
        }
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          | { type: "textWithColor"; union: BigUnion }
          | {
            type: "textWithColorAndBackground";
            union: BigUnion;
            union2: BigUnion;
          },
          {
            type: "textWithColorAndBackground";
            union: Exclude<BigUnion, "a">;
          }
        >,
        | { type: "textWithColor"; union: BigUnion }
        | {
          type: "textWithColorAndBackground";
          union: "a";
          union2: BigUnion;
        }
      >
    >,
  ];
});

Deno.test("should work in common cases", () => {
  type cases = [
    Expect<Equal<DeepExclude<"a" | "b" | "c", "a">, "b" | "c">>,
    Expect<
      Equal<
        DeepExclude<
          | { type: "textWithColor"; color: Colors }
          | {
            type: "textWithColorAndBackground";
            color: Colors;
            backgroundColor: Colors;
          },
          { type: "textWithColor" }
        >,
        {
          type: "textWithColorAndBackground";
          color: Colors;
          backgroundColor: Colors;
        }
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          | { type: "textWithColor"; color: Colors }
          | {
            type: "textWithColorAndBackground";
            color: Colors;
            backgroundColor: Colors;
          },
          { type: "textWithColor"; color: "pink" }
        >,
        | {
          type: "textWithColorAndBackground";
          color: Colors;
          backgroundColor: Colors;
        }
        | { type: "textWithColor"; color: "purple" }
        | { type: "textWithColor"; color: "red" }
        | { type: "textWithColor"; color: "yellow" }
        | { type: "textWithColor"; color: "blue" }
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          [Option<{ type: "a" } | { type: "b" }>, "c" | "d"],
          [{ kind: "some"; value: { type: "a" } }, any]
        >,
        | [{ kind: "none" }, "c" | "d"]
        | [{ kind: "some"; value: { type: "b" } }, "c" | "d"]
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          { x: "a" | "b"; y: "c" | "d"; z: "e" | "f" },
          { x: "a"; y: "c" }
        >,
        | { x: "b"; y: "c"; z: "e" | "f" }
        | { x: "b"; y: "d"; z: "e" | "f" }
        | { x: "a"; y: "d"; z: "e" | "f" }
      >
    >,
  ];
});

Deno.test("should work when pattern is a union", () => {
  type cases = [
    Expect<
      Equal<
        DeepExclude<
          { x: "a" | "b"; y: "c" | "d"; z: "e" | "f" },
          { x: "a"; y: "c" } | { x: "b"; y: "c" }
        >,
        { x: "b"; y: "d"; z: "e" | "f" } | { x: "a"; y: "d"; z: "e" | "f" }
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          { a: { b: "x" | "y" | "z" }; c: "u" | "v" },
          { c: "u" } | { a: { b: "x" } }
        >,
        { a: { b: "y" }; c: "v" } | { a: { b: "z" }; c: "v" }
      >
    >,
  ];
});

Deno.test("should correctly exclude", () => {
  type cases = [
    Expect<
      Equal<
        DeepExclude<
          ["a" | "b" | "c", "a" | "b" | "c"],
          ["b" | "c", "b" | "c"]
        >,
        ["a", "a"] | ["a", "b"] | ["a", "c"] | ["b", "a"] | ["c", "a"]
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          ["a" | "b" | "c", { type: "a" | "b" | "c" }],
          ["b" | "c", { type: "c" }]
        >,
        | ["a", { type: "c" }]
        | ["a", { type: "a" }]
        | ["a", { type: "b" }]
        | ["b", { type: "a" }]
        | ["b", { type: "b" }]
        | ["c", { type: "a" }]
        | ["c", { type: "b" }]
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          ["a" | "b" | "c", { type: "a" | "b" | "c" }],
          ["b" | "c", { type: "b" | "c" }]
        >,
        | ["a", { type: "a" }]
        | ["a", { type: "b" }]
        | ["a", { type: "c" }]
        | ["b", { type: "a" }]
        | ["c", { type: "a" }]
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          ["a" | "b" | "c", { type: "a" | "b" | "c" | "d" }],
          ["b" | "c", { type: "b" | "c" }]
        >,
        | ["a", { type: "a" }]
        | ["a", { type: "b" }]
        | ["a", { type: "c" }]
        | ["a", { type: "d" }]
        | ["b", { type: "a" }]
        | ["b", { type: "d" }]
        | ["c", { type: "a" }]
        | ["c", { type: "d" }]
      >
    >,
  ];
});

type Input = readonly ["a" | "b", "c" | "d"];
type p = ["a", "c"] | ["a", "d"] | ["b", "c"] | ["b", "d"];

// @ts-ignore
type cases = [
  Expect<
    Equal<
      DeepExclude<Input, ["a", "c"]>,
      ["a", "d"] | ["b", "c"] | ["b", "d"]
    >
  >,
  Expect<Equal<DeepExclude<Input, p>, never>>,
];

Deno.test("should work with unknown", () => {
  type cases = [
    Expect<
      Equal<
        DeepExclude<
          [number, { type: "a"; b: string }],
          [unknown, { type: "a"; b: unknown }]
        >,
        never
      >
    >,
  ];
});

Deno.test("should work when `b` contains a union", () => {
  type t = Expect<
    Equal<
      DeepExclude<
        {
          type: "c";
          value:
            | { type: "d"; value: boolean }
            | { type: "e"; value: string[] }
            | { type: "f"; value: number[] };
        },
        {
          type: "c";
          value: {
            type: "d" | "e";
          };
        }
      >,
      { type: "c"; value: { type: "f"; value: number[] } }
    >
  >;
});
