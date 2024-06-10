### Roadmap

- [ ] better variant attempt.
- [ ] `.narrow()` as an opt-in option.
  - Can we avoid generating a distributed when pattern-matching on a single union type?
    - In BuildMany/Distribute, we could probably check the number of unions that have been touched, and if it's one we don't distribute?
    - => this creates performance issue. TODO: run trace analyzer.
- [ ] `P.array.includes(x)`
- [ ] `P.record({Pkey}, {Pvalue})`
- [x] `P.nonNullable`
- [x] chainable methods
  - [x] string
    - [x] `P.string.includes('str')`
    - [x] `P.string.startsWith('str')`
    - [x] `P.string.endsWith('str')`
    - [x] `P.string.regex('[a-z]+')`
  - [x] numbers
    - [x] `P.number.between(1, 10)`
    - [x] `P.number.lt(12)`
    - [x] `P.number.gt(12)`
    - [x] `P.number.gte(12)`
    - [x] `P.number.lte(12)`
    - [x] `P.number.int(12)`
    - [x] `P.number.finite`
    - [x] `P.number.positive`
    - [x] `P.number.negative`
  - [x] all
    - [x] `P.number.optional`
    - [x] `P.string.optional`
    - [x] `P.number.select()`
    - [x] `P.string.select()`
    - [x] `P.number.optional.select()`
    - [x] `P.string.optional.select()`
- [x] Add a custom matcher protocol data structures could implement to make them matchable.
- [x] (Maybe) add an iterator protocol to `P.array` to be usable as a variadic tuple pattern. Example of using `P.array`:

```ts
const reverse = <T>(xs: T[]): T[] => {
  return match<T[], T[]>(xs)
    .with([P.any, ...P.array()], ([x, ...xs]) => [...reverse(xs), x])
    .otherwise(() => []);
};

match(xs)
  .with([P.any, ...P.array()], (xs: [unknown, ...unknown[]]) => [])
  .with([42, ...P.array(P.number), '!'], (xs: [42, ...number[], '!']) => [])
  .with(
    [...P.array(P.number), ...P.array(P.string)],
    (xs: [...number[], ...string[]]) => []
  )
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
