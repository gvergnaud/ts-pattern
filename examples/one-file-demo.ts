import { isMatching, match, P } from 'ts-pattern';

/**
 * ### One file TS-Pattern demo.
 *
 * This will demonstrate:
 * - How to use pattern matching and wildcards
 * - How to extract a value from the input Data Structure using `P.select`
 * - How to match several cases using `P.union`
 * - How to leverage exhaustiveness checking to make sure every case is handled
 * - How to pattern match on several values at once using tuples
 * - How to validate an unknown API response using `isMatching` and patterns like
 *   `P.array`, `P.optional`, etc.
 */

/**************************************************
 * Use case 1: handling discriminated union types *
 **************************************************/

type Response =
  | { type: 'video'; data: { format: 'mp4' | 'webm'; src: string } }
  | { type: 'image'; data: { extension: 'gif' | 'jpg' | 'png'; src: string } }
  | { type: 'text'; data: string; tags: { name: string; id: number }[] };

const example1 = (input: Response): string =>
  match(input)
    // 1. Basic pattern with inference with a wildcard
    .with({ type: 'video', data: { format: 'mp4' } }, (video) => video.data.src)
    // 2. using select
    .with(
      { type: 'image', data: { extension: 'gif', src: P.select() } },
      (src) => `<img src=${src} alt="This is a gif!" />`
    )
    // 3. using P.union
    .with(
      {
        type: 'image',
        data: { extension: P.union('jpg', 'png'), src: P.select() },
      },
      (src) => `<img src=${src} alt="This is a jpg or a png!" />`
    )
    // 4. selecting all tag names with P.array and P.select
    .with(
      { type: 'text', tags: P.array({ name: P.select() }) },
      (tagNames) => `text with tags: ${tagNames.join(', ')}`
    )
    // 5. basic exhaustiveness checking
    // ⚠️ doesn't type-check!
    // @ts-expect-error: { type: 'video', data: { format: 'webm' } } isn't covered
    .exhaustive();

/**************************************
 * Use case 2: multi params branching *
 **************************************/

type UserType = 'editor' | 'viewer';
// Uncomment 'enterprise' to see exhaustive checking in action
type OrgPlan = 'basic' | 'pro' | 'premium'; // | 'enterprise';

const example2 = (org: OrgPlan, user: UserType) =>
  // 1. Checking several enums with tuples
  match([org, user] as const)
    .with(['basic', P._], () => `Please upgrade to unlock this feature!`)
    // 2. `.with()` can take several patterns. It will match if one of them do.
    .with(
      ['pro', 'viewer'],
      ['premium', 'viewer'],
      () => `Your account doesn't have permissions to use this feature`
    )
    .with(['pro', 'editor'], () => `Hello!`)
    .with(['premium', 'editor'], () => `You are our favorite customer!`)
    // 3. complex exhaustive checking
    .exhaustive();

/**************************************************
 * Use case 3: Matching specific strings or numbers
 **************************************************/

const example3 = (queries: string[]) =>
  match(queries)
    .with(
      [
        P.string.startsWith('SELECT').endsWith('FROM user').select(),
        ...P.array(),
      ],
      (firstQuery) => `${firstQuery}: 👨‍👩‍👧‍👦`
    )
    .with(P.array(), () => 'other queries')
    .exhaustive();

const example4 = (position: { x: number; y: number }) =>
  match(position)
    .with({ x: P.number.gte(100) }, (value) => '⏱️')
    .with({ x: P.number.between(0, 100) }, (value) => '⏱️')
    .with({ x: P.number.positive(), y: P.number.positive() }, (value) => '⏱️')
    .otherwise(() => 'x or y is negative');

/******************************************
 * Use case 4: Validation an API response *
 ******************************************/

const User = {
  name: P.string,
  // 1. optional properties
  age: P.number.optional(),
  socialLinks: P.optional({
    twitter: P.string,
    instagram: P.string,
  }),
};

type User = P.infer<typeof User>;
/*    ^? {
    name: string;
    age?: number | undefined;
    socialLinks?: {
        twitter: string;
        instagram: string;
    } | undefined;
} */

const Post = {
  title: P.string.minLength(2).maxLength(255),
  stars: P.number.int().between(0, 5),
  content: P.string,
  author: User,
  // 2. arrays
  comments: P.array({ author: User, content: P.string }),
  // 3. tuples (a non-empty array in this case)
  tags: [P.string, ...P.array(P.string)],
} as const;

type Post = P.infer<typeof Post>;
/*    ^? {
    author: User;
    content: string;
    title: string;
    stars: number;
    comments: { author: User; content: string }[];
    tags: [string, ...string[]];
} */

// Elsewhere in the code:
// `fetch(...).then(validateResponse)`

const validateResponse = (response: unknown): Post | null => {
  // 3. validating unknown input with isMatching
  if (isMatching(Post, response)) {
    //  response is inferred as  `Post`.

    // Uncomment these lines if you want to try using `response`:
    // const cardTitle = `${response.title} by @${response.author.name}`;
    // const commenters = response.comments.map((c) => c.author.name).join(', ');
    return response;
  }

  return null;
};
