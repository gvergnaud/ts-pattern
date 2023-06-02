# TS-Pattern v4 to v5 Migration Guide

## Breaking changes

### `.with` is now eagerly evaluated

In the previous version of TS-Pattern, no logic would be executed until you called `.exhaustive()` or `.otherwise(...)`. For example, in the following code block, nothing would be logged to the console:

```ts
// TS-Pattern v4
function someFunction(
  input: { type: 'ok'; value: number } | { type: 'error'; error: Error }
) {
  match(input)
    .with({ type: 'ok' }, ({ value }) => {
      console.log(value);
    })
    .with({ type: 'error' }, ({ error }) => {
      throw error;
    });
  // We don't call `.exhaustive` here, so the code won't run
}

someFunction({ type: 'ok', value: 42 }); // nothing happens
```

In **TS-Pattern v5**, however, the library will execute the matching handler as soon as it finds it:

```ts
// TS-Pattern v5
someFunction({ type: 'ok', value: 42 }); // logs "42" to the console!
```

Handlers are now evaluated **eagerly** instead of lazily. In practice, this shouldn't change anything as long as you always finish your pattern matching expressions by either `.exhaustive` or `.otherwise`.

### Matching on Map and Sets

Matching `Set` and `Map` instances using `.with(new Set(...))` and `.with(new Map(...))` is no longer supported. If you want to match specific sets and maps, you should now use the `P.map(keyPattern, valuePattern)` and `P.set(valuePattern)` patterns:

```diff
- import { match } from 'ts-pattern';
+ import { match, P } from 'ts-pattern';


const someFunction = (value: Set<number> | Map<string, number>) =>
  match(value)
-   .with(new Set([P.number]), (set) => `a set of numbers`)
-   .with(new Map([['key', P.number]]), (map) => `map.get('key') is a number`)
+   .with(P.set(P.number), (set) => `a set of numbers`)
+   .with(P.map('key', P.number), (map) => `map.get('key') is a number`)
    .otherwise(() => null);
```

- The subpattern we provide in `P.set(subpattern)` should match all values in the set.
- The value subpattern we provide `P.map(keyPattern, subpattern)` should only match the values matching `keyPattern` for the whole `P.map(..)` pattern to match the input.

## New features

### chainable methods

TS-Pattern v5's major addition is the ability to chain methods to narrow down the values matched by primitive patterns, like `P.string` or `P.number`.

Since a few examples is worth a thousand words, here are a few ways you can use chainable methods:

#### P.number methods

```ts
const example = (position: { x: number; y: number }) =>
  match(position)
    .with({ x: P.number.gte(100) }, (value) => '🎮')
    .with({ x: P.number.between(0, 100) }, (value) => '🎮')
    .with(
      {
        x: P.number.positive().int(),
        y: P.number.positive().int(),
      },
      (value) => '🎮'
    )
    .otherwise(() => 'x or y is negative');
```

Here is the full list of number methods:

- `P.number.between(min, max)`
- `P.number.lt(max)`
- `P.number.gt(min)`
- `P.number.lte(max)`
- `P.number.gte(min)`
- `P.number.int()`
- `P.number.finite()`
- `P.number.positive()`
- `P.number.negative()`

#### P.string methods

```ts
const example = (query: string) =>
  match(query)
    .with(P.string.startsWith('SELECT'), (query) => `selection`)
    .with(P.string.endsWith('FROM user'), (query) => `👯‍♂️`)
    .with(P.string.includes('*'), () => 'contains a star')
    // Methods can be chained:
    .with(P.string.startsWith('SET').includes('*'), (query) => `🤯`)
    .exhaustive();
```

Here is the full list of string methods:

- `P.string.startsWith(str)`
- `P.string.endsWith(str)`
- `P.string.minLength(number)`
- `P.string.maxLength(number)`
- `P.string.includes(str)`
- `P.string.regex(RegExp)`

#### Global methods

Some methods are available for all primitive type patterns:

- `P.{..}.optional()`: matches even if this property isn't present on the input object.
- `P.{..}.select()`: injects the matched value into the handler function.
- `P.{..}.and(pattern)`: matches if the current pattern **and** the provided pattern match.
- `P.{..}.or(pattern)`: matches if either the current pattern **or** the provided pattern match.

```ts
const example = (value: unknown) =>
  match(value)
    .with(
      {
        username: P.string,
        displayName: P.string.optional(),
      },
      () => `{ username:string, displayName?: string }`
    )
    .with(
      {
        title: P.string,
        author: { username: P.string.select() },
      },
      (username) => `author.username is ${username}`
    )
    .with(
      P.instanceOf(Error).and({ source: P.string }),
      () => `Error & { source: string }`
    )
    .with(P.string.or(P.number), () => `string | number`)
    .otherwise(() => null);
```

### Variadic tuple patterns

With TS-Pattern, you are now able to create array (or more accurately tuple) pattern with a variable number of elements:

```ts
const example = (value: unknown) =>
  match(value)
    .with(
      // non-empty list of strings
      [P.string, ...P.array(P.string)],
      (value) => `value: [string, ...string[]]`
    )
    .otherwise(() => null);
```

Array patterns that include a `...P.array` are called **variadic tuple patterns**. You may only have a single `...P.array`, but as many fixed-index patterns as you want:

```ts
const example = (value: unknown) =>
  match(value)
    .with(
      [P.string, P.string, P.string, ...P.array(P.string)],
      (value) => `value: [string, string, string, ...string[]]`
    )
    .with(
      [P.string, P.string, ...P.array(P.string)],
      (value) => `value: [string, string, ...string[]]`
    )
    .with([], (value) => `value: []`)
    .otherwise(() => null);
```

Fixed-index patterns can also be set **after** the `...P.array` variadic, or on both sides!

```ts
const example = (value: unknown) =>
  match(value)
    .with(
      [...P.array(P.number), P.string, P.number],
      (value) => `value: [...number[], string, number]`
    )
    .with(
      [P.boolean, ...P.array(P.string), P.number, P.symbol],
      (value) => `value: [boolean, ...string[], number, symbol]`
    )
    .otherwise(() => null);
```

Lastly, argument of `P.array` is now optional, and will default to `P._`, which matches anything:

```ts
const example = (value: unknown) =>
  match(value)
    //                         👇
    .with([P.string, ...P.array()], (value) => `value: [string, ...unknown[]]`)
    .otherwise(() => null);
```

### `.returnType`
