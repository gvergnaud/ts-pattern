import { ExtractPreciseValue } from '../src/types/ExtractPreciseValue';
import { Expect, Equal } from '../src/types/helpers';
import { Option, State } from './utils';

describe('ExtractPreciseValue', () => {
  it('should correctly extract the matching value from the input and an inverted pattern', () => {
    type cases = [
      Expect<
        Equal<
          ExtractPreciseValue<
            { type: 'test' } | ['hello', Option<string>] | 'hello'[],
            ['hello', { kind: 'some' }]
          >,
          ['hello', { kind: 'some'; value: string }]
        >
      >
    ];
  });

  it('should use the type of the pattern if the input is any or never', () => {
    type cases = [
      Expect<
        Equal<
          ExtractPreciseValue<any, ['hello', { kind: 'some' }]>,
          ['hello', { kind: 'some' }]
        >
      >
    ];
  });

  it('should return the input type when pattern is unknown', () => {
    type cases = [
      Expect<
        Equal<
          ExtractPreciseValue<[State, Event], [unknown, unknown]>,
          [State, Event]
        >
      >
    ];
  });

  it('should return the correct branch a union based on the pattern', () => {
    type x = ExtractPreciseValue<
      { a: string; b: number } | [boolean, number],
      readonly [true, 2]
    >;
    type cases = [Expect<Equal<x, [true, 2]>>];
  });

  it('should support readonly input types', () => {
    type cases = [
      Expect<
        Equal<
          ExtractPreciseValue<
            { readonly a: string; b: number } | [boolean, number],
            readonly [true, 2]
          >,
          [true, 2]
        >
      >,
      Expect<
        Equal<
          ExtractPreciseValue<
            { readonly a: string; b: number } | [boolean, number],
            { b: number }
          >,
          { readonly a: string; b: number }
        >
      >,
      Expect<
        Equal<
          ExtractPreciseValue<
            { readonly a: string; b: number } | [boolean, number],
            { readonly a: string }
          >,
          { readonly a: string; b: number }
        >
      >
    ];
  });
});
