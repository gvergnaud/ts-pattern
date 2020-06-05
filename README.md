# TS Pattern

A complete Pattern Matching library for TypeScript with great type inference.

## What is Pattern Matching?

Pattern Matching is a technique coming from Functional Programming languages to declaratively write conditional code branches based on the structure of one or several values. It is a well proven technique, much more powerful and much less verbose than imperative alternatives (if/else/switch statements) especially when branching on complex data structures or on several values.

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

## Example and intro to key concepts

Sometimes you want to match on two values at once. Let's say we want to
create a reducer function, we could make a switch on the event's type, but
generally an event only makes sense if we are in a certain state.

To avoid unwanted state changes that could lead to bugs, **we pattern match
on both the state and the event** and return a new state.

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
          startTime: when((time) => Date.now() > time + 1000),
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

Let's go through this bit by bit:

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

The `when` function enables you to add a guard to your pattern.
Your pattern will not match unless your predicate returns `true`.
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

`__` is a wildcard, it will match any value.
You can use it at the top level, or inside a data structure.

```ts
  .with(__, () => state)

  // You could also use it inside your pattern:
  .with([__, __], () => state)

  // at any level:
  .with([__, { type: __ }], () => state)

  .run();
```

`run()` execute the pattern matching, and **returns the result**.

Alternatively you can use `otherwise`, which take an handler returning
a default value. `.otherwise(handler)` is equivalent to `.with(__, handler).run()`.

```ts
  .otherwise(() => state);
```

## Code Sandbox Examples

- Simple example
- [Reducer Demo (in React)](https://codesandbox.io/s/ts-pattern-reducer-example-c4yuq?file=/src/App.tsx)
- [`when` guards Demo](https://codesandbox.io/s/ts-pattern-when-guard-example-0s6d8?file=/src/index.ts)
- Polymorphic input
- Untyped input (e.g. an API response)
- `not` patterns
- `select` pattern

## API Documentation

- `.with()`
- `.when()`
- `.otherwise()`
- Patterns
  - Literals
  - Objects and arrays
  - Sets and Maps
  - `__` wildcard
  - `__.string` wildcard
  - `__.number` wildcard
  - `__.boolean` wildcard
  - `when` guards
  - `not` patterns
  - `select` pattern
- Type inference

### Patterns

#### Literals

#### Object and arrays

#### Sets and Maps

#### Wildcards

#### `when` guards

#### `not` patterns

#### `select` patterns

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
  .with(not('hello'), (value) => 'ok') // value: Input
  .with(not(__.string), (value) => 'ok') // value: { type: string }
  .with(not(when(() => true)), (value) => 'ok') // value: Input
  .with({ type: __ }, (value) => 'ok') // value: { type: string }
  .with({ type: __.string }, (value) => 'ok') // value: { type: string }
  .with({ type: when(() => true) }, (value) => 'ok') // value: { type: string }
  .with({ type: not('hello' as 'hello') }, (value) => 'ok') // value: { type: string }
  .with({ type: not(__.string) }, (value) => 'ok') // value: { type: string }
  .with({ type: not(when(() => true)) }, (value) => 'ok') // value: { type: string }
  .with(not({ type: when(() => true) }), (value) => 'ok') // value: string
  .with(not({ type: __.string }), (value) => 'ok') // value: string
  .run();
```
