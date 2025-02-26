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

  it('should work with object patterns', () => {
    const value: unknown = { foo: true };
    expect(isMatching({ foo: true }, value)).toEqual(true);
    expect(isMatching({ foo: 'true' }, value)).toEqual(false);
  });

  it('should work with array patterns', () => {
    const value: unknown = [1, 2, 3];
    expect(isMatching(P.array(P.number), value)).toEqual(true);
    expect(isMatching(P.array(P.string), value)).toEqual(false);
  });

  it('should work with variadic patterns', () => {
    const value: unknown = [1, 2, 3];
    expect(isMatching([1, ...P.array(P.number)], value)).toEqual(true);
    expect(isMatching([2, ...P.array(P.number)], value)).toEqual(false);
  });

  it('should work with primitive patterns', () => {
    const value: unknown = 1;
    expect(isMatching(P.number, value)).toEqual(true);
    expect(isMatching(P.boolean, value)).toEqual(false);
  });

  it('should work with literal patterns', () => {
    const value: unknown = 1;
    expect(isMatching(1, value)).toEqual(true);
    expect(isMatching('oops', value)).toEqual(false);
  });

  it('should work with union and intersection patterns', () => {
    const value: unknown = { foo: true };
    expect(isMatching(P.union({ foo: true }, { bar: false }), value)).toEqual(
      true
    );

    expect(isMatching(P.union({ foo: false }, { bar: false }), value)).toEqual(
      false
    );
  });

  type Pizza = { type: 'pizza'; topping: string };
  type Sandwich = { type: 'sandwich'; condiments: string[] };
  type Food = Pizza | Sandwich;

  it('type inference should be precise without `as const`', () => {
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

  it('should reject invalid pattern when two parameters are passed', () => {
    const food = { type: 'pizza', topping: 'cheese' } as Food;

    isMatching(
      // @ts-expect-error
      {
        type: 'oops',
      },
      food
    );
  });

  it('should allow patterns targetting one member of a union type', () => {
    const food = { type: 'pizza', topping: 'cheese' } as Food;
    expect(isMatching({ topping: 'cheese' }, food)).toBe(true);

    if (isMatching({ topping: 'cheese' }, food)) {
      type t = Expect<
        Equal<typeof food, Pizza & { topping: 'cheese'; type: 'pizza' }>
      >;
    }
  });

  it('should allow targetting unknown properties', () => {
    const food = { type: 'pizza', topping: 'cheese' } as Food;

    expect(isMatching({ unknownProp: P.instanceOf(Error) }, food)).toBe(false);

    if (isMatching({ unknownProp: P.instanceOf(Error) }, food)) {
      type t = Expect<Equal<typeof food, Food & { unknownProp: Error }>>;
    }
  });

  it('should correctly narrow undiscriminated unions of objects.', () => {
    type Input = { someProperty: string[] } | { this: 'is a string' };
    const input = { someProperty: ['hello'] } satisfies Input as Input;

    if (isMatching({ someProperty: P.array() }, input)) {
      expect(input.someProperty).toEqual(['hello']);
      type t = Expect<Equal<typeof input.someProperty, string[]>>;
    } else {
      throw new Error('pattern should match');
    }
  });
});
