<h1 align="center">ts-pattern</h1>

<p align="center">
The exhaustive Pattern Matching library for <a href="https://github.com/microsoft/TypeScript">TypeScript</a>
with smart type inference.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ts-pattern">
    <img src="https://badge.fury.io/js/ts-pattern.svg" alt="npm version" height="18">
  </a>
</p>

```ts
import { match, select } from 'ts-pattern';

type Data =
  | { type: 'text'; content: string }
  | { type: 'img'; src: string };

type Result =
  | { type: 'ok'; data: Data }
  | { type: 'error'; error: Error };

const result: Result = ...;

return match(result)
  .with({ type: 'error' }, (res) => `<p>Oups! An error occured</p>`)
  .with({ type: 'ok', data: { type: 'text' } }, (res) => `<p>${res.data.content}</p>`)
  .with({ type: 'ok', data: { type: 'img', src: select() } }, (src) => `<img src=${src} />`)
  .exhaustive();
```

## About

Write **better** and **safer conditions**. Pattern matching lets you express complex conditions in a single, compact expression. Your code becomes **shorter** and **more readable**. Exhaustiveness checking ensures you haven’t forgotten **any possible case**.

## Features

- Works on **any data structure**: nested objects, arrays, tuples, Sets, Maps and all primitive types.
- **Typesafe**, with helpful type inference.
- **Exhaustive matching** support, enforcing that you are matching every possible case with `.exhaustive()`.
- **Expressive API**, with catch-all and type specific **wildcards**: `__`.
- Supports `when(<predicate>)` and `not(<pattern>)` patterns for complex cases.
- Supports properties selection, via the `select(<name?>)` function.
- Tiny bundle footprint ([**only 1.4kb**](https://bundlephobia.com/package/ts-pattern@3.2.4)).

## What is Pattern Matching?

Pattern Matching is a technique coming from functional programming languages to declaratively write conditional code branches based on the structure of a value. This technique has proven itself to be much more powerful and much less verbose than imperative alternatives (if/else/switch statements) especially when branching on complex data structures or on several values.

Pattern Matching is implemented in Haskell, Rust, Swift, Elixir and many other languages. There is [a tc39 proposal](https://github.com/tc39/proposal-pattern-matching) to add Pattern Matching to the EcmaScript specification, but it is still in stage 1 and isn't likely to land before several years (if ever). Luckily, pattern matching can be implemented in userland. `ts-pattern` Provides a typesafe pattern matching implementation that you can start using today.

Read the introduction blog post: [Bringing Pattern Matching to TypeScript 🎨 Introducing TS-Pattern v3.0](https://dev.to/gvergnaud/bringing-pattern-matching-to-typescript-introducing-ts-pattern-v3-0-o1k)

## Installation

Via npm

```
npm install ts-pattern
```

Via yarn

```
yarn add ts-pattern
```

### compatibility with different TypeScript versions

| ts-pattern | TypeScript v4.2+ | TypeScript v4.1+ | TypeScript v3.x- |
| ---------- | ---------------- | ---------------- | ---------------- |
| v3.x       | ✅               | ⚠️               | ❌               |
| v2.x       | ✅               | ✅               | ❌               |
| v1.x       | ✅               | ✅               | ✅               |

✅ Full support

⚠️ Partial support, everything works except passing more than 2 patterns to `.with()`

❌ No support

# Documentation

- [Code Sandbox Examples](#code-sandbox-examples)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
  - [`match`](#match)
  - [`.with`](#with)
  - [`.when`](#when)
  - [`.otherwise`](#otherwise)
  - [`.run`](#run)
  - [`isMatching`](#ismatching)
  - [Patterns](#patterns)
    - [Literals](#literals)
    - [`__` wildcard](#__-wildcard)
    - [`__.string` wildcard](#__string-wildcard)
    - [`__.number` wildcard](#__number-wildcard)
    - [`__.boolean` wildcard](#__boolean-wildcard)
    - [`__.nullish` wildcard](#__nullish-wildcard)
    - [`__.NaN` wildcard](#__nan-wildcard)
    - [Objects](#objects)
    - [Lists (arrays)](#lists-arrays)
    - [Tuples (arrays)](#tuples-arrays)
    - [Sets](#sets)
    - [Maps](#maps)
    - [`when` guards](#when-guards)
    - [`not` patterns](#not-patterns)
    - [`select` patterns](#select-patterns)
    - [`instanceOf` patterns](#instanceof-patterns)
- [Type inference](#type-inference)
- [Inspirations](#inspirations)

## Code Sandbox Examples

- [Basic Demo](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/basic.tsx)
- [Gif fetcher app Demo (with React)](https://codesandbox.io/s/ts-pattern-gif-search-demo-n8h4k?file=/src/App.tsx)
- [Reducer Demo (with React)](https://codesandbox.io/s/ts-pattern-reducer-example-c4yuq?file=/src/App.tsx)
- [Untyped Input Demo (Handling an API response)](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/api.tsx)
- [`when` Guard Demo](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/when.tsx)
- [`not` Pattern Demo](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/not.tsx)
- [`select` Pattern Demo](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/select.tsx)

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

```ts
import { match, __, not, select, when } from 'ts-pattern';

const reducer = (state: State, event: Event): State =>
  match<[State, Event], State>([state, event])
    .with([{ status: 'loading' }, { type: 'success' }], ([, event]) => ({
      status: 'success',
      data: event.data,
    }))

    .with(
      [{ status: 'loading' }, { type: 'error', error: select() }],
      (error) => ({
        status: 'error',
        error,
      })
    )

    .with([{ status: not('loading') }, { type: 'fetch' }], () => ({
      status: 'loading',
      startTime: Date.now(),
    }))

    .with(
      [
        { status: 'loading', startTime: when((t) => t + 2000 < Date.now()) },
        { type: 'cancel' },
      ],
      () => ({
        status: 'idle',
      })
    )

    .with(__, () => state)

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
  .with([{ status: 'loading' }, { type: 'success' }], ([state, event]) => ({
    // `state` is infered as { status: 'loading' }
    // `event` is infered as { type: 'success', data: string }
    status: 'success',
    data: event.data,
  }))
```

The first argument is the **pattern**: the **shape of value**
you expect for this branch.

The second argument is the **handler function**: the code **branch** that will be called if
the input value matches the pattern.

The handler function takes the input value as first parameter with its type **narrowed down** to what the pattern matches.

### select(name?)

In the second `with` clause, we use the `select` function:

```ts
  .with(
    [{ status: 'loading' }, { type: 'error', error: select() }],
    (error) => ({
      status: 'error',
      error,
    })
  )
```

`select` let you **extract** a piece of your input value and **inject** it into your handler. It is pretty useful when pattern matching on deep data structures because it avoids the hassle of destructuring your input in your handler.

Since we didn't pass any name to `select()`, It will inject the `event.error` property as first argument to the handler function. Note that you can still access **the full input value** with its type narrowed by your pattern as **second argument** of the handler function:

```ts
  .with(
    [{ status: 'loading' }, { type: 'error', error: select() }],
    (error, stateAndEvent) => {
      // error: Error
      // stateAndEvent: [{ status: 'loading' }, { type: 'error', error: Error }]
    }
  )
```

In a pattern, we can only have a **single** anonymous selection. If you need to select more properties on your input data structure, you will need to give them **names**:

```ts
.with(
    [{ status: 'success', data: select('prevData') }, { type: 'error', error: select('err') }],
    ({ prevData, err }) => {
      // Do something with (prevData: string) and (err: Error).
    }
  )
```

Each named selection will be injected inside a `selections` object, passed as first argument to the handler function. Names can be any strings.

### not(pattern)

If you need to match on everything **but** a specific value, you can use a `not(<pattern>)` pattern. it's a function taking a pattern and returning its opposite:

```ts
  .with([{ status: not('loading') }, { type: 'fetch' }], () => ({
    status: 'loading',
  }))
```

### `when()` and guard functions

Sometimes, we need to make sure our input value respects a condition that can't be expressed by a pattern. For example, imagine you need to check if a number is positive. In these cases, we can use **guard functions**: functions taking a value and returning a `boolean`.

With `ts-pattern` there are two options to use a guard function:

- use `when(<guard function>)` inside your pattern
- pass it as second parameter to `.with(...)`

#### using when(predicate)

```ts
  .with(
    [
      {
        status: 'loading',
        startTime: when((t) => t + 2000 < Date.now()),
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
    [{ status: 'loading' },{ type: 'cancel' }],
    ([state, event]) => state.startTime + 2000 < Date.now(),
    () => ({
      status: 'idle'
    })
  )
```

This pattern will only match if the guard function returns `true`.

### the `__` wildcard

`__` will match any value.
You can use it at the top level, or inside your pattern.

```ts
  .with(__, () => state)

  // You could also use it inside your pattern:
  .with([__, __], () => state)

  // at any level:
  .with([__, { type: __ }], () => state)

```

### .exhaustive(), .otherwise() and .run()

```ts
  .exhaustive();
```

`.exhaustive()` **executes** the pattern matching expression, and **returns the result**. It also enables **exhaustiveness checking**, making sure we don't forget any possible case in our input value. This extra type safety is very nice because forgetting a case is an easy mistake to make, especially in an evolving code-base.

Note that exhaustive pattern matching is **optional**. It comes with the trade-off of having **longer compilation times** because the type checker has more work to do.

Alternatively you can use `.otherwise()`, which take an handler returning a default value. `.otherwise(handler)` is equivalent to `.with(__, handler).exhaustive()`.

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

Obviously, it also works with more complex patterns than strings. Exhaustive matching also works as you would expect.

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
  handler: (value: TInput, selections: Selections<TInput>) => TOutput
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
  pattern: Pattern<TInput>[],
  when: (value: TInput) => unknown,
  handler: (
    [selection: Selection<TInput>, ]
    value: TInput
  ) => TOutput
): Match<TInput, TOutput>;
```

#### Arguments

- `pattern: Pattern<TInput>`
  - **Required**
  - The pattern your input must match for the handler to be called.
  - [See all valid patterns bellow](#patterns)
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

Executes the match case, return its result, and enable exhaustive pattern matching, making sure at compile time that all possible cases are handled.

#### Signature

```ts
function exhaustive(): IOutput;
```

### `.otherwise`

```ts
match(...)
  .with(...)
  .otherwise(defaultHandler)
```

Executes the match case and return its result.

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

Executes the match case and return its result.

#### Signature

```ts
function run(): TOutput;
```

### `isMatching`

With a single argument:

```ts
import { isMatching, __ } from 'ts-pattern';

const isBlogPost = isMatching({
  title: __.string,
  description: __.string,
});

if (isBlogPost(value)) {
  // value: { title: string, description: string }
}
```

With two arguments:

```ts
const blogPostPattern = {
  title: __.string,
  description: __.string,
};

if (isMatching(blogPostPattern, value)) {
  // value: { title: string, description: string }
}
```

Type guard function to check if a value is matching a pattern or not.

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
  - if a value is given as second argument, `isMatching` will return a boolean telling us whether or not the value matches the pattern.
  - if the only argument given to the function is the pattern, then `isMatching` will return a **type guard function** taking a value and returning a boolean telling us whether or not the value matches the pattern.

### Patterns

Patterns are values matching one of the possible shapes of your input. They can
be literal values, data structures, wildcards, or special functions like `not`,
`when` and `select`.

If your input isn't typed, (if it's a `any` or a `unknown`), you have no constraints
on the shape of your pattern, you can put whatever you want. In your handler, your
value will take the type described by your pattern.

#### Literals

Literals are primitive JavaScript values, like number, string, boolean, bigint, null, undefined, and symbol.

```ts
import { match } from 'ts-pattern';

const input: unknown = 2;

const output = match(input)
  .with(2, () => 'number: two')
  .with(true, () => 'boolean: true')
  .with('hello', () => 'string: hello')
  .with(undefined, () => 'undefined')
  .with(null, () => 'null')
  .with(20n, () => 'bigint: 20n')
  .otherwise(() => 'something else');

console.log(output);
// => 'two'
```

#### `__` wildcard

The `__` pattern will match any value.

```ts
import { match, __ } from 'ts-pattern';

const input = 'hello';

const output = match(input)
  .with(__, () => 'It will always match')
  .otherwise(() => 'This string will never be used');

console.log(output);
// => 'It will always match'
```

#### `__.string` wildcard

The `__.string` pattern will match any value of type `string`.

```ts
import { match, __ } from 'ts-pattern';

const input = 'hello';

const output = match(input)
  .with('bonjour', () => 'Won‘t match')
  .with(__.string, () => 'it is a string!')
  .run();

console.log(output);
// => 'it is a string!'
```

#### `__.number` wildcard

The `__.number` pattern will match any value of type `number`.

```ts
import { match, __ } from 'ts-pattern';

const input = 2;

const output = match<number | string>(input)
  .with(__.string, () => 'it is a string!')
  .with(__.number, () => 'it is a number!')
  .run();

console.log(output);
// => 'it is a number!'
```

#### `__.boolean` wildcard

The `__.boolean` pattern will match any value of type `boolean`.

```ts
import { match, __ } from 'ts-pattern';

const input = true;

const output = match<number | string | boolean>(input)
  .with(__.string, () => 'it is a string!')
  .with(__.number, () => 'it is a number!')
  .with(__.boolean, () => 'it is a boolean!')
  .run();

console.log(output);
// => 'it is a boolean!'
```

#### `__.nullish` wildcard

The `__.nullish` pattern will match any value of type `null` or `undefined`.

You will **not often need this wildcard** as ordinarily `null` and `undefined`
are their own wildcards.

However, sometimes `null` and `undefined` appear in a union together
(e.g. `null | undefined | string`) and you may want to treat them as equivalent.

```ts
import { match, __ } from 'ts-pattern';

const input = null;

const output = match<number | string | boolean | null | undefined>(input)
  .with(__.string, () => 'it is a string!')
  .with(__.number, () => 'it is a number!')
  .with(__.boolean, () => 'it is a boolean!')
  .with(__.nullish, () => 'it is either null or undefined!')
  .with(null, () => 'it is null!')
  .with(undefined, () => 'it is undefined!')
  .exhaustive();

console.log(output);
// => 'it is either null or undefined!'
```

#### `__.NaN` wildcard

The `__.NaN` pattern will match `NaN` values.

Note that `__.number` also match `NaNs`, but this pattern lets you
explicitly match them if you want to handle them separately:

```ts
import { match, __ } from 'ts-pattern';

const input = NaN;
const output = match<number>(input)
  .with(__.NaN, () => 'This is not a number!')
  .with(__.number, () => 'This is a number!')
  .exhaustive();

console.log(output);
// => 'This is not a number!'
```

#### Objects

A pattern can be an object with sub-pattern properties. In order to match,
the input must be an object with all properties defined on the pattern object
and each property must match its sub-pattern.

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

#### Lists (arrays)

To match on a list of values, your pattern can be an array with a single sub-pattern in it.
This sub-pattern will be tested against all elements in your input array, and they
must all match for your list pattern to match.

```ts
import { match, __ } from 'ts-pattern';

type Input = { title: string; content: string }[];

let input: Input = [
  { title: 'Hello world!', content: 'This is a very interesting content' },
  { title: 'Bonjour!', content: 'This is a very interesting content too' },
];

const output = match(input)
  .with(
    [{ title: __.string, content: __.string }],
    (posts) => 'a list of posts!'
  )
  .otherwise(() => 'something else');

console.log(output);
// => 'a list of posts!'
```

#### Tuples (arrays)

In TypeScript, [Tuples](https://en.wikipedia.org/wiki/Tuple) are arrays with a fixed
number of elements which can be of different types. You can pattern match on tuples
with a tuple pattern, matching your value in length and shape.

```ts
import { match, __ } from 'ts-pattern';

type Input =
  | [number, '+', number]
  | [number, '-', number]
  | [number, '*', number]
  | ['-', number];

const input: Input = [3, '*', 4];

const output = match<Input>(input)
  .with([__, '+', __], ([x, , y]) => x + y)
  .with([__, '-', __], ([x, , y]) => x - y)
  .with([__, '*', __], ([x, , y]) => x * y)
  .with(['-', __], ([, x]) => -x)
  .otherwise(() => NaN);

console.log(output);
// => 12
```

#### Sets

Similarly to array patterns, set patterns have a different meaning
if they contain a single sub-pattern or several of them:

```ts
import { match, __ } from 'ts-pattern';

type Input = Set<string | number>;

const input: Input = new Set([1, 2, 3]);

const output = match<Input>(input)
  .with(new Set([1, 'hello']), (set) => `Set contains 1 and 'hello'`)
  .with(new Set([1, 2]), (set) => `Set contains 1 and 2`)
  .with(new Set([__.string]), (set) => `Set contains only strings`)
  .with(new Set([__.number]), (set) => `Set contains only numbers`)
  .otherwise(() => '');

console.log(output);
// => 'Set contains 1 and 2'
```

If a Set pattern contains one single wildcard pattern, it will match if
each value in the input set match the wildcard.

If a Set pattern contains several values, it will match if the
input Set contains each of these values.

#### Maps

Map patterns are similar to object patterns. They match if each
keyed sub-pattern match the input value for the same key.

```ts
import { match, __ } from 'ts-pattern';

type Input = Map<string, string | number>;

const input: Input = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3],
]);

const output = match<Input>(input)
  .with(new Map([['b', 2]]), (map) => `map.get('b') is 2`)
  .with(new Map([['a', __.string]]), (map) => `map.get('a') is a string`)
  .with(
    new Map([
      ['a', __.number],
      ['c', __.number],
    ]),
    (map) => `map.get('a') and map.get('c') are number`
  )
  .otherwise(() => '');

console.log(output);
// => 'map.get('b') is 2'
```

#### `when` guards

the `when` function enables you to test the input with a custom guard function.
The pattern will match only if all `when` functions return a truthy value.

Note that you can narrow down the type of your input by providing a
[Type Guard function](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards) to when.

```ts
import { match, when } from 'ts-pattern';

type Input = { score: number };

const output = match<Input>({ score: 10 })
  .with(
    {
      score: when((score): score is 5 => score === 5),
    },
    (input) => '😐' // input is infered as { score: 5 }
  )
  .with({ score: when((score) => score < 5) }, () => '😞')
  .with({ score: when((score) => score > 5) }, () => '🙂')
  .run();

console.log(output);
// => '🙂'
```

#### `not` patterns

The `not` function enables you to match on everything **but** a specific value.
it's a function taking a pattern and returning its opposite:

```ts
import { match, not } from 'ts-pattern';

type Input = boolean | number;

const toNumber = (input: Input) =>
  match(input)
    .with(not(__.boolean), (n) => n) // n: number
    .with(true, () => 1)
    .with(false, () => 0)
    .run();

console.log(toNumber(2));
// => 2
console.log(toNumber(true));
// => 1
```

#### `select` patterns

The `select` function enables us to pick a piece of our input data structure
and inject it in our handler function.

It's especially useful when pattern matching on deep data structure to
avoid the hassle of destructuring it in the handler function.

Selections can be either named (with `select('someName')`) or anonymous (with `select()`).

You can have only one anonymous selection by pattern, and the selected value will be directly inject in your handler as first argument:

```ts
import { match, select } from 'ts-pattern';

type Input =
  | { type: 'post'; user: { name: string } }
  | { ... };

const input = { type: 'post', user: { name: 'Gabriel' } }

const output = match<Input>(input)
    .with(
      { type: 'post', user: { name: select() } },
      username => username // username: string
    )
    .otherwise(() => 'anonymous');

console.log(output);
// => 'Gabriel'
```

If you need to select several things inside your input data structure, you can name your selections by giving a string to `select(<name>)`. Each selection will be passed as first argument to your handler in an object.

```ts
import { match, select } from 'ts-pattern';

type Input =
  | { type: 'post'; user: { name: string }, content: string }
  | { ... };

const input = { type: 'post', user: { name: 'Gabriel' }, content: 'Hello!' }

const output = match<Input>(input)
    .with(
      { type: 'post', user: { name: select('name') }, content: select('body') },
      ({ name, body }) => `${name} wrote "${body}"`
    )
    .otherwise(() => '');

console.log(output);
// => 'Gabriel wrote "Hello!"'
```

#### `instanceOf` patterns

The `instanceOf` function lets you build a pattern to check if
a value is an instance of a class:

```ts
import { match, instanceOf } from 'ts-pattern';

class A {
  a = 'a';
}
class B {
  b = 'b';
}

type Input = { value: A | B };

const input = { value: new A() };

const output = match<Input>(input)
  .with({ value: instanceOf(A) }, (a) => {
    return 'instance of A!';
  })
  .with({ value: instanceOf(B) }, (b) => {
    return 'instance of B!';
  })
  .exhaustive();

console.log(output);
// => 'instance of A!'
```

### type inference

`ts-pattern` heavily relies on TypeScript's type system to automatically infer the precise type of your input value based on your pattern. Here are a few examples showing how the input type would be narrowed using various patterns:

```ts
type Input = { type: string } | string;

match<Input, 'ok'>({ type: 'hello' })
  .with(__, (value) => 'ok') // value: Input
  .with(__.string, (value) => 'ok') // value: string
  .with(
    when((value) => true),
    (value) => 'ok' // value: Input
  )
  .with(
    when((value): value is string => true),
    (value) => 'ok' // value: string
  )
  .with(not('hello'), (value) => 'ok') // value: Input
  .with(not(__.string), (value) => 'ok') // value: { type: string }
  .with(not({ type: __.string }), (value) => 'ok') // value: string
  .with(not(when(() => true)), (value) => 'ok') // value: Input
  .with({ type: __ }, (value) => 'ok') // value: { type: string }
  .with({ type: __.string }, (value) => 'ok') // value: { type: string }
  .with({ type: when(() => true) }, (value) => 'ok') // value: { type: string }
  .with({ type: not('hello' as const) }, (value) => 'ok') // value: { type: string }
  .with({ type: not(__.string) }, (value) => 'ok') // value: never
  .with({ type: not(when(() => true)) }, (value) => 'ok') // value: { type: string }
  .run();
```

## Inspirations

This library has been heavily inspired by this great article by Wim Jongeneel:
[Pattern Matching in TypeScript with Record and Wildcard Patterns](https://medium.com/swlh/pattern-matching-in-typescript-with-record-and-wildcard-patterns-6097dd4e471d).
It made me realize pattern matching could be implemented in userland and we didn't have
to wait for it to be added to the language itself. I'm really grateful for that 🙏

#### how is this different from `typescript-pattern-matching`

Wim Jongeneel released his own npm package for pattern matching. `ts-pattern` has a few
notable differences:

- `ts-patterns`'s goal is to be a well unit-tested, well documented, production ready library.
- It supports more data structures, like tuples, sets and maps.
- It provides a "catch all" pattern: `__`.
- It supports exhaustive matching with `.exhaustive()`.
- It supports deep selection with the `select()` function.
- Its type inference works on deeper patterns and is well tested.
