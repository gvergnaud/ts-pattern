import { Expect, Equal } from '../src/types/helpers';
import { match, P } from '../src';

type FileFrom2022 = `2022-${number}-${number}`;
type FileFrom2023 = `2023-${number}-${number}`;

describe('endsWith', () => {
  it('should work at the top level', () => {
    const get = (x: FileFrom2022 | FileFrom2023): string =>
      match(x)
        .with(P.startsWith('2022-'), (x) => {
          type t = Expect<Equal<typeof x, FileFrom2022>>;
          return 'file from 2022';
        })
        .with(P.startsWith('2023-'), (x) => {
          type t = Expect<Equal<typeof x, FileFrom2023>>;
          return 'file from 2023';
        })
        .exhaustive();

    expect(get('2022-04-01')).toEqual('file from 2022');
    expect(get('2023-04-01')).toEqual('file from 2023');
  });

  it('should work as a nested pattern', () => {
    type Input = { value: FileFrom2022 | FileFrom2023 };

    const input: Input = { value: '2023-04-01' };

    const output = match<Input>(input)
      .with({ value: P.startsWith('2022-') }, (a) => {
        type t = Expect<Equal<typeof a, { value: FileFrom2022 }>>;
        return 'nested file from 2022';
      })
      .with({ value: P.startsWith('2023-') }, (b) => {
        type t = Expect<Equal<typeof b, { value: FileFrom2023 }>>;
        return 'nested file from 2023';
      })
      .exhaustive();

    expect(output).toEqual('nested file from 2023');
  });
});
