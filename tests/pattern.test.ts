import { Pattern } from '../src';
import { Equal, Expect } from '../src/types/helpers';
import { Matchable } from '../src/types/Pattern';

type ExtendsPattern<a, p extends Pattern<a>> = true;

describe('Pattern', () => {
  it("shouldn't allow invalid patterns", () => {
    type Input = { type: 'a'; x: { y: string } } | { type: 'b' };

    type x = Pattern<{ kind: 'some'; value: number } | { kind: 'none' }>;

    type cases = [
      ExtendsPattern<
        Input,
        { type: 'a'; x: { y: Matchable<unknown, string> } }
      >,
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
});
