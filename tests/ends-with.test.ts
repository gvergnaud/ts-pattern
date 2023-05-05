import { Expect, Equal } from '../src/types/helpers';
import { match, P } from '../src';

type PngFileName = `${string}.png`;
type JpgFileName = `${string}.jpg`;

describe('endsWith', () => {
  it('should work at the top level', () => {
    const get = (x: PngFileName | JpgFileName): string =>
      match(x)
        .with(P.endsWith('.png'), (x) => {
          type t = Expect<Equal<typeof x, PngFileName>>;
          return 'png file name';
        })
        .with(P.endsWith('.jpg'), (x) => {
          type t = Expect<Equal<typeof x, JpgFileName>>;
          return 'jpg file name';
        })
        .exhaustive();

    expect(get('foo.png')).toEqual('png file name');
    expect(get('foo.jpg')).toEqual('jpg file name');
  });

  it('should work as a nested pattern', () => {
    type Input = { value: PngFileName | JpgFileName };

    const input: Input = { value: 'foo.png' };

    const output = match<Input>(input)
      .with({ value: P.endsWith('.png') }, (a) => {
        type t = Expect<Equal<typeof a, { value: PngFileName }>>;
        return 'nested png file name';
      })
      .with({ value: P.endsWith('.jpg') }, (b) => {
        type t = Expect<Equal<typeof b, { value: JpgFileName }>>;
        return 'nested jpg file name';
      })
      .exhaustive();

    expect(output).toEqual('nested png file name');
  });
});
