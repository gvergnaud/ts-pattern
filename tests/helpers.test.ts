import { All, Equal, Expect } from '../src/types/helpers';

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
});
