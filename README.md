# Typescript Pattern

A complete pattern matching library for typescript.

```ts
import { match, __, when, not } from 'pattern';

match({ type: 'hello' })
  .with(__, () => 'ok')
  .with(String, () => 'ok')
  .with(
    when((x) => true),
    () => 'ok'
  )
  .with(not('hello'), () => 'ok')
  .with(not(String), () => 'ok')
  .with(not(when((x) => true)), () => 'ok')
  .with({ type: __ }, () => 'ok')
  .with({ type: String }, () => 'ok')
  .with({ type: when((x) => true) }, () => 'ok')
  .with({ type: not('hello') }, () => 'ok')
  .with({ type: not(String) }, () => 'ok')
  .with({ type: not(when((x) => true)) }, () => 'ok');
//   .with({ type: x => true })
//   .with({ type: String })
//   .with({ type: __.string })
//   .with({ type: __.is(String) })
```
