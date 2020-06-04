# TS Pattern

The Pattern Matching library for TypeScript you have been missing.

## What is Pattern Matching?

Pattern Matching is a technique coming from Functional Programming languages to declaratively write conditional code branches based on the structure of one or several values. It is a well proven technique, much more powerful and much less verbose than imperative alternatives (if/else/switch statements) especially when branching on several values.

Pattern Matching is implemented in Elixir, Rust, Haskell, Swift and many other languages. There is [a tc39 proposal](https://github.com/tc39/proposal-pattern-matching) to add Pattern Matching to the EcmaScript specification, but it is still in stage 1 and isn't likely to land before several years (if ever). Lukily, pattern matching can be implemented in userland. `ts-pattern` Provides a typesafe pattern matching implementation that you can start using today.

## Features

- Supports every data structure you use: objects, arrays, tuples, Sets, Maps, and all primitive types.
- Typesafe, with great type inference.
- Catch all (`__`) and type specific wild cards support.
- Supports `when(<predicate>)` and `not(<pattern>)` patterns for complexe cases.
- Supports properties selection, via the `select(<name>)` function.
- Tiny bundle footprint (1kb).

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

To avoid unwanted state changes that could lead to bugs, we pattern match
on both the current state and the event and return a new state.

I use the word `event` but you can replace it with `action` if you are used
to Redux's terminology.

```ts
type State =
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; error: Error };

type Event =
  | { type: 'fetch' }
  | { type: 'success'; data: string }
  | { type: 'error'; error: Error };
```

```ts
import { match, __, not, select } from 'ts-pattern';

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
    }))
    .with(__, () => state)
    .run();
```

Let's go through this bit by bit:

### `match(<value>)`

`match` takes a value and returns a builder on which you can
add your pattern matching cases.

```ts
match<[State, Event], State>([state, event]);
```

Her we wrap the state and the event objects in an array and we explicitly
specify the type `[State, Event]` to make sure it is interpreted as a tuple by
TypeScript, so we can match on each value separately.

### `.with(<pattern>, <handler>)`

Then we add a first `with` clause:

```ts
  .with([{ status: 'loading' }, { type: 'success' }], ([state, event]) => ({
    // `state` is infered as { status: 'loading' }
    // `event` is infered as { type: 'success', data: string }
    status: 'success',
    data: event.data,
  }))
```

The first argument is the pattern: the shape of the value
you expect for this branch.
The second argument is the function that will be called if
the data matches the given pattern.
The type of the data structure is narrowed down to
what is permitted by the pattern.

### `select(<name>)`

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
second argument to the handler function. the `select` function takes the name of
the selection, which can be whatever you like.

It is pretty useful when pattern matching on deep data structures because it avoids
the hassle of destructuring it in your handler.

### `not(<pattern>)`

if you need to match on everything but a specific value, you can use
a `not(<pattern>)` pattern. it's a function taking a pattern
and returning its opposite:

```ts
  .with([{ status: not('loading') }, { type: 'fetch' }], () => ({
    status: 'loading',
  }))
```

### the `__` wildcard

`__` is a wildcard, it will match any value.
You can use it at the top level, or inside a data structure.

```ts
  .with(__, () => state)
  .run();
```

`run()` execute the pattern matching, and returns the result.

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
