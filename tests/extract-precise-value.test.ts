import { ExtractPreciseValue } from '../src/types/ExtractPreciseValue';
import { Expect, Equal } from '../src/types/helpers';
import { Option } from './utils';

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
});
