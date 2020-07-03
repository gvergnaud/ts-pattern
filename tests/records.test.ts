import { match, __ } from '../src';
import { NotNever } from './utils';

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
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: Vector3 = x;
          return 'vector3';
        })
        .with({ x: 2, y: 1 }, (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: Vector2 = x;
          return 'vector2';
        })
        .with({ x: 1 }, (x) => {
          const notNever: NotNever<typeof x> = true;
          const inferenceCheck: Vector1 = x;
          return 'vector1';
        })
        .otherwise(() => 'no match')
    ).toEqual('vector1');
  });
});
