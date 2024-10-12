import { P } from '../src';

describe('P.exact', () => {
  type Post = {
    title: string;
    description?: string;
    stars: 1 | 2 | 3;
    comments: [];
  };

  type User = {
    age: number;
    name: string;
    displayName?: string;
    posts: Post[];
  };

  const postPattern: P.exact<Post> = {
    title: P.string,
    description: P.string.optional(),
    stars: P.union(1, 2, 3),
    comments: [],
  };

  const userPattern: P.exact<User> = {
    age: P.number,
    name: P.string,
    displayName: P.string.optional(),
    posts: P.array(postPattern),
  };
});
