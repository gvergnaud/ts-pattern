import { P } from '../src';
import { Equal, Expect } from '../src/types/helpers';
import { Matchable } from '../src/types/Pattern';

type ExtendsPattern<a, p extends P.Pattern<a>> = true;

describe('Pattern', () => {
  it("shouldn't allow invalid patterns", () => {
    type cases = [
      ExtendsPattern<
        { type: 'a'; x: { y: string } } | { type: 'b' },
        { type: 'a'; x: { y: Matchable<unknown, string> } }
      >
    ];
  });

  it('Should return a single object pattern when the input is a union of objects', () => {
    type cases = [
      Expect<
        Equal<
          P.Pattern<{ kind: 'some'; value: number } | { kind: 'none' }>,
          | Matchable<
              { kind: 'some'; value: number } | { kind: 'none' },
              unknown,
              any,
              any,
              unknown
            >
          | {
              readonly kind?: P.Pattern<'some'>;
              readonly value?: P.Pattern<number>;
            }
          | {
              readonly kind?: P.Pattern<'none'>;
            }
        >
      >
    ];
  });

  it('Should return a single object pattern when the input is a union of objects and other types', () => {
    type t = P.Pattern<
      { kind: 'some'; value: number } | { kind: 'none' } | string
    >;

    type t1 = Expect<
      Equal<
        P.Pattern<{ kind: 'some'; value: number } | { kind: 'none' } | string>,
        | Matchable<
            string | { kind: 'some'; value: number } | { kind: 'none' },
            unknown,
            any,
            any,
            unknown
          >
        | {
            readonly kind?: P.Pattern<'some'>;
            readonly value?: P.Pattern<number>;
          }
        | {
            readonly kind?: P.Pattern<'none'>;
          }
        | string
      >
    >;

    type t2 = Expect<
      Equal<
        P.Pattern<{ a?: { name: string; age: number } } | { b: '' }>,
        | Matchable<
            { a?: { name: string; age: number } } | { b: '' },
            unknown,
            any,
            any,
            unknown
          >
        | {
            readonly a?: P.Pattern<{ name: string; age: number }>;
          }
        | {
            readonly b?: P.Pattern<''>;
          }
      >
    >;
    type t3 = Expect<
      Equal<
        P.Pattern<{ name: string; age: number } | undefined>,
        | Matchable<
            { name: string; age: number } | undefined,
            unknown,
            any,
            any,
            unknown
          >
        | {
            readonly name?: P.Pattern<string>;
            readonly age?: P.Pattern<number>;
          }
        | undefined
      >
    >;
    type t4 = Expect<
      Equal<
        P.Pattern<{ name: string; age: number } | [type: 'Hello']>,
        | Matchable<
            { name: string; age: number } | [type: 'Hello'],
            unknown,
            any,
            any,
            unknown
          >
        | {
            readonly name?: P.Pattern<string>;
            readonly age?: P.Pattern<number>;
          }
        | readonly [type: P.Pattern<'Hello'>]
      >
    >;
  });
});
