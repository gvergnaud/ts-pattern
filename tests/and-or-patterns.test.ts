import { instanceOf, match, select, when, __ } from '../src';
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
              value: [[__.oneOf, { type: 'd' }, { type: 'e' }], true],
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
          .with([__.oneOf, { type: 'a' }, { type: 'b' }], (x) => {
            type t = Expect<Equal<typeof x, Input>>;
            return 'branch 3';
          })
          .exhaustive();
    });

    it('should work on any depth', () => {
      type Country = 'France' | 'Germany' | 'Spain' | 'USA';

      const input = { country: 'France' } as { country: Country };

      match(input)
        .with(
          { country: [__.oneOf, 'France', 'Germany', 'Spain'] },
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
            [
              __.every,
              instanceOf(Child1),
              { a: instanceOf(Child2), b: instanceOf(Child2) },
            ],
            (x) => {
              type t = Expect<
                Equal<typeof x, Child1 & { a: Child2; b: Child2 }>
              >;
              return 'match!';
            }
          )
          .with([__.oneOf, instanceOf(Child1), instanceOf(Child2)], (x) => {
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
            .with([__.every, __.number, __.nullish], (x) => {
              return 'big number';
            })
            .with(__.string, () => 'string')
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
            [
              __.every,
              instanceOf(Child1),
              {
                a: [__.optional, instanceOf(Child2)] as const,
                b: instanceOf(Child2),
              },
            ],
            (x) => {
              type t = Expect<
                Equal<typeof x, Child1 & { b: Child2; a?: Child2 | undefined }>
              >;
              return 'match!';
            }
          )
          .with(
            [
              __.every,
              { a: instanceOf(Child1) },
              [
                __.oneOf,
                { a: { a: instanceOf(Child1), b: instanceOf(Child1) } },
                { b: { a: instanceOf(Child2), b: instanceOf(Child2) } },
              ],
            ],
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
          .with([__.oneOf, instanceOf(Child1), instanceOf(Child2)], () => {
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
              [
                __.every,
                __.number,
                when((n): n is never => typeof n === 'number' && n > 20),
              ],
              () => {
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
            [
              __.every,
              __,
              __,
              when((n): n is number => typeof n === 'number'),
              __,
              select(),
            ],
            (x) => {
              return 'big number';
            }
          )
          .with(__.string, () => 'string')
          .exhaustive();
      };
    });
  });
});
