import { match, not, Pattern, select, when, __ } from '../src';
import { Equal, Expect } from '../src/types/helpers';
import { Option, some, none, BigUnion, State, Event } from './utils';

describe('large exhaustive', () => {
  // prettier-ignore
  type LargeObject = {
    a1: number; b1: number; c1: number; d1: number; e1: number; f1: number; g1: number; h1: number; i1: number; j1: number; k1: number; l1: number; m1: number; n1: number; o1: number; p1: number; q1: number; r1: number; s1: number; t1: number; u1: number; v1: number; w1: number; x1: number; y1: number; z1: number;
    a2: number; b2: number; c2: number; d2: number; e2: number; f2: number; g2: number; h2: number; i2: number; j2: number; k2: number; l2: number; m2: number; n2: number; o2: number; p2: number; q2: number; r2: number; s2: number; t2: number; u2: number; v2: number; w2: number; x2: number; y2: number; z2: number;
    a3: number; b3: number; c3: number; d3: number; e3: number; f3: number; g3: number; h3: number; i3: number; j3: number; k3: number; l3: number; m3: number; n3: number; o3: number; p3: number; q3: number; r3: number; s3: number; t3: number; u3: number; v3: number; w3: number; x3: number; y3: number; z3: number;
};

  describe('large objects', () => {
    expect(
      match<LargeObject | null>(null)
        .with(
          // prettier-ignore
          {
            a1: 0, b1: 0, c1: 0, d1: 0, e1: 0, f1: 0, g1: 0, h1: 0, i1: 0, j1: 0, k1: 0, l1: 0, m1: 0, n1: 0, o1: 0, p1: 0, q1: 0, r1: 0, s1: 0, t1: 0, u1: 0, v1: 0, w1: 0, x1: 0, y1: 0, z1: 0,
            a2: 0, b2: 0, c2: 0, d2: 0, e2: 0, f2: 0, g2: 0, h2: 0, i2: 0, j2: 0, k2: 0, l2: 0, m2: 0, n2: 0, o2: 0, p2: 0, q2: 0, r2: 0, s2: 0, t2: 0, u2: 0, v2: 0, w2: 0, x2: 0, y2: 0, z2: 0,
            a3: 0, b3: 0, c3: 0, d3: 0, e3: 0, f3: 0, g3: 0, h3: 0, i3: 0, j3: 0, k3: 0, l3: 0, m3: 0, n3: 0, o3: 0, p3: 0, q3: 0, r3: 0, s3: 0, t3: 0, u3: 0, v3: 0, w3: 0, x3: 0, y3: 0, z3: 0,
          },
          (x) => 'match'
        )
        .with(null, () => 'Null')
        .with(
          // prettier-ignore
          {
            a1: __.number, b1: __.number, c1: __.number, d1: __.number, e1: __.number, f1: __.number, g1: __.number, h1: __.number, i1: __.number, j1: __.number, k1: __.number, l1: __.number, m1: __.number, n1: __.number, o1: __.number, p1: __.number, q1: __.number, r1: __.number, s1: __.number, t1: __.number, u1: __.number, v1: __.number, w1: __.number, x1: __.number, y1: __.number, z1: __.number,
            a2: __.number, b2: __.number, c2: __.number, d2: __.number, e2: __.number, f2: __.number, g2: __.number, h2: __.number, i2: __.number, j2: __.number, k2: __.number, l2: __.number, m2: __.number, n2: __.number, o2: __.number, p2: __.number, q2: __.number, r2: __.number, s2: __.number, t2: __.number, u2: __.number, v2: __.number, w2: __.number, x2: __.number, y2: __.number, z2: __.number,
            a3: __.number, b3: __.number, c3: __.number, d3: __.number, e3: __.number, f3: __.number, g3: __.number, h3: __.number, i3: __.number, j3: __.number, k3: __.number, l3: __.number, m3: __.number, n3: __.number, o3: __.number, p3: __.number, q3: __.number, r3: __.number, s3: __.number, t3: __.number, u3: __.number, v3: __.number, w3: __.number, x3: __.number, y3: __.number, z3: __.number,
          },
          () => 'nope'
        )
        .exhaustive()
    ).toBe('Null');
  });

  describe('large tuple', () => {
    expect(
      match<
        [LargeObject, LargeObject, LargeObject, LargeObject, LargeObject] | null
      >(null)
        .with(
          // prettier-ignore
          [
            { 
              a1: 0, b1: 0, c1: 0, d1: 0, e1: 0, f1: 0, g1: 0, h1: 0, i1: 0, j1: 0, k1: 0, l1: 0, m1: 0, n1: 0, o1: 0, p1: 0, q1: 0, r1: 0, s1: 0, t1: 0, u1: 0, v1: 0, w1: 0, x1: 0, y1: 0, z1: 0,
              a2: 0, b2: 0, c2: 0, d2: 0, e2: 0, f2: 0, g2: 0, h2: 0, i2: 0, j2: 0, k2: 0, l2: 0, m2: 0, n2: 0, o2: 0, p2: 0, q2: 0, r2: 0, s2: 0, t2: 0, u2: 0, v2: 0, w2: 0, x2: 0, y2: 0, z2: 0,
              a3: 0, b3: 0, c3: 0, d3: 0, e3: 0, f3: 0, g3: 0, h3: 0, i3: 0, j3: 0, k3: 0, l3: 0, m3: 0, n3: 0, o3: 0, p3: 0, q3: 0, r3: 0, s3: 0, t3: 0, u3: 0, v3: 0, w3: 0, x3: 0, y3: 0, z3: 0,
            },
            { 
              a1: 0, b1: 0, c1: 0, d1: 0, e1: 0, f1: 0, g1: 0, h1: 0, i1: 0, j1: 0, k1: 0, l1: 0, m1: 0, n1: 0, o1: 0, p1: 0, q1: 0, r1: 0, s1: 0, t1: 0, u1: 0, v1: 0, w1: 0, x1: 0, y1: 0, z1: 0,
              a2: 0, b2: 0, c2: 0, d2: 0, e2: 0, f2: 0, g2: 0, h2: 0, i2: 0, j2: 0, k2: 0, l2: 0, m2: 0, n2: 0, o2: 0, p2: 0, q2: 0, r2: 0, s2: 0, t2: 0, u2: 0, v2: 0, w2: 0, x2: 0, y2: 0, z2: 0,
              a3: 0, b3: 0, c3: 0, d3: 0, e3: 0, f3: 0, g3: 0, h3: 0, i3: 0, j3: 0, k3: 0, l3: 0, m3: 0, n3: 0, o3: 0, p3: 0, q3: 0, r3: 0, s3: 0, t3: 0, u3: 0, v3: 0, w3: 0, x3: 0, y3: 0, z3: 0,
            },
            { 
              a1: 0, b1: 0, c1: 0, d1: 0, e1: 0, f1: 0, g1: 0, h1: 0, i1: 0, j1: 0, k1: 0, l1: 0, m1: 0, n1: 0, o1: 0, p1: 0, q1: 0, r1: 0, s1: 0, t1: 0, u1: 0, v1: 0, w1: 0, x1: 0, y1: 0, z1: 0,
              a2: 0, b2: 0, c2: 0, d2: 0, e2: 0, f2: 0, g2: 0, h2: 0, i2: 0, j2: 0, k2: 0, l2: 0, m2: 0, n2: 0, o2: 0, p2: 0, q2: 0, r2: 0, s2: 0, t2: 0, u2: 0, v2: 0, w2: 0, x2: 0, y2: 0, z2: 0,
              a3: 0, b3: 0, c3: 0, d3: 0, e3: 0, f3: 0, g3: 0, h3: 0, i3: 0, j3: 0, k3: 0, l3: 0, m3: 0, n3: 0, o3: 0, p3: 0, q3: 0, r3: 0, s3: 0, t3: 0, u3: 0, v3: 0, w3: 0, x3: 0, y3: 0, z3: 0,
            },
            {
              a1: 0, b1: 0, c1: 0, d1: 0, e1: 0, f1: 0, g1: 0, h1: 0, i1: 0, j1: 0, k1: 0, l1: 0, m1: 0, n1: 0, o1: 0, p1: 0, q1: 0, r1: 0, s1: 0, t1: 0, u1: 0, v1: 0, w1: 0, x1: 0, y1: 0, z1: 0,
              a2: 0, b2: 0, c2: 0, d2: 0, e2: 0, f2: 0, g2: 0, h2: 0, i2: 0, j2: 0, k2: 0, l2: 0, m2: 0, n2: 0, o2: 0, p2: 0, q2: 0, r2: 0, s2: 0, t2: 0, u2: 0, v2: 0, w2: 0, x2: 0, y2: 0, z2: 0,
              a3: 0, b3: 0, c3: 0, d3: 0, e3: 0, f3: 0, g3: 0, h3: 0, i3: 0, j3: 0, k3: 0, l3: 0, m3: 0, n3: 0, o3: 0, p3: 0, q3: 0, r3: 0, s3: 0, t3: 0, u3: 0, v3: 0, w3: 0, x3: 0, y3: 0, z3: 0,
            },
            { 
              a1: 0, b1: 0, c1: 0, d1: 0, e1: 0, f1: 0, g1: 0, h1: 0, i1: 0, j1: 0, k1: 0, l1: 0, m1: 0, n1: 0, o1: 0, p1: 0, q1: 0, r1: 0, s1: 0, t1: 0, u1: 0, v1: 0, w1: 0, x1: 0, y1: 0, z1: 0,
              a2: 0, b2: 0, c2: 0, d2: 0, e2: 0, f2: 0, g2: 0, h2: 0, i2: 0, j2: 0, k2: 0, l2: 0, m2: 0, n2: 0, o2: 0, p2: 0, q2: 0, r2: 0, s2: 0, t2: 0, u2: 0, v2: 0, w2: 0, x2: 0, y2: 0, z2: 0,
              a3: 0, b3: 0, c3: 0, d3: 0, e3: 0, f3: 0, g3: 0, h3: 0, i3: 0, j3: 0, k3: 0, l3: 0, m3: 0, n3: 0, o3: 0, p3: 0, q3: 0, r3: 0, s3: 0, t3: 0, u3: 0, v3: 0, w3: 0, x3: 0, y3: 0, z3: 0,
            }
          ],
          (x) => {
            type t = Expect<
              Equal<
                typeof x,
                [
                  LargeObject,
                  LargeObject,
                  LargeObject,
                  LargeObject,
                  LargeObject
                ]
              >
            >;
            return 'match';
          }
        )
        .with(null, () => 'Null')
        .with(
          // prettier-ignore
          [
            { 
              a1: __.number, b1: __.number, c1: __.number, d1: __.number, e1: __.number, f1: __.number, g1: __.number, h1: __.number, i1: __.number, j1: __.number, k1: __.number, l1: __.number, m1: __.number, n1: __.number, o1: __.number, p1: __.number, q1: __.number, r1: __.number, s1: __.number, t1: __.number, u1: __.number, v1: __.number, w1: __.number, x1: __.number, y1: __.number, z1: __.number,
              a2: __.number, b2: __.number, c2: __.number, d2: __.number, e2: __.number, f2: __.number, g2: __.number, h2: __.number, i2: __.number, j2: __.number, k2: __.number, l2: __.number, m2: __.number, n2: __.number, o2: __.number, p2: __.number, q2: __.number, r2: __.number, s2: __.number, t2: __.number, u2: __.number, v2: __.number, w2: __.number, x2: __.number, y2: __.number, z2: __.number,
              a3: __.number, b3: __.number, c3: __.number, d3: __.number, e3: __.number, f3: __.number, g3: __.number, h3: __.number, i3: __.number, j3: __.number, k3: __.number, l3: __.number, m3: __.number, n3: __.number, o3: __.number, p3: __.number, q3: __.number, r3: __.number, s3: __.number, t3: __.number, u3: __.number, v3: __.number, w3: __.number, x3: __.number, y3: __.number, z3: __.number,
            },
            { 
              a1: __.number, b1: __.number, c1: __.number, d1: __.number, e1: __.number, f1: __.number, g1: __.number, h1: __.number, i1: __.number, j1: __.number, k1: __.number, l1: __.number, m1: __.number, n1: __.number, o1: __.number, p1: __.number, q1: __.number, r1: __.number, s1: __.number, t1: __.number, u1: __.number, v1: __.number, w1: __.number, x1: __.number, y1: __.number, z1: __.number,
              a2: __.number, b2: __.number, c2: __.number, d2: __.number, e2: __.number, f2: __.number, g2: __.number, h2: __.number, i2: __.number, j2: __.number, k2: __.number, l2: __.number, m2: __.number, n2: __.number, o2: __.number, p2: __.number, q2: __.number, r2: __.number, s2: __.number, t2: __.number, u2: __.number, v2: __.number, w2: __.number, x2: __.number, y2: __.number, z2: __.number,
              a3: __.number, b3: __.number, c3: __.number, d3: __.number, e3: __.number, f3: __.number, g3: __.number, h3: __.number, i3: __.number, j3: __.number, k3: __.number, l3: __.number, m3: __.number, n3: __.number, o3: __.number, p3: __.number, q3: __.number, r3: __.number, s3: __.number, t3: __.number, u3: __.number, v3: __.number, w3: __.number, x3: __.number, y3: __.number, z3: __.number,
            },
            { 
              a1: __.number, b1: __.number, c1: __.number, d1: __.number, e1: __.number, f1: __.number, g1: __.number, h1: __.number, i1: __.number, j1: __.number, k1: __.number, l1: __.number, m1: __.number, n1: __.number, o1: __.number, p1: __.number, q1: __.number, r1: __.number, s1: __.number, t1: __.number, u1: __.number, v1: __.number, w1: __.number, x1: __.number, y1: __.number, z1: __.number,
              a2: __.number, b2: __.number, c2: __.number, d2: __.number, e2: __.number, f2: __.number, g2: __.number, h2: __.number, i2: __.number, j2: __.number, k2: __.number, l2: __.number, m2: __.number, n2: __.number, o2: __.number, p2: __.number, q2: __.number, r2: __.number, s2: __.number, t2: __.number, u2: __.number, v2: __.number, w2: __.number, x2: __.number, y2: __.number, z2: __.number,
              a3: __.number, b3: __.number, c3: __.number, d3: __.number, e3: __.number, f3: __.number, g3: __.number, h3: __.number, i3: __.number, j3: __.number, k3: __.number, l3: __.number, m3: __.number, n3: __.number, o3: __.number, p3: __.number, q3: __.number, r3: __.number, s3: __.number, t3: __.number, u3: __.number, v3: __.number, w3: __.number, x3: __.number, y3: __.number, z3: __.number,
            },
            {
              a1: __.number, b1: __.number, c1: __.number, d1: __.number, e1: __.number, f1: __.number, g1: __.number, h1: __.number, i1: __.number, j1: __.number, k1: __.number, l1: __.number, m1: __.number, n1: __.number, o1: __.number, p1: __.number, q1: __.number, r1: __.number, s1: __.number, t1: __.number, u1: __.number, v1: __.number, w1: __.number, x1: __.number, y1: __.number, z1: __.number,
              a2: __.number, b2: __.number, c2: __.number, d2: __.number, e2: __.number, f2: __.number, g2: __.number, h2: __.number, i2: __.number, j2: __.number, k2: __.number, l2: __.number, m2: __.number, n2: __.number, o2: __.number, p2: __.number, q2: __.number, r2: __.number, s2: __.number, t2: __.number, u2: __.number, v2: __.number, w2: __.number, x2: __.number, y2: __.number, z2: __.number,
              a3: __.number, b3: __.number, c3: __.number, d3: __.number, e3: __.number, f3: __.number, g3: __.number, h3: __.number, i3: __.number, j3: __.number, k3: __.number, l3: __.number, m3: __.number, n3: __.number, o3: __.number, p3: __.number, q3: __.number, r3: __.number, s3: __.number, t3: __.number, u3: __.number, v3: __.number, w3: __.number, x3: __.number, y3: __.number, z3: __.number,
            },
            { 
              a1: __.number, b1: __.number, c1: __.number, d1: __.number, e1: __.number, f1: __.number, g1: __.number, h1: __.number, i1: __.number, j1: __.number, k1: __.number, l1: __.number, m1: __.number, n1: __.number, o1: __.number, p1: __.number, q1: __.number, r1: __.number, s1: __.number, t1: __.number, u1: __.number, v1: __.number, w1: __.number, x1: __.number, y1: __.number, z1: __.number,
              a2: __.number, b2: __.number, c2: __.number, d2: __.number, e2: __.number, f2: __.number, g2: __.number, h2: __.number, i2: __.number, j2: __.number, k2: __.number, l2: __.number, m2: __.number, n2: __.number, o2: __.number, p2: __.number, q2: __.number, r2: __.number, s2: __.number, t2: __.number, u2: __.number, v2: __.number, w2: __.number, x2: __.number, y2: __.number, z2: __.number,
              a3: __.number, b3: __.number, c3: __.number, d3: __.number, e3: __.number, f3: __.number, g3: __.number, h3: __.number, i3: __.number, j3: __.number, k3: __.number, l3: __.number, m3: __.number, n3: __.number, o3: __.number, p3: __.number, q3: __.number, r3: __.number, s3: __.number, t3: __.number, u3: __.number, v3: __.number, w3: __.number, x3: __.number, y3: __.number, z3: __.number,
            }
          ],
          () => 'nope'
        )
        .exhaustive()
    ).toBe('Null');
  });

  // prettier-ignore
  type DeepObject = {
    1: { 2: { 3: { 4: {
      a: number; b: number; c: number; d: number; e: number; f: number; g: number; h: number; i: number; j: number; k: number; l: number; m: number; n: number; o: number; p: number; q: number; r: number; s: number; t: number; u: number; v: number; w: number; x: number; y: number; z: number;
    } } } }
  };

  describe('deep objects', () => {
    expect(
      match<DeepObject | null>(null)
        .with(
          // prettier-ignore
          { 
            1: { 2: { 3: { 4: {
              a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0, i: 0, j: 0, k: 0, l: 0, m: 0, n: 0, o: 0, p: 0, q: 0, r: 0, s: 0, t: 0, u: 0, v: 0, w: 0, x: 0, y: 0, z: 0,
            } } } }
          },
          (x) => 'match'
        )
        .with(null, () => 'Null')
        .with(
          // prettier-ignore
          {
            1: { 2: { 3: { 4: {
              a: __.number, b: __.number, c: __.number, d: __.number, e: __.number, f: __.number, g: __.number, h: __.number, i: __.number, j: __.number, k: __.number, l: __.number, m: __.number, n: __.number, o: __.number, p: __.number, q: __.number, r: __.number, s: __.number, t: __.number, u: __.number, v: __.number, w: __.number, x: __.number, y: __.number, z: __.number, 
            } } } }
          },
          () => 'nope'
        )
        .exhaustive()
    ).toBe('Null');
  });
});
