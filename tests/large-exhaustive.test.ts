import { match, P } from '../src';
import { Compute, Equal, Expect, Not } from '../src/types/helpers';

describe('large exhaustive', () => {
  // prettier-ignore
  type LargeObject<T> = Compute<{
    a1: T; b1: T; c1: T; d1: T; e1: T; f1: T; g1: T; h1: T; i1: T; j1: T; k1: T; l1: T; m1: T; n1: T; o1: T; p1: T; q1: T; r1: T; s1: T; t1: T; u1: T; v1: T; w1: T; x1: T; y1: T; z1: T;
    a2: T; b2: T; c2: T; d2: T; e2: T; f2: T; g2: T; h2: T; i2: T; j2: T; k2: T; l2: T; m2: T; n2: T; o2: T; p2: T; q2: T; r2: T; s2: T; t2: T; u2: T; v2: T; w2: T; x2: T; y2: T; z2: T;
    a3: T; b3: T; c3: T; d3: T; e3: T; f3: T; g3: T; h3: T; i3: T; j3: T; k3: T; l3: T; m3: T; n3: T; o3: T; p3: T; q3: T; r3: T; s3: T; t3: T; u3: T; v3: T; w3: T; x3: T; y3: T; z3: T;
}>;

  it('large objects', () => {
    expect(
      match<LargeObject<number> | null>(null)
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
        | [
            LargeObject<number>,
            LargeObject<number>,
            LargeObject<number>,
            LargeObject<number>,
            LargeObject<number>
          ]
        | null
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
            type test1 = Expect<Not<Equal<typeof x, never>>>;
            type test2 = Expect<Not<Equal<typeof x, unknown>>>;
            type test3 = Expect<Not<Equal<typeof x, any>>>;
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

  it('Input with a large distributed cardinality', () => {
    type States = 'idle' | 'loading' | 'success' | 'error' | 'partial_result';

    const eventStatus = 'success' as States;
    const dataStatus = 'loading' as States;
    const backgroundStatus = 'loading' as States;
    const replaySelectorsStatus = 'idle' as States;

    const input = {
      eventStatus,
      dataStatus,
      backgroundStatus,
      replaySelectorsStatus,
    } as const;

    type input = typeof input;

    const res = match(input)
      .returnType<
        | { status: 'idle' }
        | { status: 'loading' }
        | { status: 'success' }
        | { status: 'error'; error: unknown }
      >()
      .with(
        { eventStatus: P.union('loading', 'partial_result') },
        { dataStatus: P.union('loading', 'partial_result') },
        { backgroundStatus: P.union('loading', 'partial_result') },
        { replaySelectorsStatus: P.union('loading', 'partial_result') },
        () => ({ status: 'loading' })
      )
      .with(
        {
          eventStatus: 'success',
          dataStatus: 'success',
          backgroundStatus: 'success',
          replaySelectorsStatus: 'success',
        },
        () => ({ status: 'success' })
      )
      .with(
        { eventStatus: 'idle' },
        { dataStatus: 'idle' },
        { backgroundStatus: 'idle' },
        { replaySelectorsStatus: 'idle' },
        () => ({ status: 'idle' as const })
      )
      .with({ replaySelectorsStatus: 'error' }, () => ({
        status: 'error',
        error: new Error('Oops 0'),
      }))
      .with({ eventStatus: 'error' }, () => ({
        status: 'error',
        error: new Error('Oops 1'),
      }))
      .with({ dataStatus: 'error' }, () => ({
        status: 'error',
        error: new Error('Oops 2'),
      }))
      .with({ backgroundStatus: 'error' }, () => ({
        status: 'error',
        error: new Error('Oops 3'),
      }))
      .exhaustive();
  });

  enum LargeEnum {
    M0 = 'value-M0',
    M1 = 'value-M1',
    M2 = 'value-M2',
    M3 = 'value-M3',
    M4 = 'value-M4',
    M5 = 'value-M5',
    M6 = 'value-M6',
    M7 = 'value-M7',
    M8 = 'value-M8',
    M9 = 'value-M9',
    M10 = 'value-M10',
    M11 = 'value-M11',
    M12 = 'value-M12',
    M13 = 'value-M13',
    M14 = 'value-M14',
    M15 = 'value-M15',
    M16 = 'value-M16',
    M17 = 'value-M17',
    M18 = 'value-M18',
    M19 = 'value-M19',
    M20 = 'value-M20',
    M21 = 'value-M21',
    M22 = 'value-M22',
    M23 = 'value-M23',
    M24 = 'value-M24',
    M25 = 'value-M25',
    M26 = 'value-M26',
    M27 = 'value-M27',
    M28 = 'value-M28',
    M29 = 'value-M29',
    M30 = 'value-M30',
    M31 = 'value-M31',
    M32 = 'value-M32',
    M33 = 'value-M33',
    M34 = 'value-M34',
    M35 = 'value-M35',
    M36 = 'value-M36',
    M37 = 'value-M37',
    M38 = 'value-M38',
    M39 = 'value-M39',
    M40 = 'value-M40',
    M41 = 'value-M41',
    M42 = 'value-M42',
    M43 = 'value-M43',
    M44 = 'value-M44',
    M45 = 'value-M45',
    M46 = 'value-M46',
    M47 = 'value-M47',
    M48 = 'value-M48',
    M49 = 'value-M49',
  }

  type LargeUnion =
    | 'u-M0'
    | 'u-M1'
    | 'u-M2'
    | 'u-M3'
    | 'u-M4'
    | 'u-M5'
    | 'u-M6'
    | 'u-M7'
    | 'u-M8'
    | 'u-M9'
    | 'u-M10'
    | 'u-M11'
    | 'u-M12'
    | 'u-M13'
    | 'u-M14'
    | 'u-M15'
    | 'u-M16'
    | 'u-M17'
    | 'u-M18'
    | 'u-M19'
    | 'u-M20'
    | 'u-M21'
    | 'u-M22'
    | 'u-M23'
    | 'u-M24'
    | 'u-M25'
    | 'u-M26'
    | 'u-M27'
    | 'u-M28'
    | 'u-M29'
    | 'u-M30'
    | 'u-M31'
    | 'u-M32'
    | 'u-M33'
    | 'u-M34'
    | 'u-M35'
    | 'u-M36'
    | 'u-M37'
    | 'u-M38'
    | 'u-M39'
    | 'u-M40'
    | 'u-M41'
    | 'u-M42'
    | 'u-M43'
    | 'u-M44'
    | 'u-M45'
    | 'u-M46'
    | 'u-M47'
    | 'u-M48'
    | 'u-M49';

  it('large enums and string literal unions', () => {
    expect(
      match<LargeEnum>(LargeEnum.M42)
        .with(LargeEnum.M0, () => 0)
        .with(LargeEnum.M1, () => 1)
        .with(LargeEnum.M2, () => 2)
        .with(LargeEnum.M3, () => 3)
        .with(LargeEnum.M4, () => 4)
        .with(LargeEnum.M5, () => 5)
        .with(LargeEnum.M6, () => 6)
        .with(LargeEnum.M7, () => 7)
        .with(LargeEnum.M8, () => 8)
        .with(LargeEnum.M9, () => 9)
        .with(LargeEnum.M10, () => 10)
        .with(LargeEnum.M11, () => 11)
        .with(LargeEnum.M12, () => 12)
        .with(LargeEnum.M13, () => 13)
        .with(LargeEnum.M14, () => 14)
        .with(LargeEnum.M15, () => 15)
        .with(LargeEnum.M16, () => 16)
        .with(LargeEnum.M17, () => 17)
        .with(LargeEnum.M18, () => 18)
        .with(LargeEnum.M19, () => 19)
        .with(LargeEnum.M20, () => 20)
        .with(LargeEnum.M21, () => 21)
        .with(LargeEnum.M22, () => 22)
        .with(LargeEnum.M23, () => 23)
        .with(LargeEnum.M24, () => 24)
        .with(LargeEnum.M25, () => 25)
        .with(LargeEnum.M26, () => 26)
        .with(LargeEnum.M27, () => 27)
        .with(LargeEnum.M28, () => 28)
        .with(LargeEnum.M29, () => 29)
        .with(LargeEnum.M30, () => 30)
        .with(LargeEnum.M31, () => 31)
        .with(LargeEnum.M32, () => 32)
        .with(LargeEnum.M33, () => 33)
        .with(LargeEnum.M34, () => 34)
        .with(LargeEnum.M35, () => 35)
        .with(LargeEnum.M36, () => 36)
        .with(LargeEnum.M37, () => 37)
        .with(LargeEnum.M38, () => 38)
        .with(LargeEnum.M39, () => 39)
        .with(LargeEnum.M40, () => 40)
        .with(LargeEnum.M41, () => 41)
        .with(LargeEnum.M42, () => 42)
        .with(LargeEnum.M43, () => 43)
        .with(LargeEnum.M44, () => 44)
        .with(LargeEnum.M45, () => 45)
        .with(LargeEnum.M46, () => 46)
        .with(LargeEnum.M47, () => 47)
        .with(LargeEnum.M48, () => 48)
        .with(LargeEnum.M49, () => 49)
        .exhaustive()
    ).toBe(42);

    expect(
      match<LargeUnion>('u-M7')
        .with('u-M0', () => 0)
        .with('u-M1', () => 1)
        .with('u-M2', () => 2)
        .with('u-M3', () => 3)
        .with('u-M4', () => 4)
        .with('u-M5', () => 5)
        .with('u-M6', () => 6)
        .with('u-M7', () => 7)
        .with('u-M8', () => 8)
        .with('u-M9', () => 9)
        .with('u-M10', () => 10)
        .with('u-M11', () => 11)
        .with('u-M12', () => 12)
        .with('u-M13', () => 13)
        .with('u-M14', () => 14)
        .with('u-M15', () => 15)
        .with('u-M16', () => 16)
        .with('u-M17', () => 17)
        .with('u-M18', () => 18)
        .with('u-M19', () => 19)
        .with('u-M20', () => 20)
        .with('u-M21', () => 21)
        .with('u-M22', () => 22)
        .with('u-M23', () => 23)
        .with('u-M24', () => 24)
        .with('u-M25', () => 25)
        .with('u-M26', () => 26)
        .with('u-M27', () => 27)
        .with('u-M28', () => 28)
        .with('u-M29', () => 29)
        .with('u-M30', () => 30)
        .with('u-M31', () => 31)
        .with('u-M32', () => 32)
        .with('u-M33', () => 33)
        .with('u-M34', () => 34)
        .with('u-M35', () => 35)
        .with('u-M36', () => 36)
        .with('u-M37', () => 37)
        .with('u-M38', () => 38)
        .with('u-M39', () => 39)
        .with('u-M40', () => 40)
        .with('u-M41', () => 41)
        .with('u-M42', () => 42)
        .with('u-M43', () => 43)
        .with('u-M44', () => 44)
        .with('u-M45', () => 45)
        .with('u-M46', () => 46)
        .with('u-M47', () => 47)
        .with('u-M48', () => 48)
        .with('u-M49', () => 49)
        .exhaustive()
    ).toBe(7);

    match<LargeEnum>(LargeEnum.M42)
      .with(LargeEnum.M1, () => 0)
      .with(LargeEnum.M2, () => 1)
      .with(LargeEnum.M3, () => 2)
      .with(LargeEnum.M4, () => 3)
      .with(LargeEnum.M5, () => 4)
      .with(LargeEnum.M6, () => 5)
      .with(LargeEnum.M7, () => 6)
      .with(LargeEnum.M8, () => 7)
      .with(LargeEnum.M9, () => 8)
      .with(LargeEnum.M10, () => 9)
      .with(LargeEnum.M11, () => 10)
      .with(LargeEnum.M12, () => 11)
      .with(LargeEnum.M13, () => 12)
      .with(LargeEnum.M14, () => 13)
      .with(LargeEnum.M15, () => 14)
      .with(LargeEnum.M16, () => 15)
      .with(LargeEnum.M17, () => 16)
      .with(LargeEnum.M18, () => 17)
      .with(LargeEnum.M19, () => 18)
      .with(LargeEnum.M20, () => 19)
      .with(LargeEnum.M21, () => 20)
      .with(LargeEnum.M22, () => 21)
      .with(LargeEnum.M23, () => 22)
      .with(LargeEnum.M24, () => 23)
      .with(LargeEnum.M25, () => 24)
      .with(LargeEnum.M26, () => 25)
      .with(LargeEnum.M27, () => 26)
      .with(LargeEnum.M28, () => 27)
      .with(LargeEnum.M29, () => 28)
      .with(LargeEnum.M30, () => 29)
      .with(LargeEnum.M31, () => 30)
      .with(LargeEnum.M32, () => 31)
      .with(LargeEnum.M33, () => 32)
      .with(LargeEnum.M34, () => 33)
      .with(LargeEnum.M35, () => 34)
      .with(LargeEnum.M36, () => 35)
      .with(LargeEnum.M37, () => 36)
      .with(LargeEnum.M38, () => 37)
      .with(LargeEnum.M39, () => 38)
      .with(LargeEnum.M40, () => 39)
      .with(LargeEnum.M41, () => 40)
      .with(LargeEnum.M42, () => 41)
      .with(LargeEnum.M43, () => 42)
      .with(LargeEnum.M44, () => 43)
      .with(LargeEnum.M45, () => 44)
      .with(LargeEnum.M46, () => 45)
      .with(LargeEnum.M47, () => 46)
      .with(LargeEnum.M48, () => 47)
      .with(LargeEnum.M49, () => 48)
      // @ts-expect-error: LargeEnum.M0 isn't handled
      .exhaustive();
  });
});
