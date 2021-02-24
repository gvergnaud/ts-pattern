import { Expect, Equal } from '../src/types/helpers';
import { match, __ } from '../src';

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
      .with({ type: 'post', id: __.number }, (x) => {
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
});
