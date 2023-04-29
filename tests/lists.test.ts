import { match, P } from '../src';
import { Expect, Equal } from '../src/types/helpers';
import { Option, Blog } from './types-catalog/utils';

describe('List ([a])', () => {
  it('should match list patterns', () => {
    let httpResult = {
      id: 20,
      title: 'hellooo',
    };
    const res = match<any, Option<Blog[]>>([httpResult])
      .with([], (x) => {
        type t = Expect<Equal<typeof x, []>>;
        return { kind: 'some', value: [{ id: 0, title: 'LOlol' }] };
      })
      .with(P.array({ id: P.number, title: P.string }), (blogs) => {
        type t = Expect<Equal<typeof blogs, { id: number; title: string }[]>>;
        return {
          kind: 'some',
          value: blogs,
        };
      })
      .with(20, (x) => {
        type t = Expect<Equal<typeof x, 20>>;
        return { kind: 'none' };
      })
      .otherwise(() => ({ kind: 'none' }));

    expect(res).toEqual({ kind: 'some', value: [httpResult] });
  });

  it('should work with generics', () => {
    const reverse = <T>(xs: T[]): T[] => {
      return match<T[], T[]>(xs)
        .with([], () => [])
        .with(P._, ([x, ...xs]) => [...reverse(xs), x])
        .run();
    };

    expect(reverse([1, 2, 3])).toEqual([3, 2, 1]);
  });

  it('issue #148: P.array should support readonly arrays as its input', () => {
    type Input = readonly {
      readonly title: string;
      readonly content: string;
    }[];

    const input: Input = [
      { title: 'Hello world!', content: 'This is a very interesting content' },
      { title: 'Bonjour!', content: 'This is a very interesting content too' },
    ];

    const output = match<Input, string>(input)
      .with(
        P.array({ title: P.string, content: P.string }),
        (posts) => 'a list of posts!'
      )
      .otherwise(() => 'something else');
  });
});
