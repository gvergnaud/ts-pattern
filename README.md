# Typescript Pattern

A complete pattern matching library for typescript.

```ts
import { match, __, when, not } from 'pattern';

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
