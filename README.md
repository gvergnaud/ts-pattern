# TS Pattern

A complete pattern matching library for TypeScript.

## What is pattern matching?

A declarative way of making code branches in function of the input type.
Elixir, Rust, Haskell, Swift

## Features

- A strong focus on type safety and type inferences.
- Supports everything you need: objects, arrays, tuples, Sets, Maps, and all primitive types.
- Catch all (`__`) and type specific wild cards support.

## Examples

- Simple example
- Reducer example
- Polymorphic input
- Untyped input (e.g. an API response)
- `when` guards
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
