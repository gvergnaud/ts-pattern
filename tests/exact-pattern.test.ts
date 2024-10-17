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

  const postPattern2 = {
    title: P.string,
    description: P.string.optional(),
    stars: P.union(1, 2, 3),
    comments: [],
  } as const;

  type c = P.exact<User>;
  const userPattern: c = {
    age: P.number,
    name: P.string,
    displayName: P.string.optional(),
    posts: P.array(postPattern),
  };

  describe('variadic', () => {
    type X = [...number[], string];

    type XPattern = P.exact<X>; // =>

    const X: XPattern = [...P.array(P.number), P.string];
  });
});
