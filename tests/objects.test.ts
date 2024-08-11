import { isMatching, match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('Objects', () => {
  describe('symbols', () => {
    const symbolA = Symbol('symbol-a');
    const symbolB = Symbol('symbol-b');
    const symbolC = Symbol('symbol-c');
    type Input = { [symbolA]: { [symbolB]: 'foo' | 'bar' } };

    it('should work with symbols', () => {
      const fn1 = (obj: Input) => {
        if (isMatching({ [symbolA]: { [symbolB]: 'foo' } }, obj)) {
          type t = Expect<
            Equal<typeof obj, { [symbolA]: { [symbolB]: 'foo' } }>
          >;
        } else {
          throw new Error('Expected obj to match the foo pattern!');
        }
      };

      const fn2 = (obj: Input) => {
        if (isMatching({ [symbolA]: { [symbolB]: 'bar' } }, obj)) {
          type t = Expect<
            Equal<typeof obj, { [symbolA]: { [symbolB]: 'bar' } }>
          >;
          throw new Error('Expected obj to not match the bar pattern!');
        }
      };

      fn1({
        [symbolA]: { [symbolB]: 'foo' },
      });

      fn2({
        [symbolA]: { [symbolB]: 'foo' },
      });
    });

    it('narrowing inference should work', () => {
      const fn1 = (input: Input) => {
        return match(input)
          .with({ [symbolA]: P.select() }, (sel) => {
            type t = Expect<Equal<typeof sel, { [symbolB]: 'foo' | 'bar' }>>;
            return sel;
          })
          .exhaustive();
      };

      expect(fn1({ [symbolA]: { [symbolB]: 'bar' } })).toEqual({
        [symbolB]: 'bar',
      });

      const fn2 = (input: Input | { [symbolC]: string }) => {
        return match(input)
          .with({ [symbolA]: P.any }, (sel) => {
            type t = Expect<Equal<typeof sel, Input>>;
            return sel;
          })
          .with({ [symbolC]: P.select() }, (x) => x)
          .exhaustive();
      };

      expect(fn2({ [symbolC]: 'Hey' })).toEqual('Hey');
    });

    it('exhaustiveness checking should work', () => {
      const fn1 = (input: Input | { [symbolC]: string }) => {
        return match(input)
          .with({ [symbolA]: P.any }, (sel) => {
            type t = Expect<Equal<typeof sel, Input>>;
            return sel;
          })
          .with({ [symbolC]: P.any }, () => '2')
          .exhaustive();
      };

      const fn2 = (input: Input | { [symbolC]: string }) => {
        return (
          match(input)
            .with({ [symbolA]: P.any }, (sel) => {
              type t = Expect<Equal<typeof sel, Input>>;
              return sel;
            })
            // @ts-expect-error
            .exhaustive()
        );
      };
    });
  });
});
