<h1 align="center">ts-pattern</h1>

<p align="center">
A complete Pattern Matching library for <a href="https://github.com/microsoft/TypeScript">TypeScript</a>
with smart type inference.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ts-pattern">
    <img src="https://badge.fury.io/js/ts-pattern.svg" alt="npm version" height="18">
  </a>
</p>

```ts
import { match } from 'ts-pattern';

type Data =
  | { type: 'text'; content: string }
  | { type: 'img'; src: string }
  | ...; // Imagine this union is huge!

type Result =
  | { type: 'ok'; data: Data }
  | { type: 'error'; error: Error };

const result: Result = ...;

return match(result)
  .with({ type: 'ok', data: { type: 'text' } }, (res) => `<p>${res.data.content}</p>`)
  .with({ type: 'ok', data: { type: 'img' } }, (res) => `<img src=${res.data.src} />`)
  .with({ type: 'error' }, (res) => `<p>Oups! An error occured</p>`)
  .otherwise(() => `<p>everything else</p>`);
```

## Features

- Works on **any data structure**: nested objects, arrays, tuples, Sets, Maps and all primitive types.
- **Typesafe**, with great type inference.
- Optional **exhaustive matching**, enforcing that you are matching every possible case with `.exhaustive()`.
- **Expressive API**, with catch-all and type specific **wildcards**: `__`.
- Supports `when(<predicate>)` and `not(<pattern>)` patterns for complex cases.
- Supports properties selection, via the `select(<name>)` function.
- Tiny bundle footprint (**only 1kb**).

## What is Pattern Matching?

Pattern Matching is a technique coming from Functional Programming languages to declaratively write conditional code branches based on the structure of one or several values. This technique has proven itself to be much more powerful and much less verbose than imperative alternatives (if/else/switch statements) especially when branching on complex data structures or on several values.

Pattern Matching is implemented in Elixir, Rust, Haskell, Swift and many other languages. There is [a tc39 proposal](https://github.com/tc39/proposal-pattern-matching) to add Pattern Matching to the EcmaScript specification, but it is still in stage 1 and isn't likely to land before several years (if ever). Luckily, pattern matching can be implemented in userland. `ts-pattern` Provides a typesafe pattern matching implementation that you can start using today.

## Installation

Via npm

```
npm install ts-pattern
```

Via yarn

```
yarn add ts-pattern
```

⚠️ `ts-pattern@2` requires TypeScript >= v4. If you are using TypeScript v3, please install `ts-pattern@1.1.0`.

# Documentation

- [Code Sandbox Examples](#code-sandbox-examples)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
  - [match](#match)
  - [.with](#with)
  - [.when](#when)
  - [.otherwise](#when)
  - [Patterns](#patterns)
    - [Literals](#literals)
    - [`__` wildcard](#__-wildcard)
    - [`__.string` wildcard](#__string-wildcard)
    - [`__.number` wildcard](#__number-wildcard)
    - [`__.boolean` wildcard](#__boolean-wildcard)
    - [Objects](#objects)
    - [Lists (arrays)](#lists-arrays)
    - [Tuples (arrays)](#tuples-arrays)
    - [Sets](#sets)
    - [Maps](#maps)
    - [`when` guards](#when-guards)
    - [`not` patterns](#not-patterns)
    - [`select` patterns](#select-patterns)
- [Type inference](#type-inference)
- [Inspirations](#inspirations)

## Code Sandbox Examples

- [Basic Demo](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/basic.tsx)
- [Reducer Demo (with React)](https://codesandbox.io/s/ts-pattern-reducer-example-c4yuq?file=/src/App.tsx)
- [Untyped Input (API response) Demo](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/api.tsx)
- [`when` Guard Demo](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/when.tsx)
- [`not` Pattern Demo](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/not.tsx)
- [`select` Pattern Demo](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/not.tsx)

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

This is a case were `match` really shines. Instead of writing nested
switch statements, we can do that in a very expressive way:

```ts
import { match, __, not, select, when } from 'ts-pattern';

const reducer = (state: State, event: Event): State =>
  match<[State, Event], State>([state, event])
    .exhaustive()

    .with([{ status: 'loading' }, { type: 'success' }], ([, event]) => ({
      status: 'success',
      data: event.data,
    }))

    .with(
      [{ status: 'loading' }, { type: 'error', error: select('err') }],
      (_, { err }) => ({
        status: 'error',
        error: err,
      })
    )

    .with([{ status: not('loading') }, { type: 'fetch' }], () => ({
      status: 'loading',
      startTime: Date.now(),
    }))

    .with([{ status: 'loading' }, { type: 'cancel' }], () => ({
      status: 'idle',
    }))

    .with(__, () => state)

    .run();
```

**Let's go through this bit by bit:**

### match(value)

`match` takes a value and returns a builder on which you can
add your pattern matching cases.

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

### .exhaustive()

`.exhaustive()` enables **exhaustive matching**, making sure we don't forget
any possible case in our input data. This extra type safety is very nice
because forgetting a case is an easy mistake to make, especially in an
evolving code-base.

Note that exhaustive pattern matching is **optional**. It comes with the trade-off
of **disabling guard functions** (`when(...)`) and having **longer compilation times**.
If you are using `.otherwise()`, you probably don't need to use `.exhaustive()`.

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

The second argument is the handler function: the **branch** that will be called if
the data matches the given pattern.

The **type** of the data structure is **narrowed down** to
what is permitted by the pattern.

### select(name)

In the second `with` clause, we use the `select` function:

```ts
  .with(
    [{ status: 'loading' }, { type: 'error', error: select('err') }],
    (_, { err }) => ({
      status: 'error',
      error: err,
    })
  )
```

It will inject the `event.error` property inside a `selections` object given as
second argument to the handler function. The `select` function takes the **name** of
the selection, which can be whatever you like.

It is pretty useful when pattern matching on deep data structures because it avoids
the hassle of destructuring it in your handler.

### not(pattern)

If you need to match on everything **but** a specific value, you can use
a `not(<pattern>)` pattern. it's a function taking a pattern
and returning its opposite:

```ts
  .with([{ status: not('loading') }, { type: 'fetch' }], () => ({
    status: 'loading',
  }))
```

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

### .run() and .otherwise()

```ts
  .run();
```

`run()` execute the pattern matching, and **returns the result**.

Alternatively you can use `otherwise`, which take an handler returning
a default value. `.otherwise(handler)` is equivalent to `.with(__, handler).run()`.

```ts
  .otherwise(() => state);
```

### Guard functions

Sometimes, we need to make sure our input data respects a condition
that can't be expressed by a pattern. Imagine if we wanted to check that a number
is positive for instance. In this case, we can use **guard functions**:
functions taking some data and returning a `boolean`.

With `ts-pattern` you have two options to use a guard function:

- use `when(<guard function>)` inside your pattern
- pass it as second parameter to `.with(...)`

**Note**: to use this feature, you will need to **disable exhaustive matching**
by removing `.exhaustive()` if you were using it. That's because with guard functions,
there is no way to know if the pattern is going to match or not at compile time,
making exhaustive matching impossible.

#### when(predicate)

The `when` function lets you **add a guard** to your pattern.
Your pattern will not match **unless your predicate (guard) function returns `true`**.
It might be handy if you need to make a dynamic checks on
your data structure.

```ts
  .with(
    [
      {
        status: 'loading',
        startTime: when((startTime) => Date.now() > startTime + 1000),
      },
      { type: 'cancel' },
    ],
    () => ({
      status: 'idle',
    })
  )
```

#### Passing a guard function to `.with(...)`

`.with` optionally accepts up to 3 guard functions parameters between
the `pattern` and the `handler` callback:

```ts
  .with(
    [{ status: 'loading' },{ type: 'cancel' }],
    ([state, event]) => Date.now() > state.startTime + 1000,
    // you can add up to 2 other guard functions here
    () => ({
      status: 'idle'
    })
  )
```

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
one of these patterns matches your input, the branch will be chosen:

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

Obviously, you can still provide patterns that are more complex than strings, and aren't possible to express with regular switch statements. Exhaustive matching also works as you would expect.

## API Reference

### match

```ts
match(value);
```

Create a `Match` object on which you can later call `.with`, `.when`, `.otherwise` and `.run`.

#### Signature

```ts
function match<TInput, TOutput>(input: TInput): Match<TInput, TOutput>;
```

#### Options

- `input`
  - **Required**
  - the input value your patterns will be tested against.

### .with

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
  ...guardFunctions: ((value: TInput) => unknown)[],
  handler: (value: TInput, selections: Selections<TInput>) => TOutput
): Match<TInput, TOutput>;
```

#### Options

- `pattern: Pattern<TInput>`
  - **Required**
  - The pattern your input must match for the handler to be called.
  - [See all valid patterns bellow](#patterns)
  - If you provide several patterns before providing the `handler`, the `with` clause will match if one of the patterns matches.
- `when: (value: TInput) => unknown`
  - Optional
  - Additional condition the input must satisfy for the handler to be called.
  - You can add up to 3 when functions. The input will match if they all return truthy values.
  - `TInput` might be narrowed to a more precise type using the `pattern`.
- `handler: (value: TInput, selections: Selections<TInput>) => TOutput`
  - **Required**
  - Function called when the match conditions are satisfied.
  - All handlers on a single `match` case must return values of the same type, `TOutput`.
  - `TInput` might be narrowed to a more precise type using the `pattern`.
  - `selections` is an object of properties selected from the input with the [`select` function](#select-patterns).

### .when

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

#### Options

- `predicate: (value: TInput) => unknown`
  - **Required**
  - Condition the input must satisfy for the handler to be called.
- `handler: (value: TInput) => TOutput`
  - **Required**
  - Function called when the predicate condition is satisfied.
  - All handlers on a single `match` case must return values of the same type, `TOutput`.

### .exhaustive

```ts
match(...)
  .exhaustive()
  .with(...)
```

Enable exhaustive pattern matching, making sure at compile time that
all possible cases are handled.

#### Signature

```ts
function exhaustive(): ExhaustiveMatch<TInput, IOutput>;
```

### .otherwise

```ts
match(...)
  .with(...)
  .otherwise(defaultHandler)
```

Executes the match case and return its result.

#### Signature

```ts
function otherwise(defaultHandler: () => TOutput): TOutput;
```

#### Options

- `defaultHandler: () => TOutput`
  - **Required**
  - Function called if no other patterns were matched.
  - Think of it as the `default:` case of `switch` statements.
  - All handlers on a single `match` case must return values of the same type, `TOutput`.

### .run

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

#### Object

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
  { title: 'Hello world!', content: 'I‘m a very interesting content' },
  { title: 'Bonjour!', content: 'I‘m a very interesting content too' },
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
with a tuple pattern matching your value in length and shape.

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
    (input) => 'Its a good 5/7.' // input is infered as { score: 5 }
  )
  .with({ score: when((score) => score < 5) }, () => 'bad')
  .with({ score: when((score) => score > 5) }, () => 'good')
  .run();

console.log(output);
// => 'good'
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

The `select` function enables you to pick a part of your data structure
and inject it in the `selections` object given as second parameter to
your handler function.

It can be useful when you have a deep data structure and you want to
avoid the hassle of destructuring it.

```ts
import { match, not } from 'ts-pattern';

type Input =
  | { type: 'post'; user: { name: string } }
  | { ... };

const input = { type: 'post', user: { name: 'Gabriel' } }

const output = match<Input>(input)
    .with(
      { type: 'post', user: { name: select('username') } },
      (_, { username }) => username // username: string
    )
    .otherwise(() => 'anonymous');

console.log(output);
// => 'Gabriel'
```

### type inference

`ts-pattern` strongly invests on TypeScript's type inference to narrow
the type of your value to something that matches what you would expect.
Here are a few examples:

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
