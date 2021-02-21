import { Equal, Expect } from '../src/types/helpers';
import { IsMatching } from '../src/types/IsMatching';
import { NotPattern } from '../src/types/Pattern';
import { Option } from './utils';

describe('IsMatching', () => {
  it('should return true if the pattern matches the input,  false otherwise', () => {
    describe('Object', () => {
      type cases = [
        Expect<
          Equal<
            IsMatching<{ type: 'a'; color: 'yellow' | 'green' }, { type: 'a' }>,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<{ type: 'a'; color: 'yellow' | 'green' }, { type: 'b' }>,
            false
          >
        >,
        Expect<
          Equal<
            IsMatching<
              { type: 'a'; value: { type: 'c'; value: { type: 'd' } } } | 12,
              { type: 'a' }
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<
              { type: 'a'; value: { type: 'c'; value: { type: 'd' } } } | 12,
              12
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<
              | {
                  type: 'a';
                  value:
                    | { type: 'c'; value: { type: 'd' } | 2 }
                    | { type: 'e'; value: { type: 'f' } | 3 };
                }
              | 12,
              { type: 'a'; value: { type: 'c' } }
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<
              | {
                  type: 'a';
                  value:
                    | { type: 'c'; value: { type: 'd' } | 2 }
                    | { type: 'e'; value: { type: 'f' } | 3 };
                }
              | 12,
              { type: 'a'; value: { type: 'c'; value: 2 } }
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<
              {
                type: 'a';
                value:
                  | { type: 'c'; value: { type: 'd' } | 2 }
                  | { type: 'e'; value: { type: 'f' } | 3 };
              },
              { type: 'a'; value: { type: 'c'; value: 3 } }
            >,
            false
          >
        >,
        Expect<
          Equal<
            IsMatching<12, { type: 'a'; value: { type: 'c'; value: 3 } }>,
            false
          >
        >,
        Expect<
          Equal<
            IsMatching<
              | { type: 'c'; value: { type: 'd' } | 2 }
              | { type: 'e'; value: { type: 'f' } | 3 },
              { type: 'c'; value: 3 }
            >,
            false
          >
        >,
        Expect<
          Equal<
            IsMatching<
              | { type: 'c'; value: { type: 'd' } | 2 }
              | { type: 'e'; value: { type: 'f' } | 3 },
              { type: 'c' }
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<
              | { type: 'c'; value: { type: 'd' } | 2 }
              | { type: 'e'; value: { type: 'f' } | 3 },
              { value: 3 }
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<
              { type: 'c'; value: { type: 'd' } | 2 },
              { type: 'c'; value: 3 }
            >,
            false
          >
        >
      ];
    });

    describe('Tuples', () => {
      type cases = [
        Expect<
          Equal<
            IsMatching<
              Option<{ type: 'a' } | { type: 'b' }>,
              { kind: 'some'; value: { type: 'a' } }
            >,
            true
          >
        >,
        Expect<
          Equal<
            IsMatching<
              Option<{ type: 'a' } | { type: 'b' }>,
              { kind: 'some'; value: { type: 'c' } }
            >,
            false
          >
        >,
        Expect<Equal<IsMatching<'c' | 'd', unknown>, true>>,
        Expect<
          Equal<
            IsMatching<
              [Option<{ type: 'a' } | { type: 'b' }>, 'c' | 'd'],
              [{ kind: 'some'; value: { type: 'a' } }, unknown]
            >,
            true
          >
        >
      ];
    });
  });
});
