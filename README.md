<h1 align="center">TS-Pattern</h1>

<p align="center">
The exhaustive Pattern Matching library for <a href="https://github.com/microsoft/TypeScript">TypeScript</a>
with smart type inference.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ts-pattern">
    <img src="https://img.shields.io/npm/dm/ts-pattern.svg" alt="downloads" height="18">
  </a>
  <a href="https://www.npmjs.com/package/ts-pattern">
    <img src="https://img.shields.io/npm/v/ts-pattern.svg" alt="npm version" height="18">
  </a>
  <a href="https://github.com/gvergnaud/ts-pattern">
    <img src="https://img.shields.io/npm/l/ts-pattern.svg" alt="MIT license" height="18">
  </a>
</p>



```ts
import { match, P } from 'ts-pattern';

type Data =
  | { type: 'text'; content: string }
  | { type: 'img'; src: string };

type Result =
  | { type: 'ok'; data: Data }
  | { type: 'error'; error: Error };

const result: Result = ...;

const html = match(result)
  .with({ type: 'error' }, () => `<p>Oups! An error occured</p>`)
  .with({ type: 'ok', data: { type: 'text' } }, (res) => `<p>${res.data.content}</p>`)
  .with({ type: 'ok', data: { type: 'img', src: P.select() } }, (src) => `<img src=${src} />`)
  .exhaustive();
```

## About

Write **better** and **safer conditions**. Pattern matching lets you express complex conditions in a single, compact expression. Your code becomes **shorter** and **more readable**. Exhaustiveness checking ensures you haven’t forgotten **any possible case**.

![ts-pattern](https://user-images.githubusercontent.com/9265418/231688650-7cd957a9-8edc-4db8-a5fe-61e1c2179d91.gif)
<p align="center"><i>Animation by <a target="_blank" href="https://twitter.com/nicoespeon/status/1644342570389061634?s=20">@nicoespeon</a></i></p>

## Features

- Pattern-match on **any data structure**: nested [Objects](#objects), [Arrays](#tuples-arrays), [Tuples](#tuples-arrays), [Sets](#sets), [Maps](#maps) and all primitive types.
- **Typesafe**, with helpful [type inference](#type-inference).
- **Exhaustiveness checking** support, enforcing that you are matching every possible case with [`.exhaustive()`](#exhaustive).
- Use [patterns](#patterns) to **validate** the shape of your data with [`isMatching`](#ismatching).
- **Expressive API**, with catch-all and type specific **wildcards**: [`P._`](#P_-wildcard), [`P.string`](#Pstring-wildcard), [`P.number`](#Pnumber-wildcard), etc.
- Supports [**predicates**](#Pwhen-patterns), [**unions**](#Punion-patterns), [**intersections**](#Pintersection-patterns) and [**exclusion**](#Pnot-patterns) patterns for non-trivial cases.
- Supports properties selection, via the [`P.select(name?)`](#Pselect-patterns) function.
- Tiny bundle footprint ([**only 1.7kB**](https://bundlephobia.com/package/ts-pattern)).

## What is Pattern Matching?

[Pattern Matching](https://stackoverflow.com/questions/2502354/what-is-pattern-matching-in-functional-languages) is a code-branching technique coming from functional programming languages, which lets you scrutinize the structure of values in a declarative way. It has proven itself to be less verbose and more powerful than imperative alternatives (if/else/switch statements), especially when branching on complex data structures or on several values.

Pattern Matching is implemented in Haskell, Rust, Swift, Elixir and many other languages. There is [a tc39 proposal](https://github.com/tc39/proposal-pattern-matching) to add Pattern Matching to the EcmaScript specification, but it is still in stage 1 and isn't likely to land before several years. Luckily, pattern matching can be implemented in userland. `ts-pattern` Provides a typesafe pattern matching implementation that you can start using today.

Read the introduction blog post: [Bringing Pattern Matching to TypeScript 🎨 Introducing TS-Pattern](https://dev.to/gvergnaud/bringing-pattern-matching-to-typescript-introducing-ts-pattern-v3-0-o1k)

## Installation

Via npm

```
npm install ts-pattern
```

Via yarn

```
yarn add ts-pattern
```

### Compatibility with different TypeScript versions

Note: TS-Pattern assumes [Strict Mode](https://www.typescriptlang.org/tsconfig#strict) is enabled in your `tsconfig.json` file.

| ts-pattern                                                                                                                              | TypeScript v4.5+ | TypeScript v4.2+ | TypeScript v4.1+ |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------- | ---------------- |
| v4.x [(Docs)](#documentation) [(Migration Guide)](https://github.com/gvergnaud/ts-pattern/tree/master/docs/v3-to-v4-migration-guide.md) | ✅               | ❌               | ❌               |
| v3.x [(Docs)](https://github.com/gvergnaud/ts-pattern/tree/v3#documentation)                                                            | ✅               | ✅               | ⚠️               |
| v2.x [(Docs)](https://github.com/gvergnaud/ts-pattern/tree/v2#documentation)                                                            | ✅               | ✅               | ✅               |

- ✅ Full support
- ⚠️ Partial support, All features except passing multiple patterns to `.with()`.
- ❌ Not supported

# Documentation

- [Code Sandbox Examples](#code-sandbox-examples)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
  - [`match`](#match)
  - [`.with`](#with)
  - [`.when`](#when)
  - [`.exhaustive`](#exhaustive)
  - [`.otherwise`](#otherwise)
  - [`.run`](#run)
  - [`isMatching`](#ismatching)
  - [Patterns](#patterns)
    - [Literals](#literals)
    - [Wildcards](#wildcards)
    - [Objects](#objects)
    - [Tuples (arrays)](#tuples-arrays)
    - [Sets](#sets)
    - [Maps](#maps)
    - [`P.array` patterns](#Parray-patterns)
    - [`P.when` patterns](#Pwhen-patterns)
    - [`P.not` patterns](#Pnot-patterns)
    - [`P.select` patterns](#Pselect-patterns)
    - [`P.optional` patterns](#Poptional-patterns)
    - [`P.instanceOf` patterns](#Pinstanceof-patterns)
    - [`P.union` patterns](#Punion-patterns)
    - [`P.intersection` patterns](#Pintersection-patterns)
  - [Types](#types)
    - [`P.infer`](#Pinfer)
    - [`P.Pattern`](#PPattern)
    - [Type inference](#type-inference)
- [Inspirations](#inspirations)

## Code Sandbox Examples

- [Basic Demo](https://codesandbox.io/s/ts-pattern-examples-v4-bdy5p2?file=/src/examples/basic.tsx)
- [React gif fetcher app Demo](https://codesandbox.io/s/ts-pattern-gif-search-demo-v4-bkumdw?file=/src/App.tsx)
- [React.useReducer Demo](https://codesandbox.io/s/ts-pattern-reducer-example-v4-fx2yqu?file=/src/App.tsx)
- [Handling untyped API response Demo](https://codesandbox.io/s/ts-pattern-examples-v4-bdy5p2?file=/src/examples/api.tsx)
- [`P.when` Guard Demo](https://codesandbox.io/s/ts-pattern-examples-v4-bdy5p2?file=/src/examples/when.tsx)
- [`P.not` Pattern Demo](https://codesandbox.io/s/ts-pattern-examples-v4-bdy5p2?file=/src/examples/not.tsx)
- [`P.select` Pattern Demo](https://codesandbox.io/s/ts-pattern-examples-v4-bdy5p2?file=/src/examples/select.tsx)
- [`P.union` Pattern Demo](https://codesandbox.io/s/ts-pattern-examples-v4-bdy5p2?file=/src/examples/union.tsx)

## Getting Started

As an example, we are going to create a state reducer for a
frontend application fetching some data using an HTTP request.

### Example: a state reducer with ts-pattern

Our application can be in four different states: `idle`, `loading`,
`success` and `error`. Depending on which state we are in, some events
can occur. Here are all the possible types of event our application
can respond to: `fetch`, `success`, `error` and `cancel`.

I use the word `event` but you can replace it with `action` if you are used
to Redux's terminology.

```ts
type State =
  | { status: 'idle' }
  | { status: 'loading'; startTime: number }
  | { status: 'success'; data: string }
  | { status: 'error'; error: Error };

type Event =
  | { type: 'fetch' }
  | { type: 'success'; data: string }
  | { type: 'error'; error: Error }
  | { type: 'cancel' };
```

Even though our application can handle 4 events, **only a subset** of these
events **make sense for each given state**. For instance we can only `cancel`
a request if we are currently in the `loading` state.
To avoid unwanted state changes that could lead to bugs, we want to create
a reducer function that **matches on both the state and the event**
and return a new state.

This is a case where `match` really shines. Instead of writing nested
switch statements, we can do that in a very expressive way:

<!-- prettier-ignore -->
```ts
import { match, P } from 'ts-pattern';

const reducer = (state: State, event: Event): State =>
  match<[State, Event], State>([state, event])
    .with(
      [{ status: 'loading' }, { type: 'success' }],
      ([, event]) => ({
        status: 'success',
        data: event.data,
      })
    )
    .with(
      [{ status: 'loading' }, { type: 'error', error: P.select() }],
      (error) => ({
        status: 'error',
        error,
      })
    )
    .with(
      [{ status: P.not('loading') }, { type: 'fetch' }],
      () => ({
        status: 'loading',
        startTime: Date.now(),
      })
    )
    .with(
      [
        {
          status: 'loading',
          startTime: P.when((t) => t + 2000 < Date.now()),
        },
        { type: 'cancel' },
      ],
      () => ({
        status: 'idle',
      })
    )
    .with(P._, () => state)
    .exhaustive();
```

**Let's go through this bit by bit:**

### match(value)

`match` takes a value and returns a [_builder_](https://en.wikipedia.org/wiki/Builder_pattern) on which you can add your pattern matching cases.

```ts
match<[State, Event], State>([state, event]);
```

Here we wrap the state and the event objects in an array and we explicitly
specify the type `[State, Event]` to make sure it is interpreted as
a [Tuple](#tuples-arrays) by TypeScript, so we
can match on each value separately.

Most of the time, you don't need to specify the type of input
and output with `match<Input, Output>(...)` because `match` is able to
infer both of these types.

### .with(pattern, handler)

Then we add a first `with` clause:

```ts
  .with(
    [{ status: 'loading' }, { type: 'success' }],
    ([state, event]) => ({
      // `state` is inferred as { status: 'loading' }
      // `event` is inferred as { type: 'success', data: string }
      status: 'success',
      data: event.data,
    })
  )
```

The first argument is the **pattern**: the **shape of value**
you expect for this branch.

The second argument is the **handler function**: the code **branch** that will be called if
the input value matches the pattern.

The handler function takes the input value as first parameter with its type **narrowed down** to what the pattern matches.

### P.select(name?)

In the second `with` clause, we use the `P.select` function:

```ts
  .with(
    [
      { status: 'loading' },
      { type: 'error', error: P.select() }
    ],
    (error) => ({
      status: 'error',
      error,
    })
  )
```

`P.select()` lets you **extract** a piece of your input value and **inject** it into your handler. It is pretty useful when pattern matching on deep data structures because it avoids the hassle of destructuring your input in your handler.

Since we didn't pass any name to `P.select()`, It will inject the `event.error` property as first argument to the handler function. Note that you can still access **the full input value** with its type narrowed by your pattern as **second argument** of the handler function:

```ts
  .with(
    [
      { status: 'loading' },
      { type: 'error', error: P.select() }
    ],
    (error, stateAndEvent) => {
      // error: Error
      // stateAndEvent: [{ status: 'loading' }, { type: 'error', error: Error }]
    }
  )
```

In a pattern, we can only have a **single** anonymous selection. If you need to select more properties on your input data structure, you will need to give them **names**:

```ts
.with(
    [
      { status: 'success', data: P.select('prevData') },
      { type: 'error', error: P.select('err') }
    ],
    ({ prevData, err }) => {
      // Do something with (prevData: string) and (err: Error).
    }
  )
```

Each named selection will be injected inside a `selections` object, passed as first argument to the handler function. Names can be any strings.

### P.not(pattern)

If you need to match on everything **but** a specific value, you can use a `P.not(<pattern>)` pattern. it's a function taking a pattern and returning its opposite:

```ts
  .with(
    [{ status: P.not('loading') }, { type: 'fetch' }],
    () => ({
      status: 'loading',
    })
  )
```

### `P.when()` and guard functions

Sometimes, we need to make sure our input value respects a condition that can't be expressed by a pattern. For example, imagine you need to check if a number is positive. In these cases, we can use **guard functions**: functions taking a value and returning a `boolean`.

With `ts-pattern` there are two options to use a guard function:

- use `P.when(<guard function>)` inside your pattern
- pass it as second parameter to `.with(...)`

#### using P.when(predicate)

```ts
  .with(
    [
      {
        status: 'loading',
        startTime: P.when((t) => t + 2000 < Date.now()),
      },
      { type: 'cancel' },
    ],
    () => ({
      status: 'idle',
    })
  )
```

#### Passing a guard function to `.with(...)`

`.with` optionally accepts a guard function as second parameter, between
the `pattern` and the `handler` callback:

```ts
  .with(
    [{ status: 'loading' }, { type: 'cancel' }],
    ([state, event]) => state.startTime + 2000 < Date.now(),
    () => ({
      status: 'idle'
    })
  )
```

This pattern will only match if the guard function returns `true`.

### the `P._` wildcard

`P._` will match any value. You can use it either at the top level, or within another pattern.

```ts
  .with(P._, () => state)

  // You could also use it inside another pattern:
  .with([P._, P._], () => state)

  // at any level:
  .with([P._, { type: P._ }], () => state)

```

### .exhaustive(), .otherwise() and .run()

```ts
  .exhaustive();
```

`.exhaustive()` **executes** the pattern matching expression, and **returns the result**. It also enables **exhaustiveness checking**, making sure we don't forget any possible case in our input value. This extra type safety is very nice because forgetting a case is an easy mistake to make, especially in an evolving code-base.

Note that exhaustive pattern matching is **optional**. It comes with the trade-off of having **longer compilation times** because the type checker has more work to do.

Alternatively you can use `.otherwise()`, which takes an handler function returning a default value. `.otherwise(handler)` is equivalent to `.with(P._, handler).exhaustive()`.

```ts
  .otherwise(() => state);
```

If you don't want to use `.exhaustive()` and also don't want to provide a default value with `.otherwise()`, you can use `.run()` instead:

```ts
  .run();
```

It's just like `.exhaustive()`, but it's **unsafe** and might throw runtime error if no branch matches your input value.

### Matching several patterns

As you may know, `switch` statements allow handling several cases with
the same code block:

```ts
switch (type) {
  case 'text':
  case 'span':
  case 'p':
    return 'text';

  case 'btn':
  case 'button':
    return 'button';
}
```

Similarly, ts-pattern lets you pass several patterns to `.with()` and if
one of these patterns matches your input, the handler function will be called:

```ts
const sanitize = (name: string) =>
  match(name)
    .with('text', 'span', 'p', () => 'text')
    .with('btn', 'button', () => 'button')
    .otherwise(() => name);

sanitize('span'); // 'text'
sanitize('p'); // 'text'
sanitize('button'); // 'button'
```

As you might expect, this also works with more complex patterns than strings and exhaustiveness checking works as well.

## API Reference

### `match`

```ts
match(value);
```

Create a `Match` object on which you can later call `.with`, `.when`, `.otherwise` and `.run`.

#### Signature

```ts
function match<TInput, TOutput>(input: TInput): Match<TInput, TOutput>;
```

#### Arguments

- `input`
  - **Required**
  - the input value your patterns will be tested against.

### `.with`

```ts
match(...)
  .with(pattern, [...patterns], handler)
```

#### Signature

```ts
function with(
  pattern: Pattern<TInput>,
  handler: (selections: Selections<TInput>, value: TInput) => TOutput
): Match<TInput, TOutput>;

// Overload for multiple patterns
function with(
  pattern1: Pattern<TInput>,
  ...patterns: Pattern<TInput>[],
  // no selection object is provided when using multiple patterns
  handler: (value: TInput) => TOutput
): Match<TInput, TOutput>;

// Overload for guard functions
function with(
  pattern: Pattern<TInput>,
  when: (value: TInput) => unknown,
  handler: (
    selection: Selection<TInput>,
    value: TInput
  ) => TOutput
): Match<TInput, TOutput>;
```

#### Arguments

- `pattern: Pattern<TInput>`
  - **Required**
  - The pattern your input must match for the handler to be called.
  - [See all valid patterns below](#patterns)
  - If you provide several patterns before providing the `handler`, the `with` clause will match if one of the patterns matches.
- `when: (value: TInput) => unknown`
  - Optional
  - Additional condition the input must satisfy for the handler to be called.
  - The input will match if your guard function returns a truthy value.
  - `TInput` might be narrowed to a more precise type using the `pattern`.
- `handler: (value: TInput, selections: Selections<TInput>) => TOutput`
  - **Required**
  - Function called when the match conditions are satisfied.
  - All handlers on a single `match` case must return values of the same type, `TOutput`.
  - `TInput` might be narrowed to a more precise type using the `pattern`.
  - `selections` is an object of properties selected from the input with the [`select` function](#select-patterns).

### `.when`

```ts
match(...)
  .when(predicate, handler)
```

#### Signature

```ts
function when(
  predicate: (value: TInput) => unknown,
  handler: (value: TInput) => TOutput
): Match<TInput, TOutput>;
```

#### Arguments

- `predicate: (value: TInput) => unknown`
  - **Required**
  - Condition the input must satisfy for the handler to be called.
- `handler: (value: TInput) => TOutput`
  - **Required**
  - Function called when the predicate condition is satisfied.
  - All handlers on a single `match` case must return values of the same type, `TOutput`.

### `.exhaustive`

```ts
match(...)
  .with(...)
  .exhaustive()
```

Runs the pattern-matching expression and returns its result. It also enables exhaustiveness checking, making sure at compile time that we have handled all possible cases.

#### Signature

```ts
function exhaustive(): IOutput;
```

#### Example

```ts
type Permission = 'editor' | 'viewer';
type Plan = 'basic' | 'pro';

const fn = (org: Plan, user: Permission) =>
  match([org, user] as const)
    .with(['basic', 'viewer'], () => {})
    .with(['basic', 'editor'], () => {})
    .with(['pro', 'viewer'], () => {})
    // Fails with `NonExhaustiveError<['pro', 'editor']>`
    // because the `['pro', 'editor']` case isn't handled.
    .exhaustive();

const fn2 = (org: Plan, user: Permission) =>
  match([org, user] as const)
    .with(['basic', 'viewer'], () => {})
    .with(['basic', 'editor'], () => {})
    .with(['pro', 'viewer'], () => {})
    .with(['pro', 'editor'], () => {})
    .exhaustive(); // Works!
```

### `.otherwise`

```ts
match(...)
  .with(...)
  .otherwise(defaultHandler)
```

Runs the pattern-matching expression with a default handler which will be called if no previous `.with()` clause match the input value, and returns the result.

#### Signature

```ts
function otherwise(defaultHandler: (value: TInput) => TOutput): TOutput;
```

#### Arguments

- `defaultHandler: (value: TInput) => TOutput`
  - **Required**
  - Function called if no pattern matched the input value.
  - Think of it as the `default:` case of `switch` statements.
  - All handlers on a single `match` case must return values of the same type, `TOutput`.

### `.run`

```ts
match(...)
  .with(...)
  .run()
```

Runs the pattern-matching expression and returns its result. It throws an error at run time if no match was found, same as `exhaustive()`. However, unlike `.exhaustive()`, exhaustiveness is not checked at compile time, meaning the type checker will not verify that all possible cases are covered.

#### Signature

```ts
function run(): TOutput;
```

### `isMatching`

```ts
if (isMatching(pattern, value))  {
  ...
}
```

`isMatching` is a type guard function which checks if a pattern matches a given value. It is _curried_, which means it can be used in two ways.

With a single argument:

```ts
import { isMatching, P } from 'ts-pattern';

const isBlogPost = isMatching({
  title: P.string,
  description: P.string,
});

if (isBlogPost(value)) {
  // value: { title: string, description: string }
}
```

With two arguments:

```ts
const blogPostPattern = {
  title: P.string,
  description: P.string,
};

if (isMatching(blogPostPattern, value)) {
  // value: { title: string, description: string }
}
```

#### Signature

```ts
export function isMatching<p extends Pattern<any>>(
  pattern: p
): (value: any) => value is InvertPattern<p>;
export function isMatching<p extends Pattern<any>>(
  pattern: p,
  value: any
): value is InvertPattern<p>;
```

#### Arguments

- `pattern: Pattern<any>`
  - **Required**
  - The pattern a value should match.
- `value?: any`
  - **Optional**
  - if a value is given as second argument, `isMatching` will return a boolean telling us whether the pattern matches the value or not.
  - if we only give the pattern to the function, `isMatching` will return another **type guard function** taking a value and returning a boolean which tells us whether the pattern matches the value or not.

## Patterns

A pattern is a description of the expected shape of your input value.

Patterns can be regular JavaScript values (`"some string"`, `10`, `true`, ...), data structures ([objects](#objects), [arrays](#tuples-arrays), ...), wildcards ([`P._`](#P_-wildcard), [`P.string`](#pstring-wildcard), [`P.number`](#pnumber-wildcard), ...), or special matcher functions ([`P.not`](#pnot-patterns),
[`P.when`](#pwhen-patterns), [`P.select`](#pselect-patterns), ...).

All wildcards and matcher functions can be imported either as `Pattern` or as `P` from the `ts-pattern` module.

```ts
import { match, Pattern } from 'ts-pattern';

const toString = (value: unknown): string =>
  match(value)
    .with(Pattern.string, (str) => str)
    .with(Pattern.number, (num) => num.toFixed())
    .with(Pattern.boolean, (bool) => `${bool}`)
    .otherwise(() => 'Unknown');
```

Or

```ts
import { match, P } from 'ts-pattern';

const toString = (value: unknown): string =>
  match(value)
    .with(P.string, (str) => str)
    .with(P.number, (num) => num.toFixed())
    .with(P.boolean, (bool) => `${bool}`)
    .otherwise(() => 'Unknown');
```

If your input isn't typed, (if it's a `any` or a `unknown`), you are free to use any possible pattern. Your handler will infer the input type from the shape of your pattern.

### Literals

Literals are primitive JavaScript values, like `numbers`, `strings`, `booleans`, `bigints`, `symbols`, `null`, `undefined`, or `NaN`.

```ts
import { match } from 'ts-pattern';

const input: unknown = 2;

const output = match(input)
  .with(2, () => 'number: two')
  .with(true, () => 'boolean: true')
  .with('hello', () => 'string: hello')
  .with(undefined, () => 'undefined')
  .with(null, () => 'null')
  .with(NaN, () => 'number: NaN')
  .with(20n, () => 'bigint: 20n')
  .otherwise(() => 'something else');

console.log(output);
// => 'number: two'
```

### Wildcards

#### `P._` wildcard

The `P._` pattern will match any value. You can also use `P.any`, which is an alias to `P._`.

```ts
import { match, P } from 'ts-pattern';

const input = 'hello';

const output = match(input)
  .with(P._, () => 'It will always match')
  // OR
  .with(P.any, () => 'It will always match')
  .otherwise(() => 'This string will never be used');

console.log(output);
// => 'It will always match'
```

#### `P.string` wildcard

The `P.string` pattern will match any value of type `string`.

```ts
import { match, P } from 'ts-pattern';

const input = 'hello';

const output = match(input)
  .with('bonjour', () => 'Won‘t match')
  .with(P.string, () => 'it is a string!')
  .exhaustive();

console.log(output);
// => 'it is a string!'
```

#### `P.number` wildcard

The `P.number` pattern will match any value of type `number`.

```ts
import { match, P } from 'ts-pattern';

const input = 2;

const output = match<number | string>(input)
  .with(P.string, () => 'it is a string!')
  .with(P.number, () => 'it is a number!')
  .exhaustive();

console.log(output);
// => 'it is a number!'
```

#### `P.boolean` wildcard

The `P.boolean` pattern will match any value of type `boolean`.

```ts
import { match, P } from 'ts-pattern';

const input = true;

const output = match<number | string | boolean>(input)
  .with(P.string, () => 'it is a string!')
  .with(P.number, () => 'it is a number!')
  .with(P.boolean, () => 'it is a boolean!')
  .exhaustive();

console.log(output);
// => 'it is a boolean!'
```

#### `P.nullish` wildcard

The `P.nullish` pattern will match any value of type `null` or `undefined`.

Even though `null` and `undefined` can be used as literal patterns, sometimes they appear in a union together
(e.g. `null | undefined | string`) and you may want to treat them as equivalent using `P.nullish`.

```ts
import { match, P } from 'ts-pattern';

const input = null;

const output = match<number | null | undefined>(input)
  .with(P.number, () => 'it is a number!')
  .with(P.nullish, () => 'it is either null or undefined!')
  .with(null, () => 'it is null!')
  .with(undefined, () => 'it is undefined!')
  .exhaustive();

console.log(output);
// => 'it is either null or undefined!'
```

#### `P.bigint` wildcard

The `P.bigint` pattern will match any value of type `bigint`.

```ts
import { match, P } from 'ts-pattern';

const input = 20000000n;

const output = match<bigint | null>(input)
  .with(P.bigint, () => 'it is a bigint!')
  .otherwise(() => '?');

console.log(output);
// => 'it is a bigint!'
```

#### `P.symbol` wildcard

The `P.symbol` pattern will match any value of type `symbol`.

```ts
import { match, P } from 'ts-pattern';

const input = Symbol('some symbol');

const output = match<symbol | null>(input)
  .with(P.symbol, () => 'it is a symbol!')
  .otherwise(() => '?');

console.log(output);
// => 'it is a symbol!'
```

### Objects

Patterns can be objects containing sub-patterns. An object pattern will match
If and only if the input value **is an object**, contains **all properties** the pattern defines
and each property **matches** the corresponding sub-pattern.

```ts
import { match } from 'ts-pattern';

type Input =
  | { type: 'user'; name: string }
  | { type: 'image'; src: string }
  | { type: 'video'; seconds: number };

let input: Input = { type: 'user', name: 'Gabriel' };

const output = match(input)
  .with({ type: 'image' }, () => 'image')
  .with({ type: 'video', seconds: 10 }, () => 'video of 10 seconds.')
  .with({ type: 'user' }, ({ name }) => `user of name: ${name}`)
  .otherwise(() => 'something else');

console.log(output);
// => 'user of name: Gabriel'
```

### Tuples (arrays)

In TypeScript, [Tuples](https://en.wikipedia.org/wiki/Tuple) are arrays with a fixed
number of elements which can be of different types. You can pattern-match on tuples
using a tuple pattern. A tuple pattern will match if the input value **is an array of the same length**,
and each item match the corresponding sub-pattern.

```ts
import { match, P } from 'ts-pattern';

type Input =
  | [number, '+', number]
  | [number, '-', number]
  | [number, '*', number]
  | ['-', number];

const input: Input = [3, '*', 4];

const output = match(input)
  .with([P._, '+', P._], ([x, , y]) => x + y)
  .with([P._, '-', P._], ([x, , y]) => x - y)
  .with([P._, '*', P._], ([x, , y]) => x * y)
  .with(['-', P._], ([, x]) => -x)
  .otherwise(() => NaN);

console.log(output);
// => 12
```

### `P.array` patterns

To match on arrays of unknown size, you can use `P.array(subpattern)`.
It takes a sub-pattern, and will match if **all elements** in the input
array match this sub-pattern.

```ts
import { match, P } from 'ts-pattern';

type Input = { title: string; content: string }[];

let input: Input = [
  { title: 'Hello world!', content: 'This is a very interesting content' },
  { title: 'Bonjour!', content: 'This is a very interesting content too' },
];

const output = match(input)
  .with(
    P.array({ title: P.string, content: P.string }),
    (posts) => 'a list of posts!'
  )
  .otherwise(() => 'something else');

console.log(output);
// => 'a list of posts!'
```

### Sets

Patterns can be Sets.

```ts
import { match, P } from 'ts-pattern';

type Input = Set<string | number>;

const input: Input = new Set([1, 2, 3]);

const output = match(input)
  .with(new Set([1, 'hello']), (set) => `Set contains 1 and 'hello'`)
  .with(new Set([1, 2]), (set) => `Set contains 1 and 2`)
  .with(new Set([P.string]), (set) => `Set contains only strings`)
  .with(new Set([P.number]), (set) => `Set contains only numbers`)
  .otherwise(() => '');

console.log(output);
// => 'Set contains 1 and 2'
```

If a Set pattern contains one single wildcard pattern, it will match if
each value in the input set match the wildcard.

If a Set pattern contains several values, it will match if the
input Set contains each of these values.

### Maps

Patterns can be Maps. They match if the input is a Map, and if each
value match the corresponding sub-pattern.

```ts
import { match, P } from 'ts-pattern';

type Input = Map<string, string | number>;

const input: Input = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3],
]);

const output = match(input)
  .with(new Map([['b', 2]]), (map) => `map.get('b') is 2`)
  .with(new Map([['a', P.string]]), (map) => `map.get('a') is a string`)
  .with(
    new Map([
      ['a', P.number],
      ['c', P.number],
    ]),
    (map) => `map.get('a') and map.get('c') are number`
  )
  .otherwise(() => '');

console.log(output);
// => 'map.get('b') is 2'
```

### `P.when` patterns

`P.when` lets you define your own logic to check if the pattern should match or not.
If the `predicate` function given to when returns a truthy value, then the pattern
will match for this input.

Note that you can narrow down the type of your input by providing a
[Type Guard function](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards) to `P.when`.

```ts
import { match, P } from 'ts-pattern';

type Input = { score: number };

const output = match({ score: 10 })
  .with(
    {
      score: P.when((score): score is 5 => score === 5),
    },
    (input) => '😐' // input is inferred as { score: 5 }
  )
  .with({ score: P.when((score) => score < 5) }, () => '😞')
  .with({ score: P.when((score) => score > 5) }, () => '🙂')
  .run();

console.log(output);
// => '🙂'
```

### `P.not` patterns

`P.not` lets you match on everything **but** a specific value.
it's a function taking a pattern and returning the opposite pattern.

```ts
import { match, P } from 'ts-pattern';

type Input = boolean | number;

const toNumber = (input: Input) =>
  match(input)
    .with(P.not(P.boolean), (n) => n) // n: number
    .with(true, () => 1)
    .with(false, () => 0)
    .run();

console.log(toNumber(2));
// => 2
console.log(toNumber(true));
// => 1
```

### `P.select` patterns

`P.select` lets you pick a piece of your input data-structure
and injects it in your handler function.

It's especially useful when pattern matching on deep data structure to
avoid the hassle of destructuring it in the handler function.

Selections can be either named (with `P.select('someName')`) or anonymous (with `P.select()`).

You can have only one anonymous selection by pattern, and the selected value will be directly inject in your handler as first argument:

```ts
import { match, P } from 'ts-pattern';

type Input =
  | { type: 'post'; user: { name: string } }
  | { ... };

const input: Input = { type: 'post', user: { name: 'Gabriel' } }

const output = match(input)
    .with(
      { type: 'post', user: { name: P.select() } },
      username => username // username: string
    )
    .otherwise(() => 'anonymous');

console.log(output);
// => 'Gabriel'
```

If you need to select several things inside your input data structure, you can name your selections by giving a string to `P.select(<name>)`. Each selection will be passed as first argument to your handler in an object.

```ts
import { match, P } from 'ts-pattern';

type Input =
  | { type: 'post'; user: { name: string }, content: string }
  | { ... };

const input: Input = { type: 'post', user: { name: 'Gabriel' }, content: 'Hello!' }

const output = match(input)
    .with(
      { type: 'post', user: { name: P.select('name') }, content: P.select('body') },
      ({ name, body }) => `${name} wrote "${body}"`
    )
    .otherwise(() => '');

console.log(output);
// => 'Gabriel wrote "Hello!"'
```

You can also pass a sub-pattern to `P.select` if you want it to only
select values which match this sub-pattern:

```ts
type User = { age: number; name: string };
type Post = { body: string };
type Input = { author: User; content: Post };

declare const input: Input;

const output = match(input)
  .with(
    {
      author: P.select({ age: P.when((age) => age > 18) }),
    },
    (author) => author // author: User
  )
  .with(
    {
      author: P.select('author', { age: P.when((age) => age > 18) }),
      content: P.select(),
    },
    ({ author, content }) => author // author: User, content: Post
  )
  .otherwise(() => 'anonymous');
```

### `P.optional` patterns

`P.optional(subpattern)` lets you annotate a key in an object pattern as being optional,
but if it is defined it should match a given sub-pattern.

```ts
import { match, P } from 'ts-pattern';

type Input = { key?: string | number };

const output = match(input)
  .with({ key: P.optional(P.string) }, (a) => {
    return a.key; // string | undefined
  })
  .with({ key: P.optional(P.number) }, (a) => {
    return a.key; // number | undefined
  })
  .exhaustive();
```

### `P.instanceOf` patterns

The `P.instanceOf` function lets you build a pattern to check if
a value is an instance of a class:

```ts
import { match, P } from 'ts-pattern';

class A {
  a = 'a';
}
class B {
  b = 'b';
}

type Input = { value: A | B };

const input: Input = { value: new A() };

const output = match(input)
  .with({ value: P.instanceOf(A) }, (a) => {
    return 'instance of A!';
  })
  .with({ value: P.instanceOf(B) }, (b) => {
    return 'instance of B!';
  })
  .exhaustive();

console.log(output);
// => 'instance of A!'
```

### `P.union` patterns

`P.union(...subpatterns)` lets you test several patterns and will match if
one of these patterns do. It's particularly handy when you want to handle
some cases of a union type in the same code branch:

```ts
import { match, P } from 'ts-pattern';

type Input =
  | { type: 'user'; name: string }
  | { type: 'org'; name: string }
  | { type: 'text'; content: string }
  | { type: 'img'; src: string };

declare const input: Input;

const output = match(input)
  .with({ type: P.union('user', 'org') }, (userOrOrg) => {
    // userOrOrg: User | Org
    return userOrOrg.name;
  })
  .otherwise(() => '');
```

### `P.intersection` patterns

`P.intersection(...subpatterns)` lets you ensure that the input matches
**all** sub-patterns passed as parameters.

```ts
class A {
  constructor(public foo: 'bar' | 'baz') {}
}

class B {
  constructor(public str: string) {}
}

type Input = { prop: A | B };

declare const input: Input;

const output = match(input)
  .with(
    { prop: P.intersection(P.instanceOf(A), { foo: 'bar' }) },
    ({ prop }) => prop.foo // prop: A & { foo: 'bar' }
  )
  .with(
    { prop: P.intersection(P.instanceOf(A), { foo: 'baz' }) },
    ({ prop }) => prop.foo // prop: A & { foo: 'baz' }
  )
  .otherwise(() => '');
```

## Types

### `P.infer`

`P.infer<typeof somePattern>` lets you infer a type of value from a type of pattern.

It's particularly useful when validating an API response.

```ts
const postPattern = {
  title: P.string,
  content: P.string,
  likeCount: P.number,
  author: {
    name: P.string,
  },
};

type Post = P.infer<typeof postPattern>;

// posts: Post[]
const posts = await fetch(someUrl)
  .then((res) => res.json())
  .then((res: unknown): Post[] =>
    isMatching({ data: P.array(postPattern) }, res) ? res.data : []
  );
```

### `P.Pattern`

`P.Pattern<T>` is the type of all possible pattern for a generic type `T`.

```ts
type User = { name: string; age: number };

const userPattern: Pattern<User> = {
  name: 'Alice',
};
```

### Type inference

TS-Pattern takes advantage of some of the most advanced features of the type system to narrow the input type using the current pattern. It is also able to accurately know if you have handled all cases, even when matching on complex data-structures.

Here are some examples of TS-Pattern's inference features.

#### Type narrowing

If you pattern-match on a union type with a discriminant property, TS-Pattern will use this discriminant to narrow the type of input.

```ts
type Text = { type: 'text'; data: string };
type Img = { type: 'img'; data: { src: string; alt: string } };
type Video = { type: 'video'; data: { src: string; format: 'mp4' | 'webm' } };
type Content = Text | Img | Video;

const formatContent = (content: Content): string =>
  match(content)
    .with({ type: 'text' }, (text /* : Text */) => '<p>...</p>')
    .with({ type: 'img' }, (img /* : Img */) => '<img ... />')
    .with({ type: 'video' }, (video /* : Video */) => '<video ... />')
    .with(
      { type: 'img' },
      { type: 'video' },
      (video /* : Img | Video */) => 'img or video'
    )
    .with(
      { type: P.union('img', 'video') },
      (video /* : Img | Video */) => 'img or video'
    )
    .exhaustive();
```

If you use `P.select`, TS-Pattern will pick up the type of the property you selected, and will inferyour handler's type accordingly.

```ts
const formatContent = (content: Content): string =>
  match(content)
    .with(
      { type: 'text', data: P.select() },
      (content /* : string */) => '<p>...</p>'
    )
    .with(
      { type: 'video', data: { format: P.select() } },
      (format /* : 'mp4' | 'webm' */) => '<video ... />'
    )
    .with(
      { type: P.union('img', 'video'), data: P.select() },
      (data /* : Img['data'] | Video['data'] */) => 'img or video'
    )
    .exhaustive();
```

If the function given to `P.when` is a [Type Guard](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates), TS-Pattern will use the type guard's return type to narrow the input.

```ts
const isString = (x: unknown): x is string => typeof x === 'string';

const isNumber = (x: unknown): x is number => typeof x === 'number';

const fn = (input: { id: number | string }) =>
  match(input)
    .with({ id: P.when(isString) }, (narrowed /* : { id: string } */) => 'yes')
    .with({ id: P.when(isNumber) }, (narrowed /* : { id: number } */) => 'yes')
    .exhaustive();
```

#### Exhaustiveness checking

If your data structure contains several union types, you can pattern-match on several of them with a **single pattern**. TS-Pattern will keep track of the cases which have been handled and those which
haven't, so you never forget to handle a case.

```ts
type Permission = 'editor' | 'viewer';
type Plan = 'basic' | 'pro';

const fn = (org: Plan, user: Permission): string =>
  match([org, user] as const)
    .with(['basic', 'viewer'], () => {})
    .with(['basic', 'editor'], () => {})
    .with(['pro', 'viewer'], () => {})
    // Fails with `NonExhaustiveError<['pro', 'editor']>`
    // because the `['pro', 'editor']` case isn't handled.
    .exhaustive();
```

## Want to learn how TS-Pattern is built?

Check out 👉 [Type-Level TypeScript](https://type-level-typescript.com/), an online course to learn how to take full advantage of the most advanced features of TypeScript!

## Inspirations

This library has been heavily inspired by this great article by Wim Jongeneel:
[Pattern Matching in TypeScript with Record and Wildcard Patterns](https://medium.com/swlh/pattern-matching-in-typescript-with-record-and-wildcard-patterns-6097dd4e471d).
It made me realize pattern matching could be implemented in userland and we didn't have
to wait for it to be added to the language itself. I'm really grateful for that 🙏
