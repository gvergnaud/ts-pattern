import { match, Variant, implementVariants, P } from '../src';

// APP code
type Shape =
  | Variant<'Circle', { radius: number }>
  | Variant<'Square', { sideLength: number }>
  | Variant<'Rectangle', { x: number; y: number }>
  | Variant<'Blob', number>;

type Maybe<T> = Variant<'Just', T> | Variant<'Nothing'>;

const { Just, Nothing } = implementVariants<Maybe<unknown>>();
const { Circle, Square, Rectangle, Blob } = implementVariants<Shape>();

describe('Variants', () => {
  it('should work with exhaustive matching', () => {
    const area = (x: Shape) =>
      match(x)
        .with(Circle({ radius: P.select() }), (radius) => Math.PI * radius ** 2)
        .with(Square(P.select()), ({ sideLength }) => sideLength ** 2)
        .with(Rectangle(P.select()), ({ x, y }) => x * y)
        .with(Blob(P._), ({ value }) => value)
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
            a: Circle({ radius: P.select('a') }),
            b: Circle({ radius: P.select('b') }),
          },
          ({ a, b }) => a === b
        )
        .with(
          {
            a: Rectangle(P.select('a')),
            b: Rectangle(P.select('b')),
          },
          ({ a, b }) => a.x === b.x && a.y === b.y
        )
        .with(
          {
            a: Square({ sideLength: P.select('a') }),
            b: Square({ sideLength: P.select('b') }),
          },
          ({ a, b }) => a === b
        )
        .with(
          {
            a: Blob(P.select('a')),
            b: Blob(P.select('b')),
          },
          ({ a, b }) => a === b
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
          Just(Circle({ radius: P.select() })),
          (radius) => `Just Circle { radius: ${radius} }`
        )
        .with(
          Just(Square(P.select())),
          ({ sideLength }) => `Just Square sideLength: ${sideLength}`
        )
        .with(
          Just(Rectangle(P.select())),
          ({ x, y }) => `Just Rectangle { x: ${x}, y: ${y} }`
        )
        .with(Just(Blob(P.select())), (area) => `Just Blob { area: ${area} }`)
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
          Just({ type: 't' as const, value: P.select() }),
          (x) => 'typeof x: string'
        )
        .with(
          Just({ type: 'u' as const, value: P.select() }),
          (x) => 'typeof x: number'
        )
        .exhaustive();

    expect(maybeAndUnion(Nothing())).toEqual('Non');
    expect(maybeAndUnion(Just({ type: 't', value: 'hello' }))).toEqual(
      'typeof x: string'
    );
    expect(maybeAndUnion(Just({ type: 'u', value: 2 }))).toEqual(
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

    const complexMatch = (x: Result<string, { shape: Shape }>) => {
      return match(x)
        .with(Err(P.select()), (msg) => `Error: ${msg}`)
        .with(
          Success({ shape: Circle(P.select()) }),
          ({ radius }) => `Circle ${radius}`
        )
        .with(
          Success({ shape: Square(P.select()) }),
          ({ sideLength }) => `Square ${sideLength}`
        )
        .with(Success({ shape: Blob(P.select()) }), (area) => `Blob ${area}`)
        .with(
          Success({ shape: Rectangle(P.select()) }),
          ({ x, y }) => `Rectangle ${x + y}`
        )
        .exhaustive();
    };

    expect(complexMatch(Success({ shape: Circle({ radius: 20 }) }))).toEqual(
      'Circle 20'
    );
    expect(complexMatch(Success({ shape: Blob(20) }))).toEqual('Blob 20');
    expect(complexMatch(Err('Failed'))).toEqual('Error: Failed');
  });
});
