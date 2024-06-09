import { expect } from "@std/expect";
import type { Equal, Expect } from "../src/types/helpers.ts";
import { match, P } from "../mod.ts";

Deno.test("should work with 4 levels of object nesting", () => {
  type Post = {
    type: "post";
    id: number;
    content: { body: string; video: Video };
  };
  type Video = { type: "video"; id: number; content: { src: string } };

  const res = match<Post>({
    type: "post",
    id: 2,
    content: {
      body: "yo",
      video: { type: "video", content: { src: "" }, id: 2 },
    },
  })
    .with(
      { type: "post", content: { video: { id: 2, content: { src: "" } } } },
      (x) => {
        type t = Expect<
          Equal<
            typeof x,
            {
              id: number;
              type: "post";
              content: {
                body: string;
                video: {
                  type: "video";
                  id: 2;
                  content: {
                    src: "";
                  };
                };
              };
            }
          >
        >;
        return 1;
      },
    )
    .with(P.any, () => 1)
    .exhaustive();

  type t = Expect<Equal<typeof res, number>>;

  expect(res).toEqual(1);
});

Deno.test("it should work on 2 level", () => {
  expect(
    match({ one: { two: "2", foo: 2, bar: true } })
      .with({ one: { foo: P.any, bar: P.any } }, (x) => x.one.bar)
      .exhaustive(),
  ).toEqual(true);
});

Deno.test("it should work on 3 level", () => {
  expect(
    match({ one: { two: { three: "2", foo: 2, bar: true } } })
      .with(
        { one: { two: { foo: P.any, bar: P.any } } },
        (x) => x.one.two.bar,
      )
      .exhaustive(),
  ).toEqual(true);
});

Deno.test("it should work on 4 level", () => {
  expect(
    match({ one: { two: { three: { four: "2", foo: 2, bar: true } } } })
      .with(
        { one: { two: { three: { foo: P.any, bar: P.any } } } },
        (x) => x.one.two.three.bar,
      )
      .exhaustive(),
  ).toEqual(true);
});

Deno.test("it should work on 5 level", () => {
  expect(
    match({
      one: { two: { three: { four: { five: "2", foo: 2, bar: true } } } },
    })
      .with(
        { one: { two: { three: { four: { foo: P.any, bar: P.any } } } } },
        (x) => x.one.two.three.four.bar,
      )
      .exhaustive(),
  ).toEqual(true);
});

Deno.test("it should work on 17 level", () => {
  expect(
    match({
      a: {
        a: {
          a: {
            a: {
              a: {
                a: {
                  a: {
                    a: {
                      a: {
                        a: {
                          a: {
                            a: {
                              a: {
                                a: {
                                  a: {
                                    a: {
                                      a: {
                                        a: {
                                          a: {
                                            foo: 2,
                                            bar: true,
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
      .with(
        {
          a: {
            a: {
              a: {
                a: {
                  a: {
                    a: {
                      a: {
                        a: {
                          a: {
                            a: {
                              a: {
                                a: {
                                  a: {
                                    a: {
                                      a: {
                                        a: {
                                          a: {
                                            a: {
                                              a: {
                                                foo: P.any,
                                                bar: P.select("bar"),
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        (_, x) => x.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.bar,
      )
      .exhaustive(),
  ).toEqual(true);
});

Deno.test("it should work on 2 levels", () => {
  expect(
    match([{ two: "2", foo: 2, bar: true }])
      .with([{ foo: P.any, bar: P.select("bar") }], ({ bar }) => bar)
      .exhaustive(),
  ).toEqual(true);
});

Deno.test("it should work on 3 levels", () => {
  expect(
    match([[{ two: "2", foo: 2, bar: true }]])
      .with([[{ foo: P.any, bar: P.select("bar") }]], ({ bar }) => bar)
      .exhaustive(),
  ).toEqual(true);
});

Deno.test("it should work on 4 levels", () => {
  expect(
    match([[[{ two: "2", foo: 2, bar: true }]]])
      .with([[[{ foo: P.any, bar: P.select("bar") }]]], ({ bar }) => bar)
      .exhaustive(),
  ).toEqual(true);
});

Deno.test("it should work on 5 levels", () => {
  expect(
    match([[[[{ two: "2", foo: 2, bar: true }]]]])
      .with([[[[{ foo: P.any, bar: P.any }]]]], ([[[[{ bar }]]]]) => bar)
      .exhaustive(),
  ).toEqual(true);
});

Deno.test("it should work on 17 levels", () => {
  expect(
    match(
      [
        [[[[[[[[[[[[[[[[[{ two: "2", foo: 2, bar: true }]]]]]]]]]]]]]]]]],
      ] as const,
    )
      .with(
        [[[[[[[[[[[[[[[[[[{
          foo: P.any,
          bar: P.select("bar"),
        }]]]]]]]]]]]]]]]]]],
        ({ bar }) => bar,
      )
      .exhaustive(),
  ).toEqual(true);
});
