import { expect } from "@std/expect";
import type { Equal, Expect } from "../src/types/helpers.ts";
import { match, P } from "../mod.ts";
import type { Event, State } from "./types-catalog/utils.ts";

type Input = [State, Event];

Deno.test("wildcard patterns should typecheck", () => {
  let pattern: P.Pattern<Input>;
  pattern = P._;
  pattern = [P._, P._];
  pattern = [{ status: "success", data: "" }, P._];
  pattern = [{ status: "success", data: P.string }, P._];
  pattern = [{ status: "success", data: P._ }, P._];
  pattern = [{ status: "error", error: P.instanceOf(Error) }, P._];
  pattern = [{ status: "idle" }, P._];
  pattern = [P._, { type: "fetch" }];
  pattern = [P._, { type: P._ }];
  pattern = [{ status: "idle" }, { type: "fetch" }];
  pattern = [{ status: P._ }, { type: P._ }];
});

Deno.test("guard patterns should typecheck", () => {
  const pattern1: P.Pattern<Input> = P.when(() => true);
  const pattern2: P.Pattern<Input> = P.when((x) => {
    type t = Expect<Equal<typeof x, Input>>;
    return true;
  });

  const pattern3: P.Pattern<Input> = [
    P.when((state) => {
      type t = Expect<Equal<typeof state, State>>;
      return !!state;
    }),
    P.when((event) => {
      type t = Expect<Equal<typeof event, Event>>;
      return !!event;
    }),
  ];

  const pattern3_1: P.Pattern<Input> = [
    P._,
    { type: P.when((t: Event["type"]) => true) },
  ];

  const pattern4: P.Pattern<Input> = [
    {
      status: "success",
      data: P.when((d) => {
        type t = Expect<Equal<typeof d, string>>;
        return true;
      }),
    },
    P._,
  ];

  const pattern4_1: P.Pattern<Input> = [{ status: "error", data: "" }, P._];

  const pattern5: P.Pattern<Input> = [
    P._,
    { type: P.when((t: Event["type"]) => true) },
  ];

  const isFetch = (type: string): type is "fetch" => type === "fetch";

  const pattern6: P.Pattern<Input> = [P._, { type: P.when(isFetch) }];

  const pattern7: P.Pattern<{ x: string }> = {
    x: P.when((x) => {
      type t = Expect<Equal<typeof x, string>>;
      return true;
    }),
  };

  const pattern8: P.Pattern<[{ x: string }]> = [
    {
      x: P.when((x) => {
        type t = Expect<Equal<typeof x, string>>;
        return true;
      }),
    },
  ];

  const pattern9: P.Pattern<[{ x: string }, { y: number }]> = [
    {
      x: P.when((x) => {
        type t = Expect<Equal<typeof x, string>>;
        return true;
      }),
    },
    {
      y: P.when((y) => {
        type t = Expect<Equal<typeof y, number>>;
        return true;
      }),
    },
  ];

  const pattern10: P.Pattern<string | number> = P.when((x) => {
    type t = Expect<Equal<typeof x, string | number>>;
    return true;
  });
});

Deno.test("should infer values correctly in handler", () => {
  type Input = { type: string; hello?: { yo: number } } | string;

  match<Input>({ type: "hello" }).with(P.string, (x) => {
    type t = Expect<Equal<typeof x, string>>;
    return "ok";
  });

  const res = match<Input>({ type: "hello" }).with(P.string, (x) => {
    type t = Expect<Equal<typeof x, string>>;
    return "ok";
  });

  match<Input>({ type: "hello" }).with(
    P.when((x) => true),
    (x) => {
      type t = Expect<Equal<typeof x, Input>>;
      return "ok";
    },
  );

  match<Input>({ type: "hello" }).with(
    P.when((x) => {
      type t = Expect<Equal<typeof x, Input>>;
      return true;
    }),
    (x) => {
      type t = Expect<Equal<typeof x, Input>>;
      return "ok";
    },
  );
  match<Input>({ type: "hello" }).with(P.not("hello" as const), (x) => {
    type t = Expect<Equal<typeof x, Input>>;
    return "ok";
  });
  match<Input>({ type: "hello" }).with(P.not(P.string), (x) => {
    type t = Expect<
      Equal<
        typeof x,
        {
          type: string;
          hello?: {
            yo: number;
          };
        }
      >
    >;
    return "ok";
  });
  match<Input>({ type: "hello" })
    .with(P.not(P.when((x) => true)), (x) => {
      type t = Expect<Equal<typeof x, Input>>;
      return "ok";
    })
    .with({ type: P._ }, (x) => {
      type t = Expect<
        Equal<
          typeof x,
          {
            type: string;
            hello?: {
              yo: number;
            };
          }
        >
      >;
      return "ok";
    });
  match<Input>({ type: "hello" }).with({ type: P.string }, (x) => {
    type t = Expect<
      Equal<typeof x, { type: string; hello?: { yo: number } | undefined }>
    >;
    return "ok";
  });
  match<Input>({ type: "hello" }).with({ type: P.when((x) => true) }, (x) => {
    type t = Expect<
      Equal<typeof x, { type: string; hello?: { yo: number } | undefined }>
    >;
    return "ok";
  });
  match<Input>({ type: "hello" }).with(
    { type: P.not("hello" as "hello") },
    (x) => {
      type t = Expect<
        Equal<
          typeof x,
          {
            type: string;
            hello?: { yo: number } | undefined;
          }
        >
      >;
      return "ok";
    },
  );

  match<Input>({ type: "hello" }).with({ type: P.not(P.string) }, (x) => {
    type t = Expect<Equal<typeof x, Input>>;
    return "ok";
  });
  match<Input>({ type: "hello" }).with(
    { type: P.not(P.when((x) => true)) },
    (x) => {
      type t = Expect<Equal<typeof x, Input>>;
      return "ok";
    },
  );
  match<Input>({ type: "hello" }).with(
    P.not({ type: P.when((x) => true) }),
    (x) => {
      type t = Expect<Equal<typeof x, string>>;
      return "ok";
    },
  );
  match<Input>({ type: "hello" }).with(P.not({ type: P.string }), (x) => {
    type t = Expect<Equal<typeof x, string>>;
    return "ok";
  });
  match<Input>({ type: "hello" }).with(P._, (x) => {
    type t = Expect<Equal<typeof x, Input>>;
    return "ok";
  });
});

Deno.test("a union of object or primitive should be matched with a correct type inference", () => {
  type Input =
    | string
    | number
    | boolean
    | { type: string | number }
    | string[]
    | [number, number];

  match<Input>({ type: "hello" })
    .with(P.string, (x) => {
      type t = Expect<Equal<typeof x, string>>;
      return "ok";
    })
    .with(P.number, (x) => {
      type t = Expect<Equal<typeof x, number>>;
      return "ok";
    })
    .with(P.boolean, (x) => {
      type t = Expect<Equal<typeof x, boolean>>;
      return "ok";
    })
    .with({ type: P.string }, (x) => {
      type t = Expect<Equal<typeof x, { type: string }>>;
      return "ok";
    })
    .with({ type: P._ }, (x) => {
      type t = Expect<Equal<typeof x, { type: string | number }>>;
      return "ok";
    })
    .with([P.string], (x) => {
      type t = Expect<Equal<typeof x, [string]>>;
      return "ok";
    })
    .with([P.number, P.number], (x) => {
      type t = Expect<Equal<typeof x, [number, number]>>;
      return "ok";
    })
    .run();
});

const users: unknown = [{ name: "Gabriel", postCount: 20 }];

const typedUsers = match(users)
  .with([{ name: P.string, postCount: P.number }], (users) => users)
  .otherwise(() => []);

// type of `typedUsers` is { name: string, postCount: number }[]

expect(
  typedUsers
    .map((user) => `<p>${user.name} has ${user.postCount} posts.</p>`)
    .join(""),
).toEqual(`<p>Gabriel has 20 posts.</p>`);

Deno.test("should enforce all branches return the right typeP. when it's set", () => {
  match<number, number>(2)
    //  @ts-expect-error
    .with(2, () => "string")
    //  @ts-expect-error
    .otherwise(() => "?");
});

Deno.test("issue #73: should enforce the handler as the right type", () => {
  const f = (x: number) => x.toLocaleString();
  const g = (x: string) => x.toUpperCase();
  expect(() =>
    match(false)
      // @ts-expect-error
      .with(true, f)
      // @ts-expect-error
      .with(false, g)
      // @ts-expect-error
      .with(true, (n: string) => "")
      .exhaustive()
  ).toThrow();
});

Deno.test("union of literals", () => {
  const f = (input: "a" | "b") =>
    match(input)
      .with("a", () => "a handled")
      // @ts-expect-error duplicates shouldn't be permitted
      .with("a", () => "duplicated")
      .with("b", () => "b handled")
      .exhaustive();

  const f2 = (input: "a" | "b" | 2 | 1) =>
    match(input)
      .with("a", () => "a handled")
      .with("b", () => "b handled")
      .with(1, () => "1 handled")
      // @ts-expect-error duplicates shouldn't be permitted
      .with(1, () => "duplicated")
      .with(2, () => "2 handled")
      .exhaustive();
});

Deno.test("union of objects", () => {
  type Input = { type: "a"; data: string } | { type: "b"; data: number };

  const f = (input: Input) =>
    match(input)
      .with({ type: "a" }, () => "a handled")
      .with(
        {
          // @ts-expect-error duplicates shouldn't be permitted
          type: "a",
        },
        () => "duplicated",
      )
      .with({ type: "b" }, () => "b handled")
      .exhaustive();
});

Deno.test("should error after P.any", () => {
  type Input = { type: "a"; data: string } | { type: "b"; data: number };

  const f = (input: Input) =>
    match(input)
      .with(P.any, () => "a handled")
      // @ts-expect-error
      .with({ type: "a" }, () => "duplicated")
      .exhaustive();
});

Deno.test("shouldn't exclude in case of primitive type", () => {
  const width = 100;
  const height = 200;
  const size = 10;
  let canShowInlineLegend = true as boolean;

  match<boolean>(true)
    .with(size >= 100 && width > height * 2.25, () => "table")
    .with(size >= 100 && height > width * 1.5, () => "table")
    .with(canShowInlineLegend, () => "inline")
    .otherwise(() => "none");
});

Deno.test("should correctly instantiate the input type on every pattern creator functions", () => {
  match<"a" | "b">("a").with(
    P.when((x) => {
      type test = Expect<Equal<typeof x, "a" | "b">>;
      return true;
    }),
    () => "a",
  );

  match<"a" | "b">("a").with(
    // @ts-expect-error
    P.union("somethingwrong"),
    () => "a",
  );

  match<{ type: "a" } | { type: "b" }>({ type: "a" }).with(
    // @ts-expect-error
    P.intersection("asd"),
    () => "a",
  );

  match<{ type: "a" } | { type: "b" }>({ type: "a" }).with(
    // @ts-expect-error
    P.intersection("asd"),
    () => "a",
  );

  match<{ type: "a" } | { type: "b" }>({ type: "a" }).with(
    P.intersection({
      // @ts-expect-error
      type: P.union("oops"),
    }),
    () => "a",
  );

  match<{ type: "a" } | { type: "b" }>({ type: "a" }).with(
    // @ts-expect-error
    P.optional("asd"),
    () => "a",
  );

  match<{ type: "a" } | { type: "b" }>({ type: "a" }).with(
    P.optional({
      // @ts-expect-error
      type: P.union("oops"),
    }),
    () => "a",
  );
});
