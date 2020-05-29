### Roadmap

- [ ] Forbid impossible patterns like `{ status: 'error', data: (data) => data.length > 3 }` (error have no data)

- [ ] Find a way to enforce exhaustive pattern matching
- [x] Add an operator to select a part of the data structure

```ts
type Input = ['+', number, number] | ['*', number, number] | ['-', number];

const res = match<Input, number>(input).with(
  ['+', select('x'), select('y')],
  ({ x, y }) => x + y
);
```

- [x] Add `not(value)` in patterns.
  - this should have type like `{type: 'not', value: T }` which could be inverted to
    the least upper bound of between T and U.
  - it could also be implemented using a guard function
  - `{ value: n => n > m }`
- [x] Should we remove `run`, and use `otherwise` instead to run the computation ?
  - No because sometimes all patterns are handle without needing an otherwise
  - And it forces the user to create an extra returned value, which can be cumbersome
- [x] Narrow down to type of value in `when` if the predicate is a type guard.
  - Ask question about type guard inference on TS repo
