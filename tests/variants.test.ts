import { match, select, __, Variant, implementVariants } from '../src';

// APP code
type Shape =
  | Variant<'Circle', { radius: number }>
  | Variant<'Square', { sideLength: number }>
  | Variant<'Rectangle', { x: number; y: number }>
  | Variant<'Blob', number>;

type Maybe<T> = Variant<'Just', T> | Variant<'Nothing'>;

type x = Maybe<unknown>;

const { Just, Nothing } = implementVariants<Maybe<unknown>>();
const { Circle, Square, Rectangle, Blob } = implementVariants<Shape>();

describe('Variants', () => {
  it('should work with exhaustive matching', () => {
    const area = (x: Shape) =>
      match(x)
        .with(Circle(__), ({ radius }) => Math.PI * radius ** 2)
        .with(Square(__), ({ sideLength }) => sideLength ** 2)
        .with(Rectangle(__), ({ x, y }) => x * y)
        .with(Blob(__), ({ value }) => value)
        .exhaustive();

    expect(area(Circle({ radius: 1 }))).toEqual(Math.PI);
    expect(area(Square({ sideLength: 10 }))).toEqual(100);
    expect(area(Blob(0))).toEqual(0);

    // @ts-expect-error
    expect(() => area({ tag: 'UUUPPs' })).toThrow();
  });

  it('should be possible to nest variants in data structures', () => {
    const shapesAreEqual = (a: Shape, b: Shape) =>
      match({ a, b })
        .with(
          {
            a: Circle(__),
            b: Circle(__),
          },
          ({ a, b }) => a.radius === b.radius
        )
        .with(
          {
            a: Rectangle(__),
            b: Rectangle(__),
          },
          ({ a, b }) => a.x === b.x && a.y === b.y
        )
        .with(
          {
            a: Square(__),
            b: Square(__),
          },
          ({ a, b }) => a.sideLength === b.sideLength
        )
        .with(
          {
            a: Blob(__),
            b: Blob(__),
          },
          ({ a, b }) => a.value === b.value
        )
        .otherwise(() => false);

    expect(
      shapesAreEqual(Circle({ radius: 2 }), Circle({ radius: 2 }))
    ).toEqual(true);
    expect(
      shapesAreEqual(Circle({ radius: 2 }), Circle({ radius: 5 }))
    ).toEqual(false);
    expect(
      shapesAreEqual(Square({ sideLength: 2 }), Circle({ radius: 5 }))
    ).toEqual(false);
  });

  it('Variants with type parameters should work', () => {
    const toString = (maybeShape: Maybe<Shape>) =>
      match(maybeShape)
        .with(Nothing(), () => 'Nothing')
        .with(
          Just(Circle(select())),
          ({ radius }) => `Just Circle { radius: ${radius} }`
        )
        .with(
          Just(Square(__)),
          ({ value: { sideLength } }) => `Just Square sideLength: ${sideLength}`
        )
        .with(
          Just(Rectangle(select())),
          ({ x, y }) => `Just Rectangle { x: ${x}, y: ${y} }`
        )
        .with(Just(Blob(select())), (area) => `Just Blob { area: ${area} }`)
        .exhaustive();

    expect(toString(Just(Circle({ radius: 20 })))).toEqual(
      `Just Circle { radius: 20 }`
    );
    expect(toString(Nothing())).toEqual(`Nothing`);
  });

  it('should be possible to put a union type in a variant', () => {
    // with a normal union

    const maybeAndUnion = (
      x: Maybe<{ type: 't'; value: string } | { type: 'u'; value: number }>
    ) =>
      match(x)
        .with(Nothing(), () => 'Non')
        .with(
          Just({ type: 't' as const, value: select() }),
          (x) => 'typeof x: string'
        )
        .with(
          Just({ type: 'u' as const, value: select() }),
          (x) => 'typeof x: number'
        )
        .exhaustive();

    expect(maybeAndUnion(Nothing())).toEqual('Non');
    expect(maybeAndUnion(Just({ type: 't' as const, value: 'hello' }))).toEqual(
      'typeof x: string'
    );
    expect(maybeAndUnion(Just({ type: 'u' as const, value: 2 }))).toEqual(
      'typeof x: number'
    );
  });

  it('should be possible to create a variant with several type parameters', () => {
    // Result
    type Result<E, A> = Variant<'Success', A> | Variant<'Err', E>;

    const { Success, Err } = implementVariants<Result<unknown, unknown>>();

    type SomeRes = Result<string, { hello: string }>;

    const x = true ? Success({ hello: 'coucou' }) : Err('lol');

    const y: SomeRes = x;

    const complexMatch = (x: Result<string, { shape: Maybe<Shape> }>) => {
      return match(x)
        .with(Err(select()), ({ value }) => `Error: ${value}`)
        .with(
          Success({ shape: Just(Circle({ radius: select() })) }),
          (radius) => `Circle ${radius}`
        )
        .with(
          Success({ shape: Just(Square(select())) }),
          ({ sideLength }) => `Square ${sideLength}`
        )
        .with(
          Success({ shape: Just(Blob(select())) }),
          ({ value: area }) => `Blob ${area}`
        )
        .with(
          Success({ shape: Just(Rectangle(select())) }),
          ({ x, y }) => `Rectangle ${x + y}`
        )
        .with(Success({ shape: Nothing() }), () => `Nothing`)
        .exhaustive();
    };

    expect(
      complexMatch(Success({ shape: Just(Circle({ radius: 20 })) }))
    ).toEqual('Circle 20');
    expect(complexMatch(Success({ shape: Just(Blob(20)) }))).toEqual('Blob 20');
    expect(complexMatch(Err('Failed'))).toEqual('Error: Failed');
  });
});

/**
 * I think this is better because I'm too attach to the idea that
 * patterns should look like constructing the value.
 * this has some typesafety tradeoffs, but I think they are bearable.
 */
const x = Circle(__);
const y = Circle(select());
const z = Circle({ radius: select() });
const w = Circle({ radius: 2 });
const r = Rectangle({ x: 2, y: 3 });
