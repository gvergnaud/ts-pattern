### Roadmap

- [ ] Find a way to enforce exhaustive pattern matching
- [ ] Maybe change the syntax for list, and provide a `__.list` pattern
- [ ] Forbid impossible patterns like `{ status: 'error', data: (data) => data.length > 3 }` (error have no data)
- [ ] Maybe rework the selection api to work with arg number?

```ts
type Input = ['+', number, number] | ['*', number, number] | ['-', number];

const res = match<Input, number>(input).with(
  ['+', select.args1, select.args2, select.args3],
  (x, y) => x + y
);

const res = match<Input, number>(input).with(
  ['+', __.args1, __.args2, __.args3],
  (x, y) => x + y
);

// This could even be extend
const res = match<Input, number>(input).with(
  ['+', __.number.args1, __.number.args2],
  (x, y) => x + y
);

const res = match<Input, number>(input).with(
  ['+', args1, args2, args3],
  (x, y) => x + y
);

const res = match<Input, number>(input).with(
  ['+', args.first, args.second, args.third],
  (x, y) => x + y
);
```

- [x] Find a way to make the full type inference work
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
