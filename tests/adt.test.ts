import { match, select, __, Variant, impl } from '../src';

// APP code
type Shape =
  | Variant<'Circle', { radius: number }>
  | Variant<'Square', { sideLength: number }>
  | Variant<'Rectangle', { x: number; y: number }>
  | Variant<'Blob', { area: number }>;

type Maybe<T> = Variant<'Just', T> | Variant<'Nothing'>;

const { Just, Nothing } = impl<Maybe<unknown>>();
const { Circle, Square, Rectangle, Blob } = impl<Shape>();

const toString = (x: Maybe<Shape>) =>
  match(x)
    .with(Nothing, () => 'Nope')
    .with(
      Just(Circle({ radius: select() })),
      (radius) => `Just Circle { radius: ${radius} }`
    )
    .with(
      Just(Square(select())),
      ({ sideLength }) => `Just Square sideLength: ${sideLength}`
    )
    .with(
      Just(Rectangle(select())),
      ({ x, y }) => `Just Rectangle { x: ${x}, y: ${y} }`
    )
    .with(Just(__), () => `Just unknown`)
    .exhaustive();

console.log(toString(Just(Circle({ radius: 20 }))));
console.log(toString(Nothing));

const area = (x: Shape) =>
  match(x)
    .with(Circle({ radius: select() }), (radius) => Math.PI * radius ** 2)
    .with(Square(select()), ({ sideLength }) => sideLength ** 2)
    .with(Rectangle(select()), ({ x, y }) => x * y)
    .with(Blob(__), ({ value: { area } }) => area)
    .exhaustive();

console.log(area(Circle({ radius: 20 })));
console.log(area(Square({ sideLength: 10 })));

const shapesAreEqual = (a: Shape, b: Shape) =>
  match({ a, b })
    .with(
      {
        a: Circle({ radius: select('a') }),
        b: Circle({ radius: select('b') }),
      },
      ({ a, b }) => a === b
    )
    .with(
      {
        a: Rectangle(select('a')),
        b: Rectangle(select('b')),
      },
      ({ a, b }) => a.x === b.x && a.y === b.y
    )
    .with(
      {
        a: Square({ sideLength: select('a') }),
        b: Square({ sideLength: select('b') }),
      },
      ({ a, b }) => a === b
    )
    .with(
      {
        a: Blob({ area: select('a') }),
        b: Blob({ area: select('b') }),
      },
      ({ a, b }) => a === b
    )
    .otherwise(() => false);

console.log(shapesAreEqual(Circle({ radius: 2 }), Circle({ radius: 2 })));
console.log(shapesAreEqual(Circle({ radius: 2 }), Circle({ radius: 5 })));
console.log(shapesAreEqual(Square({ sideLength: 2 }), Circle({ radius: 5 })));

// Result

type Result<E, A> = Variant<'Success', A> | Variant<'Err', E>;
const { Success, Err } = impl<Result<unknown, unknown>>();

type SomeRes = Result<string, { hello: string }>;

const x = true ? Success({ hello: 'coucou' }) : Err('lol');
const y: SomeRes = x;

const someF = (x: Result<string, { shape: Shape }>) =>
  match(x)
    .with(
      Success({ shape: Circle(select()) }),
      ({ radius }) => `Circle ${radius}`
    )
    .with(
      Success({ shape: Square(select()) }),
      ({ sideLength }) => `Square ${sideLength}`
    )
    .with(Success({ shape: Blob(select()) }), ({ area }) => `Blob ${area}`)
    .with(
      Success({ shape: Rectangle(select()) }),
      ({ x, y }) => `Rectangle ${x + y}`
    )
    .with(Err(select()), (msg) => `Error: ${msg}`)
    .with(Success({ shape: __ }), () => `I wish we didn't need this`)
    .exhaustive();

// with a normal union

const maybeAndUnion = (
  x: Maybe<{ type: 't'; value: string } | { type: 'u'; value: number }>
) =>
  match(x)
    .with(Nothing, () => 'Nein')
    .with(
      Just({ type: 't' as const, value: select() }),
      (x) => 'typeof x: string'
    )
    .with(
      Just({ type: 'u' as const, value: select() }),
      (x) => 'typeof x: number'
    )
    .exhaustive();

console.log(maybeAndUnion(Nothing));
console.log(maybeAndUnion(Just({ type: 't', value: 'hello' })));
console.log(maybeAndUnion(Just({ type: 'u', value: 2 })));
