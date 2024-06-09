import { P } from "../mod.ts";
import type { Equal, Expect } from "../src/types/helpers.ts";

Deno.test("should correctly narrow the input type", () => {
  type Input = ["a" | "b" | "c", "a" | "b" | "c"];
  const Pattern = ["a", P.union("a", "b")] as const;

  type Narrowed = P.narrow<Input, typeof Pattern>;
  //     ^?
  type test = Expect<Equal<Narrowed, ["a", "a" | "b"]>>;
});
