import { match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('large exhaustive', () => {
  // prettier-ignore
  type LargeObject = {
    a1: number; b1: number; c1: number; d1: number; e1: number; f1: number; g1: number; h1: number; i1: number; j1: number; k1: number; l1: number; m1: number; n1: number; o1: number; p1: number; q1: number; r1: number; s1: number; t1: number; u1: number; v1: number; w1: number; x1: number; y1: number; z1: number;
    a2: number; b2: number; c2: number; d2: number; e2: number; f2: number; g2: number; h2: number; i2: number; j2: number; k2: number; l2: number; m2: number; n2: number; o2: number; p2: number; q2: number; r2: number; s2: number; t2: number; u2: number; v2: number; w2: number; x2: number; y2: number; z2: number;
    a3: number; b3: number; c3: number; d3: number; e3: number; f3: number; g3: number; h3: number; i3: number; j3: number; k3: number; l3: number; m3: number; n3: number; o3: number; p3: number; q3: number; r3: number; s3: number; t3: number; u3: number; v3: number; w3: number; x3: number; y3: number; z3: number;
};

  it('large objects', () => {
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
            a1: P.number, b1: P.number, c1: P.number, d1: P.number, e1: P.number, f1: P.number, g1: P.number, h1: P.number, i1: P.number, j1: P.number, k1: P.number, l1: P.number, m1: P.number, n1: P.number, o1: P.number, p1: P.number, q1: P.number, r1: P.number, s1: P.number, t1: P.number, u1: P.number, v1: P.number, w1: P.number, x1: P.number, y1: P.number, z1: P.number,
            a2: P.number, b2: P.number, c2: P.number, d2: P.number, e2: P.number, f2: P.number, g2: P.number, h2: P.number, i2: P.number, j2: P.number, k2: P.number, l2: P.number, m2: P.number, n2: P.number, o2: P.number, p2: P.number, q2: P.number, r2: P.number, s2: P.number, t2: P.number, u2: P.number, v2: P.number, w2: P.number, x2: P.number, y2: P.number, z2: P.number,
            a3: P.number, b3: P.number, c3: P.number, d3: P.number, e3: P.number, f3: P.number, g3: P.number, h3: P.number, i3: P.number, j3: P.number, k3: P.number, l3: P.number, m3: P.number, n3: P.number, o3: P.number, p3: P.number, q3: P.number, r3: P.number, s3: P.number, t3: P.number, u3: P.number, v3: P.number, w3: P.number, x3: P.number, y3: P.number, z3: P.number,
          },
          () => 'nope'
        )
        .exhaustive()
    ).toBe('Null');
  });

  it('large tuple', () => {
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
              a1: P.number, b1: P.number, c1: P.number, d1: P.number, e1: P.number, f1: P.number, g1: P.number, h1: P.number, i1: P.number, j1: P.number, k1: P.number, l1: P.number, m1: P.number, n1: P.number, o1: P.number, p1: P.number, q1: P.number, r1: P.number, s1: P.number, t1: P.number, u1: P.number, v1: P.number, w1: P.number, x1: P.number, y1: P.number, z1: P.number,
              a2: P.number, b2: P.number, c2: P.number, d2: P.number, e2: P.number, f2: P.number, g2: P.number, h2: P.number, i2: P.number, j2: P.number, k2: P.number, l2: P.number, m2: P.number, n2: P.number, o2: P.number, p2: P.number, q2: P.number, r2: P.number, s2: P.number, t2: P.number, u2: P.number, v2: P.number, w2: P.number, x2: P.number, y2: P.number, z2: P.number,
              a3: P.number, b3: P.number, c3: P.number, d3: P.number, e3: P.number, f3: P.number, g3: P.number, h3: P.number, i3: P.number, j3: P.number, k3: P.number, l3: P.number, m3: P.number, n3: P.number, o3: P.number, p3: P.number, q3: P.number, r3: P.number, s3: P.number, t3: P.number, u3: P.number, v3: P.number, w3: P.number, x3: P.number, y3: P.number, z3: P.number,
            },
            { 
              a1: P.number, b1: P.number, c1: P.number, d1: P.number, e1: P.number, f1: P.number, g1: P.number, h1: P.number, i1: P.number, j1: P.number, k1: P.number, l1: P.number, m1: P.number, n1: P.number, o1: P.number, p1: P.number, q1: P.number, r1: P.number, s1: P.number, t1: P.number, u1: P.number, v1: P.number, w1: P.number, x1: P.number, y1: P.number, z1: P.number,
              a2: P.number, b2: P.number, c2: P.number, d2: P.number, e2: P.number, f2: P.number, g2: P.number, h2: P.number, i2: P.number, j2: P.number, k2: P.number, l2: P.number, m2: P.number, n2: P.number, o2: P.number, p2: P.number, q2: P.number, r2: P.number, s2: P.number, t2: P.number, u2: P.number, v2: P.number, w2: P.number, x2: P.number, y2: P.number, z2: P.number,
              a3: P.number, b3: P.number, c3: P.number, d3: P.number, e3: P.number, f3: P.number, g3: P.number, h3: P.number, i3: P.number, j3: P.number, k3: P.number, l3: P.number, m3: P.number, n3: P.number, o3: P.number, p3: P.number, q3: P.number, r3: P.number, s3: P.number, t3: P.number, u3: P.number, v3: P.number, w3: P.number, x3: P.number, y3: P.number, z3: P.number,
            },
            { 
              a1: P.number, b1: P.number, c1: P.number, d1: P.number, e1: P.number, f1: P.number, g1: P.number, h1: P.number, i1: P.number, j1: P.number, k1: P.number, l1: P.number, m1: P.number, n1: P.number, o1: P.number, p1: P.number, q1: P.number, r1: P.number, s1: P.number, t1: P.number, u1: P.number, v1: P.number, w1: P.number, x1: P.number, y1: P.number, z1: P.number,
              a2: P.number, b2: P.number, c2: P.number, d2: P.number, e2: P.number, f2: P.number, g2: P.number, h2: P.number, i2: P.number, j2: P.number, k2: P.number, l2: P.number, m2: P.number, n2: P.number, o2: P.number, p2: P.number, q2: P.number, r2: P.number, s2: P.number, t2: P.number, u2: P.number, v2: P.number, w2: P.number, x2: P.number, y2: P.number, z2: P.number,
              a3: P.number, b3: P.number, c3: P.number, d3: P.number, e3: P.number, f3: P.number, g3: P.number, h3: P.number, i3: P.number, j3: P.number, k3: P.number, l3: P.number, m3: P.number, n3: P.number, o3: P.number, p3: P.number, q3: P.number, r3: P.number, s3: P.number, t3: P.number, u3: P.number, v3: P.number, w3: P.number, x3: P.number, y3: P.number, z3: P.number,
            },
            {
              a1: P.number, b1: P.number, c1: P.number, d1: P.number, e1: P.number, f1: P.number, g1: P.number, h1: P.number, i1: P.number, j1: P.number, k1: P.number, l1: P.number, m1: P.number, n1: P.number, o1: P.number, p1: P.number, q1: P.number, r1: P.number, s1: P.number, t1: P.number, u1: P.number, v1: P.number, w1: P.number, x1: P.number, y1: P.number, z1: P.number,
              a2: P.number, b2: P.number, c2: P.number, d2: P.number, e2: P.number, f2: P.number, g2: P.number, h2: P.number, i2: P.number, j2: P.number, k2: P.number, l2: P.number, m2: P.number, n2: P.number, o2: P.number, p2: P.number, q2: P.number, r2: P.number, s2: P.number, t2: P.number, u2: P.number, v2: P.number, w2: P.number, x2: P.number, y2: P.number, z2: P.number,
              a3: P.number, b3: P.number, c3: P.number, d3: P.number, e3: P.number, f3: P.number, g3: P.number, h3: P.number, i3: P.number, j3: P.number, k3: P.number, l3: P.number, m3: P.number, n3: P.number, o3: P.number, p3: P.number, q3: P.number, r3: P.number, s3: P.number, t3: P.number, u3: P.number, v3: P.number, w3: P.number, x3: P.number, y3: P.number, z3: P.number,
            },
            { 
              a1: P.number, b1: P.number, c1: P.number, d1: P.number, e1: P.number, f1: P.number, g1: P.number, h1: P.number, i1: P.number, j1: P.number, k1: P.number, l1: P.number, m1: P.number, n1: P.number, o1: P.number, p1: P.number, q1: P.number, r1: P.number, s1: P.number, t1: P.number, u1: P.number, v1: P.number, w1: P.number, x1: P.number, y1: P.number, z1: P.number,
              a2: P.number, b2: P.number, c2: P.number, d2: P.number, e2: P.number, f2: P.number, g2: P.number, h2: P.number, i2: P.number, j2: P.number, k2: P.number, l2: P.number, m2: P.number, n2: P.number, o2: P.number, p2: P.number, q2: P.number, r2: P.number, s2: P.number, t2: P.number, u2: P.number, v2: P.number, w2: P.number, x2: P.number, y2: P.number, z2: P.number,
              a3: P.number, b3: P.number, c3: P.number, d3: P.number, e3: P.number, f3: P.number, g3: P.number, h3: P.number, i3: P.number, j3: P.number, k3: P.number, l3: P.number, m3: P.number, n3: P.number, o3: P.number, p3: P.number, q3: P.number, r3: P.number, s3: P.number, t3: P.number, u3: P.number, v3: P.number, w3: P.number, x3: P.number, y3: P.number, z3: P.number,
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

  it('deep objects', () => {
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
              a: P.number, b: P.number, c: P.number, d: P.number, e: P.number, f: P.number, g: P.number, h: P.number, i: P.number, j: P.number, k: P.number, l: P.number, m: P.number, n: P.number, o: P.number, p: P.number, q: P.number, r: P.number, s: P.number, t: P.number, u: P.number, v: P.number, w: P.number, x: P.number, y: P.number, z: P.number, 
            } } } }
          },
          () => 'nope'
        )
        .exhaustive()
    ).toBe('Null');
  });
});
