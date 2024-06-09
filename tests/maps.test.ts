import { expect } from "@std/expect";
import type { Equal, Expect } from "../src/types/helpers.ts";
import { match, P } from "../mod.ts";

Deno.test("should match Map patterns", () => {
  const usersMap = new Map([
    ["a", { name: "alice" }],
    ["b", { name: "bob" }],
  ]);

  const userPattern = { name: P.string };

  const res = match<Map<string, { name: string }>>(usersMap)
    .with(P.map(P.union("b", "a"), userPattern), (map) => ({
      name: map.get("b")!.name + " " + map.get("a")!.name,
    }))
    .with(P.map("b", userPattern), (map) => map.get("b")!)
    .with(P._, () => ({ name: "unknown" }))
    .run();

  type t = Expect<Equal<typeof res, { name: string }>>;

  expect(res).toEqual({ name: "bob alice" });
});

Deno.test("should match any map if P.map isn't given any arguments", () => {
  const usersMap = new Map([
    ["a", { name: "alice" }],
    ["b", { name: "bob" }],
  ]);

  const res = match<Map<string, { name: string }>>(usersMap)
    .with(P.map(), () => true)
    .exhaustive();
  type t = Expect<Equal<typeof res, boolean>>;
  expect(res).toEqual(true);
});
