import { expect } from "@std/expect";
import type { Equal, Expect } from "../src/types/helpers.ts";
import { match, P } from "../mod.ts";
import type { Event, State } from "./types-catalog/utils.ts";

Deno.test("should match tuple patterns", () => {
  const sum = (xs: number[]): number =>
    match(xs)
      .with([], () => 0)
      .with([P.number, P.number], ([x, y]) => x + y)
      .with([P.number, P.number, P.number], ([x, y, z]) => x + y + z)
      .with(
        [P.number, P.number, P.number, P.number],
        ([x, y, z, w]) => x + y + z + w,
      )
      .run();

  expect(sum([2, 3, 2, 4])).toEqual(11);
});

Deno.test("should discriminate correctly union of tuples", () => {
  type Input =
    | ["+", number, number]
    | ["*", number, number]
    | ["-", number]
    | ["++", number];

  const res = match<Input, number>(["-", 2])
    .with(["+", P.number, P.number], (value) => {
      type t = Expect<Equal<typeof value, ["+", number, number]>>;
      const [, x, y] = value;
      return x + y;
    })
    .with(["*", P.number, P.number], (value) => {
      type t = Expect<Equal<typeof value, ["*", number, number]>>;
      const [, x, y] = value;
      return x * y;
    })
    .with(["-", P.number], (value) => {
      type t = Expect<Equal<typeof value, ["-", number]>>;
      const [, x] = value;
      return -x;
    })
    .with(["++", P.number], ([, x]) => x + 1)
    .exhaustive();

  const res2 = match<Input, number>(["-", 2])
    .with(["+", P._, P._], (value) => {
      type t = Expect<Equal<typeof value, ["+", number, number]>>;
      const [, x, y] = value;
      return x + y;
    })
    .with(["*", P._, P._], (value) => {
      type t = Expect<Equal<typeof value, ["*", number, number]>>;
      const [, x, y] = value;
      return x * y;
    })
    .with(["-", P._], (value) => {
      type t = Expect<Equal<typeof value, ["-", number]>>;
      const [, x] = value;
      return -x;
    })
    .run();

  expect(res).toEqual(-2);
  expect(res2).toEqual(-2);
});

const tuples: { tuple: [string, number]; expected: string }[] = [
  { tuple: ["coucou", 20], expected: "number match" },
  { tuple: ["hello", 20], expected: "perfect match" },
  { tuple: ["hello", 21], expected: "string match" },
  { tuple: ["azeaze", 17], expected: "not matching" },
];

tuples.forEach(({ tuple, expected }) => {
  Deno.test(`should work with ${tuple}`, () => {
    expect(
      match<[string, number], string>(tuple)
        .with(["hello", 20], (x) => {
          type t = Expect<Equal<typeof x, ["hello", 20]>>;
          return `perfect match`;
        })
        .with(["hello", P._], (x) => {
          type t = Expect<Equal<typeof x, ["hello", number]>>;
          return `string match`;
        })
        .with([P._, 20], (x) => {
          type t = Expect<Equal<typeof x, [string, 20]>>;
          return `number match`;
        })
        .with([P.string, P.number], (x) => {
          type t = Expect<Equal<typeof x, [string, number]>>;
          return `not matching`;
        })
        .exhaustive(),
    ).toEqual(expected);
  });
});

Deno.test("should work with tuple of records", () => {
  const initState: State = {
    status: "idle",
  };

  const reducer = (state: State, event: Event): State =>
    match<[State, Event], State>([state, event])
      .with([P.any, { type: "fetch" }], (x) => {
        type t = Expect<Equal<typeof x, [State, { type: "fetch" }]>>;

        return {
          status: "loading",
        };
      })
      .with([{ status: "loading" }, { type: "success" }], (x) => {
        type t = Expect<
          Equal<
            typeof x,
            [
              { status: "loading" },
              { type: "success"; data: string; requestTime?: number },
            ]
          >
        >;

        return {
          status: "success",
          data: x[1].data,
        };
      })
      .with([{ status: "loading" }, { type: "error" }], (x) => {
        type t = Expect<
          Equal<
            typeof x,
            [{ status: "loading" }, { type: "error"; error: Error }]
          >
        >;

        return {
          status: "error",
          error: x[1].error,
        };
      })
      .with([{ status: "loading" }, { type: "cancel" }], (x) => {
        type t = Expect<
          Equal<typeof x, [{ status: "loading" }, { type: "cancel" }]>
        >;

        return initState;
      })
      .otherwise(() => state);

  expect(reducer(initState, { type: "fetch" })).toEqual({
    status: "loading",
  });

  expect(
    reducer({ status: "loading" }, { type: "success", data: "yo" }),
  ).toEqual({
    status: "success",
    data: "yo",
  });

  expect(reducer({ status: "loading" }, { type: "cancel" })).toEqual({
    status: "idle",
  });
});

Deno.test("should work with as const", () => {
  type State = { type: "a" } | { type: "b" };
  type Event = { type: "c" } | { type: "d" };
  const state = { type: "a" } as State;
  const event = { type: "c" } as Event;

  const output = match([state, event])
    .with([{ type: "a" }, { type: "c" }], () => "a + c")
    .otherwise(() => "no");

  expect(output).toEqual("a + c");
});

Deno.test("should work with nested tuples", () => {
  type State = {};
  type Msg = [type: "Login"] | [type: "UrlChange", url: string];

  function update(state: State, msg: Msg) {
    return match<[State, Msg], string>([state, msg])
      .with([P.any, ["Login"]], () => "ok")
      .with([P.any, ["UrlChange", P.select()]], () => "not ok")
      .exhaustive();
  }
});
