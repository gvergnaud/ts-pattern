import { match, __ } from '../src';
import { NotNever } from './utils';

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
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: Post & { id: 2 } = x;
        return 100;
      })
      .with({ type: 'post', id: __.number }, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: Post = x;
        return 10;
      })
      .with({ type: 'post' }, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: Post = x;
        // id is still nullable
        x.id = undefined;
        return 1;
      })
      .run();

    expect(res).toEqual(100);
  });
});
