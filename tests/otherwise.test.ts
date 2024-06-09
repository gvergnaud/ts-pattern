import { expect } from "@std/expect";
import { match } from "../mod.ts";

Deno.test("should pass matched value to otherwise", () => {
  const result = match<number>(42)
    .with(51, (d) => d)
    .otherwise((d) => d);
  expect(result).toBe(42);
});
