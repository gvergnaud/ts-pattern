### Roadmap

- [ ] add a `rest` (maybe `rest(Pattern<a>)`) pattern for list. Example of using `rest`:

```ts
const reverse2 = <T>(xs: T[]): T[] => {
  return (
    match<T[], T[]>(xs)
      // matches a list with at least one element
      .with([__, ...rest(__)], ([x, ...xs]) => [...reverse(xs), x])
      .otherwise(() => [])
  );
};
```

- [x] When not provided, maybe compute the output type from all branches
- [x] maybe add a lightweight `select` API for single values
- [x] add support matching against several patterns in a single `.with()` clause.
- [x] Find a way to enforce exhaustive pattern matching
- [x] Several pattern/when clauses if necessary, with refined type inference from one to the other
- [x] Find a way to make the full type inference work
- [x] Add an operator to select a part of the data structure
- [x] Add `not(value)` in patterns.
- [x] Narrow down to type of value in `when` if the predicate is a type guard.
