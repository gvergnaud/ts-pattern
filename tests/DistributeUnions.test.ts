import {
  FindUnions,
  Distribute,
  DistributeUnions,
} from '../src/types/DistributeUnions';

import { Equal, Expect } from '../src/types/helpers';

describe('FindUnions', () => {
  it('should correctly find all unions on an object', () => {
    type cases = [
      Expect<
        Equal<
          FindUnions<{ a: 1 | 2; b: 3 | 4 }>,
          [[1 | 2, ['a']], [3 | 4, ['b']]]
        >
      >,
      Expect<
        Equal<
          FindUnions<{ a: 1 | 2; b: 3 | 4; c: 5 | 6 }>,
          [[1 | 2, ['a']], [3 | 4, ['b']], [5 | 6, ['c']]]
        >
      >,
      Expect<
        Equal<
          FindUnions<{
            a: 1 | 2;
            b: 3 | 4;
            c: 5 | 6;
            d: { e: 7 | 8; f: 9 | 10 };
          }>,
          [
            [1 | 2, ['a']],
            [3 | 4, ['b']],
            [5 | 6, ['c']],
            [7 | 8, ['d', 'e']],
            [9 | 10, ['d', 'f']]
          ]
        >
      >,
      Expect<
        Equal<
          FindUnions<{
            a: {
              b: {
                c: {
                  d: { e: 7 | 8; f: 9 | 10 };
                };
              };
            };
          }>,
          [
            [7 | 8, ['a', 'b', 'c', 'd', 'e']],
            [9 | 10, ['a', 'b', 'c', 'd', 'f']]
          ]
        >
      >,
      Expect<
        Equal<
          FindUnions<{
            a: {
              b: {
                c: {
                  d: { e: 7 | 8; f: 9 | 10 };
                  e: 'not a union';
                };
                g: 2 | 3;
              };
            };
          }>,
          [
            [7 | 8, ['a', 'b', 'c', 'd', 'e']],
            [9 | 10, ['a', 'b', 'c', 'd', 'f']],
            [2 | 3, ['a', 'b', 'g']]
          ]
        >
      >
    ];
  });

  it('should correctly find all unions on a tuple', () => {
    type cases = [
      Expect<
        Equal<FindUnions<[1 | 2, 3 | 4]>, [[1 | 2, ['0']], [3 | 4, ['1']]]>
      >,
      Expect<
        Equal<
          FindUnions<[1 | 2, 3 | 4, 5 | 6]>,
          [[1 | 2, ['0']], [3 | 4, ['1']], [5 | 6, ['2']]]
        >
      >
    ];
  });
});

describe('Distribute', () => {
  it('should distribute unions into a list of values with their path', () => {
    type cases = [
      Expect<
        Equal<
          Distribute<[[1 | 2, ['0']], [3 | 4, ['1']]]>,
          | [[2, ['0']], [3, ['1']]]
          | [[2, ['0']], [4, ['1']]]
          | [[1, ['0']], [3, ['1']]]
          | [[1, ['0']], [4, ['1']]]
        >
      >,
      Expect<
        Equal<
          Distribute<[[1 | 2, ['0']], [3 | 4, ['1']], [5 | 6, ['2']]]>,
          | [[2, ['0']], [3, ['1']], [5, ['2']]]
          | [[2, ['0']], [3, ['1']], [6, ['2']]]
          | [[2, ['0']], [4, ['1']], [5, ['2']]]
          | [[2, ['0']], [4, ['1']], [6, ['2']]]
          | [[1, ['0']], [3, ['1']], [5, ['2']]]
          | [[1, ['0']], [3, ['1']], [6, ['2']]]
          | [[1, ['0']], [4, ['1']], [5, ['2']]]
          | [[1, ['0']], [4, ['1']], [6, ['2']]]
        >
      >
    ];
  });
});

describe('DistributeUnions', () => {
  type tinput = { a: '1' | '2'; b: '3' | '4'; c: '5' | '6' };

  type t12 = DistributeUnions<tinput>;
  type t15 = Exclude<t12, { a: '1' }>;

  const t12: t12 = { a: '1', b: '3', c: '6' };
  // @ts-expect-error
  const t13: Exclude<t12, { a: '1'; b: '3' }> = {
    a: '1',
    b: '3',
    c: '6',
  };
  const t16: Exclude<t12, { a: '1'; b: '3' }> = {
    a: '2',
    b: '3',
    c: '6',
  };

  type Option<a> = { kind: 'none' } | { kind: 'some'; value: a };

  type Input =
    | { x: 'a'; value: Option<string> }
    | { x: 'b'; value: Option<number> };

  type Input2 = ['a', Option<string>] | ['b', Option<number>];

  type X = DistributeUnions<Input>;
  type Z = Exclude<
    DistributeUnions<Input>,
    { x: 'a'; value: { kind: 'none' } }
  >;

  const x: X = { x: 'a', value: { kind: 'none' } };
  // @ts-expect-error
  const z: Z = { x: 'a', value: { kind: 'none' } };
});
