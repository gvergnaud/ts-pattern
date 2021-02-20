import { DeepExclude } from '../src/types/DeepExclude';
import { Equal, Expect } from '../src/types/helpers';
import { NotPattern } from '../src/types/Pattern';
import { BigUnion, Option } from './utils';

type Colors = 'pink' | 'purple' | 'red' | 'yellow' | 'blue';

describe('DeepExclude', () => {
  it('should work with bug unions', () => {
    it('should work with big unions', () => {
      type cases = [
        Expect<
          Equal<
            DeepExclude<
              | { type: 'textWithColor'; union: BigUnion }
              | {
                  type: 'textWithColorAndBackground';
                  union: BigUnion;
                  union2: BigUnion;
                },
              { type: 'textWithColor' }
            >,
            {
              type: 'textWithColorAndBackground';
              union: BigUnion;
              union2: BigUnion;
            }
          >
        >,
        Expect<
          Equal<
            DeepExclude<
              | { type: 'textWithColor'; union: BigUnion }
              | {
                  type: 'textWithColorAndBackground';
                  union: BigUnion;
                  union2: BigUnion;
                },
              {
                type: 'textWithColorAndBackground';
                union: Exclude<BigUnion, 'a'>;
              }
            >,
            | { type: 'textWithColor'; union: BigUnion }
            | {
                type: 'textWithColorAndBackground';
                union: 'a';
                union2: BigUnion;
              }
          >
        >
      ];
    });
  });

  it('should work in common cases', () => {});
  type cases = [
    Expect<Equal<DeepExclude<'a' | 'b' | 'c', 'a'>, 'b' | 'c'>>,
    Expect<
      Equal<
        DeepExclude<
          | { type: 'textWithColor'; color: Colors }
          | {
              type: 'textWithColorAndBackground';
              color: Colors;
              backgroundColor: Colors;
            },
          { type: 'textWithColor' }
        >,
        {
          type: 'textWithColorAndBackground';
          color: Colors;
          backgroundColor: Colors;
        }
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          | { type: 'textWithColor'; color: Colors }
          | {
              type: 'textWithColorAndBackground';
              color: Colors;
              backgroundColor: Colors;
            },
          { type: 'textWithColor'; color: 'pink' }
        >,
        | {
            type: 'textWithColorAndBackground';
            color: Colors;
            backgroundColor: Colors;
          }
        | { type: 'textWithColor'; color: 'purple' }
        | { type: 'textWithColor'; color: 'red' }
        | { type: 'textWithColor'; color: 'yellow' }
        | { type: 'textWithColor'; color: 'blue' }
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          [Option<{ type: 'a' } | { type: 'b' }>, 'c' | 'd'],
          [{ kind: 'some'; value: { type: 'a' } }, any]
        >,
        | [{ kind: 'none' }, 'c' | 'd']
        | [{ kind: 'some'; value: { type: 'b' } }, 'c' | 'd']
      >
    >,
    Expect<
      Equal<
        DeepExclude<
          { x: 'a' | 'b'; y: 'c' | 'd'; z: 'e' | 'f' },
          { x: 'a'; y: 'c' }
        >,
        | { x: 'b'; y: 'c'; z: 'e' | 'f' }
        | { x: 'b'; y: 'd'; z: 'e' | 'f' }
        | { x: 'a'; y: 'd'; z: 'e' | 'f' }
      >
    >
  ];
});
