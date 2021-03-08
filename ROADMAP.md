### Roadmap

- [ ] add a `rest` (maybe `rest(Pattern<a>)`) pattern for list. Example of using `rest`:

```ts
const reverse2 = <T>(xs: T[]): T[] => {
  return match<T[], T[]>(xs)
    .with([__, ...rest], ([x, ...xs]) => [...reverse(xs), x])
    .otherwise(() => []);
};
```

- [ ] When not provided, maybe compute the output type from all branches
- [x] maybe add a lightweight `select` API for single values
- [x] add support matching against several patterns in a single `.with()` clause.
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

### V3

```ts
match(Input)
  .with({ type: 'text' }, () => ...)
  // if when isn't a type guard, this pattern is ignored, we don't exclude
  .with({ type: 'video', duration: when(x => x > 10) }, () => ...)
  // this catches every number
  .with({ type: 'video', duration: when((x): x is number => isNumber(x)) }, () => ...)
  // if a property is a literal but the input type for this property
  // is not a literal type, ignore this pattern because we can't narrow the type
  .with({ type: 'movie', duration: 10 }, () => ...)
  // with `as const` we can narrow the type, so this pattern isn't ignored
  .with({ type: 'movie', duration: 10 as const }, () => ...)

  //  Selection API:
  .with({ type: 'movie', duration: 10, author: select() }, (author) => ...)

  .with({ type: 'picture' }, () => ...)
  // This is a type error, because `type picture` has already been handled
  .with({ type: 'picture' }, () => ...)
   // this replaces run()
  .exhaustive()
  // OR: no exhaustive check
  .run()
  // OR
  .otherwise()
```

To make this work we will need A `CombineUnions` type, so that the input type doesn't get larger
as we exclude cases from it.

We will need to change the way `when` and literal patterns are handled, and have an aborting mecanism
when we know we can't make any predicion on the excluded cases.

TODO:

- [ ] Fix readonly support
- [ ] Update docs
