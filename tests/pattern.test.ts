import { Pattern } from '../src';
import { Equal, Expect } from '../src/types/helpers';
import { Matchable } from '../src/types/Pattern';

type ExtendsPattern<a, p extends Pattern<a>> = true;

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
          Pattern<{ kind: 'some'; value: number } | { kind: 'none' }>,
          | Matchable<
              { kind: 'some'; value: number } | { kind: 'none' },
              unknown,
              any,
              any,
              unknown
            >
          | {
              readonly kind?: Pattern<'some' | 'none'> | undefined;
              readonly value?: Pattern<number> | undefined;
            }
        >
      >
    ];
  });

  it('Should return a single object pattern when the input is a union of objects and other types', () => {
    type cases = [
      Expect<
        Equal<
          Pattern<{ kind: 'some'; value: number } | { kind: 'none' } | string>,
          | Matchable<
              string | { kind: 'some'; value: number } | { kind: 'none' },
              unknown,
              any,
              any,
              unknown
            >
          | {
              readonly kind?: Pattern<'some' | 'none'> | undefined;
              readonly value?: Pattern<number> | undefined;
            }
          | string
        >
      >,
      Expect<
        Equal<
          Pattern<{ a?: { name: string; age: number } } | { b: '' }>,
          | Matchable<
              { a?: { name: string; age: number } } | { b: '' },
              unknown,
              any,
              any,
              unknown
            >
          | {
              readonly a?:
                | Pattern<{ name: string; age: number } | undefined>
                | undefined;
              readonly b?: Pattern<''> | undefined;
            }
        >
      >,
      Expect<
        Equal<
          Pattern<{ name: string; age: number } | undefined>,
          | Matchable<
              { name: string; age: number } | undefined,
              unknown,
              any,
              any,
              unknown
            >
          | {
              readonly name?: Pattern<string> | undefined;
              readonly age?: Pattern<number> | undefined;
            }
          | undefined
        >
      >,
      Expect<
        Equal<
          Pattern<{ name: string; age: number } | [type: 'Hello']>,
          | Matchable<
              { name: string; age: number } | [type: 'Hello'],
              unknown,
              any,
              any,
              unknown
            >
          | {
              readonly name?: Pattern<string> | undefined;
              readonly age?: Pattern<number> | undefined;
            }
          | readonly [type: Pattern<'Hello'>]
        >
      >
    ];
  });
});
