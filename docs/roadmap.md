### Roadmap

- [ ] Add a custom matcher protocol data structures could implement to make them matchable.
- [ ] Add a native regex support.

- [ ] (Maybe) add an iterator protocol to `P.array` to be usable as a variadic tuple pattern. Example of using `P.array`:

```ts
const reverse = <T>(xs: T[]): T[] => {
  return match<T[], T[]>(xs)
    .with([P.any, ...P.array()], ([x, ...xs]) => [...reverse(xs), x])
    .otherwise(() => []);
};

match(xs)
  .with([P.any, ...P.array()], (xs: [unknown, ...unknown[]]) => [])
  .with([42, ...P.array(P.number), '!'], (xs: [42, ...number[], '!']) => [])
  .otherwise(() => []);
```

- [x] update `select()` and `select('name')` to accept a pattern the selected value should match.
- [x] add a `union(...patterns)` pattern.
- [x] When not provided, maybe compute the output type from all branches
- [x] maybe add a lightweight `select` API for single values
- [x] add support matching against several patterns in a single `.with()` clause.
- [x] Find a way to enforce exhaustive pattern matching
- [x] Several pattern/when clauses if necessary, with refined type inference from one to the other
- [x] Find a way to make the full type inference work
- [x] Add an operator to select a part of the data structure
- [x] Add `not(value)` in patterns.
- [x] Narrow down to type of value in `when` if the predicate is a type guard.
