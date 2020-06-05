# TS Pattern

A complete Pattern Matching library for [TypeScript](https://github.com/microsoft/TypeScript)
with great type inference.

## What is Pattern Matching?

Pattern Matching is a technique coming from Functional Programming languages to declaratively write conditional code branches based on the structure of one or several values. This technique has proven itself to be much more powerful and much less verbose than imperative alternatives (if/else/switch statements) especially when branching on complex data structures or on several values.

Pattern Matching is implemented in Elixir, Rust, Haskell, Swift and many other languages. There is [a tc39 proposal](https://github.com/tc39/proposal-pattern-matching) to add Pattern Matching to the EcmaScript specification, but it is still in stage 1 and isn't likely to land before several years (if ever). Lukily, pattern matching can be implemented in userland. `ts-pattern` Provides a typesafe pattern matching implementation that you can start using today.

## Features

- Supports **every data structure** you use: objects, arrays, tuples, Sets, Maps, and all primitive types.
- **Typesafe**, with great type inference.
- Supports catch all (`__`) and type specific **wildcards**.
- Supports `when(<predicate>)` and `not(<pattern>)` patterns for complexe cases.
- Supports properties selection, via the `select(<name>)` function.
- Tiny bundle footprint (**only 1kb**).

## Installation

Via npm:

```
npm install ts-pattern
```

Via yarn

```
yarn add ts-pattern
```

# Documentation

- [Code Sandbox Examples](#code-sandbox-examples)
- [Intro to key concepts](#intro-to-key-concepts)
- [API Reference](#api-reference)
  - [match](#match)
  - [.with](#with)
  - [.when](#when)
  - [.otherwise](#when)
  - [Patterns](#patterns)
    - [Literals](#literals)
    - [Objects](#objects)
    - [Arrays](#arrays)
    - [Tuples](#tuples)
    - [Sets](#sets)
    - [Maps](#maps)
    - [`__` wildcard](#__-wildcard)
    - [`__.string` wildcard](#__string-wildcard)
    - [`__.number` wildcard](#__number-wildcard)
    - [`__.boolean` wildcard](#__boolean-wildcard)
    - [`when` guards](#when-guards)
    - [`not` patterns](#not-patterns)
    - [`select` patterns](#select-patterns)
- [Type inference](#type-inference)

## Code Sandbox Examples

- [Basic](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/basic.ts)
- [Reducer Demo (in React)](https://codesandbox.io/s/ts-pattern-reducer-example-c4yuq?file=/src/App.tsx)
- [Untyped input (e.g. an API response)](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/api.ts)
- [`when` guards Demo](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/when.ts)
- [`not` patterns](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/not.ts)
- [`select` pattern](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/not.ts)

## Intro to key concepts

Sometimes you want to match on two values at once. Let's say we want to
create a reducer function, we could make a switch on the event's type, but
generally an event only makes sense if we are in a certain state.

To avoid unwanted state changes that could lead to bugs, **we pattern match
on both the state and the event** and return a new state.

I use the word `event` but you can replace it with `action` if you are used
to Redux's terminology.

### Full example

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

```ts
import { match, __, not, select, when } from 'ts-pattern';

const reducer = (state: State, event: Event): State =>
  match<[State, Event], State>([state, event])
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
a [Tuple](https://en.wikipedia.org/wiki/Tuple) by TypeScript, so we
can match on each value separately.

Most of the time, you don't need to specify the type of input
and output with `match<Input, Output>(...)` because `match` is able to
infer both of this values.

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
second argument to the handler function. the `select` function takes the **name** of
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

### when(predicate)

The `when` function enables you to **add a guard** to your pattern.
Your pattern will not match **unless your predicate returns `true`**.
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

## API Reference

### .match

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
  .with(pattern, [, when, when, when], handler)
```

#### Signature

```ts
function with(
  pattern: Pattern<TInput>,
  [, when: (value: TInput) => unknown,
     when: (value: TInput) => unknown,
     when: (value: TInput) => unknown],
  handler: (value: TInput) => TOutput
): Match<TInput, TOutput>;
```

#### Options

- `pattern: Pattern<TInput>`
  - **Required**
  - The pattern your input must match for the handler to be called.
  - [See all valid patterns bellow](#patterns)
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

### .when

```ts
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

### .otherwise

```ts
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

Literals are primitive javascript values, like number, string, or boolean.

```ts
let x: unknown = 2;
const res = match(x)
  .with(2, () => 'number: two')
  .with(true, () => 'boolean: true')
  .with('hello', () => 'string: hello')
  .with(undefined, () => 'undefined')
  .with(null, () => 'null')
  .with(20n, () => 'bigint: 20n')
  .otherwise(() => 'something else');

console.log(res);
// => 'two'
```

#### Object

A pattern can be an object with sub-pattern properties. In order to match,
the input must be an object with all properties defined on the pattern object
and each property must match its sub-pattern.

```ts
type Input =
  | { type: 'user'; name: string }
  | { type: 'image'; src: string }
  | { type: 'video'; seconds: number };

let x: Input = { type: 'user', name: 'Gabriel' };
const res = match(x)
  .with({ type: 'image' }, () => 'image')
  .with({ type: 'video', seconds: 10 }, () => 'video of 10 seconds.')
  .with({ type: 'user' }, ({ name }) => `user of name: ${name}`)
  .otherwise(() => 'something else');

console.log(res);
// => 'user of name: Gabriel'
```

#### Arrays

#### Tuples

#### Sets

#### Maps

#### `__` wildcard

#### `__.string` wildcard

#### `__.number` wildcard

#### `__.boolean` wildcard

#### `when` guards

#### `not` patterns

#### `select` pattern

### type inference

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
  .with({ type: not('hello' as 'hello') }, (value) => 'ok') // value: { type: string }
  .with({ type: not(__.string) }, (value) => 'ok') // value: never
  .with({ type: not(when(() => true)) }, (value) => 'ok') // value: { type: string }
  .run();
```

## Inspiration

This library has been heavily inspired by this great article by Wim Jongeneel:
[Pattern Matching in TypeScript with Record and Wildcard Patterns](https://medium.com/swlh/pattern-matching-in-typescript-with-record-and-wildcard-patterns-6097dd4e471d).
It made me realise pattern matching could be implemented in userland and we didn't have
to wait for it to be added to the language itself. I'm really greatful for that 🙏

#### how is this different from `typescript-pattern-matching`

Wim Jongeneel released his own npm package for pattern matching. `ts-pattern` has a few
notable differences:

- `ts-patterns`'s goal is to be a well unit-tested, production ready library.
- It supports more data structures, like tuples, sets and maps.
- It provides a "catch all", `__`.
- It supports deep selection with the `select()` function.
- Its type inference works on deeper patterns and is well tested.
