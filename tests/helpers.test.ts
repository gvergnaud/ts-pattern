import {
  Drop,
  Equal,
  ExcludeIfContainsNever,
  Expect,
  Iterator,
  LeastUpperBound,
  Slice,
  IntersectObjects,
} from '../src/types/helpers';

describe('helpers', () => {
  describe('Slice', () => {
    it('should correctly return the start of a tuple', () => {
      type cases = [
        Expect<Equal<Slice<[1, 2, 3], Iterator<0>>, []>>,
        Expect<Equal<Slice<[1, 2, 3], Iterator<1>>, [1]>>,
        Expect<Equal<Slice<[1, 2, 3], Iterator<2>>, [1, 2]>>,
        Expect<Equal<Slice<[1, 2, 3], Iterator<3>>, [1, 2, 3]>>,
        Expect<Equal<Slice<[1, 2, 3], Iterator<4>>, [1, 2, 3]>>
      ];
    });

    it('should correctly return the start of a readonly tuple', () => {
      type cases = [
        Expect<Equal<Slice<readonly [1, 2, 3], Iterator<0>>, []>>,
        Expect<Equal<Slice<readonly [1, 2, 3], Iterator<1>>, [1]>>,
        Expect<Equal<Slice<readonly [1, 2, 3], Iterator<2>>, [1, 2]>>,
        Expect<Equal<Slice<readonly [1, 2, 3], Iterator<3>>, [1, 2, 3]>>,
        Expect<Equal<Slice<readonly [1, 2, 3], Iterator<4>>, [1, 2, 3]>>
      ];
    });
  });

  describe('Drop', () => {
    it('should correctly remove the n first elements of a tuple', () => {
      type cases = [
        Expect<Equal<Drop<[1, 2, 3], Iterator<0>>, [1, 2, 3]>>,
        Expect<Equal<Drop<[1, 2, 3], Iterator<1>>, [2, 3]>>,
        Expect<Equal<Drop<[1, 2, 3], Iterator<2>>, [3]>>,
        Expect<Equal<Drop<[1, 2, 3], Iterator<3>>, []>>,
        Expect<Equal<Drop<[1, 2, 3], Iterator<4>>, []>>
      ];
    });

    it('should correctly remove the n first elements of a readonly tuple', () => {
      type cases = [
        Expect<
          Equal<Drop<readonly [1, 2, 3], Iterator<0>>, readonly [1, 2, 3]>
        >,
        Expect<Equal<Drop<readonly [1, 2, 3], Iterator<1>>, [2, 3]>>,
        Expect<Equal<Drop<readonly [1, 2, 3], Iterator<2>>, [3]>>,
        Expect<Equal<Drop<readonly [1, 2, 3], Iterator<3>>, []>>,
        Expect<Equal<Drop<readonly [1, 2, 3], Iterator<4>>, []>>
      ];
    });
  });

  describe('ExcludeIfContainsNever', () => {
    it('should work with objects and tuples', () => {
      type cases = [
        Expect<
          Equal<
            ExcludeIfContainsNever<
              { kind: 'some'; value: string } | { kind: never },
              { kind: 'some' }
            >,
            { kind: 'some'; value: string }
          >
        >,
        Expect<
          Equal<
            ExcludeIfContainsNever<
              [{ kind: 'some'; value: string } | never],
              [{ kind: 'some' }]
            >,
            [{ kind: 'some'; value: string }]
          >
        >,
        Expect<
          Equal<
            ExcludeIfContainsNever<
              [{ kind: 'some'; value: string }, never],
              [{ kind: 'some' }, unknown]
            >,
            never
          >
        >
      ];
    });
  });

  describe('LeastUpperBound', () => {
    it('If both a and b extend each other, it should pick b', () => {
      class B {}
      class A extends B {}
      type t = Expect<Equal<LeastUpperBound<A | B, B>, B>>;
    });
  });

  describe('IntersectObjects', () => {
    it('', () => {
      type x = IntersectObjects<
        | { k: 'a'; value: number; a: string }
        | { k: 'b'; value: string; b: string }
        | { k: 'c'; value: number; c: string }
      >;

      type t = Expect<
        Equal<
          x,
          {
            k: 'a' | 'b' | 'c';
            value: number | string;
            a: string;
            b: string;
            c: string;
          }
        >
      >;

      type t2 = Expect<
        Equal<
          IntersectObjects<
            | { k: 'a'; value: number }
            | { k: 'b'; value: string }
            | { k: 'c'; value: number }
          >,
          {
            k: 'a' | 'b' | 'c';
            value: number | string;
          }
        >
      >;

      type t3 = Expect<
        Equal<
          IntersectObjects<
            | { type: 1; data: number }
            | { type: 'two'; data: string }
            | { type: 3; data: boolean }
            | { type: 4 }
          >,
          { type: 1 | 'two' | 3 | 4; data: number | string | boolean }
        >
      >;
    });
  });
});
