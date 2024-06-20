import { Expect, Equal } from '../src/types/helpers';
import { match } from '../src';

describe('Records ({})', () => {
  it('Should match records', () => {
    type Vector1 = { x: number };
    type Vector2 = { x: number; y: number };
    type Vector3 = {
      x: number;
      y: number;
      z: number;
    };
    type Vector = Vector1 | Vector2 | Vector3;

    const vector: Vector = { x: 1 };

    expect(
      match<Vector, string>(vector)
        .with({ x: 1, y: 1, z: 1 }, (x) => {
          type t = Expect<Equal<typeof x, { x: 1; y: 1; z: 1 }>>;
          return 'vector3';
        })
        .with({ x: 2, y: 1 }, (x) => {
          type t = Expect<
            Equal<typeof x, { x: 2; y: 1 } | { z: number; x: 2; y: 1 }>
          >;
          return 'vector2';
        })
        .with({ x: 1 }, (x) => {
          type t = Expect<
            Equal<
              typeof x,
              { x: 1 } | { x: 1; y: number } | { x: 1; y: number; z: number }
            >
          >;
          return 'vector1';
        })
        .otherwise(() => 'no match')
    ).toEqual('vector1');
  });
});
