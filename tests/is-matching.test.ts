import { expect } from "@std/expect";
import { isMatching, P } from "../mod.ts";
import type { Equal, Expect } from "../src/types/helpers.ts";

Deno.test("should generate a type guard function from a pattern if given a single argument", () => {
  const something: unknown = {
    title: "Hello",
    author: { name: "Gabriel", age: 27 },
  };

  const isBlogPost = isMatching({
    title: P.string,
    author: { name: P.string, age: P.number },
  });

  if (isBlogPost(something)) {
    type t = Expect<
      Equal<
        typeof something,
        { title: string; author: { name: string; age: number } }
      >
    >;
    expect(true).toBe(true);
  } else {
    throw new Error(
      "isMatching should have returned true but it returned false",
    );
  }
});
Deno.test("should act as a type guard function if given a two arguments", () => {
  const something: unknown = {
    title: "Hello",
    author: { name: "Gabriel", age: 27 },
  };

  if (
    isMatching(
      {
        title: P.string,
        author: { name: P.string, age: P.number },
      },
      something,
    )
  ) {
    type t = Expect<
      Equal<
        typeof something,
        { title: string; author: { name: string; age: number } }
      >
    >;
    expect(true).toBe(true);
  } else {
    throw new Error(
      "isMatching should have returned true but it returned false",
    );
  }
});

Deno.test("type inference should be precise without `as const`", () => {
  type Pizza = { type: "pizza"; topping: string };
  type Sandwich = { type: "sandwich"; condiments: string[] };
  type Food = Pizza | Sandwich;

  const food = { type: "pizza", topping: "cheese" } as Food;

  const isPizza = isMatching({ type: "pizza" });

  if (isPizza(food)) {
    type t = Expect<Equal<typeof food, Pizza>>;
  } else {
    throw new Error("Expected food to match the pizza pattern!");
  }

  if (isMatching({ type: "pizza" }, food)) {
    type t = Expect<Equal<typeof food, Pizza>>;
  } else {
    throw new Error("Expected food to match the pizza pattern!");
  }
});
