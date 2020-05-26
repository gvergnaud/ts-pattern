# Typescript Pattern

A complete pattern matching library for typescript.

```ts
import { match, __, when, not } from 'pattern';

match({ type: 'hello' })
  .with(__, () => 'ok')
  .with(__.string, () => 'ok')
  .with(
    when((x) => true),
    () => 'ok'
  )
  .with(not('hello'), () => 'ok')
  .with(not(__.string), () => 'ok')
  .with(not(when((x) => true)), () => 'ok')
  .with({ type: __ }, () => 'ok')
  .with({ type: __.string }, () => 'ok')
  .with({ type: when((x) => true) }, () => 'ok')
  .with({ type: not('hello') }, () => 'ok')
  .with({ type: not(__.string) }, () => 'ok')
  .with({ type: not(when((x) => true)) }, () => 'ok');
```
