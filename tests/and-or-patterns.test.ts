import { instanceOf, match, __ } from '../src';
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
              value: [{ [__.or]: [{ type: 'd' }, { type: 'e' }] }, true],
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
          .with({ [__.or]: [{ type: 'a' }, { type: 'b' }] }, (x) => {
            type t = Expect<Equal<typeof x, Input>>;
            return 'branch 3';
          })
          .exhaustive();
    });
  });

  describe('and', () => {
    it('should match if all patterns match', () => {
      const f = (n: Parent) =>
        match(n)
          .with(
            {
              [__.and]: [
                instanceOf(Child1),
                { a: instanceOf(Child2), b: instanceOf(Child2) },
              ],
            },
            (x) => {
              type t = Expect<
                Equal<typeof x, Child1 & { a: Child2; b: Child2 }>
              >;
              return 'match!';
            }
          )
          .with({ [__.or]: [instanceOf(Child1), instanceOf(Child2)] }, () => {
            return 'catchall';
          })
          .exhaustive();

      expect(f(new Child1(new Child2(), new Child2()))).toBe('match!');
      expect(f(new Child1(new Child1(), new Child2()))).toBe('catchall');
    });
  });

  describe('composition', () => {
    it('or and and should nest nicely', () => {
      const f = (n: Parent) =>
        match(n)
          .with(
            {
              [__.and]: [
                instanceOf(Child1),
                {
                  a: { [__.optional]: instanceOf(Child2) },
                  b: instanceOf(Child2),
                },
              ],
            },
            (x) => {
              type t = Expect<
                Equal<typeof x, Child1 & { b: Child2; a?: Child2 | undefined }>
              >;
              return 'match!';
            }
          )
          .with(
            {
              [__.and]: [
                {
                  [__.or]: [
                    { a: { a: instanceOf(Child1), b: instanceOf(Child1) } },
                    { b: { a: instanceOf(Child2), b: instanceOf(Child2) } },
                  ],
                },
                { a: instanceOf(Child1) },
              ],
            },
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
          .with({ [__.or]: [instanceOf(Child1), instanceOf(Child2)] }, () => {
            return 'catchall';
          })
          .exhaustive();

      expect(f(new Child1(new Child2(), new Child2()))).toBe('match!');
      expect(f(new Child1(new Child1(), new Child2()))).toBe('catchall');
    });
    it('or, and and optional should nest nicely', () => {});
  });
});
