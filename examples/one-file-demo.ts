/**
 * Demo summary:
 * - Basic pattern with inference with a wildcard
 *      -> use case: better than switch because you can use it in a react component
 * - using select
 *      -> easy to extract a value from the input Data Structure
 * - using P.union
 *      -> matching several cases
 * - basic exhaustiveness checking
 *      -> checking if everything is handled
 * - complexe exhaustiveness checking: matching on several values with a tuple
 *      -> matching all combination of 2 enums
 * - P.array, P.optional, isMatching: validating input
 *      -> typing API responses from 3rd party backends which aren't versioned
 */

import { isMatching, match, P, __ } from '../src';

/**
 * Use case 1: handling discriminated union types
 */

type Response =
  | { type: 'video'; format: 'mp4' | 'webm'; src: string }
  | { type: 'image'; extension: 'gif' | 'jpg' | 'png'; src: string }
  | { type: 'text'; content: string; tags: { name: string; id: number }[] };

const exampleFunction1 = (input: Response) =>
  match(input)
    // 1. Basic pattern with inference with a wildcard
    .with({ type: 'video', format: 'mp4' }, (video) => video.src)
    // 2. using select
    .with(
      { type: 'image', extension: 'gif', src: P.select() },
      (value) => value + '!!'
    )
    // 3. using P.union
    .with(
      { type: 'image', extension: P.union('jpg', 'png'), src: P.select() },
      (value) => value + '!!'
    )
    // 4. basic exhaustiveness checking
    // @ts-expect-error
    .exhaustive();

/**
 * Use case 2: multi params conditional logic
 */

type UserType = 'contributor' | 'spectator';
type OrgPlan = 'basic' | 'pro' /* | 'premium' */ | 'enterprise';

const exampleFunction2 = (org: OrgPlan, user: UserType) =>
  // Checking several enums with tuples
  match([org, user] as const)
    .with(['basic', __], () => `Please upgrade to unlock this feature!`)
    .with(
      [P.union('pro', 'enterprise'), 'spectator'],
      () => `Your account doesn't have permissions to use this feature`
    )
    .with(['pro', 'contributor'], () => `Hello!`)
    .with(['enterprise', 'contributor'], () => `You are our favorite customer!`)
    // 5. complex exhaustive checking
    .exhaustive();

/**
 * Use case 3: Validation an API response
 */

const userPattern = {
  name: P.string,
  // 6. optional properties
  age: P.optional(P.number),
  socialLinks: P.optional({
    twitter: P.string,
    instagram: P.string,
  }),
};

const postPattern = {
  title: P.string,
  content: P.string,
  likeCount: P.number,
  author: userPattern,
  // 7. arrays
  comments: P.array({
    author: userPattern,
    content: P.string,
  }),
};

type Post = P.infer<typeof postPattern>;

const validate = (response: unknown): Post | null => {
  // 8. validating unknown input with isMatching
  if (isMatching(postPattern, response)) {
    //  response: Post
    const cardTitle = `${response.title} by @${response.author.name}`;
    const commenters = response.comments.map((c) => c.author.name).join(', ');
    return response;
  }

  return null;
};
