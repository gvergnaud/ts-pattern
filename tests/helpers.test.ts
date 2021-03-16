import {
  All,
  Drop,
  Equal,
  ExcludeIfContainsNever,
  Expect,
  Iterator,
  Slice,
} from '../src/types/helpers';

describe('helpers', () => {
  describe('All', () => {
    it('should return true if all values are true', () => {
      type cases = [
        Expect<Equal<All<[]>, true>>,
        Expect<Equal<All<[true, true]>, true>>,
        Expect<Equal<All<[true, true, true]>, true>>
      ];
    });

    it('should return false if some values are false', () => {
      type cases = [
        Expect<Equal<All<[false]>, false>>,
        Expect<Equal<All<[true, false]>, false>>,
        Expect<Equal<All<[true, false, true]>, false>>
      ];
    });

    it('should return false if some values are boolean', () => {
      type cases = [
        Expect<Equal<All<[true, boolean, true]>, false>>,
        Expect<Equal<All<[boolean]>, false>>
      ];
    });
  });

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
});
