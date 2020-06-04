# TS Pattern

The Pattern Matching library for TypeScript you have been missing.

## What is Pattern Matching?

Pattern Matching is a technique coming from Functional Programming languages to declaratively write conditional code branches based on the structure of one or several values. It is a well proven technique much more powerful and much less verbose than imperative alternatives (if/else/switch statements) especially when branching on several values.

Pattern Matching is implemented in Elixir, Rust, Haskell, Swift and many other languages. There is [a tc39 proposal](https://github.com/tc39/proposal-pattern-matching) to add Pattern Matching to the EcmaScript specification, but it is still in stage 1 and isn't likely to land before several years (if ever). Lukily, pattern matching can be implemented in userland. `ts-pattern` Provides a typesafe pattern matching implementation that you can start using today.

## Features

- Supports every data structure you use: objects, arrays, tuples, Sets, Maps, and all primitive types.
- Typesafe, with great type inference.
- Catch all (`__`) and type specific wild cards support.
- Supports `when` and `not` patterns for complexe cases.
- Supports properties selection, via the `select` function.
- Tiny bundle footprint (1kb).

## Gist

## Code Sandbox Examples

- Simple example
- [Reducer Demo (in React)](https://codesandbox.io/s/ts-pattern-reducer-example-c4yuq?file=/src/App.tsx)
- [`when` guards Demo](https://codesandbox.io/s/ts-pattern-when-guard-example-0s6d8?file=/src/index.ts)
- Polymorphic input
- Untyped input (e.g. an API response)
- `not` patterns
- `select` pattern

## Documentation

- Installation
- Patterns
  - Literals
  - Objects and arrays
  - Sets and Maps
  - `__` and other wild cards
  - `when` guards
  - `not` patterns
  - `select` pattern

## Pattern matching

### Example

```ts
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; error: Error };

type Event =
  | { type: 'fetch' }
  | { type: 'success'; data: string }
  | { type: 'error'; error: Error }
  | { type: 'cancel' };
```

```ts
import { match, __, not } from 'ts-pattern';

const initState: State = {
  status: 'idle',
};

const reducer = (state: State, event: Event): State =>
  // Sometimes you want to match on two values at once.
  // Here we pattern match both on the state and the event
  // and return a new state.
  match<[State, Event], State>([state, event])
    // the first argument is the pattern : the shape of the value
    // you expect for this branch.
    .with([{ status: 'loading' }, { type: 'success' }], ([, event]) => ({
      status: 'success',
      data: event.data,
    }))
    // The second argument is the function that will be called if
    // the data matches the given pattern.
    // The type of the data structure is narrowed down to
    // what is permitted by the pattern.
    .with([{ status: 'loading' }, { type: 'error' }], ([, event]) => ({
      status: 'error',
      error: event.error,
    }))
    .with([{ status: 'loading' }, { type: 'cancel' }], () => initState)
    // if you need to exclude a value, you can use
    // a `not` pattern. it's a function taking a pattern
    // and returning its opposite.
    .with([{ status: not('loading') }, { type: 'fetch' }], () => ({
      status: 'loading',
    }))
    // `__` is a wildcard, it will match any value.
    // You can use it at the top level, or inside a data structure.
    .with(__, () => state)
    // You can also use `otherwise`, which is equivalent to `with(__)`.
    .otherwise(() => state)
    // `run` execute the match close, and returns the value
    .run();
```

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
