# TS-Pattern v4 to v5 Migration Guide

This file contains all breaking changes and new features between the version 4 and 5 of TS-Pattern.

# Breaking changes

## `.with` is now evaluated eagerly

In the previous version of TS-Pattern, no code would execute until you called `.exhaustive()` or `.otherwise(...)`. For example, in the following code block, nothing would be logged to the console or thrown:

```ts
// TS-Pattern v4
type Input = { type: 'ok'; value: number } | { type: 'error'; error: Error };

// We don't call `.exhaustive`, so handlers don't run.
function someFunction(input: Input) {
  match(input)
    .with({ type: 'ok' }, ({ value }) => {
      console.log(value);
    })
    .with({ type: 'error' }, ({ error }) => {
      throw error;
    });
}

someFunction({ type: 'ok', value: 42 }); // nothing happens
```

In **TS-Pattern v5**, however, the library will execute the matching handler as soon as it finds it:

```ts
// TS-Pattern v5
someFunction({ type: 'ok', value: 42 }); // logs "42" to the console!
```

Handlers are now evaluated **eagerly** instead of lazily. In practice, this shouldn't change anything as long as you always finish your pattern matching expressions by either `.exhaustive` or `.otherwise`.

## Matching on Map and Sets

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
- The value subpattern we provide in `P.map(keyPattern, subpattern)` should only match the values matching `keyPattern` for the whole `P.map(..)` pattern to match the input.

# New features

## chainable methods

TS-Pattern v5's major addition is the ability to chain methods to narrow down the values matched by primitive patterns, like `P.string` or `P.number`.

Since a few examples is worth a thousand words, here are a few ways you can use chainable methods:

### P.number methods

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

- `P.number.between(min, max)`: matches numbers between `min` and `max`.
- `P.number.lt(max)`: matches numbers smaller than `max`.
- `P.number.gt(min)`: matches numbers greater than `min`.
- `P.number.lte(max)`: matches numbers smaller than or equal to `max`.
- `P.number.gte(min)`: matches numbers greater than or equal to `min`.
- `P.number.int()`: matches integers.
- `P.number.finite()`: matches all numbers except `Infinity` and `-Infinity`
- `P.number.positive()`: matches positive numbers.
- `P.number.negative()`: matches negative numbers.

### P.string methods

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

- `P.string.startsWith(str)`: matches strings that start with `str`.
- `P.string.endsWith(str)`: matches strings that end with `str`.
- `P.string.minLength(min)`: matches strings with at least `min` characters.
- `P.string.maxLength(max)`: matches strings with at most `max` characters.
- `P.string.includes(str)`: matches strings that contain `str`.
- `P.string.regex(RegExp)`: matches strings if they match this regular expression.

### Global methods

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

## Variadic tuple patterns

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

## `.returnType`

In TS-Pattern v4, the only way to explicitly set the return type of your `match` expression is to set the two `<Input, Output>` type parameters of `match`:

```ts
// TS-Pattern v4
match<
  { isAdmin: boolean; plan: 'free' | 'paid' }, // input type
  number // return type
>({ isAdmin, plan })
  .with({ isAdmin: true }, () => 123)
  .with({ plan: 'free' }, () => 'Oops!');
//                              ~~~~~~ ❌ not a number.
```

the main drawback is that you need to set the **_input type_** explicitly **_too_**, even though TypeScript should be able to infer it.

In TS-Pattern v5, you can use the `.returnType<Type>()` method to only set the return type:

```ts
match({ isAdmin, plan })
  .returnType<number>() // 👈 new
  .with({ isAdmin: true }, () => 123)
  .with({ plan: 'free' }, () => 'Oops!');
//                              ~~~~~~ ❌ not a number.
```
