import { match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('and, and or patterns', () => {
  type A = {
    type: 'a';
    value: [
      { type: 'd'; value: number } | { type: 'e'; value: string },
      boolean
    ];
  };

  type B = {
    type: 'b';
    data: {
      some?: 'thing' | 'stuff' | '?';
    };
    children: Input[];
  };

  type Input = A | B;

  abstract class Parent {}

  class Child1 extends Parent {
    constructor(public a?: Parent, public b?: Parent) {
      super();
    }
  }

  class Child2 extends Parent {
    constructor(public a?: Parent, public b?: Parent) {
      super();
    }
  }

  describe('or', () => {
    it('should match if one of the patterns matches', () => {
      const f = (input: Input) =>
        match(input)
          .with(
            {
              type: 'a',
              value: [P.union({ type: 'd' }, { type: 'e' }), true],
            },
            (x) => {
              type t = Expect<
                Equal<
                  typeof x,
                  {
                    type: 'a';
                    value: [
                      (
                        | { type: 'd'; value: number }
                        | { type: 'e'; value: string }
                      ),
                      true
                    ];
                  }
                >
              >;
              return 'branch 1';
            }
          )
          .with({ type: 'a' }, (x) => {
            type t = Expect<Equal<typeof x, A>>;
            return 'branch 2';
          })
          .with(
            P.union(
              { type: 'a', value: [{ type: 'd' }, true] } as const,
              {
                type: 'b',
              } as const
            ),
            (x) => {
              type t = Expect<
                Equal<
                  typeof x,
                  | B
                  | {
                      type: 'a';
                      value: [{ type: 'd'; value: number }, true];
                    }
                >
              >;
              return 'branch 3';
            }
          )
          .exhaustive();
    });

    it('unions and intersections should work on properties shared by several element in a union type', () => {
      type C = {
        type: 'c';
        value:
          | { type: 'd'; value: boolean }
          | { type: 'e'; value: string[] }
          | { type: 'f'; value: number[] };
      };

      type Input =
        | { type: 'a'; value: string }
        | { type: 'b'; value: number }
        | C;

      const f = (input: Input) =>
        match(input)
          .with({ type: P.union('a', 'b') }, (x) => {
            type t = Expect<
              Equal<
                typeof x,
                { type: 'a'; value: string } | { type: 'b'; value: number }
              >
            >;
            return 'branch 1';
          })
          .with({ type: 'c' }, (x) => {
            type t = Expect<Equal<typeof x, C>>;
            return 'branch 2';
          })
          .exhaustive();

      const fe = (input: Input) =>
        match(input)
          .with({ type: P.union('a', 'b') }, (x) => {
            type t = Expect<
              Equal<
                typeof x,
                { type: 'a'; value: string } | { type: 'b'; value: number }
              >
            >;
            return 'branch 1';
          })
          .with({ type: 'c', value: { type: P.union('d', 'e') } }, (x) => {
            type t = Expect<
              Equal<
                typeof x,
                {
                  type: 'c';
                  value:
                    | { type: 'd'; value: boolean }
                    | { type: 'e'; value: string[] };
                }
              >
            >;
            return 'branch 2';
          })
          .with({ type: 'c', value: { type: 'f' } }, (x) => {
            type t = Expect<
              Equal<
                typeof x,
                {
                  type: 'c';
                  value: { type: 'f'; value: number[] };
                }
              >
            >;
            return 'branch 2';
          })
          // FIXME: This should work
          .exhaustive();
    });

    it('should work on any depth', () => {
      type Country = 'France' | 'Germany' | 'Spain' | 'USA';

      const input = { country: 'France' } as { country: Country };

      match(input)
        .with(
          { country: P.union('France', 'Germany', 'Spain') },
          (x) => 'Europe'
        )
        .with({ country: 'USA' }, () => 'America')
        .exhaustive();
    });
  });

  describe('and', () => {
    it('should match if all patterns match', () => {
      const f = (n: Parent) =>
        match(n)
          .with(
            P.intersection(P.instanceOf(Child1), {
              a: P.instanceOf(Child2),
              b: P.instanceOf(Child2),
            }),
            (x) => {
              type t = Expect<
                Equal<typeof x, Child1 & { a: Child2; b: Child2 }>
              >;
              return 'match!';
            }
          )
          .with(P.union(P.instanceOf(Child1), P.instanceOf(Child2)), (x) => {
            return 'catchall';
          })
          .exhaustive();

      expect(f(new Child1(new Child2(), new Child2()))).toBe('match!');
      expect(f(new Child1(new Child1(), new Child2()))).toBe('catchall');
    });

    it('should consider two incompatible patterns as matching never', () => {
      const f = (n: number | string) => {
        return (
          match(n)
            .with(P.intersection(P.number, P.nullish), (x) => {
              return 'never';
            })
            .with(P.string, () => 'string')
            // @ts-expect-error NonExhaustiveError<number>
            .exhaustive()
        );
      };
      expect(() => f(20)).toThrow();
    });
  });

  describe('composition', () => {
    it('or and and should nest nicely', () => {
      const f = (n: Parent) =>
        match(n)
          .with(
            P.intersection(P.instanceOf(Child1), {
              a: P.optional(P.instanceOf(Child2)),
              b: P.instanceOf(Child2),
            }),
            (x) => {
              type t = Expect<
                Equal<typeof x, Child1 & { b: Child2; a?: Child2 | undefined }>
              >;
              return 'match!';
            }
          )
          .with(
            P.intersection(
              { a: P.instanceOf(Child1) },
              P.union(
                { a: { a: P.instanceOf(Child1), b: P.instanceOf(Child1) } },
                { b: { a: P.instanceOf(Child2), b: P.instanceOf(Child2) } }
              )
            ),
            (x) => {
              type t = Expect<
                Equal<
                  typeof x,
                  { a: Child1 } & (
                    | { a: { a: Child1; b: Child1 } }
                    | { b: { a: Child2; b: Child2 } }
                  )
                >
              >;
              return 'branch 2';
            }
          )
          .with(P.union(P.instanceOf(Child1), P.instanceOf(Child2)), () => {
            return 'catchall';
          })
          .exhaustive();

      expect(f(new Child1(new Child2(), new Child2()))).toBe('match!');
      expect(f(new Child1(new Child1(), new Child2()))).toBe('catchall');
    });

    it("using a and patterns with when shouldn't consider the pattern exhaustive unless the guard function truly matches every possibilities of the input", () => {
      const f = (n: number) => {
        return (
          match(n)
            .with(
              P.intersection(
                P.number,
                P.when((n): n is never => typeof n === 'number' && n > 20)
              ),
              (x) => {
                return 'big number';
              }
            )
            // @ts-expect-error
            .exhaustive()
        );
      };

      const f2 = (n: number | string) => {
        return match(n)
          .with(
            P.intersection(
              P.__,
              P.__,
              P.when((n): n is number => typeof n === 'number'),
              P.__,
              P.select()
            ),
            (x) => {
              type t = Expect<Equal<typeof x, number>>;
              return 'big number';
            }
          )
          .with(P.string, () => 'string')
          .exhaustive();
      };

      const f3 = (n: number | string) => {
        return (
          match(n)
            .with(
              P.intersection(
                P.__,
                P.__,
                P.when((n): n is number => typeof n === 'number'),
                P.__,
                P.select()
              ),
              (x) => {
                type t = Expect<Equal<typeof x, number>>;
                return 'big number';
              }
            )
            // @ts-expect-error: string isn't handled
            .exhaustive()
        );
      };
    });

    it('intersection should work with selects', () => {
      const f = (n: number | string) => {
        return match({ n })
          .with(
            {
              n: P.intersection(
                P.__,
                P.when((n): n is number => typeof n === 'number'),
                P.__,
                P.select()
              ),
            },
            (x) => {
              type t = Expect<Equal<typeof x, number>>;
              return x;
            }
          )
          .with({ n: P.string }, () => 'string')
          .exhaustive();
      };

      expect(f(20)).toEqual(20);
      expect(f('20')).toEqual('string');
    });

    it('union & intersections should work with selects', () => {
      type Input = {
        value:
          | { type: 'a'; v: number }
          | { type: 'b'; v: string }
          | { type: 'c'; v: boolean };
      };
      const f = (input: Input) => {
        return match(input)
          .with(
            {
              value: P.intersection(
                P.select(),
                P.union({ type: 'a' }, { type: 'b' })
              ),
            },
            (x) => {
              type t = Expect<
                Equal<
                  typeof x,
                  { type: 'a'; v: number } | { type: 'b'; v: string }
                >
              >;
              return x.type;
            }
          )
          .with({ value: { type: 'c' } }, () => 'other')
          .exhaustive();
      };

      expect(f({ value: { type: 'a', v: 20 } })).toEqual('a');
      expect(f({ value: { type: 'c', v: true } })).toEqual('other');
    });

    it('unions containing selects should consider all selections optional', () => {
      type Input = {
        value:
          | { type: 'a'; n: number }
          | { type: 'b'; s: string }
          | { type: 'c'; b: boolean };
      };
      const f = (input: Input) => {
        return match(input)
          .with(
            {
              value: P.union(
                { type: 'a', n: P.select('n') },
                { type: 'b', s: P.select('s') }
              ),
            },
            (x) => {
              type t = Expect<
                Equal<
                  typeof x,
                  {
                    n: number | undefined;
                    s: string | undefined;
                  }
                >
              >;
              return x;
            }
          )
          .with(
            {
              value: P.union({ type: 'a', n: P.select() }, { type: 'b' }),
            },
            (x) => {
              type t = Expect<Equal<typeof x, number | undefined>>;
              return x;
            }
          )

          .with({ value: { type: 'c' } }, () => 'other')
          .exhaustive();
      };

      expect(f({ value: { type: 'a', n: 20 } })).toEqual({
        n: 20,
        s: undefined,
      });
      expect(f({ value: { type: 'b', s: 'str' } })).toEqual({
        a: undefined,
        s: 'str',
      });
      expect(f({ value: { type: 'c', b: true } })).toEqual('other');
    });

    it('P.not should work with unions and intersections', () => {
      type Input = {
        value:
          | { type: 'a'; n: number }
          | { type: 'b'; s: string }
          | { type: 'c'; b: boolean };
      };
      const f = (input: Input) => {
        return match(input)
          .with({ value: P.not({ type: P.union('a', 'b') }) }, (x) => {
            type t = Expect<
              Equal<typeof x, { value: { type: 'c'; b: boolean } }>
            >;
            return 'not a or b';
          })
          .with({ value: P.union({ type: 'a' }, { type: 'b' }) }, (x) => {
            type t = Expect<
              Equal<
                typeof x,
                { value: { type: 'a'; n: number } | { type: 'b'; s: string } }
              >
            >;
            return 'a or b';
          })
          .exhaustive();
      };

      expect(f({ value: { type: 'b', s: 'str' } })).toEqual('a or b');
      expect(f({ value: { type: 'c', b: true } })).toEqual('not a or b');
    });

    it('P.array should work with unions and intersections', () => {
      type Input = {
        value: (
          | { type: 'a'; n: number }
          | { type: 'b'; s: string }
          | { type: 'c'; b: boolean }
        )[];
      };
      const f = (input: Input) => {
        return match(input)
          .with({ value: P.array({ type: P.union('a', 'b') }) }, (x) => {
            type t = Expect<
              Equal<
                typeof x,
                {
                  value: (
                    | { type: 'a'; n: number }
                    | { type: 'b'; s: string }
                  )[];
                }
              >
            >;
            return x.value.map((x) => x.type).join(',');
          })
          .with(
            { value: P.array(P.union({ type: 'a' }, { type: 'b' })) },
            (x) => {
              type t = Expect<
                Equal<
                  typeof x,
                  {
                    value: (
                      | { type: 'a'; n: number }
                      | { type: 'b'; s: string }
                    )[];
                  }
                >
              >;
              return x.value.map((x) => x.type).join(',');
            }
          )
          .with({ value: P.array(P.__) }, () => 'other')
          .exhaustive();
      };

      expect(
        f({
          value: [
            { type: 'b', s: 'str' },
            { type: 'a', n: 2 },
          ],
        })
      ).toEqual('b,a');
      expect(
        f({
          value: [
            { type: 'a', n: 2 },
            { type: 'c', b: true },
          ],
        })
      ).toEqual('other');
    });

    it('Composing P.union and P.array should work on union of arrays', () => {
      type Input = {
        value:
          | { type: 'a'; n: number }[]
          | { type: 'b'; s: string }[]
          | { type: 'c'; b: boolean }[];
      };

      const f = (input: Input) => {
        return match(input)
          .with({ value: P.array({ type: P.union('a', 'b') }) }, (x) => {
            type t = Expect<
              Equal<
                typeof x,
                {
                  value:
                    | { type: 'a'; n: number }[]
                    | { type: 'b'; s: string }[];
                }
              >
            >;
            return x.value[0].type;
          })
          .with(
            { value: P.array(P.union({ type: 'a' }, { type: 'b' })) },
            (x) => {
              type t = Expect<
                Equal<
                  typeof x,
                  {
                    value:
                      | { type: 'a'; n: number }[]
                      | { type: 'b'; s: string }[];
                  }
                >
              >;
              return x.value[0].type;
            }
          )
          .with({ value: P.array(P.__) }, () => 'other')
          .exhaustive();
      };

      expect(
        f({
          value: [
            { type: 'b', s: 'str' },
            { type: 'b', s: '2' },
          ],
        })
      ).toEqual('b');
      expect(
        f({
          value: [
            { type: 'a', n: 2 },
            { type: 'a', n: 3 },
          ],
        })
      ).toEqual('a');
    });

    it('Composing P.union and P.array should work on union of objects containing arrays', () => {
      type Input =
        | {
            value: { type: 'a'; n: number }[];
          }
        | {
            value: { type: 'b'; s: string }[];
          }
        | {
            value: { type: 'c'; b: boolean }[];
          };

      const f = (input: Input) => {
        return (
          match(input)
            .with(
              { value: P.array(P.union({ type: 'a' }, { type: 'b' })) },
              (x) => {
                type t = Expect<
                  Equal<
                    typeof x,
                    | {
                        value: { type: 'a'; n: number }[];
                      }
                    | {
                        value: { type: 'b'; s: string }[];
                      }
                  >
                >;
                return x.value[0].type;
              }
            )
            // @ts-expect-error: FIXME: ideal this should work
            .with({ value: P.array({ type: P.union('a', 'b') }) }, (x) => {})
            .with({ value: P.array(P.__) }, () => 'other')
            .exhaustive()
        );
      };

      expect(
        f({
          value: [
            { type: 'b', s: 'str' },
            { type: 'b', s: '2' },
          ],
        })
      ).toEqual('b');
      expect(
        f({
          value: [
            { type: 'a', n: 2 },
            { type: 'a', n: 3 },
          ],
        })
      ).toEqual('a');
    });

    it('P.optional should work with unions and intersections', () => {
      type Input = {
        value?:
          | { type: 'a'; n: number }
          | { type: 'b'; s: string }
          | { type: 'c'; b: boolean };
      };
      const f = (input: Input) => {
        return match(input)
          .with(
            { value: P.optional(P.union({ type: 'a' }, { type: 'b' })) },
            (x) => {
              type t = Expect<
                Equal<
                  typeof x,
                  {
                    value?:
                      | { type: 'a'; n: number }
                      | { type: 'b'; s: string }
                      | undefined;
                  }
                >
              >;
              return 'maybe a or b';
            }
          )
          .with({ value: { type: 'c' } }, (x) => {
            type t = Expect<
              Equal<typeof x, { value: { type: 'c'; b: boolean } }>
            >;
            return 'c';
          })
          .exhaustive();
      };

      expect(f({ value: { type: 'a', n: 20 } })).toEqual('maybe a or b');
      expect(f({ value: { type: 'b', s: 'str' } })).toEqual('maybe a or b');
      expect(f({})).toEqual('maybe a or b');
      expect(f({ value: { type: 'c', b: true } })).toEqual('c');
    });
  });

  it('unknown input', () => {
    match<unknown>({})
      .with(
        // It would be nice if as const wasn't necessary with unknown inputs
        { a: P.optional(P.union('hello' as const, 'bonjour' as const)) },
        (x) => {
          type t = Expect<
            Equal<typeof x, { a?: 'hello' | 'bonjour' | undefined }>
          >;
          return 'ok';
        }
      )
      .otherwise(() => 'ko');
  });

  it('Should work with P.typed()', () => {
    class A {
      constructor(public foo: 'bar' | 'baz') {}
    }

    class B {
      constructor(public str: string) {}
    }

    const f = (input: A | B) =>
      match(input)
        .with(
          P.typed<A | B>().intersection(P.instanceOf(A), { foo: 'bar' }),
          // prop: A & { foo: 'bar' }
          (prop) => {
            type t = Expect<Equal<typeof prop, A & { foo: 'bar' }>>;
            return 'branch 1';
          }
        )
        .with(
          P.typed<A | B>().intersection(P.instanceOf(A), { foo: 'baz' }),
          // prop: A & { foo: 'baz' }
          (prop) => {
            type t = Expect<Equal<typeof prop, A & { foo: 'baz' }>>;
            return 'branch 2';
          }
        )
        .with(
          P.instanceOf(B),
          // prop: B
          (prop) => {
            type t = Expect<Equal<typeof prop, B>>;
            return 'branch 3';
          }
        )
        .exhaustive();
  });
});
