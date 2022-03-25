/**
 * ### One file TS-Pattern demo.
 *
 * This demo will demonstrate:
 * - How to use pattern matching and wildcards
 * - How to extract a value from the input Data Structure using `P.select`
 * - How to match several cases using `P.union`
 * - How to leverage exhaustiveness checking to make sure every case is handled
 * - How to pattern match on several values at once using tuples
 * - How to validate an unknown API responses using `P.array`, `P.optional` and `isMatching`
 */

import { isMatching, match, P } from '../src';

/**************************************************
 * Use case 1: handling discriminated union types *
 **************************************************/

type Response =
  | { type: 'video'; data: { format: 'mp4' | 'webm'; src: string } }
  | { type: 'image'; data: { extension: 'gif' | 'jpg' | 'png'; src: string } }
  | { type: 'text'; data: string; tags: { name: string; id: number }[] };

const exampleFunction1 = (input: Response): string =>
  match(input)
    // 1. Basic pattern with inference with a wildcard
    .with({ type: 'video', data: { format: 'mp4' } }, (video) => video.data.src)
    // 2. using select
    .with(
      { type: 'image', data: { extension: 'gif', src: P.select() } },
      (value) => value + '!!'
    )
    // 3. using P.union
    .with(
      {
        type: 'image',
        data: { extension: P.union('jpg', 'png'), src: P.select() },
      },
      (value) => value + '!!'
    )
    // 4. selecting all tag names with P.array and P.select
    .with(
      { type: 'text', tags: P.array({ name: P.select() }) },
      (tagNames) => tagNames.join(', ') + '!!'
    )
    // 5. basic exhaustiveness checking
    // @ts-expect-error: { type: 'video', data: { format: 'webm' } } isn't covered
    .exhaustive();

/**********************************************
 * Use case 2: multi params conditional logic *
 **********************************************/

type UserType = 'editor' | 'viewer';
// Uncomment 'premium' to see exhaustive checking in action
type OrgPlan = 'basic' | 'pro' /* | 'premium' */ | 'enterprise';

const exampleFunction2 = (org: OrgPlan, user: UserType): string =>
  // 1. Checking several enums with tuples
  match([org, user] as const)
    .with(['basic', P._], () => `Please upgrade to unlock this feature!`)
    // 2. `.with()` can take several patterns. It will match if one of them do.
    .with(
      ['pro', 'viewer'],
      ['enterprise', 'viewer'],
      () => `Your account doesn't have permissions to use this feature`
    )
    .with(['pro', 'editor'], () => `Hello!`)
    .with(['enterprise', 'editor'], () => `You are our favorite customer!`)
    // 3. complex exhaustive checking
    .exhaustive();

/******************************************
 * Use case 3: Validation an API response *
 ******************************************/

const userPattern = {
  name: P.string,
  // 1. optional properties
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
  // 2. arrays
  comments: P.array({
    author: userPattern,
    content: P.string,
  }),
};

type Post = P.infer<typeof postPattern>;

// elsewhere ine the code:
// `fetch(...).then(validateResponse)`

const validateResponse = (response: unknown): Post | null => {
  // 3. validating unknown input with isMatching
  if (isMatching(postPattern, response)) {
    //  response is inferred as  `Post`.

    // Uncomment these lines if you want to try using `response`:
    // const cardTitle = `${response.title} by @${response.author.name}`;
    // const commenters = response.comments.map((c) => c.author.name).join(', ');
    return response;
  }

  return null;
};
