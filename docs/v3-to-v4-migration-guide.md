# TS-Pattern v3 to v4 Migration Guide

## Breaking changes

### Imports

type-specific wildcard patterns have moved from `__.<pattern>` to a new `Pattern` qualified module, also exported as `P` by ts-pattern.

```diff
- import { match, __ } from 'ts-pattern';
+ import { match, Pattern } from 'ts-pattern';


const toString = (value: string | number) =>
  match(value)
-   .with(__.string, (v) => v)
-   .with(__.number, (v) => `${v}`)
+   .with(Pattern.string, (v) => v)
+   .with(Pattern.number, (v) => `${v}`)
    .exhaustive();
```

or

```diff
- import { match, __ } from 'ts-pattern';
+ import { match, P } from 'ts-pattern';


const toString = (value: string | number) =>
  match(value)
-   .with(__.string, (v) => v)
-   .with(__.number, (v) => `${v}`)
+   .with(P.string, (v) => v)
+   .with(P.number, (v) => `${v}`)
    .exhaustive();
```

#### `__`

The top level `__` export was moved to `P._` and `P.any`:

```diff
- import { match, __ } from 'ts-pattern';
+ import { match, P } from 'ts-pattern';


const toString = (value: string | number) =>
  match(value)
-   .with(__, (v) => `${v}`)
+   .with(P._, (v) => `${v}`)
    // OR
+   .with(P.any, (v) => `${v}`)
    .exhaustive();
```

#### `select()`, `not()`, `when()`

Function to create patterns have been moved to the `P` module.

```diff
- import { match, select, not, when } from 'ts-pattern';
+ import { match, P } from 'ts-pattern';


const toString = (value: number) =>
  match(value)
-   .with({ prop: select() }, (v) => `${v}`)
+   .with({ prop: P.select() }, (v) => `${v}`)

-   .with({ prop: not(10) }, (v) => `${v}`)
+   .with({ prop: P.not(10) }, (v) => `${v}`)

-   .with({ prop: when((x) => x < 5) }, (v) => `${v}`)
+   .with({ prop: P.when((x) => x < 5) }, (v) => `${v}`)
    .exhaustive();
```

#### `Pattern` type

the `Pattern` type which used to be exported at the toplevel is now accessible at `P.Pattern`.

```diff
- import { match, Pattern } from 'ts-pattern';
+ import { match, P } from 'ts-pattern';

- const pattern: Pattern<number> = P.when(x => x > 2);
+ const pattern: P.Pattern<number> = P.when(x => x > 2);
```

### list patterns

The syntax for matching on a list of elements with an unknown length has changed from `[subpattern]` to `P.array(subpattern)`.

Example:

```diff
- import { match, __ } from 'ts-pattern';
+ import { match, P } from 'ts-pattern';


const parseUsers = (response: unknown) =>
  match(response)
-   .with({ data: [{ name: __.string }] }, (users) => users)
+   .with({ data: P.array({ name: P.string }) }, (users) => users)
    .otherwise(() => []);
```

Now `[subpattern]` matches arrays with 1 element in them. This is more consistent with native language features, like destructuring assignement and is overall more intuitive. This will resolve [#69](https://github.com/gvergnaud/ts-pattern/issues/69), [#62](https://github.com/gvergnaud/ts-pattern/issues/62) and [#46](https://github.com/gvergnaud/ts-pattern/issues/46).

### NaN

The `__.NaN` pattern has been replaced by simply using the NaN value in the pattern:

```diff
match<number>(NaN)
-   .with(__.NaN, () => "this is not a number")
+   .with(NaN, () => "this is not a number")
    .otherwise((n) => n);
```

## New features

Here is the list of all new features which have been added in TS-Pattern v4.

### Arrays and unary tuples

#### `P.array(pattern)`

To match an array of elements, you can now use `P.array`:

```ts
import { match, P } from 'ts-pattern';

const responsePattern = {
  data: P.array({
    id: P.string,
    post: P.array({
      title: P.string,
      content: P.string,
    }),
  }),
};

fetchSomething().then((value: unknown) =>
  match(value)
    .with(responsePattern, (value) => {
      // value: { data: { id: string, post: { title: string, content: string }[] }[] }
      return value;
    })
    .otherwise(() => {
      throw new Error('unexpected response');
    })
);
```

### Optional object properties

#### `P.optional(pattern)`

If you want one of the keys of your pattern to be optional, you can now use `P.optional(subpattern)`.

If you `P.select()` something in an optional pattern, it's type will be infered as `T | undefined`.

```ts
import { match, P } from 'ts-pattern';

const doSomethingWithUser = (user: User | Org) =>
  match(user)
    .with(
      {
        type: 'user',
        detail: {
          bio: P.optional(P.string),
          socialLinks: P.optional({
            twitter: P.select(),
          }),
        },
      },
      (twitterLink, value) => {
        // twitterLink: string | undefined
        /**
         *  value.detail: {
         *      bio?: string,
         *      socialLinks?: {
         *          twitter: string
         *      }
         *  }
         **/
      }
    )
    .otherwise(() => {
      throw new Error('unexpected response');
    });
```

### Union & intersection patterns

`P.union(...patterns)` and `P.intersection(...patterns)` combine several patterns into a single one, either by checking that one of them match the input (`p.union`) or all of them match it (`P.intersection`).

#### `P.union(...patterns)`

```ts
type Input =
  | { type: 'a'; value: string }
  | { type: 'b'; value: number }
  | {
      type: 'c';
      value:
        | { type: 'd'; value: boolean }
        | { type: 'e'; value: string[] }
        | { type: 'f'; value: number[] };
    };

const f = (input: Input) =>
  match(input)
    .with(
      { type: P.union('a', 'b') },
      // x: { type: 'a'; value: string } | { type: 'b'; value: number }
      (x) => 'branch 1'
    )
    .with(
      // P.union can take any subpattern:
      {
        type: 'c',
        value: { value: P.union(P.boolean, P.array(P.string)) },
      },
      (x) => 'branch 2' // x.value.value: boolean | string[]
    )
    .with({ type: 'c', value: { type: 'f' } }, () => 'branch 3')
    .exhaustive();
```

#### `P.intersection(...patterns)`

```ts
class A {
  constructor(public foo: 'bar' | 'baz') {}
}

class B {
  constructor(public str: string) {}
}

const f = (input: { prop: A | B }) =>
  match(input)
    .with(
      { prop: P.intersection(P.instanceOf(A), { foo: 'bar' }) },
      // prop: A & { foo: 'bar' }
      ({ prop }) => 'branch 1'
    )
    .with(
      { prop: P.intersection(P.instanceOf(A), { foo: 'baz' }) },
      // prop: A & { foo: 'baz' }
      ({ prop }) => 'branch 2'
    )
    .with(
      { prop: P.instanceOf(B) },
      // prop: B
      ({ prop }) => 'branch 3'
    )
    .exhaustive();
```

### Select with sub pattern

`P.select()` now can take a subpattern and match only what the subpattern matches:

```ts
type Img = { type: 'img'; src: string };
type Text = { type: 'text'; content: string; length: number };
type User = { type: 'user'; username: string };
type Org = { type: 'org'; orgId: number };

const post = (input: { author: User | Org; content: Text | Img }) =>
  match(input)
    .with(
      { author: P.select({ type: 'user' }) },
      // user: User
      (user) => {}
    )
    .with(
      {
        // This also works with named selections
        author: P.select('org', { type: 'org' }),
        content: P.select('text', { type: 'text' }),
      },
      // org: Org, text: Text
      ({ org, text }) => {}
    )
    .otherwise(() => {
      // ...
    });
```

### Infer the matching types from a pattern

#### `P.infer<typeof pattern>`

TS-Pattern is pretty handy for parsing unknown payloads like HTTP responses. You can write a pattern for the shape you are expecting, and then use `isMatching(pattern, response)` to make sure the response has the correct shape.

One limitation TS-Pattern had in its previous version was that it did not provide a way to get the TypeScript type of the value a given pattern matches. This is what `P.infer<typeof pattern>` does :)

```ts
const postPattern = {
  title: P.string,
  description: P.optional(P.string),
  content: P.string,
  likeCount: P.number,
};

type Post = P.infer<typeof postPattern>;
// Post: { title: string, description?: string, content: string, likeCount: number }

const userPattern = {
  name: P.string,
  postCount: P.number,
  bio: P.optional(P.string),
  posts: P.optional(P.array(postPattern)),
};

type User = P.infer<typeof userPattern>;
// User: { name: string, postCount: number, bio?: string, posts?: Post[]  }

const isUserList = isMatching(P.array(userPattern));

const res = await fetchUsers();

if (isUserList(res)) {
  // res: User
}
```

### New type specific wildcards

#### `P.symbol`

`P.symbol` is a wildcard pattern matching any **symbol**.

```ts
match(Symbol('Hello'))
  .with(P.symbol, () => 'this is a symbol!')
  .exhaustive();
```

#### `P.bigint`

`P.bigint` is a wildcard pattern matching any **bigint**.

```ts
match(200n)
  .with(P.bigint, () => 'this is a bigint!')
  .exhaustive();
```
