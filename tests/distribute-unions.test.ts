import type {
  Distribute,
  DistributeMatchingUnions,
  FindUnions,
  FindUnionsMany,
} from "../src/types/DistributeUnions.ts";

import type { Equal, Expect } from "../src/types/helpers.ts";
import type { Option } from "./types-catalog/utils.ts";

Deno.test("should correctly find all unions on an object", () => {
  type res1 = FindUnions<{ a: 1 | 2; b: 3 | 4; c: 6 | 7 }, { a: 1; b: 3 }>;
  type test1 = Expect<
    Equal<
      res1,
      [
        {
          cases:
            | {
              value: 1;
              subUnions: [];
            }
            | {
              value: 2;
              subUnions: [];
            };
          path: ["a"];
        },
        {
          cases:
            | {
              value: 4;
              subUnions: [];
            }
            | {
              value: 3;
              subUnions: [];
            };
          path: ["b"];
        },
      ]
    >
  >;
  type res2 = FindUnions<
    {
      a: 1 | 2;
      b: 3 | 4;
      c: 5 | 6;
      d: 7 | 8; // not matched
    },
    { a: 1; b: 3; c: 5 }
  >;
  type test2 = Expect<
    Equal<
      res2,
      [
        {
          cases:
            | {
              value: 1;
              subUnions: [];
            }
            | {
              value: 2;
              subUnions: [];
            };
          path: ["a"];
        },
        {
          cases:
            | {
              value: 3;
              subUnions: [];
            }
            | {
              value: 4;
              subUnions: [];
            };
          path: ["b"];
        },
        {
          cases:
            | {
              value: 5;
              subUnions: [];
            }
            | {
              value: 6;
              subUnions: [];
            };
          path: ["c"];
        },
      ]
    >
  >;
  type res3 = FindUnions<
    {
      a: 1 | 2;
      b: 3 | 4;
      c: 5 | 6;
      d: { e: 7 | 8; f: 9 | 10 };
      g: 11 | 12; // not matched by the pattern
    },
    {
      a: 1;
      b: 3;
      c: 5;
      d: { e: 7; f: 9 };
    }
  >;

  type test3 = Expect<
    Equal<
      res3,
      [
        {
          cases:
            | {
              value: 1;
              subUnions: [];
            }
            | {
              value: 2;
              subUnions: [];
            };
          path: ["a"];
        },
        {
          cases:
            | {
              value: 3;
              subUnions: [];
            }
            | {
              value: 4;
              subUnions: [];
            };
          path: ["b"];
        },
        {
          cases:
            | {
              value: 5;
              subUnions: [];
            }
            | {
              value: 6;
              subUnions: [];
            };
          path: ["c"];
        },
        {
          cases:
            | {
              value: 7;
              subUnions: [];
            }
            | {
              value: 8;
              subUnions: [];
            };
          path: ["d", "e"];
        },
        {
          cases:
            | {
              value: 9;
              subUnions: [];
            }
            | {
              value: 10;
              subUnions: [];
            };
          path: ["d", "f"];
        },
      ]
    >
  >;

  type res4 = FindUnions<
    { a: { b: { e: 7 | 8; f: 9 | 10 } } } | { c: 11 | 12 },
    { a: { b: { e: 7; f: 9 } } }
  >;
  type test4 = Expect<
    Equal<
      res4,
      [
        {
          cases:
            | {
              value: { a: { b: { e: 7 | 8; f: 9 | 10 } } };
              subUnions: [
                {
                  cases:
                    | {
                      value: 7;
                      subUnions: [];
                    }
                    | {
                      value: 8;
                      subUnions: [];
                    };
                  path: ["a", "b", "e"];
                },
                {
                  cases:
                    | {
                      value: 9;
                      subUnions: [];
                    }
                    | {
                      value: 10;
                      subUnions: [];
                    };
                  path: ["a", "b", "f"];
                },
              ];
            }
            | { value: { c: 11 | 12 }; subUnions: [] };
          path: [];
        },
      ]
    >
  >;

  type res5 = FindUnions<
    {
      e: "not a union";
      a: {
        e: 7 | 8;
        f: 9 | 10;
        g: 11 | 12; // not matched
      };
      b: 2 | 3;
    },
    { e: "not a union"; a: { e: 7; f: 9 }; b: 2 }
  >;
  type test5 = Expect<
    Equal<
      res5,
      [
        {
          cases:
            | {
              value: 7;
              subUnions: [];
            }
            | {
              value: 8;
              subUnions: [];
            };
          path: ["a", "e"];
        },
        {
          cases:
            | {
              value: 9;
              subUnions: [];
            }
            | {
              value: 10;
              subUnions: [];
            };
          path: ["a", "f"];
        },
        {
          cases:
            | {
              value: 2;
              subUnions: [];
            }
            | {
              value: 3;
              subUnions: [];
            };
          path: ["b"];
        },
      ]
    >
  >;
});

Deno.test("should correctly find all unions on a tuple", () => {
  type cases = [
    Expect<
      Equal<
        FindUnions<[1 | 2, 3 | 4], [1, 3]>,
        [
          {
            cases:
              | {
                value: 1;
                subUnions: [];
              }
              | {
                value: 2;
                subUnions: [];
              };
            path: [0];
          },
          {
            cases:
              | {
                value: 3;
                subUnions: [];
              }
              | {
                value: 4;
                subUnions: [];
              };
            path: [1];
          },
        ]
      >
    >,
    Expect<
      Equal<
        FindUnions<[1 | 2, 3 | 4, 5 | 6], [1, 3, 5]>,
        [
          {
            cases:
              | {
                value: 1;
                subUnions: [];
              }
              | {
                value: 2;
                subUnions: [];
              };
            path: [0];
          },
          {
            cases:
              | {
                value: 3;
                subUnions: [];
              }
              | {
                value: 4;
                subUnions: [];
              };
            path: [1];
          },
          {
            cases:
              | {
                value: 5;
                subUnions: [];
              }
              | {
                value: 6;
                subUnions: [];
              };
            path: [2];
          },
        ]
      >
    >,
    Expect<
      Equal<
        FindUnions<
          { type: "a"; value: 1 | 2 } | { type: "b"; value: 4 | 5 },
          { type: "a"; value: 1 }
        >,
        [
          {
            cases:
              | {
                value: { type: "a"; value: 1 | 2 };
                subUnions: [
                  {
                    cases:
                      | {
                        value: 1;
                        subUnions: [];
                      }
                      | {
                        value: 2;
                        subUnions: [];
                      };
                    path: ["value"];
                  },
                ];
              }
              | {
                value: { type: "b"; value: 4 | 5 };
                subUnions: [];
              };
            path: [];
          },
        ]
      >
    >,
    Expect<
      Equal<
        FindUnions<readonly ["a" | "b", "c" | "d"], ["a", "c"]>,
        [
          {
            cases:
              | {
                value: "a";
                subUnions: [];
              }
              | {
                value: "b";
                subUnions: [];
              };
            path: [0];
          },
          {
            cases:
              | {
                value: "c";
                subUnions: [];
              }
              | {
                value: "d";
                subUnions: [];
              };
            path: [1];
          },
        ]
      >
    >,
  ];
});

Deno.test("when matched against an empty array, the input should be turned into a union of empty array and non-empty array", () => {
  type res1 = FindUnions<readonly number[], readonly []>;
  type tes1 = Expect<
    Equal<
      res1,
      [
        {
          cases:
            | {
              value: readonly [];
              subUnions: [];
            }
            | {
              value: readonly [number, ...(readonly number[])];
              subUnions: [];
            };
          path: [];
        },
      ]
    >
  >;

  type res2 = FindUnions<[number], []>;
  type tes2 = Expect<Equal<res2, []>>;

  type res3 = FindUnions<[number], [number, ...number[]]>;
  type tes3 = Expect<Equal<res3, []>>;

  type res4 = FindUnions<[number], [...number[], number]>;
  type tes4 = Expect<Equal<res4, []>>;

  type res5 = FindUnions<[number], [...number[], number]>;
  type tes5 = Expect<Equal<res5, []>>;

  type res6 = FindUnions<readonly number[], readonly [number, ...number[]]>;
  type tes6 = Expect<
    Equal<
      res6,
      [
        {
          cases:
            | {
              value: readonly [];
              subUnions: [];
            }
            | {
              value: readonly [number, ...(readonly number[])];
              subUnions: [];
            };
          path: [];
        },
      ]
    >
  >;

  type res7 = FindUnions<readonly number[], readonly [...number[], number]>;
  type tes7 = Expect<
    Equal<
      res7,
      [
        {
          cases:
            | {
              value: readonly [];
              subUnions: [];
            }
            | {
              value: readonly [...number[], number];
              subUnions: [];
            };
          path: [];
        },
      ]
    >
  >;

  type res8 = FindUnions<
    readonly [...number[], number],
    readonly [...number[], number]
  >;
  type tes8 = Expect<Equal<res8, []>>;

  type res9 = FindUnions<
    readonly [number, ...number[]],
    readonly [number, ...number[]]
  >;
  type tes9 = Expect<Equal<res9, []>>;
});

Deno.test("should avoid duplicating the unions, even if the pattern matches the same path twice", () => {
  type cases = [
    Expect<
      Equal<
        FindUnionsMany<
          { type: { x: "a"; y: 1 | 2 } | { x: "b"; y: 3 | 4 } },
          { type: { x: "a"; y: 1 } } | { type: { x: "a"; y: 2 } }
        >,
        [
          {
            cases:
              | {
                value: {
                  x: "a";
                  y: 1 | 2;
                };
                subUnions: [
                  {
                    cases:
                      | {
                        value: 1;
                        subUnions: [];
                      }
                      | {
                        value: 2;
                        subUnions: [];
                      };
                    path: ["type", "y"];
                  },
                ];
              }
              | {
                value: {
                  x: "b";
                  y: 3 | 4;
                };
                subUnions: [];
              };
            path: ["type"];
          },
        ]
      >
    >,
  ];
});

Deno.test("should distribute unions into a list of values with their path", () => {
  type cases = [
    Expect<
      Equal<
        Distribute<
          [
            {
              cases:
                | {
                  value: 1;
                  subUnions: [];
                }
                | {
                  value: 2;
                  subUnions: [];
                };
              path: [0];
            },
            {
              cases:
                | {
                  value: 3;
                  subUnions: [];
                }
                | {
                  value: 4;
                  subUnions: [];
                };
              path: [1];
            },
          ]
        >,
        | [[1, [0]], [3, [1]]]
        | [[1, [0]], [4, [1]]]
        | [[2, [0]], [3, [1]]]
        | [[2, [0]], [4, [1]]]
      >
    >,
    Expect<
      Equal<
        Distribute<
          [
            {
              cases:
                | {
                  value: 1;
                  subUnions: [];
                }
                | {
                  value: 2;
                  subUnions: [];
                };
              path: [0];
            },
            {
              cases:
                | {
                  value: 3;
                  subUnions: [];
                }
                | {
                  value: 4;
                  subUnions: [];
                };
              path: [1];
            },
            {
              cases:
                | {
                  value: 5;
                  subUnions: [];
                }
                | {
                  value: 6;
                  subUnions: [];
                };
              path: [2];
            },
          ]
        >,
        | [[1, [0]], [3, [1]], [5, [2]]]
        | [[1, [0]], [3, [1]], [6, [2]]]
        | [[1, [0]], [4, [1]], [5, [2]]]
        | [[1, [0]], [4, [1]], [6, [2]]]
        | [[2, [0]], [3, [1]], [5, [2]]]
        | [[2, [0]], [3, [1]], [6, [2]]]
        | [[2, [0]], [4, [1]], [5, [2]]]
        | [[2, [0]], [4, [1]], [6, [2]]]
      >
    >,
    Equal<
      // Nested
      Distribute<
        [
          {
            cases:
              | {
                value: {
                  type: "a";
                  value: 1 | 2;
                };
                subUnions: [
                  {
                    cases:
                      | {
                        value: 1;
                        subUnions: [];
                      }
                      | {
                        value: 2;
                        subUnions: [];
                      };
                    path: ["value"];
                  },
                ];
              }
              | {
                value: {
                  type: "b";
                  value: 4 | 5;
                };
                subUnions: [
                  {
                    cases:
                      | {
                        value: 4;
                        subUnions: [];
                      }
                      | {
                        value: 5;
                        subUnions: [];
                      };
                    path: ["value"];
                  },
                ];
              };
            path: [];
          },
        ]
      >,
      | [[{ type: "a"; value: 1 | 2 }, []], [1, ["value"]]]
      | [[{ type: "a"; value: 1 | 2 }, []], [2, ["value"]]]
      | [[{ type: "b"; value: 4 | 5 }, []], [4, ["value"]]]
      | [[{ type: "b"; value: 4 | 5 }, []], [5, ["value"]]]
    >,
  ];
});

type cases = [
  Expect<
    Equal<
      DistributeMatchingUnions<
        { a: 1 | 2; b: "3" | "4"; c: "5" | "6" },
        { a: 1; b: "3"; c: "5" }
      >,
      | { a: 1; b: "3"; c: "5" }
      | { a: 1; b: "3"; c: "6" }
      | { a: 1; b: "4"; c: "5" }
      | { a: 1; b: "4"; c: "6" }
      | { a: 2; b: "3"; c: "5" }
      | { a: 2; b: "3"; c: "6" }
      | { a: 2; b: "4"; c: "5" }
      | { a: 2; b: "4"; c: "6" }
    >
  >,
  Expect<
    Equal<
      DistributeMatchingUnions<
        { x: "a"; value: Option<string> } | { x: "b"; value: Option<number> },
        { x: "a"; value: { kind: "none" } }
      >,
      | { x: "a"; value: { kind: "none" } }
      | { x: "a"; value: { kind: "some"; value: string } }
      | { x: "b"; value: Option<number> }
    >
  >,
  Expect<
    Equal<
      DistributeMatchingUnions<
        [1, number] | ["two", string] | [3, boolean],
        [3, true]
      >,
      [1, number] | ["two", string] | [3, false] | [3, true]
    >
  >,
];

Deno.test("should leave unions of literals untouched", () => {
  type cases = [
    Expect<Equal<DistributeMatchingUnions<"a" | "b", "a">, "a" | "b">>,
    Expect<Equal<DistributeMatchingUnions<1 | 2, 1>, 1 | 2>>,
    Expect<Equal<DistributeMatchingUnions<boolean, true>, false | true>>,
  ];
});

Deno.test("should work on nested tuples", () => {
  type cases = [
    Expect<
      Equal<
        DistributeMatchingUnions<
          [1, ["two", Option<string>] | [3, Option<boolean>]],
          [1, ["two", { kind: "some"; value: string }]]
        >,
        | [1, ["two", { kind: "none" }]]
        | [1, ["two", { kind: "some"; value: string }]]
        | [1, [3, Option<boolean>]]
      >
    >,
    Expect<
      Equal<
        DistributeMatchingUnions<
          [1, ["two", Option<string>]] | [3, Option<boolean>],
          [1, ["two", { kind: "some"; value: string }]]
        >,
        | [1, ["two", { kind: "none" }]]
        | [1, ["two", { kind: "some"; value: string }]]
        | [3, Option<boolean>]
      >
    >,
    Expect<
      Equal<
        DistributeMatchingUnions<["a" | "b", 1 | 2], ["a", unknown]>,
        ["a", 1 | 2] | ["b", 1 | 2]
      >
    >,
  ];
});

Deno.test("unknown should match but shouldn't distribute", () => {
  type cases = [
    Expect<
      Equal<
        DistributeMatchingUnions<
          [1, ["two", Option<string>]] | [3, Option<boolean>],
          [1, unknown]
        >,
        [1, ["two", Option<string>]] | [3, Option<boolean>]
      >
    >,
    Expect<
      Equal<
        DistributeMatchingUnions<
          { a: 1 | 2; b: "3" | "4"; c: "5" | "6" },
          { a: 1; b: unknown; c: unknown }
        >,
        | { a: 1; b: "3" | "4"; c: "5" | "6" }
        | { a: 2; b: "3" | "4"; c: "5" | "6" }
      >
    >,
    Expect<
      Equal<
        DistributeMatchingUnions<
          { a: 1 | 2; b: "3" | "4"; c: "5" | "6" },
          { a: 1; b: "3"; c: unknown }
        >,
        | { a: 1; b: "3"; c: "5" | "6" }
        | { a: 2; b: "3"; c: "5" | "6" }
        | { a: 1; b: "4"; c: "5" | "6" }
        | { a: 2; b: "4"; c: "5" | "6" }
      >
    >,
    Expect<
      Equal<
        DistributeMatchingUnions<
          { a: 1 | 2; b: ["3" | "4", "5" | "6"] },
          { a: 1; b: ["3", unknown] }
        >,
        | { a: 1; b: ["3", "5" | "6"] }
        | { a: 2; b: ["3", "5" | "6"] }
        | { a: 1; b: ["4", "5" | "6"] }
        | { a: 2; b: ["4", "5" | "6"] }
      >
    >,
  ];
});

Deno.test("should work for non unions", () => {
  type res1 = DistributeMatchingUnions<[], []>;
  type test1 = Expect<Equal<res1, []>>;

  type cases = [
    Expect<Equal<DistributeMatchingUnions<{}, {}>, {}>>,
    Expect<
      Equal<
        DistributeMatchingUnions<Map<string, string>, Map<string, string>>,
        Map<string, string>
      >
    >,
    Expect<
      Equal<DistributeMatchingUnions<Set<string>, Set<string>>, Set<string>>
    >,
    Expect<Equal<DistributeMatchingUnions<string, string>, string>>,
    Expect<Equal<DistributeMatchingUnions<number, number>, number>>,
    Expect<Equal<DistributeMatchingUnions<any, any>, any>>,
    Expect<Equal<DistributeMatchingUnions<never, never>, never>>,
    Expect<Equal<DistributeMatchingUnions<unknown, unknown>, unknown>>,
  ];
});

Deno.test("should work with objects", () => {
  type X = 1 | 2 | 3 | 4 | 5 | 6 | 7;

  type cases = [
    Expect<
      Equal<
        DistributeMatchingUnions<
          { a: X; b: X; c: X; d: X; e: X; f: X; g: X; h: X; i: X },
          { a: 1 }
        >,
        | { a: 1; b: X; c: X; d: X; e: X; f: X; g: X; h: X; i: X }
        | { a: 2; b: X; c: X; d: X; e: X; f: X; g: X; h: X; i: X }
        | { a: 3; b: X; c: X; d: X; e: X; f: X; g: X; h: X; i: X }
        | { a: 4; b: X; c: X; d: X; e: X; f: X; g: X; h: X; i: X }
        | { a: 5; b: X; c: X; d: X; e: X; f: X; g: X; h: X; i: X }
        | { a: 6; b: X; c: X; d: X; e: X; f: X; g: X; h: X; i: X }
        | { a: 7; b: X; c: X; d: X; e: X; f: X; g: X; h: X; i: X }
      >
    >,
    Expect<
      Equal<
        DistributeMatchingUnions<
          {
            type: "type";
            x: undefined;
            q: string;
            union1: "a" | "b";
            color: "3";
            union2: "1" | "2";
          },
          { union1: "a"; union2: "1" }
        >,
        | {
          type: "type";
          q: string;
          x: undefined;
          union1: "a";
          color: "3";
          union2: "1";
        }
        | {
          type: "type";
          q: string;
          x: undefined;
          union1: "a";
          color: "3";
          union2: "2";
        }
        | {
          type: "type";
          q: string;
          x: undefined;
          union1: "b";
          color: "3";
          union2: "1";
        }
        | {
          type: "type";
          q: string;
          x: undefined;
          union1: "b";
          color: "3";
          union2: "2";
        }
      >
    >,
  ];
});

Deno.test("should not distribute unions for lists, set and maps", () => {
  // The reason is that list can be heterogeneous, so
  // matching on a A[] for a in input of (A|B)[] doesn't
  // rule anything out. You can still have a (A|B)[] afterward.
  // The same logic goes for Set and Maps.
  type cases = [
    Expect<
      Equal<DistributeMatchingUnions<("a" | "b")[], "a"[]>, ("a" | "b")[]>
    >,
    Expect<
      Equal<
        DistributeMatchingUnions<
          { type: "a" | "b"; x: "c" | "d" }[],
          { type: "a"; x: "c" }[]
        >,
        { type: "a" | "b"; x: "c" | "d" }[]
      >
    >,
    Expect<
      Equal<
        DistributeMatchingUnions<Set<"a" | "b">, Set<"a">>,
        Set<"a" | "b">
      >
    >,
    Expect<
      Equal<
        DistributeMatchingUnions<Map<string, "a" | "b">, Map<string, "a">>,
        Map<string, "a" | "b">
      >
    >,
    Expect<
      Equal<
        DistributeMatchingUnions<
          | {
            type: "a";
            items: ({ t: "x"; some: string; data: number } | { t: "y" })[];
          }
          | {
            type: "b";
            items: { other: boolean; data: string }[];
          },
          { type: "a"; items: { t: "y" }[] }
        >,
        | {
          type: "a";
          items: ({ t: "x"; some: string; data: number } | { t: "y" })[];
        }
        | {
          type: "b";
          items: { other: boolean; data: string }[];
        }
      >
    >,
  ];
});

Deno.test("should return the input if the inverted pattern is `unknown` (if the pattern is `P._`", () => {
  type cases = [
    Expect<
      Equal<
        DistributeMatchingUnions<
          [1, number] | ["two", string] | [3, boolean],
          unknown
        >,
        [1, number] | ["two", string] | [3, boolean]
      >
    >,
    Expect<
      Equal<
        DistributeMatchingUnions<
          { a: 1 | 2; b: "3" | "4"; c: "5" | "6" },
          unknown
        >,
        { a: 1 | 2; b: "3" | "4"; c: "5" | "6" }
      >
    >,
    Expect<
      Equal<
        DistributeMatchingUnions<
          | { x: "a"; value: Option<string> }
          | { x: "b"; value: Option<number> },
          unknown
        >,
        { x: "a"; value: Option<string> } | { x: "b"; value: Option<number> }
      >
    >,
  ];
});

Deno.test("should work with readonly inputs", () => {
  type cases = [
    Expect<
      Equal<
        DistributeMatchingUnions<readonly ["a" | "b", "c" | "d"], ["a", "c"]>,
        ["a", "c"] | ["a", "d"] | ["b", "c"] | ["b", "d"]
      >
    >,
  ];
});
