import { match } from '../src';
import { DeepExclude } from '../src/types/DeepExclude';
import {
  InvertPattern,
  InvertPatternForExclude,
} from '../src/types/InvertPattern';
import { MatchedValue } from '../src/types/Pattern';
import {
  Equal,
  Expect,
  ExtractWithDefault,
  IsReadonlyArray,
} from '../src/types/helpers';

describe('readonly', () => {
  describe('exhaustive', () => {
    it('tuples', () => {
      const f = (input: readonly ['a' | 'b', 'c' | 'd']) =>
        match(input)
          .with(['a', 'c'], (x) => {
            type t = Expect<Equal<typeof x, readonly ['a', 'c']>>;
            return 'ok';
          })
          .with(['a', 'd'], (x) => {
            type t = Expect<Equal<typeof x, readonly ['a', 'd']>>;
            return 'ok';
          })
          .with(['b', 'c'], (x) => {
            type t = Expect<Equal<typeof x, readonly ['b', 'c']>>;
            return 'ok';
          })
          .with(['b', 'd'], (x) => {
            type t = Expect<Equal<typeof x, readonly ['b', 'd']>>;
            return 'ok';
          })
          .exhaustive();
    });

    it('objects', () => {
      const f = (
        input: Readonly<{ t: 'a'; x: number }> | Readonly<{ t: 'b'; x: string }>
      ) =>
        match(input)
          .with({ t: 'a' }, (x) => {
            type t = Expect<Equal<typeof x, Readonly<{ t: 'a'; x: number }>>>;
            return 'ok';
          })
          .with({ t: 'b' }, (x) => {
            type t = Expect<Equal<typeof x, Readonly<{ t: 'b'; x: string }>>>;
            return 'ok';
          })
          .exhaustive();
    });

    it('mixed', () => {
      const f = (
        input:
          | Readonly<{ t: 'a'; x: readonly [number, string, 2] }>
          | Readonly<{ t: 'b'; x: string }>
      ) =>
        match(input)
          .with({ t: 'a', x: [2, 'hello', 2] }, (x) => {
            type t = Expect<
              Equal<typeof x, { t: 'a'; x: [number, string, 2] }>
            >;
            return 'ok';
          })
          .with({ t: 'a', x: [2, 'hello', 2] as const }, (x) => {
            type t = Expect<Equal<typeof x, { t: 'a'; x: [2, 'hello', 2] }>>;
            return 'ok';
          })
          .with({ t: 'a' }, (x) => {
            type t = Expect<
              Equal<
                typeof x,
                Readonly<{ t: 'a'; x: readonly [number, string, 2] }>
              >
            >;
            return 'ok';
          })
          .with({ t: 'b' }, (x) => {
            type t = Expect<Equal<typeof x, Readonly<{ t: 'b'; x: string }>>>;
            return 'ok';
          })
          .exhaustive();
    });
  });
});
