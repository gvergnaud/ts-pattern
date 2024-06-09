import type { BuildMany } from "../src/types/BuildMany.ts";
import type { Equal, Expect } from "../src/types/helpers.ts";
import type { State } from "./types-catalog/utils.ts";

Deno.test("should correctly update the content of a readonly tuple", () => {
  type cases = [
    Expect<
      Equal<
        BuildMany<readonly [number, State], [[{ status: "idle" }, [1]]]>,
        [number, { status: "idle" }]
      >
    >,
    Expect<
      Equal<
        BuildMany<
          readonly [number, State],
          [[{ status: "idle" }, [1]]] | [[{ status: "loading" }, [1]]]
        >,
        [number, { status: "idle" }] | [number, { status: "loading" }]
      >
    >,
  ];
});
