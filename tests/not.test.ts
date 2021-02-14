import { match, __, not } from '../src';
import { NotNever } from './utils';

describe('not', () => {
  describe('pattern containing a not clause', () => {
    it('should work at the top level', () => {
      const get = (x: unknown) =>
        match(x)
          .with(not(__.number), (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: unknown = x;
            return 'not a number';
          })
          .with(not(__.string), (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: unknown = x;
            return 'not a string';
          })
          .run();

      expect(get(20)).toEqual('not a string');
      expect(get('hello')).toEqual('not a number');
    });

    it('should work in a nested structure', () => {
      type DS = { x: string | number; y: string | number };
      const get = (x: DS) =>
        match(x)
          .with({ y: __.number, x: not(__.string) }, (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: { x: number; y: number } = x;
            return 'yes';
          })
          .with(__, () => 'no')
          .run();

      expect(get({ x: 2, y: 2 })).toEqual('yes');
      expect(get({ y: 2, x: 'hello' })).toEqual('no');
    });

    it('should discriminate union types correctly', () => {
      const one = 'one';
      const two = 'two';

      const get = (x: 'one' | 'two') =>
        match(x)
          .with(not(one), (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: 'two' = x;
            return 'not 1';
          })
          .with(not(two), (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: 'one' = x;
            return 'not 2';
          })
          .run();

      expect(get('two')).toEqual('not 1');
      expect(get('one')).toEqual('not 2');
    });

    it('should discriminate union types correctly', () => {
      type Input =
        | {
            type: 'success';
          }
        | { type: 'error' };

      const get = (x: Input) =>
        match(x)
          .with({ type: not('success') }, (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: { type: 'error' } = x;
            return 'error';
          })
          .with({ type: not('error') }, (x) => {
            const notNever: NotNever<typeof x> = true;
            const inferenceCheck: { type: 'success' } = x;
            return 'success';
          })
          .run();

      expect(get({ type: 'error' })).toEqual('error');
      expect(get({ type: 'success' })).toEqual('success');
    });
  });
});
