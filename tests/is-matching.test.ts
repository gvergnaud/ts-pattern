import { isMatching, __ } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('isMatching', () => {
  it('should generate a type guard function from a pattern if given a single argument', () => {
    const something: unknown = {
      title: 'Hello',
      author: { name: 'Gabriel', age: 27 },
    };

    const isBlogPost = isMatching({
      title: __.string,
      author: { name: __.string, age: __.number },
    });

    if (isBlogPost(something)) {
      type t = Expect<
        Equal<
          typeof something,
          { title: string; author: { name: string; age: number } }
        >
      >;
      expect(true).toBe(true);
    } else {
      throw new Error(
        'isMatching should have returned true but it returned false'
      );
    }
  });
  it('should act as a type guard function if given a two arguments', () => {
    const something: unknown = {
      title: 'Hello',
      author: { name: 'Gabriel', age: 27 },
    };

    if (
      isMatching(
        {
          title: __.string,
          author: { name: __.string, age: __.number },
        },
        something
      )
    ) {
      type t = Expect<
        Equal<
          typeof something,
          { title: string; author: { name: string; age: number } }
        >
      >;
      expect(true).toBe(true);
    } else {
      throw new Error(
        'isMatching should have returned true but it returned false'
      );
    }
  });
});
