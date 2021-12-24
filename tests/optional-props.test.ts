import { Expect, Equal } from '../src/types/helpers';
import { match, not, __, P } from '../src';

describe('optional properties', () => {
  it('matching on optional properties should work', () => {
    type Post = {
      type: 'post';
      id?: number;
      body: string;
    };

    const res = match<Post>({
      type: 'post',
      id: 2,
      body: 'az',
    })
      .with({ type: 'post', id: 2 as const }, (x) => {
        type t = Expect<Equal<typeof x, { type: 'post'; id: 2; body: string }>>;
        return 100;
      })
      .with({ type: 'post', id: P.number }, (x) => {
        type t = Expect<
          Equal<typeof x, { type: 'post'; id: number; body: string }>
        >;
        return 10;
      })
      .with({ type: 'post' }, (x) => {
        type t = Expect<Equal<typeof x, Post>>;
        // id is still nullable
        x.id = undefined;
        return 1;
      })
      .run();

    expect(res).toEqual(100);
  });

  it('should correctly narrow the input type when the input is assignable to the pattern type', () => {
    type Foo =
      | { type: 'test'; id?: string }
      | { type: 'test2'; id?: string; otherProp: string }
      | { type: 'test3'; id?: string; otherProp?: string };

    const f = (foo: Foo) =>
      match(foo)
        .with({ type: 'test', id: not(undefined) }, ({ id }) => {
          type t = Expect<Equal<typeof id, string>>;
          return 0;
        })

        .with({ type: 'test' }, ({ id }) => {
          type t = Expect<Equal<typeof id, string | undefined>>;
          return 1;
        })

        .with({ type: 'test2' }, ({ id }) => {
          type t = Expect<Equal<typeof id, string | undefined>>;
          return 2;
        })
        .with({ type: 'test3' }, ({ id }) => {
          type t = Expect<Equal<typeof id, string | undefined>>;
          return 3;
        })
        .exhaustive();

    expect(f({ type: 'test', id: '1' })).toEqual(0);
    expect(f({ type: 'test' })).toEqual(1);
    expect(f({ type: 'test2', otherProp: '' })).toEqual(2);
    expect(f({ type: 'test3' })).toEqual(3);
  });
});
