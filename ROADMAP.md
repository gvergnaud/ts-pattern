### Roadmap

- [ ] Find a way to enforce exhaustive pattern matching
- [ ] Add `not(value)` in patterns.
  - this should have type like `{type: 'not', value: T }` which could be inverted to
    the least upper bound of between T and U.
  - it could also be implemented using a guard function
  - `{ value: n => n > m }`
- [ ] Should we remove `run`, and use `otherwise` instead to run the computation ?
- [x] Narrow down to type of value in `when` if the predicate is a type guard.
  - Ask question about type guard inference on TS repo
