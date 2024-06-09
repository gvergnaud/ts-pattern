import type {
  Drop,
  Equal,
  Expect,
  IntersectObjects,
  IsReadonlyArray,
  Iterator,
  LeastUpperBound,
  Take,
  UpdateAt,
} from "../src/types/helpers.ts";

Deno.test("should correctly return the start of a tuple", () => {
  type cases = [
    Expect<Equal<Take<[1, 2, 3], Iterator<0>>, []>>,
    Expect<Equal<Take<[1, 2, 3], Iterator<1>>, [1]>>,
    Expect<Equal<Take<[1, 2, 3], Iterator<2>>, [1, 2]>>,
    Expect<Equal<Take<[1, 2, 3], Iterator<3>>, [1, 2, 3]>>,
    Expect<Equal<Take<[1, 2, 3], Iterator<4>>, [1, 2, 3]>>,
  ];
});

Deno.test("should correctly return the start of a readonly tuple", () => {
  type cases = [
    Expect<Equal<Take<readonly [1, 2, 3], Iterator<0>>, []>>,
    Expect<Equal<Take<readonly [1, 2, 3], Iterator<1>>, [1]>>,
    Expect<Equal<Take<readonly [1, 2, 3], Iterator<2>>, [1, 2]>>,
    Expect<Equal<Take<readonly [1, 2, 3], Iterator<3>>, [1, 2, 3]>>,
    Expect<Equal<Take<readonly [1, 2, 3], Iterator<4>>, [1, 2, 3]>>,
  ];
});

Deno.test("should correctly remove the n first elements of a tuple", () => {
  type cases = [
    Expect<Equal<Drop<[1, 2, 3], Iterator<0>>, [1, 2, 3]>>,
    Expect<Equal<Drop<[1, 2, 3], Iterator<1>>, [2, 3]>>,
    Expect<Equal<Drop<[1, 2, 3], Iterator<2>>, [3]>>,
    Expect<Equal<Drop<[1, 2, 3], Iterator<3>>, []>>,
    Expect<Equal<Drop<[1, 2, 3], Iterator<4>>, []>>,
  ];
});

Deno.test("should correctly remove the n first elements of a readonly tuple", () => {
  type cases = [
    Expect<
      Equal<Drop<readonly [1, 2, 3], Iterator<0>>, readonly [1, 2, 3]>
    >,
    Expect<Equal<Drop<readonly [1, 2, 3], Iterator<1>>, [2, 3]>>,
    Expect<Equal<Drop<readonly [1, 2, 3], Iterator<2>>, [3]>>,
    Expect<Equal<Drop<readonly [1, 2, 3], Iterator<3>>, []>>,
    Expect<Equal<Drop<readonly [1, 2, 3], Iterator<4>>, []>>,
  ];
});

type cases = [
  Expect<
    Equal<UpdateAt<readonly [1, 2, 3], Iterator<0>, true>, [true, 2, 3]>
  >,
  Expect<
    Equal<UpdateAt<readonly [1, 2, 3], Iterator<1>, true>, [1, true, 3]>
  >,
  Expect<
    Equal<UpdateAt<readonly [1, 2, 3], Iterator<2>, true>, [1, 2, true]>
  >,
  Expect<Equal<UpdateAt<readonly [1, 2, 3], Iterator<3>, true>, [1, 2, 3]>>,
  Expect<Equal<UpdateAt<readonly [1, 2, 3], Iterator<4>, true>, [1, 2, 3]>>,
];

Deno.test("If both a and b extend each other, it should pick b", () => {
  class B {}
  class A extends B {}
  type t = Expect<Equal<LeastUpperBound<A | B, B>, B>>;
});

Deno.test("IntersectObjects", () => {
  type x = IntersectObjects<
    | { k: "a"; value: number; a: string }
    | { k: "b"; value: string; b: string }
    | { k: "c"; value: number; c: string }
  >;

  type t = Expect<
    Equal<
      x,
      {
        k: "a" | "b" | "c";
        value: number | string;
        a: string;
        b: string;
        c: string;
      }
    >
  >;

  type t2 = Expect<
    Equal<
      IntersectObjects<
        | { k: "a"; value: number }
        | { k: "b"; value: string }
        | { k: "c"; value: number }
      >,
      {
        k: "a" | "b" | "c";
        value: number | string;
      }
    >
  >;

  type t3 = Expect<
    Equal<
      IntersectObjects<
        | { type: 1; data: number }
        | { type: "two"; data: string }
        | { type: 3; data: boolean }
        | { type: 4 }
      >,
      { type: 1 | "two" | 3 | 4; data: number | string | boolean }
    >
  >;
});

type t1 = IsReadonlyArray<readonly []>;
type test1 = Expect<Equal<t1, true>>;
type t2 = IsReadonlyArray<readonly number[]>;
type test2 = Expect<Equal<t2, true>>;
type t3 = IsReadonlyArray<readonly [number]>;
type test3 = Expect<Equal<t3, true>>;
type t4 = IsReadonlyArray<readonly [number, ...(readonly any[])]>;
type test4 = Expect<Equal<t4, true>>;
type t5 = IsReadonlyArray<readonly [...(readonly any[]), number]>;
type test5 = Expect<Equal<t5, true>>;

type t6 = IsReadonlyArray<[]>;
type test6 = Expect<Equal<t6, false>>;
type t7 = IsReadonlyArray<number[]>;
type test7 = Expect<Equal<t7, false>>;
type t8 = IsReadonlyArray<[number]>;
type test8 = Expect<Equal<t8, false>>;
type t9 = IsReadonlyArray<[number, ...any[]]>;
type test9 = Expect<Equal<t9, false>>;
type t10 = IsReadonlyArray<[...any[], number]>;
type test10 = Expect<Equal<t10, false>>;
