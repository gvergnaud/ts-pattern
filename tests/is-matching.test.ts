import { isMatching, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('isMatching', () => {
  it('should generate a type guard function from a pattern if given a single argument', () => {
    const something: unknown = {
      title: 'Hello',
      author: { name: 'Gabriel', age: 27 },
    };

    const isBlogPost = isMatching({
      title: P.string,
      author: { name: P.string, age: P.number },
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
          title: P.string,
          author: { name: P.string, age: P.number },
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

  it('type inference should be precise without `as const`', () => {
    type Pizza = { type: 'pizza'; topping: string };
    type Sandwich = { type: 'sandwich'; condiments: string[] };
    type Food = Pizza | Sandwich;

    const food = { type: 'pizza', topping: 'cheese' } as Food;

    const isPizza = isMatching({ type: 'pizza' });

    if (isPizza(food)) {
      type t = Expect<Equal<typeof food, Pizza>>;
    } else {
      throw new Error('Expected food to match the pizza pattern!');
    }

    if (isMatching({ type: 'pizza' }, food)) {
      type t = Expect<Equal<typeof food, Pizza>>;
    } else {
      throw new Error('Expected food to match the pizza pattern!');
    }
  });
  it('should work with symbols', () => {
    const symbolA = Symbol('symbol-a');
    const symbolB = Symbol('symbol-b');
    const obj: { [symbolA]: { [symbolB]: 'foo' | 'bar' } } = {
      [symbolA]: { [symbolB]: 'foo' },
    };
    if (isMatching({ [symbolA]: { [symbolB]: 'foo' } }, obj)) {
      type t = Expect<Equal<typeof obj, { [symbolA]: { [symbolB]: 'foo' } }>>;
    } else {
      throw new Error('Expected obj to match the foo pattern!');
    }
    if (isMatching({ [symbolA]: { [symbolB]: 'bar' } }, obj)) {
      type t = Expect<
        Equal<
          typeof obj,
          { [symbolA]: { [symbolB]: 'foo' } } & {
            [symbolA]: { [symbolB]: 'bar' };
          }
        >
      >;
      throw new Error('Expected obj to not match the bar pattern!');
    }
  });
});
