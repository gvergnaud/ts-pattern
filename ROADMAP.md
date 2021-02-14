### Roadmap

- [ ] add a `oneOf(...Pattern<a>[])` pattern (or `or`?)
- [ ] add a lightweight `select` API for single values
- [ ] add a `rest` (maybe `rest(Pattern<a>)`) pattern for list. Example of using `rest`:

```ts
const reverse2 = <T>(xs: T[]): T[] => {
  return match<T[], T[]>(xs)
    .with([__, ...rest], ([x, ...xs]) => [...reverse(xs), x])
    .otherwise(() => []);
};
```

- [ ] When not provided, maybe compute the output type from all branches
- [ ] Maybe change the syntax for list, and provide a `__.list` pattern, so we can support unary tuples
- [x] Find a way to enforce exhaustive pattern matching
- [x] Several pattern/when clauses if necessary, with refined type inference from one to the other
- [x] Find a way to make the full type inference work
- [x] Add an operator to select a part of the data structure
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
