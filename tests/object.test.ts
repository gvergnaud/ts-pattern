import { Expect, Equal, Primitives } from '../src/types/helpers';
import { P, match } from '../src';

describe('Object', () => {
  describe('P.object', () => {
    describe('exhaustiveness checking', () => {
      it("shouldn't match primitive types", () => {
        const fn = (input: Primitives | object) =>
          match(input)
            .with(P.object, (obj) => {
              type t = Expect<Equal<typeof obj, object>>;
              return 'object';
            })
            // @ts-expect-error primitive types aren't assignable to `object`
            .exhaustive();

        expect(fn({ k: 'hello' })).toEqual('object');
        expect(() => fn('hello')).toThrow();
      });

      it('should match functions', () => {
        const fn = (input: () => void) =>
          match(input)
            .with(P.object, (obj) => {
              type t = Expect<Equal<typeof obj, () => void>>;
              return 'object';
            })
            // `() => void` is assignable to `object`
            .exhaustive();
        expect(fn(() => {})).toEqual('object');
      });

      it('should match object literals', () => {
        const fn = (input: { hello: 'world' }) =>
          match(input)
            .with(P.object, (obj) => {
              type t = Expect<Equal<typeof obj, { hello: 'world' }>>;
              return 'object';
            })
            // `{ hello: 'world' }` is assignable to `object`
            .exhaustive();
        expect(fn({ hello: 'world' })).toEqual('object');
      });

      it('should match arrays', () => {
        const fn = (input: string[] | [1, 2] | [] | readonly ['a', 'b']) =>
          match(input)
            .with(P.object, (obj) => {
              type t = Expect<
                Equal<typeof obj, string[] | [1, 2] | [] | readonly ['a', 'b']>
              >;
              return 'object';
            })
            // all arrays are assignable to `object`
            .exhaustive();
        expect(fn(['a', 'b'])).toEqual('object');
        expect(fn(['aasdasd'])).toEqual('object');
        expect(fn([])).toEqual('object');
        expect(fn([1, 2])).toEqual('object');
      });

      it('should match records', () => {
        const fn = (input: Record<string, string>) => {
          match(input)
            .with(P.object, (obj) => {
              type t = Expect<Equal<typeof obj, Record<string, string>>>;
              return 'object';
            })
            // records are assignable to `object`.
            .exhaustive();
          expect(fn({ a: 'b' })).toEqual('object');
        };
      });
    });
  });

  describe('P.object.empty()', () => {
    it('should only catch the literal `{}`.', () => {
      const fn = (input: object) =>
        match(input)
          .with(P.object.empty(), (obj) => {
            type t = Expect<Equal<typeof obj, object>>;
            return 'yes';
          })
          // @ts-expect-error: non empty object aren't caught
          .exhaustive();
      expect(fn({})).toEqual('yes');
      expect(() => fn({ hello: 'world' })).toThrow();
      expect(() => fn(() => {})).toThrow();
      expect(() => fn([1, 2, 3])).toThrow();
      expect(() => fn([])).toThrow();
    });

    it('should not catch the primitive types', () => {
      const fn = (input: unknown) =>
        match(input)
          .with(P.object.empty(), (obj) => {
            type t = Expect<Equal<typeof obj, object>>;
            return 'yes';
          })
          .otherwise(() => 'no');

      expect(fn({})).toEqual('yes');
      expect(fn(0)).toEqual('no');
      expect(fn(0n)).toEqual('no');
      expect(fn(null)).toEqual('no');
    });
  });
  
  describe('P.object.exact({...})', () => {
    it('should only catch exact match.', () => {
      const fn = (input: object) =>
        match(input)
          .with(P.object.exact({ a: P.any }), (obj) => {
            type t = Expect<Equal<typeof obj, { a: unknown }>>;
            return 'yes';
          })
          .otherwise(() => 'no');
          
      expect(fn({a: []})).toEqual('yes');
      expect(fn({a: null})).toEqual('yes');
      expect(fn({a: undefined})).toEqual('yes');
      expect(fn({a: undefined,b:undefined})).toEqual('no');
      expect(fn({})).toEqual('no');
      expect(() => fn({ hello: 'world' })).toEqual('no');
      expect(() => fn(() => {})).toEqual('no');
      expect(() => fn([1, 2, 3])).toEqual('no');
      expect(() => fn([])).toEqual('no');
    });
  });
});
